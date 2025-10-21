import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/moments/[id]
 * Fetch a single moment by ID
 */
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid moment ID' },
        { status: 400 }
      );
    }

    const moment = await prisma.moment.findUnique({
      where: { id },
    });

    if (!moment) {
      return NextResponse.json(
        { error: 'Moment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(moment);
  } catch (error) {
    console.error('Error fetching moment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moment' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/moments/[id]
 * Update a moment by ID
 * Body: { description?, gpsLat?, gpsLng?, imageUrl?, audioUrl? }
 */
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid moment ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Build update data object (only include provided fields)
    const updateData = {};
    if (body.description !== undefined) {
      updateData.description = body.description.trim();
    }
    if (body.gpsLat !== undefined) {
      updateData.gpsLat = body.gpsLat;
    }
    if (body.gpsLng !== undefined) {
      updateData.gpsLng = body.gpsLng;
    }
    if (body.imageUrl !== undefined) {
      updateData.imageUrl = body.imageUrl || null;
    }
    if (body.audioUrl !== undefined) {
      updateData.audioUrl = body.audioUrl || null;
    }

    const moment = await prisma.moment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(moment);
  } catch (error) {
    if (error.code === 'P2025') {
      // Prisma error: Record not found
      return NextResponse.json(
        { error: 'Moment not found' },
        { status: 404 }
      );
    }

    console.error('Error updating moment:', error);
    return NextResponse.json(
      { error: 'Failed to update moment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/moments/[id]
 * Delete a moment by ID
 */
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid moment ID' },
        { status: 400 }
      );
    }

    await prisma.moment.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error.code === 'P2025') {
      // Prisma error: Record not found
      return NextResponse.json(
        { error: 'Moment not found' },
        { status: 404 }
      );
    }

    console.error('Error deleting moment:', error);
    return NextResponse.json(
      { error: 'Failed to delete moment' },
      { status: 500 }
    );
  }
}
