import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { verifyUserPermission } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyUserPermission('case:read');
  if (!auth.authorized) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Access denied' } },
      { status: 403 }
    );
  }

  const { id } = await params;
  const patientCase = store.getCaseById(id);
  if (!patientCase) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Case not found' } },
      { status: 404 }
    );
  }

  const patient = store.getPatientById(patientCase.patientId);
  const responsibleDoctor = patientCase.responsibleUserId
    ? store.getUserById(patientCase.responsibleUserId)
    : null;
  const notes = store.getNotesByCaseId(id);
  const events = store.getEventsByCaseId(id);
  const followups = store.getFollowups({ caseId: id });
  const attachments = store.getAttachmentsByCaseId(id);

  return NextResponse.json({
    data: {
      ...patientCase,
      patient,
      responsibleDoctor,
      notes,
      events,
      followups,
      attachments,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyUserPermission('case:update');
  if (!auth.authorized || !auth.user) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Permission case:update required' } },
      { status: 403 }
    );
  }

  const { id } = await params;
  try {
    const updates = await req.json();
    const updated = store.updateCase(id, updates, auth.user);
    if (!updated) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Case not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error('Error updating case:', err);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to update case' } },
      { status: 500 }
    );
  }
}
