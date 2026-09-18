import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { verifyUserPermission } from '@/lib/auth';
import { CasePriority, CaseStatus } from '@/types';

export async function GET(req: NextRequest) {
  const auth = await verifyUserPermission('case:read');
  if (!auth.authorized) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Access denied' } },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId') || undefined;
  const status = searchParams.get('status') || undefined;
  const priority = searchParams.get('priority') || undefined;
  const department = searchParams.get('department') || undefined;
  const responsibleUserId = searchParams.get('responsibleUserId') || undefined;
  const search = searchParams.get('q') || searchParams.get('search') || undefined;

  const cases = store.getCases({
    patientId,
    status,
    priority,
    department,
    responsibleUserId,
    search,
  });

  // Enrich with patient and doctor details
  const enrichedCases = cases.map((c) => {
    const patient = store.getPatientById(c.patientId);
    const doctor = c.responsibleUserId ? store.getUserById(c.responsibleUserId) : null;
    return {
      ...c,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
      patientIdentifier: patient?.patientIdentifier || '',
      responsibleUserName: doctor?.fullName || 'Unassigned',
    };
  });

  return NextResponse.json({
    data: enrichedCases,
    meta: {
      total: enrichedCases.length,
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyUserPermission('case:create');
  if (!auth.authorized || !auth.user) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Permission case:create required' } },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      patientId,
      title,
      consultationReason,
      status = 'New',
      priority = 'Normal',
      department = 'General Medicine',
      responsibleUserId,
      clinicalDocumentation,
    } = body;

    if (!patientId || !title || !consultationReason) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Patient ID, title, and consultation reason are required fields.',
          },
        },
        { status: 400 }
      );
    }

    const patient = store.getPatientById(patientId);
    if (!patient) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Referenced patient does not exist.' } },
        { status: 400 }
      );
    }

    const newCase = store.createCase(
      {
        patientId,
        title: title.trim(),
        consultationReason: consultationReason.trim(),
        status: status as CaseStatus,
        priority: priority as CasePriority,
        department,
        responsibleUserId: responsibleUserId || auth.user.id,
        clinicalDocumentation: {
          chiefComplaint: clinicalDocumentation?.chiefComplaint || consultationReason,
          historyOfPresentIllness: clinicalDocumentation?.historyOfPresentIllness || '',
          medicalHistory: clinicalDocumentation?.medicalHistory || '',
          familySocialHistory: clinicalDocumentation?.familySocialHistory || '',
          examinationFindings: clinicalDocumentation?.examinationFindings || '',
          investigations: clinicalDocumentation?.investigations || '',
          assessmentAndPlan: clinicalDocumentation?.assessmentAndPlan || 'Initial clinical assessment pending.',
          medications: clinicalDocumentation?.medications || '',
        },
      },
      auth.user
    );

    return NextResponse.json({ data: newCase }, { status: 201 });
  } catch (err) {
    console.error('Error creating case:', err);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to create case record' } },
      { status: 500 }
    );
  }
}
