import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/stats/dashboard
 * Returns dashboard statistics including:
 * - Total moments count
 * - Count of moments with photos
 * - Count of moments with audio
 * - Count of moments with video
 * - Recent 5 moments
 */
export async function GET() {
  try {
    // Get total counts using aggregation
    const [totalMoments, photosCount, audioCount, videoCount, recentMoments] = await Promise.all([
      // Total moments
      prisma.moment.count(),

      // Moments with images
      prisma.moment.count({
        where: {
          imageUrl: {
            not: null
          }
        }
      }),

      // Moments with audio
      prisma.moment.count({
        where: {
          audioUrl: {
            not: null
          }
        }
      }),

      // Moments with video
      prisma.moment.count({
        where: {
          videoUrl: {
            not: null
          }
        }
      }),

      // Recent 5 moments with relations
      prisma.moment.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          category: true,
          tags: {
            include: {
              tag: true
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      stats: {
        totalMoments,
        photosCount,
        audioCount,
        videoCount
      },
      recentMoments
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
