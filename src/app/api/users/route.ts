import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUser, verifyUserPermission } from '@/lib/auth';
import { RoleName } from '@/types';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  // Any authenticated user can get users list for clinician assignment dropdowns, but sensitive fields omitted
  const users = store.getUsers().map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    roleName: u.roleName,
    department: u.department,
    isActive: u.isActive,
    createdAt: u.createdAt,
  }));

  return NextResponse.json({ data: users });
}

export async function POST(req: NextRequest) {
  const auth = await verifyUserPermission('user:manage');
  if (!auth.authorized || !auth.user) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Permission user:manage required' } },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { fullName, email, roleName, department = 'General' } = body;

    if (!fullName || !email || !roleName) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Full name, email, and role are required.' } },
        { status: 400 }
      );
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      roleId: `role-${(roleName as string).toLowerCase()}`,
      roleName: roleName as RoleName,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const users = store.getUsers();
    users.push(newUser);

    store.addAuditLog({
      actorId: auth.user.id,
      actorName: auth.user.fullName,
      actorEmail: auth.user.email,
      actorRole: auth.user.roleName,
      action: 'CREATE_USER',
      entityType: 'USER',
      entityId: newUser.id,
      metadata: { email: newUser.email, role: newUser.roleName },
    });

    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (err) {
    console.error('Error creating user:', err);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to create user' } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyUserPermission('user:manage');
  if (!auth.authorized || !auth.user) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Permission user:manage required' } },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'User ID and updates required' } },
        { status: 400 }
      );
    }

    const updated = store.updateUser(id, updates);
    if (!updated) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    store.addAuditLog({
      actorId: auth.user.id,
      actorName: auth.user.fullName,
      actorEmail: auth.user.email,
      actorRole: auth.user.roleName,
      action: 'UPDATE_USER',
      entityType: 'USER',
      entityId: id,
      metadata: { updates },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error('Error updating user:', err);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to update user' } },
      { status: 500 }
    );
  }
}
