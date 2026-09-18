import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { verifyUserPermission } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyUserPermission('patient:read');
  if (!auth.authorized) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Access denied' } },
      { status: 403 }
    );
  }

  const { id } = await params;
  const patient = store.getPatientById(id);
  if (!patient) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Patient not found' } },
      { status: 404 }
    );
  }

  const cases = store.getCases({ patientId: patient.id });

  return NextResponse.json({
    data: {
      ...patient,
      cases,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyUserPermission('patient:update');
  if (!auth.authorized || !auth.user) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Permission patient:update required' } },
      { status: 403 }
    );
  }

  const { id } = await params;
  try {
    const updates = await req.json();
    const updatedPatient = store.updatePatient(id, updates, auth.user);
    if (!updatedPatient) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Patient not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updatedPatient });
  } catch (err) {
    console.error('Error updating patient:', err);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to update patient' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyUserPermission('patient:archive');
  if (!auth.authorized || !auth.user) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Permission patient:archive required' } },
      { status: 403 }
    );
  }

  const { id } = await params;
  const success = store.archivePatient(id, auth.user);
  if (!success) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Patient not found' } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: { message: 'Patient archival state toggled successfully' },
  });
}
