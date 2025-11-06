'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

/**
 * Gallery filters component
 * Filters: media type, date range, tags, categories, sort
 */
export default function GalleryFilters({ filters, onFilterChange }) {
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch available tags and categories
  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/gallery/filters');
      if (!response.ok) throw new Error('Failed to fetch filters');
      const data = await response.json();
      setTags(data.tags || []);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleMediaTypeChange = (type) => {
    onFilterChange({ mediaType: type });
  };

  const handleSortChange = (sortBy) => {
    onFilterChange({ sortBy });
  };

  const handleCategoryChange = (categoryId) => {
    onFilterChange({
      categoryId: categoryId === filters.categoryId ? null : categoryId,
    });
  };

  const handleTagToggle = (tagId) => {
    const newTagIds = filters.tagIds.includes(tagId)
      ? filters.tagIds.filter((id) => id !== tagId)
      : [...filters.tagIds, tagId];
    onFilterChange({ tagIds: newTagIds });
  };

  const handleDateChange = (field, value) => {
    onFilterChange({ [field]: value ? new Date(value) : null });
  };

  const resetFilters = () => {
    onFilterChange({
      mediaType: 'all',
      sortBy: 'newest',
      dateFrom: null,
      dateTo: null,
      tagIds: [],
      categoryId: null,
    });
  };

  const hasActiveFilters =
    filters.mediaType !== 'all' ||
    filters.sortBy !== 'newest' ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.tagIds.length > 0 ||
    filters.categoryId;

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-100">Filters</h2>
          {hasActiveFilters && (
            <Button
              onClick={resetFilters}
              variant="secondary"
              size="sm"
            >
              Reset All
            </Button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-gray-400 hover:text-gray-200 transition-colors lg:hidden"
        >
          {showFilters ? '▲ Hide' : '▼ Show'}
        </button>
      </div>

      {/* Filters (always visible on desktop, toggleable on mobile) */}
      <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
        {/* Media Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Media Type
          </label>
          <div className="flex flex-wrap gap-2">
            {['all', 'image', 'audio', 'video'].map((type) => (
              <Button
                key={type}
                onClick={() => handleMediaTypeChange(type)}
                variant={filters.mediaType === type ? 'primary' : 'secondary'}
                size="sm"
                className="min-w-[100px]"
              >
                {type === 'all' && '🖼️ All'}
                {type === 'image' && '📷 Images'}
                {type === 'audio' && '🎤 Audio'}
                {type === 'video' && '🎬 Video'}
              </Button>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sort By
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'newest', label: '🕐 Newest' },
              { value: 'oldest', label: '🕑 Oldest' },
              { value: 'mostViewed', label: '👁️ Most Viewed' },
            ].map((option) => (
              <Button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                variant={filters.sortBy === option.value ? 'primary' : 'secondary'}
                size="sm"
                className="min-w-[120px]"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">From</label>
              <input
                type="date"
                value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">To</label>
              <input
                type="date"
                value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange('dateTo', e.target.value)}
                className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filters.categoryId === category.id
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags {filters.tagIds.length > 0 && `(${filters.tagIds.length} selected)`}
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = filters.tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    #{tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
