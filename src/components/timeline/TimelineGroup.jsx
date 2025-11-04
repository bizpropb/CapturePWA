'use client';

import TimelineItem from './TimelineItem';

/**
 * Timeline group component
 * Displays a group of moments under a date label
 */
export default function TimelineGroup({ group, onEdit, onDelete }) {
  return (
    <div className="relative">
      {/* Date Label */}
      <div className="sticky top-0 z-10 bg-gray-900 py-3 px-4 mb-4 -mx-4 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          {group.label}
          <span className="text-sm font-normal text-gray-500">
            ({group.moments.length})
          </span>
        </h2>
      </div>

      {/* Timeline Items */}
      <div className="space-y-6 relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-800 hidden md:block"></div>

        {group.moments.map((moment, index) => (
          <TimelineItem
            key={moment.id}
            moment={moment}
            isLast={index === group.moments.length - 1}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
