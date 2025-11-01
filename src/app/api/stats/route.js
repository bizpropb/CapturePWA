import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/stats
 * Returns aggregated analytics data for the stats page
 *
 * Query params:
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    const whereClause = Object.keys(dateFilter).length > 0
      ? { createdAt: dateFilter }
      : {};

    // 1. Total counts and basic stats
    const totalStats = await prisma.moment.aggregate({
      where: whereClause,
      _count: { id: true },
      _avg: { viewCount: true }
    });

    // 2. Moments over time (grouped by date)
    const allMoments = await prisma.moment.findMany({
      where: whereClause,
      select: {
        createdAt: true,
        imageUrl: true,
        audioUrl: true,
        videoUrl: true,
        mood: true,
        categoryId: true,
        gpsLat: true,
        gpsLng: true,
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group moments by date for timeline chart
    const momentsByDate = {};
    allMoments.forEach(moment => {
      const date = moment.createdAt.toISOString().split('T')[0];
      momentsByDate[date] = (momentsByDate[date] || 0) + 1;
    });

    const momentsOverTime = Object.entries(momentsByDate).map(([date, count]) => ({
      date,
      count
    }));

    // 3. Moments by category
    const momentsByCategory = await prisma.moment.groupBy({
      where: whereClause,
      by: ['categoryId'],
      _count: { id: true }
    });

    // Fetch category names
    const categoryIds = momentsByCategory
      .map(item => item.categoryId)
      .filter(id => id !== null);

    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, icon: true }
    });

    const categoryMap = Object.fromEntries(
      categories.map(cat => [cat.id, cat])
    );

    const categoryStats = momentsByCategory.map(item => ({
      name: item.categoryId ? categoryMap[item.categoryId]?.name || 'Unknown' : 'Uncategorized',
      icon: item.categoryId ? categoryMap[item.categoryId]?.icon || '📁' : '📁',
      count: item._count.id,
      categoryId: item.categoryId
    }));

    // 4. Moments by mood
    const moodCounts = {};
    allMoments.forEach(moment => {
      if (moment.mood) {
        moodCounts[moment.mood] = (moodCounts[moment.mood] || 0) + 1;
      }
    });

    const moodStats = Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count
    }));

    // 5. Media breakdown
    let imageCount = 0;
    let audioCount = 0;
    let videoCount = 0;
    let textOnlyCount = 0;

    allMoments.forEach(moment => {
      if (moment.imageUrl) imageCount++;
      if (moment.audioUrl) audioCount++;
      if (moment.videoUrl) videoCount++;
      if (!moment.imageUrl && !moment.audioUrl && !moment.videoUrl) {
        textOnlyCount++;
      }
    });

    const mediaBreakdown = [
      { type: 'Images', count: imageCount },
      { type: 'Audio', count: audioCount },
      { type: 'Video', count: videoCount },
      { type: 'Text Only', count: textOnlyCount }
    ].filter(item => item.count > 0);

    // 6. Most used tags
    const tagRelations = await prisma.moment.findMany({
      where: whereClause,
      select: {
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        }
      }
    });

    const tagCounts = {};
    tagRelations.forEach(moment => {
      moment.tags.forEach(momentTag => {
        const tag = momentTag.tag;
        if (!tagCounts[tag.id]) {
          tagCounts[tag.id] = {
            id: tag.id,
            name: tag.name,
            color: tag.color,
            count: 0
          };
        }
        tagCounts[tag.id].count++;
      });
    });

    const topTags = Object.values(tagCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 tags

    // 7. Capture frequency (for heatmap)
    const captureFrequency = {};
    allMoments.forEach(moment => {
      const date = moment.createdAt.toISOString().split('T')[0];
      captureFrequency[date] = (captureFrequency[date] || 0) + 1;
    });

    // 8. GPS locations (for map)
    const locations = allMoments
      .filter(m => m.gpsLat !== 0 && m.gpsLng !== 0)
      .map(m => ({
        lat: m.gpsLat,
        lng: m.gpsLng
      }));

    // Return all stats
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalMoments: totalStats._count.id,
          averageViews: Math.round(totalStats._avg.viewCount || 0),
          dateRange: {
            start: startDate || null,
            end: endDate || null
          }
        },
        momentsOverTime,
        categoryStats,
        moodStats,
        mediaBreakdown,
        topTags,
        captureFrequency,
        locations
      }
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
