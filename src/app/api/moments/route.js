import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/moments
 * Fetch all moments, ordered by creation date (newest first)
 */
export async function GET() {
  try {
    const moments = await prisma.moment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(moments);
  } catch (error) {
    console.error('Error fetching moments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/moments
 * Create a new moment
 * Body: { description, gpsLat?, gpsLng?, imageUrl?, audioUrl? }
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required field
    if (!body.description || body.description.trim() === '') {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    // Create moment with provided data
    const moment = await prisma.moment.create({
      data: {
        description: body.description.trim(),
        gpsLat: body.gpsLat ?? 0.0,
        gpsLng: body.gpsLng ?? 0.0,
        imageUrl: body.imageUrl || null,
        audioUrl: body.audioUrl || null,
      },
    });

    return NextResponse.json(moment, { status: 201 });
  } catch (error) {
    console.error('Error creating moment:', error);
    return NextResponse.json(
      { error: 'Failed to create moment' },
      { status: 500 }
    );
  }
}
