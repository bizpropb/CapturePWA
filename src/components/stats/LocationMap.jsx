'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';

/**
 * LocationMap Component
 * Displays GPS locations of moments on an interactive map with clusters
 */
export default function LocationMap({ locations }) {
  // Calculate map center (average of all locations)
  const center = useMemo(() => {
    if (locations.length === 0) return [0, 0];

    const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;

    return [avgLat, avgLng];
  }, [locations]);

  // Cluster nearby locations (simple clustering by rounding to 3 decimals)
  const clusters = useMemo(() => {
    const clusterMap = {};

    locations.forEach(loc => {
      const key = `${loc.lat.toFixed(3)},${loc.lng.toFixed(3)}`;
      if (!clusterMap[key]) {
        clusterMap[key] = {
          lat: loc.lat,
          lng: loc.lng,
          count: 0
        };
      }
      clusterMap[key].count++;
    });

    return Object.values(clusterMap);
  }, [locations]);

  // Calculate appropriate zoom level based on spread of locations
  const zoom = useMemo(() => {
    if (locations.length === 0) return 2;
    if (locations.length === 1) return 13;

    // Calculate bounding box
    const lats = locations.map(l => l.lat);
    const lngs = locations.map(l => l.lng);
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const maxRange = Math.max(latRange, lngRange);

    // Determine zoom based on range
    if (maxRange > 50) return 3;
    if (maxRange > 20) return 5;
    if (maxRange > 10) return 6;
    if (maxRange > 5) return 7;
    if (maxRange > 2) return 8;
    if (maxRange > 1) return 9;
    if (maxRange > 0.5) return 10;
    if (maxRange > 0.1) return 11;
    return 12;
  }, [locations]);

  // Get marker size and color based on cluster count
  const getMarkerStyle = (count) => {
    if (count === 1) return { radius: 6, color: '#3b82f6', fillOpacity: 0.6 };
    if (count < 5) return { radius: 10, color: '#8b5cf6', fillOpacity: 0.7 };
    if (count < 10) return { radius: 14, color: '#f59e0b', fillOpacity: 0.8 };
    return { radius: 18, color: '#ef4444', fillOpacity: 0.9 };
  };

  if (locations.length === 0) {
    return (
      <div className="h-[400px] bg-neutral-800 rounded-lg flex items-center justify-center">
        <p className="text-neutral-400">No GPS data available</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {clusters.map((cluster, index) => {
          const style = getMarkerStyle(cluster.count);
          return (
            <CircleMarker
              key={index}
              center={[cluster.lat, cluster.lng]}
              radius={style.radius}
              pathOptions={{
                color: style.color,
                fillColor: style.color,
                fillOpacity: style.fillOpacity,
                weight: 2
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold mb-1">
                    {cluster.count} moment{cluster.count !== 1 ? 's' : ''}
                  </div>
                  <div className="text-neutral-600 text-xs">
                    {cluster.lat.toFixed(6)}, {cluster.lng.toFixed(6)}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
