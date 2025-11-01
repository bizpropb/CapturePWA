import { NextResponse } from 'next/server';
import { getGalleryFilters } from '@/lib/gallery-api';

/**
 * GET /api/gallery/filters
 * Fetch available filters for the gallery (tags and categories)
 */
export async function GET() {
  try {
    const filters = await getGalleryFilters();
    return NextResponse.json(filters);
  } catch (error) {
    console.error('Gallery filters API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery filters' },
      { status: 500 }
    );
  }
}
