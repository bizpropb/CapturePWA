'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MapView from '@/components/capture/MapView';
import {
  momentsToCoordinates,
  calculateTotalDistance,
  formatDistance,
  getBoundingBox,
  clusterMoments
} from '@/utils/location-utils';
import { fetchMoments } from '@/lib/api';

export default function LocationHistoryPage() {
  const router = useRouter();
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMoment, setSelectedMoment] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list' | 'clusters'

  useEffect(() => {
    loadMoments();
  }, []);

  const loadMoments = async () => {
    try {
      setLoading(true);
      const data = await fetchMoments();
      // Filter moments with valid GPS coordinates
      const momentsWithLocation = data.filter(
        m => m.gpsLat !== 0 || m.gpsLng !== 0
      );
      setMoments(momentsWithLocation);
    } catch (err) {
      setError('Failed to load moments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading location history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (moments.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-4 text-blue-400 hover:text-blue-300 flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold mb-6">Location History</h1>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">No moments with location data yet.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Create First Moment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalDistance = calculateTotalDistance(moments);
  const coordinates = momentsToCoordinates(moments);
  const boundingBox = getBoundingBox(coordinates);
  const clusters = clusterMoments(moments, 100); // 100m radius

  const uniqueLocations = new Set(
    moments.map(m => `${m.gpsLat.toFixed(4)},${m.gpsLng.toFixed(4)}`)
  ).size;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold">Location History</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('clusters')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'clusters'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Clusters
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-sm text-gray-400">Total Moments</p>
              <p className="text-2xl font-bold text-blue-400">{moments.length}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-sm text-gray-400">Unique Locations</p>
              <p className="text-2xl font-bold text-green-400">{uniqueLocations}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-sm text-gray-400">Distance Traveled</p>
              <p className="text-2xl font-bold text-purple-400">
                {formatDistance(totalDistance)}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-sm text-gray-400">Clusters</p>
              <p className="text-2xl font-bold text-orange-400">{clusters.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        {viewMode === 'map' && boundingBox && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <MapView
              lat={boundingBox.center.lat}
              lng={boundingBox.center.lng}
              zoom={12}
              height={600}
              showMarker={false}
              markers={coordinates.map(c => ({
                lat: c.lat,
                lng: c.lng,
                popup: c.popup
              }))}
            />
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-4">
            {moments.map((moment, index) => (
              <div
                key={moment.id}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors cursor-pointer"
                onClick={() => setSelectedMoment(selectedMoment?.id === moment.id ? null : moment)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-400 text-sm">#{index + 1}</span>
                      <h3 className="font-medium text-gray-100">
                        {moment.description.substring(0, 50)}
                        {moment.description.length > 50 && '...'}
                      </h3>
                    </div>
                    {moment.locationName && (
                      <p className="text-sm text-gray-400 mb-1">
                        📍 {moment.locationName}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 font-mono">
                      {moment.gpsLat.toFixed(6)}, {moment.gpsLng.toFixed(6)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(moment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-gray-400">
                    {selectedMoment?.id === moment.id ? '▼' : '▶'}
                  </span>
                </div>

                {selectedMoment?.id === moment.id && (
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <MapView
                      lat={moment.gpsLat}
                      lng={moment.gpsLng}
                      zoom={15}
                      height={300}
                      showMarker={true}
                      popupText={moment.locationName || moment.description}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {viewMode === 'clusters' && (
          <div className="space-y-4">
            {clusters.map((cluster, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-100">
                      Cluster {index + 1}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {cluster.count} moment{cluster.count > 1 ? 's' : ''} at this location
                    </p>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      {cluster.center.lat.toFixed(6)}, {cluster.center.lng.toFixed(6)}
                    </p>
                  </div>
                  <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm">
                    {cluster.count}
                  </span>
                </div>

                <div className="mb-3 rounded-lg overflow-hidden">
                  <MapView
                    lat={cluster.center.lat}
                    lng={cluster.center.lng}
                    zoom={16}
                    height={200}
                    showMarker={true}
                    popupText={`${cluster.count} moments`}
                  />
                </div>

                <div className="space-y-2">
                  {cluster.moments.map(moment => (
                    <div
                      key={moment.id}
                      className="bg-gray-900 rounded p-2 text-sm"
                    >
                      <p className="text-gray-300">
                        {moment.description.substring(0, 60)}
                        {moment.description.length > 60 && '...'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(moment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
