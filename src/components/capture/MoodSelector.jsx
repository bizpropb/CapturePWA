'use client';

import { useState } from 'react';

/**
 * MoodSelector Component
 * Allows users to select their current mood with emoji-based options
 */

const MOOD_OPTIONS = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'excited', emoji: '🎉', label: 'Excited' },
  { value: 'love', emoji: '❤️', label: 'Loving' },
  { value: 'grateful', emoji: '🙏', label: 'Grateful' },
  { value: 'calm', emoji: '😌', label: 'Calm' },
  { value: 'thoughtful', emoji: '🤔', label: 'Thoughtful' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'tired', emoji: '😴', label: 'Tired' },
  { value: 'stressed', emoji: '😰', label: 'Stressed' },
  { value: 'angry', emoji: '😠', label: 'Angry' },
  { value: 'surprised', emoji: '😲', label: 'Surprised' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
];

export default function MoodSelector({ value, onChange, disabled = false }) {
  const [showAll, setShowAll] = useState(false);

  const handleSelect = (moodValue) => {
    onChange(moodValue === value ? null : moodValue);
  };

  const displayedMoods = showAll ? MOOD_OPTIONS : MOOD_OPTIONS.slice(0, 6);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        How are you feeling? (optional)
      </label>

      {/* Mood Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
        {displayedMoods.map((mood) => (
          <button
            key={mood.value}
            type="button"
            onClick={() => handleSelect(mood.value)}
            disabled={disabled}
            className={`
              flex flex-col items-center justify-center gap-1
              p-3 rounded-lg border-2 transition-all duration-200
              ${value === mood.value
                ? 'border-blue-500 bg-blue-500/20 scale-105'
                : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={mood.label}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-xs text-gray-300">{mood.label}</span>
          </button>
        ))}
      </div>

      {/* Show More/Less Toggle */}
      {!showAll ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          disabled={disabled}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Show more moods →
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setShowAll(false)}
          disabled={disabled}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Show less
        </button>
      )}

      {/* Selected Mood Display */}
      {value && (
        <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-sm text-blue-400">
          Current mood: {MOOD_OPTIONS.find(m => m.value === value)?.emoji} {MOOD_OPTIONS.find(m => m.value === value)?.label}
        </div>
      )}
    </div>
  );
}
