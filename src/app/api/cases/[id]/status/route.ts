import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { verifyUserPermission } from '@/lib/auth';
import { CaseStatus } from '@/types';

const VALID_STATUSES: CaseStatus[] = [
  'New',
  'Under Review',
  'Active',
  'On Hold',
  'Follow-up Required',
  'Resolved',
  'Closed',
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyUserPermission('case:status_update');
  if (!auth.authorized || !auth.user) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Permission case:status_update required' } },
      { status: 403 }
    );
  }

  const { id } = await params;
  try {
    const { status } = (await req.json()) as { status: CaseStatus };
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    const updated = store.updateCaseStatus(id, status, auth.user);
    if (!updated) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Case not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        id: updated.id,
        status: updated.status,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    console.error('Error updating case status:', err);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to update case status' } },
      { status: 500 }
    );
  }
}
