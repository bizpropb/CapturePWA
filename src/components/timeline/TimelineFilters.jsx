'use client';

import { useState, useEffect } from 'react';

/**
 * Timeline filter sidebar
 * Filters: tags, categories, mood
 */
export default function TimelineFilters({ filters, onFilterChange, onReset }) {
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [moods, setMoods] = useState([]);

  // Fetch available filters
  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/timeline/filters');
      if (!response.ok) throw new Error('Failed to fetch filters');
      const data = await response.json();
      setTags(data.tags || []);
      setCategories(data.categories || []);
      setMoods(data.moods || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleCategoryChange = (categoryId) => {
    onFilterChange({
      categoryId: categoryId === filters.categoryId ? null : categoryId,
    });
  };

  const handleMoodChange = (mood) => {
    onFilterChange({
      mood: mood === filters.mood ? null : mood,
    });
  };

  const handleTagToggle = (tagId) => {
    const newTagIds = filters.tagIds.includes(tagId)
      ? filters.tagIds.filter((id) => id !== tagId)
      : [...filters.tagIds, tagId];
    onFilterChange({ tagIds: newTagIds });
  };

  const hasActiveFilters =
    filters.tagIds.length > 0 || filters.categoryId || filters.mood;

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-100">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Reset
          </button>
        )}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Category
          </label>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.categoryId === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Moods */}
      {moods.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Mood
          </label>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodChange(mood)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.mood === mood
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Tags {filters.tagIds.length > 0 && `(${filters.tagIds.length})`}
          </label>
          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.tagIds.includes(tag.id)
                    ? 'text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                style={
                  filters.tagIds.includes(tag.id)
                    ? { backgroundColor: tag.color }
                    : {}
                }
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tags.length === 0 && categories.length === 0 && moods.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No filters available</p>
          <p className="text-xs mt-1">
            Create moments with tags, categories, or moods to filter
          </p>
        </div>
      )}
    </div>
  );
}
