import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { verifyUserPermission } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await verifyUserPermission('audit:read');
  if (!auth.authorized) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Permission audit:read required' } },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get('entityType') || undefined;
  const actorId = searchParams.get('actorId') || undefined;
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  const logs = store.getAuditLogs({ entityType, actorId, limit });

  return NextResponse.json({
    data: logs,
    meta: {
      total: logs.length,
    },
  });
}
