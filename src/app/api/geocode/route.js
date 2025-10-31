import { NextResponse } from 'next/server';

/**
 * Reverse geocode coordinates to address using OpenStreetMap Nominatim API
 * @route GET /api/geocode?lat={latitude}&lng={longitude}
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    // Validate coordinates
    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat and lng' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Coordinates out of range' },
        { status: 400 }
      );
    }

    // Call OpenStreetMap Nominatim API for reverse geocoding
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'CapturePWA/1.0', // Nominatim requires User-Agent header
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    // Check if location was found
    if (data.error) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    // Extract useful address components
    const address = data.address || {};
    const locationData = {
      displayName: data.display_name,
      address: {
        road: address.road || null,
        city: address.city || address.town || address.village || null,
        state: address.state || null,
        country: address.country || null,
        countryCode: address.country_code || null,
        postcode: address.postcode || null,
        suburb: address.suburb || address.neighbourhood || null,
      },
      // Short formatted address
      shortAddress: [
        address.road,
        address.city || address.town || address.village,
        address.country
      ].filter(Boolean).join(', '),
      coordinates: {
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon),
      },
    };

    return NextResponse.json(locationData);

  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode location', details: error.message },
      { status: 500 }
    );
  }
}
