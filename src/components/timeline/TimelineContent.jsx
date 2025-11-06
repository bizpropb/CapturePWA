'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { groupMomentsByDate } from '@/utils/date-grouping';
import TimelineGroup from './TimelineGroup';
import TimelineSearch from './TimelineSearch';
import TimelineFilters from './TimelineFilters';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EditModal from '@/components/moments/EditModal';

/**
 * Main timeline content component
 * Manages state for search, filters, pagination, and moment display
 */
export default function TimelineContent({ initialData }) {
  const router = useRouter();
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
  const [editingMoment, setEditingMoment] = useState(null);

  // Fetch moments when search or filters change
  useEffect(() => {
    // Always fetch when search or filters change (including when search is cleared)
    fetchMoments(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filters.tagIds.join(','), filters.categoryId, filters.mood]);

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

  /**
   * Handle edit moment
   */
  const handleEdit = (moment) => {
    setEditingMoment(moment);
  };

  /**
   * Handle delete moment
   */
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this moment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/moments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete moment');
      }

      // Remove moment from list and refresh
      setMoments(moments.filter((m) => m.id !== id));
      router.refresh();
    } catch (err) {
      alert('Error deleting moment: ' + err.message);
    }
  };

  /**
   * Handle save edited moment
   */
  const handleSave = (updatedMoment) => {
    // Update moment in list
    setMoments(moments.map((m) => (m.id === updatedMoment.id ? updatedMoment : m)));
    router.refresh();
  };

  /**
   * Close edit modal
   */
  const handleCloseModal = () => {
    setEditingMoment(null);
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
              <TimelineGroup
                key={group.label}
                group={group}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
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

      {/* Edit Modal */}
      {editingMoment && (
        <EditModal
          moment={editingMoment}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
