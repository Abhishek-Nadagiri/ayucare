// Automated end-to-end integration test for Ayucare API & Domain Rules
import assert from 'assert';

async function runTests() {
  console.log('--- STARTING AYUCARE SYSTEM VERIFICATION TESTS ---');

  // Let's test against a live dev or direct store execution
  const { store } = await import('../src/lib/db/store.ts');
  const { hasPermission } = await import('../src/lib/auth/rbac.ts');

  // Test 1: Seed data integrity
  console.log('Test 1: Verifying seed database integrity...');
  store.resetToSeed();
  const patients = store.getPatients();
  const cases = store.getCases();
  const followups = store.getFollowups();
  const users = store.getUsers();

  assert(patients.length >= 8, 'Expected at least 8 seeded patients');
  assert(cases.length >= 8, 'Expected at least 8 seeded cases');
  assert(followups.length >= 5, 'Expected at least 5 seeded follow-ups');
  assert(users.length >= 5, 'Expected 5 seeded users');
  console.log('✓ Seed database has complete clinical records and personas.');

  // Test 2: Patient Creation & ID Generation
  console.log('Test 2: Testing Patient Creation & ID Generation...');
  const doctor = store.getUserById('usr-sarah-chen');
  const newPatient = store.createPatient(
    {
      firstName: 'Jonathan',
      lastName: 'Harker',
      dateOfBirth: '1985-05-15',
      sex: 'Male',
      bloodType: 'O+',
      allergies: ['Penicillin'],
      contactInformation: { phone: '+1 555 123 4567' },
    },
    doctor
  );

  assert(newPatient.patientIdentifier.startsWith('AYU-PT-2026-'), 'Invalid patient identifier format');
  assert(newPatient.firstName === 'Jonathan', 'First name mismatch');
  console.log(`✓ Created patient with unique ID: ${newPatient.patientIdentifier}`);

  // Test 3: Case Creation & Attribution
  console.log('Test 3: Testing Case Creation & Event Timeline Generation...');
  const newCase = store.createCase(
    {
      patientId: newPatient.id,
      title: 'Post-Exposure Rabies Prophylaxis Surveillance',
      consultationReason: 'Animal bite sustained during outdoor expedition.',
      status: 'Active',
      priority: 'Urgent',
      department: 'Emergency',
      responsibleUserId: doctor.id,
      clinicalDocumentation: {
        chiefComplaint: 'Bite wound to left forearm.',
        historyOfPresentIllness: 'Bite sustained 2 hours ago from stray animal.',
        assessmentAndPlan: 'Initiated Rabies Vaccine series and Immunoglobulin.',
      },
    },
    doctor
  );

  assert(newCase.caseNumber.startsWith('CASE-2026-'), 'Invalid case number format');
  assert(newCase.patientId === newPatient.id, 'Patient ID link broken');

  const caseEvents = store.getEventsByCaseId(newCase.id);
  assert(caseEvents.length >= 1, 'Expected case creation event in timeline');
  assert(caseEvents[0].eventType === 'CASE_CREATED', 'Event type mismatch');
  console.log(`✓ Case created: ${newCase.caseNumber} with automatic timeline event.`);

  // Test 4: Status Transition & Audit Logging
  console.log('Test 4: Testing Case Status Transitions & Auditing...');
  const initialAuditCount = store.getAuditLogs().length;
  store.updateCaseStatus(newCase.id, 'Follow-up Required', doctor);

  const updatedCase = store.getCaseById(newCase.id);
  assert(updatedCase.status === 'Follow-up Required', 'Status transition failed');

  const updatedEvents = store.getEventsByCaseId(newCase.id);
  assert(
    updatedEvents.some((e) => e.eventType === 'STATUS_CHANGED'),
    'Status change not reflected in timeline'
  );

  const auditLogs = store.getAuditLogs();
  assert(auditLogs.length > initialAuditCount, 'Audit log was not recorded for status transition');
  console.log('✓ Status transition verified with chronological timeline event & audit log entry.');

  // Test 5: Follow-up Scheduling & Overdue Calculation
  console.log('Test 5: Testing Follow-up Milestone Calculations...');
  const overdueFollowup = store.createFollowup(
    {
      caseId: newCase.id,
      assignedTo: doctor.id,
      followupDate: '2026-01-01', // Past date
      purpose: 'Dose 2 Rabies Vaccine Administration',
      status: 'Pending',
      outcome: null,
    },
    doctor
  );

  const overdueList = store.getFollowups({ timeframe: 'OVERDUE' });
  assert(
    overdueList.some((f) => f.id === overdueFollowup.id),
    'Overdue follow-up was not accurately classified'
  );

  // Complete the follow-up
  store.updateFollowup(
    overdueFollowup.id,
    {
      status: 'Completed',
      outcome: 'Dose 2 successfully administered, no adverse reactions.',
    },
    doctor
  );

  const completed = store.getFollowupById(overdueFollowup.id);
  assert(completed.status === 'Completed', 'Follow-up completion failed');
  assert(completed.completedAt !== null, 'completedAt timestamp missing');
  console.log('✓ Overdue calculation and completion workflow verified.');

  // Test 6: RBAC Permission Evaluation
  console.log('Test 6: Verifying Role-Based Access Control matrix...');
  // Doctor permissions
  assert(hasPermission('Doctor', 'patient:create') === true, 'Doctor should have patient:create');
  assert(hasPermission('Doctor', 'case:create') === true, 'Doctor should have case:create');
  assert(hasPermission('Doctor', 'user:manage') === false, 'Doctor must NOT have user:manage');
  assert(hasPermission('Doctor', 'audit:read') === false, 'Doctor must NOT have audit:read');

  // Nurse permissions
  assert(hasPermission('Nurse', 'note:create') === true, 'Nurse should have note:create');
  assert(hasPermission('Nurse', 'followup:update') === true, 'Nurse should have followup:update');
  assert(hasPermission('Nurse', 'case:create') === false, 'Nurse must NOT have case:create');
  assert(hasPermission('Nurse', 'user:manage') === false, 'Nurse must NOT have user:manage');

  // Administrator permissions
  assert(hasPermission('Administrator', 'user:manage') === true, 'Admin should have user:manage');
  assert(hasPermission('Administrator', 'audit:read') === true, 'Admin should have audit:read');
  assert(hasPermission('Administrator', 'patient:archive') === true, 'Admin should have patient:archive');
  assert(hasPermission('Administrator', 'case:create') === false, 'Admin must not create clinical cases');

  // Student permissions
  assert(hasPermission('Student', 'case:read') === true, 'Student should have case:read');
  assert(hasPermission('Student', 'note:create') === true, 'Student should have note:create (training)');
  assert(hasPermission('Student', 'case:create') === false, 'Student must NOT create cases');
  assert(hasPermission('Student', 'user:manage') === false, 'Student must NOT manage users');
  console.log('✓ RBAC Least-Privilege matrix strictly enforced across all 4 roles.');

  // Test 7: Dashboard Statistics Aggregation
  console.log('Test 7: Testing Dashboard KPI Aggregation...');
  const stats = store.getDashboardStats();
  assert(typeof stats.totalPatients === 'number', 'Invalid totalPatients');
  assert(typeof stats.activeCases === 'number', 'Invalid activeCases');
  assert(typeof stats.overdueFollowups === 'number', 'Invalid overdueFollowups');
  assert(stats.casesByPriority.urgent > 0, 'Expected urgent cases in stats');
  console.log(`✓ Dashboard statistics calculated: ${stats.activeCases} active cases, ${stats.totalPatients} patients.`);

  console.log('--- ALL TESTS PASSED SUCCESSFULLY (100%) ---');
}

runTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
