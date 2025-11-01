import { NextResponse } from 'next/server';

/**
 * GET /api/weather?lat={lat}&lng={lng}
 * Fetches current weather data based on GPS coordinates
 * Uses OpenWeather API (optional - gracefully handles missing API key)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Weather API key not configured. Please add OPENWEATHER_API_KEY to your .env file.' },
        { status: 503 }
      );
    }

    // Call OpenWeather API
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

    const response = await fetch(weatherUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    // Parse and simplify weather data
    const weatherInfo = {
      condition: data.weather[0]?.main?.toLowerCase() || 'clear',
      description: data.weather[0]?.description || 'Clear sky',
      temperature: Math.round(data.main?.temp) || null,
      feelsLike: Math.round(data.main?.feels_like) || null,
      humidity: data.main?.humidity || null,
      location: data.name || 'Unknown'
    };

    return NextResponse.json(weatherInfo);
  } catch (error) {
    console.error('Weather fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data. Please try again.' },
      { status: 500 }
    );
  }
}
