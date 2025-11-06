'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * MapView Component
 * Displays an interactive map using Leaflet (client-side only)
 *
 * @param {Object} props
 * @param {number} props.lat - Latitude
 * @param {number} props.lng - Longitude
 * @param {number} [props.zoom=13] - Initial zoom level
 * @param {number} [props.height=300] - Map height in pixels
 * @param {boolean} [props.showMarker=true] - Show marker at center
 * @param {string} [props.popupText] - Optional popup text for marker
 * @param {Array} [props.markers] - Array of additional markers: [{lat, lng, popup}]
 */
export default function MapView({
  lat,
  lng,
  zoom = 13,
  height = 300,
  showMarker = true,
  popupText,
  markers = []
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !mapRef.current) {
      return;
    }

    // Dynamically import Leaflet CSS and JS
    const loadMap = async () => {
      try {
        // Import Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Import Leaflet JS
        const L = (await import('leaflet')).default;

        // Fix marker icon issue with Webpack
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Check if map is already initialized and remove it
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Check if the container has a Leaflet instance
        if (mapRef.current._leaflet_id) {
          // Container already initialized, clear it
          mapRef.current._leaflet_id = undefined;
        }

        // Initialize map
        const map = L.map(mapRef.current).setView([lat, lng], zoom);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Add main marker
        if (showMarker) {
          const marker = L.marker([lat, lng]).addTo(map);
          if (popupText) {
            marker.bindPopup(popupText);
          }
        }

        // Add additional markers
        markers.forEach(({ lat: markerLat, lng: markerLng, popup }) => {
          const marker = L.marker([markerLat, markerLng]).addTo(map);
          if (popup) {
            marker.bindPopup(popup);
          }
        });

        mapInstanceRef.current = map;
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading map:', error);
        setIsLoading(false);
      }
    };

    loadMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, zoom, showMarker, popupText, markers]);

  return (
    <>
      {isLoading && (
        <div
          className="bg-gray-800 rounded-lg flex items-center justify-center"
          style={{ height: `${height}px` }}
        >
          <div className="text-gray-400">Loading map...</div>
        </div>
      )}
      <div
        ref={mapRef}
        style={{
          height: `${height}px`,
          width: '100%',
          borderRadius: '8px',
          display: isLoading ? 'none' : 'block'
        }}
        className="z-0"
      />
    </>
  );
}
