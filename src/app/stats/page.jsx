'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import dynamic from 'next/dynamic';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import MainLayout from '@/components/layout/MainLayout';
import PageHeader from '@/components/layout/PageHeader';

// Dynamically import the map component (client-side only)
const LocationMap = dynamic(() => import('@/components/stats/LocationMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-neutral-800 rounded-lg animate-pulse" />
});

// Color palette for charts
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Fetch stats data
  const fetchStats = async (startDate, endDate) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/stats?${params}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(dateRange.start, dateRange.end);
  }, []);

  // Export to JSON
  const exportJSON = () => {
    if (!stats) return;
    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `capturepwa-stats-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export to CSV
  const exportCSV = () => {
    if (!stats) return;

    // Create CSV from moments over time data
    let csv = 'Date,Count\n';
    stats.momentsOverTime.forEach(item => {
      csv += `${item.date},${item.count}\n`;
    });

    csv += '\n\nCategory,Count\n';
    stats.categoryStats.forEach(item => {
      csv += `${item.name},${item.count}\n`;
    });

    csv += '\n\nMood,Count\n';
    stats.moodStats.forEach(item => {
      csv += `${item.mood},${item.count}\n`;
    });

    const dataBlob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `capturepwa-stats-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Apply date filter
  const applyDateFilter = () => {
    fetchStats(dateRange.start, dateRange.end);
  };

  // Clear date filter
  const clearDateFilter = () => {
    setDateRange({ start: '', end: '' });
    fetchStats('', '');
  };

  if (loading && !stats) {
    return (
      <MainLayout>
        <div className="container mx-auto max-w-[1200px] px-4 py-8 pb-24">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-neutral-400">Loading statistics...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto max-w-[1200px] px-4 py-8 pb-24">
          <Card className="p-8 text-center">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <Button onClick={() => fetchStats(dateRange.start, dateRange.end)}>
              Try Again
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!stats) return null;

  return (
    <MainLayout>
    <div className="container mx-auto max-w-[1200px] px-4 py-8 pb-24">
      {/* Page Header with Online Indicator */}
      <PageHeader
        title="Analytics & Statistics"
        description="Insights into your captured moments"
      />

      {/* Controls */}
      <Card className="p-6 mb-8">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Date Range Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-neutral-400 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-neutral-400 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={applyDateFilter} disabled={loading}>
              {loading ? 'Loading...' : 'Apply Filter'}
            </Button>
            {(dateRange.start || dateRange.end) && (
              <Button variant="secondary" onClick={clearDateFilter}>
                Clear
              </Button>
            )}
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2 ml-auto">
            <Button variant="secondary" onClick={exportJSON}>
              Export JSON
            </Button>
            <Button variant="secondary" onClick={exportCSV}>
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-neutral-400 text-sm mb-1">Total Moments</div>
          <div className="text-4xl font-bold">{stats.overview.totalMoments}</div>
        </Card>
        <Card className="p-6">
          <div className="text-neutral-400 text-sm mb-1">Average Views</div>
          <div className="text-4xl font-bold">{stats.overview.averageViews}</div>
        </Card>
        <Card className="p-6">
          <div className="text-neutral-400 text-sm mb-1">Locations Captured</div>
          <div className="text-4xl font-bold">{stats.locations.length}</div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Moments Over Time - Line Chart */}
        {stats.momentsOverTime.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Moments Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.momentsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis
                  dataKey="date"
                  stroke="#a3a3a3"
                  tick={{ fill: '#a3a3a3' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#a3a3a3" tick={{ fill: '#a3a3a3' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#262626', border: '1px solid #404040', borderRadius: '8px' }}
                  labelStyle={{ color: '#ededed' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Legend wrapperStyle={{ color: '#a3a3a3' }} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Moments" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Moments by Category - Pie Chart */}
        {stats.categoryStats.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Moments by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryStats}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.icon} ${entry.name}`}
                >
                  {stats.categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#262626', border: '1px solid #404040', borderRadius: '8px' }}
                  itemStyle={{ color: '#ededed' }}
                />
                <Legend wrapperStyle={{ color: '#a3a3a3' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Moments by Mood - Bar Chart */}
        {stats.moodStats.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Moments by Mood</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.moodStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="mood" stroke="#a3a3a3" tick={{ fill: '#a3a3a3' }} />
                <YAxis stroke="#a3a3a3" tick={{ fill: '#a3a3a3' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#262626', border: '1px solid #404040', borderRadius: '8px' }}
                  labelStyle={{ color: '#ededed' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Legend wrapperStyle={{ color: '#a3a3a3' }} />
                <Bar dataKey="count" fill="#8b5cf6" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Media Breakdown - Pie Chart */}
        {stats.mediaBreakdown.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Media Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.mediaBreakdown}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {stats.mediaBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#262626', border: '1px solid #404040', borderRadius: '8px' }}
                  itemStyle={{ color: '#ededed' }}
                />
                <Legend wrapperStyle={{ color: '#a3a3a3' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Most Used Tags */}
      {stats.topTags.length > 0 && (
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Most Used Tags</h2>
          <div className="flex flex-wrap gap-3">
            {stats.topTags.map((tag) => (
              <div
                key={tag.id}
                className="px-4 py-2 rounded-full flex items-center gap-2"
                style={{ backgroundColor: tag.color + '20', borderColor: tag.color, borderWidth: '1px' }}
              >
                <span style={{ color: tag.color }} className="font-medium">{tag.name}</span>
                <span className="text-neutral-400 text-sm">({tag.count})</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Capture Frequency Heatmap */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Capture Frequency Heatmap</h2>
        <CaptureHeatmap data={stats.captureFrequency} />
      </Card>

      {/* GPS Locations Map */}
      {stats.locations.length > 0 && (
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Capture Locations</h2>
          <p className="text-neutral-400 text-sm mb-4">
            {stats.locations.length} moments with GPS data
          </p>
          <LocationMap locations={stats.locations} />
        </Card>
      )}

      {/* Empty State */}
      {stats.overview.totalMoments === 0 && (
        <Card className="p-12 text-center mt-8">
          <p className="text-neutral-400 text-lg mb-4">No data available for the selected date range</p>
          <Button onClick={clearDateFilter}>View All Data</Button>
        </Card>
      )}
    </div>
    </MainLayout>
  );
}

// Capture Frequency Heatmap Component
function CaptureHeatmap({ data }) {
  // Generate all 30 days from today backwards
  const days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = data[dateStr] || 0;
    days.push({ date: dateStr, count, dateObj: date });
  }

  // Find max count for color scaling
  const maxCount = Math.max(...days.map(d => d.count), 1);

  // Get color intensity based on count
  const getColor = (count) => {
    if (count === 0) return '#171717';
    const intensity = count / maxCount;
    if (intensity < 0.25) return '#1e3a8a';
    if (intensity < 0.5) return '#1e40af';
    if (intensity < 0.75) return '#2563eb';
    return '#3b82f6';
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-neutral-400">
        Last 30 days
      </div>
      <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-30 gap-1">
        {days.map(({ date, count, dateObj }) => (
          <div
            key={date}
            className="w-3 h-3 rounded-sm relative group cursor-pointer transition-transform hover:scale-150"
            style={{ backgroundColor: getColor(count) }}
            title={`${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${count} moment${count !== 1 ? 's' : ''}`}
          >
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-neutral-400">
        <span>Less</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#171717' }}></div>
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#1e3a8a' }}></div>
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#1e40af' }}></div>
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#2563eb' }}></div>
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#3b82f6' }}></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
