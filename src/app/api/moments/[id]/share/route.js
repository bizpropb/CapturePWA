import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * Generate a unique share token
 * Format: 8-character alphanumeric string
 */
function generateShareToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * POST /api/moments/[id]/share
 * Generate or retrieve share token for a moment
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const momentId = parseInt(id, 10);

    if (isNaN(momentId)) {
      return NextResponse.json(
        { error: 'Invalid moment ID' },
        { status: 400 }
      );
    }

    // Find the moment
    const moment = await prisma.moment.findUnique({
      where: { id: momentId },
    });

    if (!moment) {
      return NextResponse.json(
        { error: 'Moment not found' },
        { status: 404 }
      );
    }

    // If moment already has a share token, return it
    if (moment.shareToken) {
      return NextResponse.json({
        shareToken: moment.shareToken,
        shareUrl: `/share/${moment.shareToken}`,
      });
    }

    // Generate new share token
    let shareToken;
    let attempts = 0;
    const maxAttempts = 10;

    // Keep trying until we get a unique token
    while (attempts < maxAttempts) {
      shareToken = generateShareToken();

      // Check if token already exists
      const existing = await prisma.moment.findUnique({
        where: { shareToken },
      });

      if (!existing) {
        break; // Token is unique
      }

      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Failed to generate unique share token' },
        { status: 500 }
      );
    }

    // Update moment with share token and mark as public
    const updatedMoment = await prisma.moment.update({
      where: { id: momentId },
      data: {
        shareToken,
        isPublic: true,
      },
    });

    return NextResponse.json({
      shareToken: updatedMoment.shareToken,
      shareUrl: `/share/${updatedMoment.shareToken}`,
    });
  } catch (error) {
    console.error('Error generating share token:', error);
    return NextResponse.json(
      { error: 'Failed to generate share token' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/moments/[id]/share
 * Remove share token and make moment private
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const momentId = parseInt(id, 10);

    if (isNaN(momentId)) {
      return NextResponse.json(
        { error: 'Invalid moment ID' },
        { status: 400 }
      );
    }

    // Update moment to remove share token
    const updatedMoment = await prisma.moment.update({
      where: { id: momentId },
      data: {
        shareToken: null,
        isPublic: false,
      },
    });

    return NextResponse.json({
      message: 'Share link removed',
      moment: updatedMoment,
    });
  } catch (error) {
    console.error('Error removing share token:', error);
    return NextResponse.json(
      { error: 'Failed to remove share token' },
      { status: 500 }
    );
  }
}
