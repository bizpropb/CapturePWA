import { NextResponse } from 'next/server';
import { getTimelineFilters } from '@/lib/timeline-api';

/**
 * GET /api/timeline/filters
 * Fetch available filters for the timeline (tags, categories, moods)
 */
export async function GET() {
  try {
    const filters = await getTimelineFilters();
    return NextResponse.json(filters);
  } catch (error) {
    console.error('Timeline filters API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline filters' },
      { status: 500 }
    );
  }
}
