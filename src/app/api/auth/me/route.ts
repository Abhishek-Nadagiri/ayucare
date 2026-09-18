import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRolePermissions } from '@/lib/auth/rbac';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHENTICATED', message: 'No active session' } },
      { status: 401 }
    );
  }

  const permissions = getRolePermissions(user.roleName);

  return NextResponse.json({
    data: {
      user,
      permissions,
    },
  });
}
