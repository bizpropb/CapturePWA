import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/moments/share/[token]
 * Fetch a moment by share token and increment view count
 */
export async function GET(request, { params }) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: 'Share token is required' },
        { status: 400 }
      );
    }

    // Fetch moment by share token with relations
    const moment = await prisma.moment.findUnique({
      where: { shareToken: token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // If moment not found or not public
    if (!moment) {
      return NextResponse.json(
        { error: 'Moment not found or not public' },
        { status: 404 }
      );
    }

    if (!moment.isPublic) {
      return NextResponse.json(
        { error: 'This moment is not publicly shared' },
        { status: 403 }
      );
    }

    // Increment view count
    await prisma.moment.update({
      where: { id: moment.id },
      data: { viewCount: { increment: 1 } },
    });

    // Format tags for response
    const formattedMoment = {
      ...moment,
      tags: moment.tags.map(mt => mt.tag),
    };

    return NextResponse.json(formattedMoment);
  } catch (error) {
    console.error('Error fetching shared moment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moment' },
      { status: 500 }
    );
  }
}
