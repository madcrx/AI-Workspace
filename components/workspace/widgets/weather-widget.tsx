'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudRain, Sun, CloudSnow, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeatherData {
  temp: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

interface WeatherWidgetProps {
  settings?: {
    location?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    unit?: 'fahrenheit' | 'celsius';
  };
}

export function WeatherWidget({ settings }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const location = settings?.location || settings?.city || 'New York';
  const unit = settings?.unit || 'fahrenheit';

  useEffect(() => {
    fetchWeather();
  }, [location, unit]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      // Using geocoding to get coordinates from location name
      const geocodeResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
      );
      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.results || geocodeData.results.length === 0) {
        setLoading(false);
        return;
      }

      const { latitude, longitude, name } = geocodeData.results[0];

      // Using Open-Meteo API (free, no API key required)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&temperature_unit=${unit}`
      );
      const data = await response.json();

      const weatherCode = data.current?.weather_code || 0;
      let condition = 'Clear';
      if (weatherCode >= 51 && weatherCode <= 67) condition = 'Rainy';
      else if (weatherCode >= 71 && weatherCode <= 77) condition = 'Snowy';
      else if (weatherCode >= 1 && weatherCode <= 3) condition = 'Cloudy';

      setWeather({
        temp: Math.round(data.current?.temperature_2m || 0),
        condition,
        location: name,
        humidity: data.current?.relative_humidity_2m || 0,
        windSpeed: Math.round(data.current?.wind_speed_10m || 0),
        precipitation: data.current?.precipitation || 0,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setLoading(false);
    }
  };

  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="h-8 w-8" />;
    switch (weather.condition) {
      case 'Rainy':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'Snowy':
        return <CloudSnow className="h-8 w-8 text-blue-300" />;
      case 'Cloudy':
        return <Cloud className="h-8 w-8 text-gray-500" />;
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="pt-4 pb-4">
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading...</p>
        ) : weather ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              {getWeatherIcon()}
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {weather.temp}°{unit === 'celsius' ? 'C' : 'F'}
                </div>
                <div className="text-xs text-muted-foreground">{weather.condition}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="font-medium">{weather.location}</div>
              <div className="grid grid-cols-2 gap-2">
                <div>Wind: {weather.windSpeed} {unit === 'celsius' ? 'km/h' : 'mph'}</div>
                <div>Rain: {weather.precipitation} mm</div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Unable to load weather</p>
        )}
      </CardContent>
    </Card>
  );
}
