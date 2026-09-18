import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { verifyUserPermission } from '@/lib/auth';
import { FollowupStatus } from '@/types';

export async function GET(req: NextRequest) {
  const auth = await verifyUserPermission('followup:read');
  if (!auth.authorized) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Access denied' } },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const caseId = searchParams.get('caseId') || undefined;
  const status = searchParams.get('status') || undefined;
  const assignedTo = searchParams.get('assignedTo') || undefined;
  const timeframe = (searchParams.get('timeframe') as 'OVERDUE' | 'TODAY' | 'UPCOMING' | 'ALL') || undefined;

  const followups = store.getFollowups({ caseId, status, assignedTo, timeframe });

  // Enrich with case and patient info if missing
  const enriched = followups.map((f) => {
    const c = store.getCaseById(f.caseId);
    const p = c ? store.getPatientById(c.patientId) : null;
    const u = store.getUserById(f.assignedTo);
    return {
      ...f,
      caseNumber: f.caseNumber || c?.caseNumber,
      caseTitle: f.caseTitle || c?.title,
      patientId: f.patientId || p?.id,
      patientName: f.patientName || (p ? `${p.firstName} ${p.lastName}` : 'Unknown'),
      assignedToName: f.assignedToName || u?.fullName || 'Unassigned',
    };
  });

  return NextResponse.json({
    data: enriched,
    meta: {
      total: enriched.length,
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyUserPermission('followup:create');
  if (!auth.authorized || !auth.user) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Permission followup:create required' } },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { caseId, followupDate, purpose, assignedTo, status = 'Scheduled' } = body;

    if (!caseId || !followupDate || !purpose) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Case ID, follow-up date, and purpose are required.' } },
        { status: 400 }
      );
    }

    const patientCase = store.getCaseById(caseId);
    if (!patientCase) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Referenced case not found' } },
        { status: 404 }
      );
    }

    const patient = store.getPatientById(patientCase.patientId);
    const assignee = assignedTo ? store.getUserById(assignedTo) : auth.user;

    const newFollowup = store.createFollowup(
      {
        caseId,
        caseNumber: patientCase.caseNumber,
        caseTitle: patientCase.title,
        patientId: patient?.id,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : undefined,
        assignedTo: assignee?.id || auth.user.id,
        assignedToName: assignee?.fullName || auth.user.fullName,
        followupDate,
        purpose: purpose.trim(),
        status: status as FollowupStatus,
        outcome: null,
      },
      auth.user
    );

    return NextResponse.json({ data: newFollowup }, { status: 201 });
  } catch (err) {
    console.error('Error creating follow-up:', err);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to create follow-up' } },
      { status: 500 }
    );
  }
}
