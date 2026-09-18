import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { SESSION_COOKIE_NAME } from '@/lib/auth';
import { RoleName } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roleName, userId } = body as { roleName?: RoleName; userId?: string };

    const users = store.getUsers();
    let targetUser = userId ? users.find((u) => u.id === userId) : null;

    if (!targetUser && roleName) {
      targetUser = users.find((u) => u.roleName === roleName && u.isActive) || null;
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'No matching user found for this role' } },
        { status: 404 }
      );
    }

    store.addAuditLog({
      actorId: targetUser.id,
      actorName: targetUser.fullName,
      actorEmail: targetUser.email,
      actorRole: targetUser.roleName,
      action: 'SWITCH_DEMO_ROLE',
      entityType: 'AUTH',
      entityId: targetUser.id,
      metadata: { newRole: targetUser.roleName },
    });

    const res = NextResponse.json({
      data: {
        user: targetUser,
        message: `Switched active role to ${targetUser.roleName} (${targetUser.fullName})`,
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, targetUser.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error('Error switching role:', err);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to switch role' } },
      { status: 500 }
    );
  }
}
