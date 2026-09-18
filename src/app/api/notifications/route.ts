import { NextRequest, NextResponse } from 'next/server';
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

  const notifications = store.getNotifications(user.id);
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return NextResponse.json({
    data: {
      notifications,
      unreadCount,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      store.markAllNotificationsAsRead(user.id);
      return NextResponse.json({ data: { message: 'All notifications marked as read' } });
    }

    if (notificationId) {
      store.markNotificationAsRead(notificationId);
      return NextResponse.json({ data: { message: 'Notification marked as read' } });
    }

    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Missing notificationId or markAllRead' } },
      { status: 400 }
    );
  } catch (err) {
    console.error('Error updating notifications:', err);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to update notification' } },
      { status: 500 }
    );
  }
}
