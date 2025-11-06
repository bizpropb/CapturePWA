'use client';

import { useState, useEffect } from 'react';

/**
 * TagSelector Component
 * Allows users to select existing tags or create new ones
 * Supports multiple tag selection
 */

export default function TagSelector({ value = [], onChange, disabled = false }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // const [newTagName, setNewTagName] = useState('');
  // const [creating, setCreating] = useState(false);
  // const [showInput, setShowInput] = useState(false);

  // Fetch tags on mount
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');

      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }

      const data = await response.json();
      setTags(data);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTag = (tagId) => {
    if (value.includes(tagId)) {
      // Remove tag
      onChange(value.filter(id => id !== tagId));
    } else {
      // Add tag
      onChange([...value, tagId]);
    }
  };

  // COMMENTED OUT: Create new tag functionality (doesn't work, not needed)
  // const handleCreateTag = async (e) => {
  //   e.preventDefault();

  //   if (!newTagName.trim()) {
  //     return;
  //   }

  //   setCreating(true);
  //   setError('');

  //   try {
  //     const response = await fetch('/api/tags', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         name: newTagName.trim(),
  //       }),
  //     });

  //     if (!response.ok) {
  //       const data = await response.json();
  //       throw new Error(data.error || 'Failed to create tag');
  //     }

  //     const newTag = await response.json();

  //     // Add new tag to list
  //     setTags([...tags, newTag]);

  //     // Automatically select the new tag
  //     onChange([...value, newTag.id]);

  //     // Reset input
  //     setNewTagName('');
  //     setShowInput(false);
  //   } catch (err) {
  //     console.error('Error creating tag:', err);
  //     setError(err.message);
  //   } finally {
  //     setCreating(false);
  //   }
  // };

  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tags (optional)
        </label>
        <div className="text-sm text-gray-400">Loading tags...</div>
      </div>
    );
  }

  const selectedTags = tags.filter(tag => value.includes(tag.id));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Tags (optional)
      </label>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map(tag => (
            <div
              key={tag.id}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-sm"
              style={{
                backgroundColor: `${tag.color}20`,
                borderColor: tag.color,
                borderWidth: '1px',
                color: tag.color,
              }}
            >
              <span>{tag.name}</span>
              <button
                type="button"
                onClick={() => handleToggleTag(tag.id)}
                disabled={disabled}
                className="ml-1 hover:opacity-70 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Available Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags
            .filter(tag => !value.includes(tag.id))
            .map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleToggleTag(tag.id)}
                disabled={disabled}
                className="px-3 py-1 rounded-full border text-sm transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: disabled ? '#374151' : `${tag.color}10`,
                  borderColor: tag.color,
                  color: tag.color,
                }}
              >
                {tag.name}
              </button>
            ))}
        </div>
      )}

      {/* COMMENTED OUT: Create New Tag UI (doesn't work, not needed) */}
      {/* {!showInput ? (
        <button
          type="button"
          onClick={() => setShowInput(true)}
          disabled={disabled}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
        >
          <span>+</span> Create new tag
        </button>
      ) : (
        <form onSubmit={handleCreateTag} className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Tag name..."
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={creating || disabled}
            autoFocus
          />
          <button
            type="submit"
            disabled={creating || disabled || !newTagName.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? 'Creating...' : 'Add'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowInput(false);
              setNewTagName('');
              setError('');
            }}
            disabled={creating || disabled}
            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </form>
      )} */}

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-400">{error}</div>
      )}

      {/* Empty State */}
      {tags.length === 0 && !showInput && (
        <div className="text-sm text-gray-400">
          No tags yet. Create your first tag!
        </div>
      )}
    </div>
  );
}
