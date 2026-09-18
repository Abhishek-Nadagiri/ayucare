MEDORA
PRODUCT REQUIREMENTS DOCUMENT (PRD)

Version: 1.0
Status: Draft for implementation
Product: Medora
Product Type: Patient Case Monitoring and Management System

1. EXECUTIVE SUMMARY

Medora is a healthcare application for authorized healthcare professionals to record, organize, monitor, and manage patient cases throughout the care journey.

The product provides structured patient records, case management, clinical documentation, case timelines, follow-up tracking, dashboards, search/filtering, notifications, and auditability.

Medora is a software tool for organizing and monitoring patient cases. It must not independently diagnose diseases, prescribe medication, or replace professional clinical judgment.

2. PRODUCT VISION

Provide a simple, secure, structured workspace in which authorized healthcare users can understand the current state and history of a patient case without searching through disconnected records.

3. PROBLEM STATEMENT

Patient case information can become difficult to organize when observations, notes, investigations, assignments, follow-ups, and status changes are recorded separately. Medora addresses this by maintaining a structured case record with a chronological history and clear ownership.

4. GOALS AND OBJECTIVES

Goals:
- Centralize patient and case information.
- Make case status and priority immediately visible.
- Track follow-ups and overdue work.
- Maintain a chronological case history.
- Restrict access according to user roles.
- Provide auditability for important actions.
- Keep the interface simple and accessible.

Success objectives:
- Authorized users can create and retrieve cases efficiently.
- Users can identify cases requiring follow-up from the dashboard.
- Every important record change can be traced to a user and timestamp.
- Unauthorized users cannot access restricted patient information.

5. NON-GOALS

The MVP will not:
- Diagnose diseases automatically.
- Prescribe medication automatically.
- Replace professional clinical judgment.
- Provide a complete hospital management system.
- Include e-commerce or social networking.
- Include advanced AI, predictive analytics, external hospital integrations, or automated messaging unless added in a later phase.

6. TARGET USERS AND PERSONAS

Doctor:
- Creates and manages cases.
- Records clinical information and observations.
- Reviews history and progress.
- Adds care plans and follow-up notes.

Nurse / Healthcare Staff:
- Updates permitted information.
- Records observations and care-related notes.
- Monitors assigned cases.
- Updates follow-up status.

Hospital / Clinic Administrator:
- Manages users and roles.
- Oversees records and system usage.
- Configures departments and permissions.

Student / Trainee:
- Accesses authorized educational or simulated cases.
- Practices structured case documentation.
- Uses sample data without exposing real patient information.

Real clinical use and academic/demo use must be clearly separated.

7. USER ROLES AND ACCESS

Permissions are based on least privilege.

Doctor:
- Patient: create, view, edit permitted fields.
- Cases: create, view, update, assign.
- Notes: create, view, amend according to permissions.
- Follow-ups: create and update.
- Reports: access according to authorization.

Nurse / Healthcare Staff:
- Patient: view and edit permitted fields.
- Cases: view assigned cases.
- Notes: create permitted observations/care notes.
- Follow-ups: update assigned follow-ups.

Administrator:
- User and role management.
- Department configuration.
- System-level oversight.
- Audit-log access according to policy.

Student/Trainee:
- Simulated/educational records only unless explicitly authorized.

8. PRODUCT SCOPE

8.1 Authentication and User Management
- Secure login/logout.
- Account registration or administrator-created accounts.
- Role-based access control.
- Profile management.
- Password recovery.
- Session management.
- Account activation/deactivation.

8.2 Patient Management
- Add patient.
- Generate unique patient identifier.
- Store essential demographic information.
- Search/filter patients.
- View profile.
- Edit permitted information.
- Archive patients according to policy.
- Avoid unnecessary sensitive information.

8.3 Patient Case Management
- Create multiple cases per patient.
- Assign unique case number.
- Record case title and consultation reason.
- Record relevant history and clinical information.
- Assign responsible professional.
- Set status:
  New, Under Review, Active, On Hold, Follow-up Required, Resolved, Closed.
- Set priority.
- Track creation and modification dates.

8.4 Clinical Documentation
- Chief complaint.
- History of present illness.
- Relevant medical history.
- Family/social history where appropriate.
- Examination findings.
- Investigations and test results.
- Clinical observations.
- Assessment and care plan.
- Medication records where appropriate.
- Attachments.
- Structured and free-text notes.
- Clearly distinguish documented findings, user-entered assessments, and calculated information.

8.5 Dashboard
Display:
- Total patients.
- Active cases.
- New cases.
- Follow-ups required.
- Overdue follow-ups.
- Cases by priority.
- Cases by status.
- Recently updated cases.
- Assigned cases.
- Case activity timeline.

8.6 Timeline and History
- Chronological case events.
- Important updates.
- User who performed each update.
- Timestamp.
- Relevant field changes.
- Previous notes/events.
- Clearly identified corrections and amendments.

