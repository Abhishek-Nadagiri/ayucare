import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Email is required' } },
        { status: 400 }
      );
    }

    const users = store.getUsers();
    const cleanInput = email.toLowerCase().replace('@ayucare.health', '').replace('@medora.health', '');
    const user = users.find((u) => {
      const uClean = u.email.toLowerCase().replace('@ayucare.health', '').replace('@medora.health', '');
      return u.email.toLowerCase() === email.toLowerCase() || uClean === cleanInput;
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: 'AUTH_FAILED', message: 'Invalid credentials or user not found' } },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: { code: 'ACCOUNT_DISABLED', message: 'Account is deactivated. Contact an administrator.' } },
        { status: 403 }
      );
    }

    // Accept standard demo password or any non-empty input for demo convenience
    if (password && password !== 'Ayucare2026!' && password !== 'Medora2026!' && password !== 'password') {
      // In demo mode, accept any password or validate
    }

    // Log login audit event
    store.addAuditLog({
      actorId: user.id,
      actorName: user.fullName,
      actorEmail: user.email,
      actorRole: user.roleName,
      action: 'USER_LOGIN',
      entityType: 'AUTH',
      entityId: user.id,
      metadata: { email: user.email, role: user.roleName },
    });

    const response = NextResponse.json({
      data: {
        user,
        message: 'Successfully authenticated',
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, user.id, {
      httpOnly: false, // Accessible to client for reactive role badge display
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Internal server error during authentication' } },
      { status: 500 }
    );
  }
}
