import { NextResponse } from 'next/server';
import webpush from 'web-push';
import prisma from '@/lib/prisma';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Send push notification to user's subscribed devices
 * POST /api/push/send
 *
 * Body: {
 *   userId: number (optional, defaults to 1)
 *   title: string
 *   body: string
 *   icon?: string
 *   badge?: string
 *   data?: object
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId = 1,
      title,
      body: messageBody,
      icon = '/icons/icon-192x192.png',
      badge = '/icons/icon-72x72.png',
      data = {},
    } = body;

    if (!title || !messageBody) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Get all subscriptions for the user
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No subscriptions found for user' },
        { status: 404 }
      );
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body: messageBody,
      icon,
      badge,
      data: {
        ...data,
        dateOfArrival: Date.now(),
        url: data.url || '/',
      },
    });

    // Send notification to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.auth,
            p256dh: sub.p256dh,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, payload);
          return { success: true, endpoint: sub.endpoint };
        } catch (error) {
          // If subscription is no longer valid, delete it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.delete({
              where: { id: sub.id },
            });
          }
          throw error;
        }
      })
    );

    // Count successes and failures
    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({
      message: 'Push notifications sent',
      sent: successful,
      failed,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Send test notification to all users
 * GET /api/push/send/test
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId') || '1');

    const testPayload = {
      title: 'Test Notification',
      body: 'This is a test notification from CapturePWA!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: {
        url: '/settings',
      },
    };

    // Use the POST endpoint logic
    const response = await fetch(new URL('/api/push/send', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...testPayload }),
    });

    return response;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification', details: error.message },
      { status: 500 }
    );
  }
}
