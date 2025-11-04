'use client';

import { Card } from '@/components/ui';

/**
 * DashboardStats Component
 * Displays quick statistics cards for the dashboard
 */
export default function DashboardStats({ stats }) {
  const statCards = [
    {
      label: 'Total Moments',
      value: stats.totalMoments,
      icon: '✨',
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Photos',
      value: stats.photosCount,
      icon: '📸',
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Audio Clips',
      value: stats.audioCount,
      icon: '🎵',
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Videos',
      value: stats.videoCount,
      icon: '🎬',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card
          key={index}
          className="relative overflow-hidden"
        >
          {/* Gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`} />

          {/* Content */}
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{stat.icon}</span>
              <span className={`text-3xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </span>
            </div>
            <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
