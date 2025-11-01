'use client';

import { useState, useEffect } from 'react';
import { groupMomentsByDate } from '@/utils/date-grouping';
import TimelineGroup from './TimelineGroup';
import TimelineSearch from './TimelineSearch';
import TimelineFilters from './TimelineFilters';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';

/**
 * Main timeline content component
 * Manages state for search, filters, pagination, and moment display
 */
export default function TimelineContent({ initialData }) {
  const [moments, setMoments] = useState(initialData?.moments || []);
  const [pagination, setPagination] = useState(initialData?.pagination || {});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    tagIds: [],
    categoryId: null,
    mood: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch moments when search or filters change
  useEffect(() => {
    if (searchQuery || filters.tagIds.length > 0 || filters.categoryId || filters.mood) {
      fetchMoments(1, true);
    }
  }, [searchQuery, filters]);

  /**
   * Fetch moments from API
   */
  const fetchMoments = async (page = 1, reset = false) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        searchQuery,
        tagIds: JSON.stringify(filters.tagIds),
      });

      if (filters.categoryId) {
        queryParams.append('categoryId', filters.categoryId.toString());
      }
      if (filters.mood) {
        queryParams.append('mood', filters.mood);
      }

      const response = await fetch(`/api/timeline?${queryParams}`);
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
   * Handle search
   */
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  /**
   * Reset filters and search
   */
  const resetAll = () => {
    setSearchQuery('');
    setFilters({
      tagIds: [],
      categoryId: null,
      mood: null,
    });
    setMoments(initialData?.moments || []);
    setPagination(initialData?.pagination || {});
  };

  // Group moments by date
  const groupedMoments = groupMomentsByDate(moments);

  const hasActiveFilters =
    searchQuery ||
    filters.tagIds.length > 0 ||
    filters.categoryId ||
    filters.mood;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Filter Sidebar (Desktop) / Collapsible (Mobile) */}
      <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
        <div className="sticky top-6">
          <TimelineFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={resetAll}
          />
        </div>
      </div>

      {/* Main Timeline */}
      <div className="flex-1 min-w-0">
        {/* Search Bar */}
        <div className="mb-6">
          <TimelineSearch
            searchQuery={searchQuery}
            onSearch={handleSearch}
            onToggleFilters={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
          />
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
            <span>Filters active</span>
            <button
              onClick={resetAll}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Timeline Groups */}
        {moments.length === 0 && !loading ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400 mb-4">No moments found</p>
            {hasActiveFilters ? (
              <p className="text-gray-500">
                Try adjusting your search or filters
              </p>
            ) : (
              <p className="text-gray-500">
                Start capturing moments to see them here
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {groupedMoments.map((group) => (
              <TimelineGroup key={group.label} group={group} />
            ))}
          </div>
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
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        )}

        {/* Results Count */}
        {moments.length > 0 && (
          <div className="text-center text-sm text-gray-500 mt-8">
            Showing {moments.length} of {pagination.totalCount} moments
          </div>
        )}
      </div>
    </div>
  );
}
