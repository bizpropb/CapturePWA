'use client';

import MomentCard from './MomentCard';

export default function MomentList({ moments, onDelete, onEdit, loading }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-400">Loading moments...</p>
      </div>
    );
  }

  if (moments.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800 rounded-lg">
        <p className="text-gray-400 text-lg">No moments yet. Create your first moment!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-white">Your Moments</h2>
      <div className="flex flex-col gap-4">
        {moments.map((moment) => (
          <MomentCard
            key={moment.id}
            moment={moment}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}
