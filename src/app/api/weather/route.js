import { NextResponse } from 'next/server';

/**
 * GET /api/weather?lat={lat}&lng={lng}
 * Fetches current weather data based on GPS coordinates
 * Uses Open-Meteo API (free, no API key required)
 * Fallback to OpenWeather if OPENWEATHER_API_KEY is set
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

    // Use Open-Meteo (free, no key required) as default
    if (!apiKey) {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;

      const response = await fetch(weatherUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();

      // Map WMO weather codes to simple conditions
      const weatherCodeMap = {
        0: { condition: 'clear', description: 'Clear sky' },
        1: { condition: 'clear', description: 'Mainly clear' },
        2: { condition: 'cloudy', description: 'Partly cloudy' },
        3: { condition: 'cloudy', description: 'Overcast' },
        45: { condition: 'foggy', description: 'Foggy' },
        48: { condition: 'foggy', description: 'Depositing rime fog' },
        51: { condition: 'rainy', description: 'Light drizzle' },
        53: { condition: 'rainy', description: 'Moderate drizzle' },
        55: { condition: 'rainy', description: 'Dense drizzle' },
        61: { condition: 'rainy', description: 'Slight rain' },
        63: { condition: 'rainy', description: 'Moderate rain' },
        65: { condition: 'rainy', description: 'Heavy rain' },
        71: { condition: 'snowy', description: 'Slight snow' },
        73: { condition: 'snowy', description: 'Moderate snow' },
        75: { condition: 'snowy', description: 'Heavy snow' },
        77: { condition: 'snowy', description: 'Snow grains' },
        80: { condition: 'rainy', description: 'Slight rain showers' },
        81: { condition: 'rainy', description: 'Moderate rain showers' },
        82: { condition: 'rainy', description: 'Violent rain showers' },
        85: { condition: 'snowy', description: 'Slight snow showers' },
        86: { condition: 'snowy', description: 'Heavy snow showers' },
        95: { condition: 'stormy', description: 'Thunderstorm' },
        96: { condition: 'stormy', description: 'Thunderstorm with slight hail' },
        99: { condition: 'stormy', description: 'Thunderstorm with heavy hail' },
      };

      const weatherCode = data.current?.weather_code || 0;
      const weather = weatherCodeMap[weatherCode] || { condition: 'clear', description: 'Clear' };

      const weatherInfo = {
        condition: weather.condition,
        description: weather.description,
        temperature: Math.round(data.current?.temperature_2m) || null,
        feelsLike: null, // Open-Meteo doesn't provide feels-like in free tier
        humidity: data.current?.relative_humidity_2m || null,
        location: 'Current Location'
      };

      return NextResponse.json(weatherInfo);
    }

    // Use OpenWeather API if key is provided
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
