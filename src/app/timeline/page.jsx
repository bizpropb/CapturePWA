import MainLayout from '@/components/layout/MainLayout';
import PageHeader from '@/components/layout/PageHeader';
import TimelineContent from '@/components/timeline/TimelineContent';
import { getTimelineMoments } from '@/lib/timeline-api';

/**
 * Timeline Page
 * Server-side rendered timeline with:
 * - Chronological moment display
 * - Date grouping (Today, Yesterday, Last Week, etc.)
 * - Search functionality (descriptions/locations/tags)
 * - Filter sidebar (tags, categories, mood)
 * - Infinite scroll
 * - Mini-maps for GPS locations
 */

export const dynamic = 'force-dynamic'; // Force SSR
export const revalidate = 0; // No caching

/**
 * Generate metadata for SEO
 */
export async function generateMetadata() {
  return {
    title: 'Timeline | CapturePWA',
    description: 'View your moments in chronological order',
    openGraph: {
      title: 'Timeline | CapturePWA',
      description: 'Browse your life moments in chronological order',
      type: 'website',
    },
  };
}

/**
 * Fetch initial timeline data server-side
 */
async function getInitialData() {
  try {
    const data = await getTimelineMoments({
      page: 1,
      limit: 20,
      searchQuery: '',
      filters: {
        tagIds: [],
        categoryId: null,
        mood: null,
      },
    });
    return data;
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    return {
      moments: [],
      pagination: {
        page: 1,
        limit: 20,
        totalCount: 0,
        totalPages: 0,
        hasMore: false,
      },
    };
  }
}

export default async function TimelinePage() {
  // Fetch initial data server-side
  const initialData = await getInitialData();

  return (
    <MainLayout>
      <div className="container mx-auto max-w-[1200px] px-4 py-8 pb-24">
        {/* Page Header with Online Indicator */}
        <PageHeader
          title="Timeline"
          description="Your moments in chronological order"
        />

        {/* Timeline content with search and filters */}
        <TimelineContent initialData={initialData} />
      </div>
    </MainLayout>
  );
}
