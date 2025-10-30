import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Subscribe to push notifications
 * POST /api/push/subscribe
 *
 * Body: {
 *   subscription: PushSubscription object from browser
 *   userId: number (optional, defaults to 1)
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { subscription, userId = 1 } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      );
    }

    // Extract auth and p256dh keys from subscription
    const auth = subscription.keys?.auth;
    const p256dh = subscription.keys?.p256dh;

    if (!auth || !p256dh) {
      return NextResponse.json(
        { error: 'Missing auth or p256dh keys' },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint },
    });

    if (existing) {
      return NextResponse.json({
        message: 'Subscription already exists',
        subscription: existing,
      });
    }

    // Create new push subscription
    const newSubscription = await prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        auth,
        p256dh,
      },
    });

    return NextResponse.json({
      message: 'Subscription created successfully',
      subscription: newSubscription,
    });
  } catch (error) {
    console.error('Error creating push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get all push subscriptions for a user
 * GET /api/push/subscribe?userId=1
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId') || '1');

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Error fetching push subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Unsubscribe from push notifications
 * DELETE /api/push/subscribe?endpoint=...
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint parameter is required' },
        { status: 400 }
      );
    }

    const deleted = await prisma.pushSubscription.delete({
      where: { endpoint },
    });

    return NextResponse.json({
      message: 'Subscription deleted successfully',
      subscription: deleted,
    });
  } catch (error) {
    console.error('Error deleting push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription', details: error.message },
      { status: 500 }
    );
  }
}