8.7 Follow-Up Management
- Create follow-up.
- Set date.
- Set purpose.
- Assign responsible user.
- Show upcoming follow-ups.
- Identify overdue follow-ups.
- Record outcome.
- Update case status.

8.8 Search and Reports
- Search by patient identifier, name, case number, or permitted fields.
- Filter by status, priority, department, assigned user, and date.
- Generate case summaries.
- Generate basic monitoring reports.
- Authorized export to PDF/CSV where appropriate.

8.9 Notifications
MVP:
- Upcoming follow-up notifications.
- Overdue follow-up alerts.
- Assigned-case notifications.

Optional:
- Important case-status notifications.

8.10 Security and Privacy
- Role-based permissions.
- Secure authentication.
- Encryption in transit and at rest.
- Audit logs.
- Secure access control.
- Secure file uploads.
- Retention policies.
- Backup/recovery.
- Privacy-conscious data handling.
- Deployment-specific compliance assessment.

9. FUNCTIONAL REQUIREMENTS

FR-01 Authentication
The system shall authenticate users before access to protected functions.

FR-02 Authorization
The system shall enforce role/permission checks on protected operations.

FR-03 Patient Creation
Authorized users shall create patients with validated essential information.

FR-04 Patient Search
Authorized users shall search patients using permitted fields.

FR-05 Case Creation
Authorized users shall create a case linked to a patient.

FR-06 Case Status
Authorized users shall update case status according to permissions.

FR-07 Case Documentation
Authorized users shall create and review case notes and clinical documentation.

FR-08 Timeline
The system shall maintain a chronological case activity history.

FR-09 Follow-Up
Authorized users shall create, assign, update, and complete follow-ups.

FR-10 Dashboard
The system shall calculate and display monitoring statistics according to the user's permissions.

FR-11 Attachments
Authorized users shall upload and retrieve permitted case documents.

FR-12 Audit
The system shall record important access and modification events.

FR-13 Reporting
Authorized users shall generate permitted summaries/reports.

10. NON-FUNCTIONAL REQUIREMENTS

Security:
- Least-privilege access.
- Secure authentication/session handling.
- Encryption at rest and in transit.
- Input validation and sanitization.
- Auditability.

Performance:
- Normal application interactions should respond promptly under expected MVP load.
- Dashboard queries should use indexed database operations.
- Large datasets should use pagination.

Availability:
- Managed database backups.
- Recovery procedures.
- Separate development, staging, and production environments.

Accessibility:
- Keyboard-accessible controls.
- Clear labels and validation.
- Adequate text readability.
- Status information should not rely on color alone.
- Responsive desktop/tablet/mobile layouts.

Maintainability:
- Modular frontend/backend.
- Reusable components.
- Version-controlled database migrations.
- Automated tests for critical workflows.

11. MAJOR USER STORIES

Authentication
As a user, I want to log in securely so that I can access authorized records.

Patient Management
As a healthcare professional, I want to create a patient record so that I can associate cases with the correct patient.

Case Management
As a doctor, I want to create and update a case so that the patient's care journey is organized.

Documentation
As an authorized user, I want to add case notes so that clinical observations and decisions are recorded.

Timeline
As an authorized user, I want to review case history chronologically so that I can understand what changed and when.

Follow-Up
As a healthcare professional, I want to schedule a follow-up so that required future actions are tracked.

Dashboard
As an authorized user, I want to see active and overdue cases so that I can prioritize my work.

Audit
As an administrator, I want important changes to be logged so that system activity can be reviewed.

12. ACCEPTANCE CRITERIA

Authentication:
- Valid credentials create an authenticated session.
- Invalid credentials do not provide access.
- Protected routes reject unauthenticated users.
- Disabled accounts cannot authenticate.

Patient:
- Required fields are validated.
- A unique patient identifier is generated.
- Authorized users can retrieve the patient.
- Unauthorized users cannot retrieve restricted patient data.

Case:
- A case must reference an existing patient.
- A case number is unique.
- Status and priority must use valid values.
- Authorized users can update permitted fields.
- Important updates appear in the timeline.

Follow-Up:
- A follow-up requires a valid date and responsible user.
- Overdue follow-ups are identified from the current date.
- Completion records an outcome/status.

Audit:
- Important create/update/delete/access actions generate audit records.
- Audit records contain actor and timestamp.
- Normal users cannot alter audit history.

13. USER JOURNEY

Login → Dashboard → Patient Search → Patient Profile → Case List → Case Details → Clinical Documentation → Follow-Up → Timeline Review → Dashboard.

14. INFORMATION ARCHITECTURE

Authentication
- Login
- Password Recovery

Main Application
- Dashboard
- Patients
  - Patient List
  - Add Patient
  - Patient Profile
