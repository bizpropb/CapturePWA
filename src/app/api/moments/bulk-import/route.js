import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/moments/bulk-import
 * Bulk import moments using Prisma transaction
 *
 * DEMONSTRATION: Prisma $transaction() feature
 * - All imports succeed or all fail (atomic operation)
 * - Prevents partial imports on errors
 * - Shows advanced Prisma capability
 *
 * Body: {
 *   moments: Array<{description, gpsLat?, gpsLng?, imageUrl?, audioUrl?, mood?, weather?, categoryId?}>
 * }
 */
export async function POST(request) {
  try {
    const { moments } = await request.json();

    // Validate input
    if (!Array.isArray(moments) || moments.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input: moments array is required' },
        { status: 400 }
      );
    }

    // Validate each moment
    const invalidMoments = moments.filter(m => !m.description || m.description.trim() === '');
    if (invalidMoments.length > 0) {
      return NextResponse.json(
        { error: `${invalidMoments.length} moment(s) missing description` },
        { status: 400 }
      );
    }

    console.log(`🔄 Starting bulk import of ${moments.length} moments using Prisma transaction...`);

    // ✨ PRISMA TRANSACTION DEMO ✨
    // Use $transaction to ensure all-or-nothing import
    // If any moment fails, the entire import is rolled back
    const result = await prisma.$transaction(async (tx) => {
      const createdMoments = [];

      for (const momentData of moments) {
        // Clean up data
        const cleanedData = {
          description: momentData.description.trim(),
          gpsLat: momentData.gpsLat ?? 0.0,
          gpsLng: momentData.gpsLng ?? 0.0,
          imageUrl: momentData.imageUrl || null,
          audioUrl: momentData.audioUrl || null,
          videoUrl: momentData.videoUrl || null,
          mood: momentData.mood || null,
          weather: momentData.weather || null,
          categoryId: momentData.categoryId || null,
          locationName: momentData.locationName || null,
          gpsAccuracy: momentData.gpsAccuracy || null,
        };

        // Create moment within transaction
        const moment = await tx.moment.create({
          data: cleanedData,
        });

        createdMoments.push(moment);
      }

      return createdMoments;
    });

    console.log(`✅ Bulk import completed successfully: ${result.length} moments created`);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.length} moments`,
      count: result.length,
      moments: result,
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Bulk import transaction failed:', error);

    // If transaction fails, ALL changes are rolled back
    return NextResponse.json(
      {
        success: false,
        error: 'Bulk import failed',
        message: error.message,
        details: 'Transaction rolled back - no moments were imported',
      },
      { status: 500 }
    );
  }
}
