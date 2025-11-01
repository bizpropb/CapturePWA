'use client';

import { useState, useEffect } from 'react';

/**
 * CategorySelector Component
 * Allows users to select a category for their moment
 * Fetches categories from the API
 */

export default function CategorySelector({ value, onChange, disabled = false }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (categoryId) => {
    onChange(categoryId === value ? null : categoryId);
  };

  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Category (optional)
        </label>
        <div className="text-sm text-gray-400">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Category (optional)
        </label>
        <div className="text-sm text-red-400">{error}</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Category (optional)
        </label>
        <div className="text-sm text-gray-400">No categories available</div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Category (optional)
      </label>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleSelect(category.id)}
            disabled={disabled}
            className={`
              flex items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200
              ${value === category.id
                ? 'border-purple-500 bg-purple-500/20 scale-105'
                : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={category.description || category.name}
          >
            <span className="text-2xl">{category.icon}</span>
            <span className="text-sm text-gray-300 truncate">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Selected Category Display */}
      {value && (
        <div className="mt-3 p-2 bg-purple-500/10 border border-purple-500/30 rounded text-sm text-purple-400">
          Category: {categories.find(c => c.id === value)?.icon} {categories.find(c => c.id === value)?.name}
        </div>
      )}
    </div>
  );
}
