import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';

/**
 * Generate a random share token
 */
function generateShareToken() {
  return randomBytes(16).toString('hex');
}

/**
 * POST /api/moments/[id]/share
 * Generate a share token for a moment and make it public
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const momentId = parseInt(id);

    if (isNaN(momentId)) {
      return NextResponse.json(
        { error: 'Invalid moment ID' },
        { status: 400 }
      );
    }

    // Check if moment exists
    const existingMoment = await prisma.moment.findUnique({
      where: { id: momentId },
      select: { id: true, shareToken: true, isPublic: true },
    });

    if (!existingMoment) {
      return NextResponse.json(
        { error: 'Moment not found' },
        { status: 404 }
      );
    }

    // If already has a share token and is public, return existing token
    if (existingMoment.shareToken && existingMoment.isPublic) {
      return NextResponse.json({
        shareToken: existingMoment.shareToken,
        shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/share/${existingMoment.shareToken}`,
        message: 'Using existing share link',
      });
    }

    // Generate new token if needed
    const shareToken = existingMoment.shareToken || generateShareToken();

    // Update moment to be public and set share token
    const updatedMoment = await prisma.moment.update({
      where: { id: momentId },
      data: {
        shareToken,
        isPublic: true,
      },
      select: {
        id: true,
        shareToken: true,
        isPublic: true,
      },
    });

    return NextResponse.json({
      shareToken: updatedMoment.shareToken,
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/share/${updatedMoment.shareToken}`,
      message: 'Share link created successfully',
    });
  } catch (error) {
    console.error('Error generating share token:', error);
    return NextResponse.json(
      { error: 'Failed to generate share link' },
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
    const momentId = parseInt(id);

    if (isNaN(momentId)) {
      return NextResponse.json(
        { error: 'Invalid moment ID' },
        { status: 400 }
      );
    }

    // Update moment to be private
    const updatedMoment = await prisma.moment.update({
      where: { id: momentId },
      data: {
        isPublic: false,
      },
      select: {
        id: true,
        isPublic: true,
      },
    });

    return NextResponse.json({
      message: 'Moment is now private',
      isPublic: updatedMoment.isPublic,
    });
  } catch (error) {
    console.error('Error removing share:', error);
    return NextResponse.json(
      { error: 'Failed to make moment private' },
      { status: 500 }
    );
  }
}
