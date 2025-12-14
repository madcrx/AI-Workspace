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
    city?: string;
    latitude?: number;
    longitude?: number;
  };
}

export function WeatherWidget({ onSettings, settings }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const city = settings?.city || 'New York';
  const latitude = settings?.latitude || 40.7128;
  const longitude = settings?.longitude || -74.006;

  useEffect(() => {
    fetchWeather();
  }, [latitude, longitude]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      // Using Open-Meteo API (free, no API key required)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&temperature_unit=fahrenheit`
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
        location: city,
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Cloud className="h-4 w-4" />
          Weather
        </CardTitle>
        {onSettings && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onSettings}>
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading...</p>
        ) : weather ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              {getWeatherIcon()}
              <div className="text-right">
                <div className="text-2xl font-bold">{weather.temp}°F</div>
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
