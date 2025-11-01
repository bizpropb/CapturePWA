'use client';

import { useState, useEffect } from 'react';
import GalleryGrid from './GalleryGrid';
import GalleryFilters from './GalleryFilters';
import Lightbox from './Lightbox';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';

/**
 * Main gallery content component
 * Manages state for filters, sorting, infinite scroll, and lightbox
 */
export default function GalleryContent({ initialMoments }) {
  const [moments, setMoments] = useState(initialMoments?.moments || []);
  const [pagination, setPagination] = useState(initialMoments?.pagination || {});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    mediaType: 'all',
    sortBy: 'newest',
    dateFrom: null,
    dateTo: null,
    tagIds: [],
    categoryId: null,
  });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Fetch moments on initial load and when filters change
  useEffect(() => {
    fetchMoments(1, true); // Reset to page 1 when filters change
  }, [filters]);

  // Initial data fetch on mount
  useEffect(() => {
    if (moments.length === 0 && !loading) {
      fetchMoments(1, true);
    }
  }, []);

  /**
   * Fetch moments from API
   */
  const fetchMoments = async (page = 1, reset = false) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...filters,
        tagIds: JSON.stringify(filters.tagIds),
      });

      const response = await fetch(`/api/gallery?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch moments');

      const data = await response.json();

      if (reset) {
        setMoments(data.moments);
      } else {
        setMoments((prev) => [...prev, ...data.moments]);
      }
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching moments:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load more moments (infinite scroll)
   */
  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      fetchMoments(pagination.page + 1, false);
    }
  };

  /**
   * Open lightbox at specific index
   */
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Extract media items for lightbox (images and videos only)
  const mediaItems = moments
    .filter((m) => m.imageUrl || m.videoUrl)
    .map((m) => ({
      id: m.id,
      type: m.imageUrl ? 'image' : 'video',
      url: m.imageUrl || m.videoUrl,
      description: m.description,
      createdAt: m.createdAt,
    }));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <GalleryFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Gallery Grid */}
      {moments.length === 0 && !loading ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-400 mb-4">No moments found</p>
          <p className="text-gray-500">
            Try adjusting your filters or capture some moments with media
          </p>
        </div>
      ) : (
        <GalleryGrid
          moments={moments}
          onItemClick={openLightbox}
          loading={loading && moments.length === 0}
        />
      )}

      {/* Load More Button */}
      {pagination.hasMore && (
        <div className="flex justify-center py-8">
          <Button
            onClick={loadMore}
            loading={loading}
            disabled={loading}
            variant="secondary"
            size="lg"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && moments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          items={mediaItems}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
