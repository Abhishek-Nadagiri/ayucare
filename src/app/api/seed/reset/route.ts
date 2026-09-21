import { NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';

export async function POST() {
  const user = await getCurrentUser();
  store.resetToSeed();

  if (user) {
    store.addAuditLog({
      actorId: user.id,
      actorName: user.fullName,
      actorEmail: user.email,
      actorRole: user.roleName,
      action: 'RESET_DATABASE_TO_DEMO_SEED',
      entityType: 'AUTH',
      entityId: user.id,
    });
  }

  return NextResponse.json({
    data: {
      message: 'Ayucare database successfully re-seeded with realistic clinical dataset.',
    },
  });
}
