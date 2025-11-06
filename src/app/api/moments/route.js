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
 * Body: {
 *   description, gpsLat?, gpsLng?, imageUrl?, audioUrl?,
 *   mood?, weather?, categoryId?, tagIds?
 * }
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

    // Prepare moment data
    const momentData = {
      description: body.description.trim(),
      gpsLat: body.gpsLat ?? 0.0,
      gpsLng: body.gpsLng ?? 0.0,
      imageUrl: body.imageUrl || null,
      audioUrl: body.audioUrl || null,
      mood: body.mood || null,
      weather: body.weather || null,
      categoryId: body.categoryId || null,
    };

    // Create moment with tags if provided
    const moment = await prisma.moment.create({
      data: {
        ...momentData,
        // Connect tags using the junction table
        tags: body.tagIds && body.tagIds.length > 0
          ? {
              create: body.tagIds.map(tagId => ({
                tag: {
                  connect: { id: tagId }
                }
              }))
            }
          : undefined
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    // Format tags to flatten the nested structure
    const formattedMoment = {
      ...moment,
      tags: moment.tags.map(mt => mt.tag),
    };

    return NextResponse.json(formattedMoment, { status: 201 });
  } catch (error) {
    console.error('Error creating moment:', error);
    return NextResponse.json(
      { error: 'Failed to create moment' },
      { status: 500 }
    );
  }
}
