import { MainLayout, PageHeader } from '@/components/layout';
import GalleryContent from '@/components/gallery/GalleryContent';

/**
 * Gallery Page
 * Client-side rendered gallery with:
 * - Responsive masonry grid layout
 * - Media filtering (images/audio/video)
 * - Date range filtering
 * - Tag and category filtering
 * - Sort options (newest, oldest, most viewed)
 * - Infinite scroll
 * - Lightbox for full-screen viewing
 * - Image download functionality
 */

export const metadata = {
  title: 'Gallery | CapturePWA',
  description: 'Browse your captured moments in a beautiful gallery',
};

export default function GalleryPage() {
  // Client-side rendering - data fetched in GalleryContent component
  return (
    <MainLayout>
      <PageHeader
        title="Gallery"
        description="Browse your captured moments"
      />

      {/* Gallery content with filters and grid */}
      <GalleryContent initialMoments={{ moments: [], pagination: { page: 1, limit: 20, totalCount: 0, totalPages: 0, hasMore: false } }} />
    </MainLayout>
  );
}
