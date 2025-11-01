/**
 * Date grouping utilities for timeline
 * Groups moments by relative date (Today, Yesterday, This Week, etc.)
 */

/**
 * Get the relative date label for a timestamp
 * @param {Date|string} date - Date to get label for
 * @returns {string} Relative date label
 */
export function getRelativeDateLabel(date) {
  const momentDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - today.getDay());

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  const momentDateOnly = new Date(momentDate);
  momentDateOnly.setHours(0, 0, 0, 0);

  // Check if today
  if (momentDateOnly.getTime() === today.getTime()) {
    return 'Today';
  }

  // Check if yesterday
  if (momentDateOnly.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  // Check if this week (excluding today and yesterday)
  if (momentDateOnly >= thisWeekStart && momentDateOnly < today) {
    return 'This Week';
  }

  // Check if last week
  if (momentDateOnly >= lastWeekStart && momentDateOnly < thisWeekStart) {
    return 'Last Week';
  }

  // Check if this month (excluding this week)
  if (momentDateOnly >= thisMonthStart && momentDateOnly < thisWeekStart) {
    return 'This Month';
  }

  // Check if last month
  if (momentDateOnly >= lastMonthStart && momentDateOnly <= lastMonthEnd) {
    return 'Last Month';
  }

  // Check if this year
  if (momentDate.getFullYear() === today.getFullYear()) {
    return momentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // Older than this year
  return momentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Group moments by relative date
 * @param {Array} moments - Array of moment objects
 * @returns {Array} Array of grouped moments { label, moments[] }
 */
export function groupMomentsByDate(moments) {
  const groups = {};

  moments.forEach((moment) => {
    const label = getRelativeDateLabel(moment.createdAt);

    if (!groups[label]) {
      groups[label] = {
        label,
        moments: [],
      };
    }

    groups[label].moments.push(moment);
  });

  // Convert to array and sort by date (most recent first)
  const groupsArray = Object.values(groups);

  // Define order for relative date labels
  const labelOrder = [
    'Today',
    'Yesterday',
    'This Week',
    'Last Week',
    'This Month',
    'Last Month',
  ];

  groupsArray.sort((a, b) => {
    const aIndex = labelOrder.indexOf(a.label);
    const bIndex = labelOrder.indexOf(b.label);

    // If both are in the predefined order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    // If only a is in the predefined order
    if (aIndex !== -1) return -1;

    // If only b is in the predefined order
    if (bIndex !== -1) return 1;

    // Both are month/year labels - sort by date descending
    const aDate = new Date(a.moments[0].createdAt);
    const bDate = new Date(b.moments[0].createdAt);
    return bDate - aDate;
  });

  return groupsArray;
}

/**
 * Format date for display in timeline item
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatTimelineDate(date) {
  const momentDate = new Date(date);
  return momentDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get time ago string (e.g., "2 hours ago")
 * @param {Date|string} date - Date to get time ago for
 * @returns {string} Time ago string
 */
export function getTimeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHour < 24) return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
  if (diffDay < 7) return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
  if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  if (diffDay < 365) {
    const months = Math.floor(diffDay / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  const years = Math.floor(diffDay / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}
