import { NextResponse } from 'next/server';
import { getTimelineMoments } from '@/lib/timeline-api';

/**
 * GET /api/timeline
 * Fetch moments for timeline (paginated, searchable, filterable)
 *
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 * - searchQuery: string (search descriptions/tags)
 * - tagIds: JSON array of tag IDs
 * - categoryId: number
 * - mood: string
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const searchQuery = searchParams.get('searchQuery') || '';
    const tagIds = searchParams.get('tagIds')
      ? JSON.parse(searchParams.get('tagIds'))
      : [];
    const categoryId = searchParams.get('categoryId')
      ? parseInt(searchParams.get('categoryId'), 10)
      : null;
    const mood = searchParams.get('mood') || null;

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Fetch moments
    const result = await getTimelineMoments({
      page,
      limit,
      searchQuery,
      filters: {
        tagIds,
        categoryId,
        mood,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Timeline API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline moments' },
      { status: 500 }
    );
  }
}
