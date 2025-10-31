'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import geofenceManager from '@/lib/geofence-manager';
import { fetchMoments } from '@/lib/api';

export default function GeofencesPage() {
  const router = useRouter();
  const [geofences, setGeofences] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [moments, setMoments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGeofence, setNewGeofence] = useState({
    name: '',
    lat: '',
    lng: '',
    radius: 100,
  });

  useEffect(() => {
    loadGeofences();
    loadMoments();
    setIsMonitoring(geofenceManager.isMonitoring());
    setCurrentPosition(geofenceManager.getCurrentPosition());

    // Update position periodically if monitoring
    const interval = setInterval(() => {
      if (geofenceManager.isMonitoring()) {
        setCurrentPosition(geofenceManager.getCurrentPosition());
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const loadGeofences = () => {
    setGeofences(geofenceManager.getAllGeofences());
  };

  const loadMoments = async () => {
    try {
      const data = await fetchMoments();
      const momentsWithLocation = data.filter(m => m.gpsLat !== 0 || m.gpsLng !== 0);
      setMoments(momentsWithLocation);
    } catch (err) {
      console.error('Failed to load moments:', err);
    }
  };

  const handleStartMonitoring = () => {
    const success = geofenceManager.startMonitoring();
    if (success) {
      setIsMonitoring(true);
    } else {
      alert('Failed to start monitoring. Check GPS permissions.');
    }
  };

  const handleStopMonitoring = () => {
    geofenceManager.stopMonitoring();
    setIsMonitoring(false);
  };

  const handleAddGeofence = (e) => {
    e.preventDefault();

    try {
      geofenceManager.addGeofence({
        id: Date.now().toString(),
        name: newGeofence.name,
        lat: parseFloat(newGeofence.lat),
        lng: parseFloat(newGeofence.lng),
        radius: parseInt(newGeofence.radius),
        notifyOnEnter: true,
        notifyOnExit: true,
      });

      setNewGeofence({ name: '', lat: '', lng: '', radius: 100 });
      setShowAddForm(false);
      loadGeofences();
      alert('Geofence added! Start monitoring to receive notifications.');
    } catch (err) {
      alert('Failed to add geofence: ' + err.message);
    }
  };

  const handleAddFromMoment = (moment) => {
    setNewGeofence({
      name: moment.locationName || moment.description.substring(0, 30),
      lat: moment.gpsLat.toString(),
      lng: moment.gpsLng.toString(),
      radius: 100,
    });
    setShowAddForm(true);
  };

  const handleDeleteGeofence = (id) => {
    if (confirm('Delete this geofence?')) {
      geofenceManager.removeGeofence(id);
      loadGeofences();
    }
  };

  const activeGeofences = geofenceManager.getActiveGeofences();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-blue-400 hover:text-blue-300"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold">Geofences</h1>
          </div>
          <div className="flex items-center gap-2">
            {isMonitoring ? (
              <button
                onClick={handleStopMonitoring}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
                Stop Monitoring
              </button>
            ) : (
              <button
                onClick={handleStartMonitoring}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Start Monitoring
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Total Geofences</p>
            <p className="text-2xl font-bold text-blue-400">{geofences.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Active (Inside)</p>
            <p className="text-2xl font-bold text-green-400">{activeGeofences.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Monitoring Status</p>
            <p className={`text-2xl font-bold ${isMonitoring ? 'text-green-400' : 'text-gray-500'}`}>
              {isMonitoring ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>

        {/* Current Position */}
        {currentPosition && (
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-blue-100 mb-2">Current Position</p>
            <p className="text-xs text-blue-200 font-mono">
              {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
            </p>
            <p className="text-xs text-blue-300 mt-1">
              Accuracy: ±{Math.round(currentPosition.accuracy)}m
            </p>
          </div>
        )}

        {/* Geofence List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Geofences</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              {showAddForm ? 'Cancel' : '+ Add Geofence'}
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleAddGeofence} className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-3">Add New Geofence</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={newGeofence.name}
                    onChange={(e) => setNewGeofence({ ...newGeofence, name: e.target.value })}
                    placeholder="Home, Work, etc."
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={newGeofence.lat}
                      onChange={(e) => setNewGeofence({ ...newGeofence, lat: e.target.value })}
                      placeholder="0.000000"
                      required
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={newGeofence.lng}
                      onChange={(e) => setNewGeofence({ ...newGeofence, lng: e.target.value })}
                      placeholder="0.000000"
                      required
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Radius (meters): {newGeofence.radius}m
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={newGeofence.radius}
                    onChange={(e) => setNewGeofence({ ...newGeofence, radius: e.target.value })}
                    className="w-full"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                >
                  Add Geofence
                </button>
              </div>
            </form>
          )}

          {/* Geofence Cards */}
          {geofences.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400 mb-4">No geofences yet.</p>
              <p className="text-sm text-gray-500 mb-4">
                Add geofences to receive notifications when you enter or leave specific locations.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {geofences.map((geofence) => {
                const isActive = activeGeofences.some(g => g.id === geofence.id);
                return (
                  <div
                    key={geofence.id}
                    className={`rounded-lg p-4 border ${
                      isActive
                        ? 'bg-green-900 border-green-700'
                        : 'bg-gray-800 border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-lg">{geofence.name}</h3>
                          {isActive && (
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                              Inside
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 font-mono">
                          {geofence.lat.toFixed(6)}, {geofence.lng.toFixed(6)}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Radius: {geofence.radius}m
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteGeofence(geofence.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Add from Moments */}
        {moments.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Quick Add from Moments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {moments.slice(0, 6).map(moment => (
                <button
                  key={moment.id}
                  onClick={() => handleAddFromMoment(moment)}
                  className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-left transition-colors"
                >
                  <p className="text-sm font-medium text-gray-100 mb-1">
                    {moment.locationName || moment.description.substring(0, 30)}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    {moment.gpsLat.toFixed(4)}, {moment.gpsLng.toFixed(4)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-900 border border-blue-700 rounded-lg p-4">
          <h3 className="font-medium text-blue-100 mb-2">How Geofences Work</h3>
          <ul className="text-sm text-blue-200 space-y-1 list-disc list-inside">
            <li>Add locations you want to monitor</li>
            <li>Click "Start Monitoring" to enable tracking</li>
            <li>You'll get notifications when entering/leaving geofenced areas</li>
            <li>Your device will vibrate when crossing geofence boundaries</li>
            <li>Monitoring works in the background (PWA feature)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
