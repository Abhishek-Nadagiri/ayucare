import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, getCurrentUser } from '@/lib/auth';
import { store } from '@/lib/db/store';

export async function POST() {
  const user = await getCurrentUser();
  if (user) {
    store.addAuditLog({
      actorId: user.id,
      actorName: user.fullName,
      actorEmail: user.email,
      actorRole: user.roleName,
      action: 'USER_LOGOUT',
      entityType: 'AUTH',
      entityId: user.id,
    });
  }

  const response = NextResponse.json({
    data: { message: 'Logged out successfully' },
  });

  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
