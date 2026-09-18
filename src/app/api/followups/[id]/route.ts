import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { verifyUserPermission } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyUserPermission('followup:update');
  if (!auth.authorized || !auth.user) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Permission followup:update required' } },
      { status: 403 }
    );
  }

  const { id } = await params;
  try {
    const updates = await req.json();
    const updated = store.updateFollowup(id, updates, auth.user);
    if (!updated) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Follow-up not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error('Error updating follow-up:', err);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to update follow-up' } },
      { status: 500 }
    );
  }
}
