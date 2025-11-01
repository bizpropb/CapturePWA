import { NextResponse } from 'next/server';
import { getAllMomentsWithMedia } from '@/lib/gallery-api';

/**
 * GET /api/gallery
 * Fetch moments with media (paginated and filtered)
 *
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 * - mediaType: 'all' | 'image' | 'audio' | 'video'
 * - sortBy: 'newest' | 'oldest' | 'mostViewed'
 * - dateFrom: ISO date string
 * - dateTo: ISO date string
 * - tagIds: JSON array of tag IDs
 * - categoryId: number
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const mediaType = searchParams.get('mediaType') || 'all';
    const sortBy = searchParams.get('sortBy') || 'newest';
    const dateFrom = searchParams.get('dateFrom')
      ? new Date(searchParams.get('dateFrom'))
      : null;
    const dateTo = searchParams.get('dateTo')
      ? new Date(searchParams.get('dateTo'))
      : null;
    const tagIds = searchParams.get('tagIds')
      ? JSON.parse(searchParams.get('tagIds'))
      : [];
    const categoryId = searchParams.get('categoryId')
      ? parseInt(searchParams.get('categoryId'), 10)
      : null;

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Fetch moments
    const result = await getAllMomentsWithMedia({
      page,
      limit,
      mediaType,
      sortBy,
      dateFrom,
      dateTo,
      tagIds,
      categoryId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Gallery API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery moments' },
      { status: 500 }
    );
  }
}
