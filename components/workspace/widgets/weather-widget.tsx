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
}

interface WeatherWidgetProps {
  onSettings?: () => void;
  settings?: {
    location?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    unit?: 'fahrenheit' | 'celsius';
  };
}

export function WeatherWidget({ onSettings, settings }: WeatherWidgetProps) {
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
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&temperature_unit=${unit}`
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
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Cloud className="h-4 w-4" />
          Weather
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            <div className="text-xs text-muted-foreground">
              <div>{weather.location}</div>
              <div>Humidity: {weather.humidity}%</div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Unable to load weather</p>
        )}
      </CardContent>
    </Card>
  );
}
