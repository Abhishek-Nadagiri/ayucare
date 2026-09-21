import { cookies } from 'next/headers';
import { store } from '@/lib/db/store';
import { User, PermissionName } from '@/types';
import { hasPermission } from './rbac';

export const SESSION_COOKIE_NAME = 'ayucare_session_user';

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!userId) {
      // Default fallback for development/demo: Dr. Sarah Chen
      const defaultUser = store.getUserById('usr-sarah-chen');
      return defaultUser || null;
    }
    const user = store.getUserById(userId);
    return user || null;
  } catch {
    // If running in environment without request cookies
    const defaultUser = store.getUserById('usr-sarah-chen');
    return defaultUser || null;
  }
}

export async function verifyUserPermission(permission: PermissionName): Promise<{
  authorized: boolean;
  user: User | null;
  error?: string;
}> {
  const user = await getCurrentUser();
  if (!user) {
    return { authorized: false, user: null, error: 'Authentication required' };
  }
  if (!user.isActive) {
    return { authorized: false, user, error: 'User account is deactivated' };
  }
  if (!hasPermission(user.roleName, permission)) {
    return {
      authorized: false,
      user,
      error: `Forbidden: role ${user.roleName} lacks permission ${permission}`,
    };
  }
  return { authorized: true, user };
}
