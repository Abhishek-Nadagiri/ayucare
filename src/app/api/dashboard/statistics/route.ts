import { NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const stats = store.getDashboardStats();
  const recentCases = store.getCases().slice(0, 5).map((c) => {
    const patient = store.getPatientById(c.patientId);
    return {
      ...c,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
    };
  });

  const urgentFollowups = store.getFollowups({ timeframe: 'OVERDUE' }).slice(0, 5);
  const recentEvents = store.getAuditLogs({ limit: 6 });

  return NextResponse.json({
    data: {
      stats,
      recentCases,
      urgentFollowups,
      recentEvents,
    },
  });
}
