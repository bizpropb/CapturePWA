'use client';

import { useEffect, useState } from 'react';

/**
 * WelcomeSection Component
 * Displays today's date and a motivational message
 */
export default function WelcomeSection() {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues with date formatting
  useEffect(() => {
    setMounted(true);
  }, []);

  const motivationalMessages = [
    "Every moment is worth capturing ✨",
    "Create memories that last forever 🌟",
    "Your story matters. Capture it today 📖",
    "Life is a collection of moments 🎯",
    "Today is a perfect day to remember 🌅",
    "Capture the magic in everyday life ✨",
    "Your journey deserves to be documented 🚀",
    "Every day is a new page in your story 📝"
  ];

  // Get a consistent message based on the day of the year
  const getDailyMessage = () => {
    if (!mounted) return motivationalMessages[0];

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return motivationalMessages[dayOfYear % motivationalMessages.length];
  };

  const formatDate = () => {
    if (!mounted) return '';

    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="text-center mb-8">
      <p className="text-neutral-400 text-sm mb-2">
        {mounted && formatDate()}
      </p>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        {getDailyMessage()}
      </h2>
    </div>
  );
}