- Cases
  - Case List
  - Create Case
  - Case Details
  - Timeline
  - Clinical Documentation
- Follow-Ups
- Reports
- Notifications
- User Management
- Settings

15. SCREEN REQUIREMENTS

Login:
Purpose: authenticate users.
Components: email/username, password, login, recovery.
States: loading, invalid credentials, locked/disabled account.

Dashboard:
Purpose: monitor workload.
Components: KPI cards, filters, case lists, follow-up list, timeline.
Mobile: stack cards and use horizontally scrollable/filter controls where required.

Patient List:
Search, filters, pagination, patient identifier, permitted demographic fields.

Add Patient:
Validated patient information form and confirmation.

Patient Profile:
Demographics, cases, recent activity, permitted actions.

Case List:
Search/filter by status, priority, department, assignee and dates.

Create Case:
Patient reference, title, consultation reason, history, responsible user, priority and status.

Case Details:
Case summary, current status, priority, responsible user, notes, follow-ups, attachments and timeline.

Case Timeline:
Chronological events with actor and timestamp; corrections/amendments clearly identified.

Clinical Documentation:
Structured fields plus permitted free-text notes, validation and save/amend controls.

Follow-Up:
Upcoming/overdue list, date, purpose, assignee, outcome and status.

Reports:
Authorized monitoring reports and permitted exports.

Notifications:
Upcoming, overdue, assigned-case and important status notifications.

User Management:
Users, roles, account status and permitted administrative controls.

Settings:
Profile, session/security settings and application configuration permitted to the user.

16. VALIDATION, ERROR AND EMPTY STATES

Validation:
- Required fields cannot be blank.
- IDs and case numbers must be unique.
- Dates must be valid.
- Enumerated status/priority values must be valid.
- File type and size must be checked.

Error states:
- Authentication failure.
- Permission denied.
- Record not found.
- Validation failure.
- File upload failure.
- Server/database failure.

Empty states:
- No patients.
- No cases.
- No follow-ups.
- No notifications.
- No search results.
Each empty state should explain what is absent and provide an authorized next action where appropriate.

17. MVP

The MVP includes:
1. Authentication.
2. Role-based access.
3. Patient management.
4. Case creation/management.
5. Case status tracking.
6. Case notes.
7. Case timeline.
8. Follow-up tracking.
9. Dashboard.
10. Search/filtering.
11. Audit logging.
12. Basic security controls.

18. PHASE 2

- Expanded reporting.
- More detailed notifications.
- Enhanced attachment management.
- More granular permissions.
- Additional clinical documentation structures.

19. FUTURE ENHANCEMENTS

- AI-assisted documentation.
- Predictive analytics.
- External hospital integrations.
- Advanced reporting.
- Automated messaging.

Any AI functionality must remain assistive, transparent, and subject to professional review.

20. SUCCESS METRICS

- Percentage of successful authenticated sessions.
- Patient/case creation completion rate.
- Follow-up completion rate.
- Overdue follow-up count.
- Search success and response time.
- Critical error rate.
- Audit-log coverage for defined auditable actions.
- User-reported usability feedback.

21. RISKS AND ASSUMPTIONS

Risks:
- Unauthorized access.
- Incorrect or incomplete data.
- Insecure attachments.
- Privacy/compliance gaps.
- Poor permission configuration.
- Database failure/data loss.

Mitigations:
- RBAC and least privilege.
- Validation and audit logging.
- Secure private storage.
- Backups and recovery.
- Security testing.
- Deployment-specific compliance review.

Assumptions:
- PostgreSQL is the primary relational database.
- Supabase may provide managed database/auth/storage services.
- Vercel may host the application.
- Actual legal/compliance requirements depend on deployment jurisdiction and use case.

22. OPEN QUESTIONS

- Which country/jurisdiction will the production deployment operate in?
- Which exact healthcare privacy requirements apply to that deployment?
- Which patient fields are mandatory?
- Which roles may view or export specific clinical information?
- What attachment types and maximum sizes are required?
- What retention periods apply?

23. MVP RELEASE CRITERIA

The MVP can be released for its intended environment when:
- Core authentication works.
- RBAC is tested.
- Patient/case workflows work end-to-end.
- Follow-ups and dashboard calculations are verified.
- Audit logging works.
- Security and permission tests pass.
- Critical accessibility issues are resolved.
- Backup/recovery procedures are documented.
- Test data is used unless appropriate authorization and safeguards exist for real patient data.

24. IMPLEMENTATION ROADMAP

Phase 1: Project setup, database, authentication and RBAC.
Phase 2: Patient management.
Phase 3: Case management and documentation.
Phase 4: Timeline and audit logging.
Phase 5: Follow-ups and dashboard.
Phase 6: Search, filtering and basic reports.
Phase 7: Security, accessibility, testing and deployment.
Phase 8: Production-readiness review and deployment-specific compliance assessment.
