'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClockWidgetProps {
  onSettings?: () => void;
  settings?: {
    timezone?: string;
  };
}

export function ClockWidget({ onSettings, settings }: ClockWidgetProps) {
  const [time, setTime] = useState(new Date());

  const timezone = settings?.timezone || 'America/New_York';

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    return time.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = () => {
    return time.toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTimezoneName = () => {
    const names: { [key: string]: string } = {
      'America/New_York': 'Eastern',
      'America/Chicago': 'Central',
      'America/Denver': 'Mountain',
      'America/Los_Angeles': 'Pacific',
      'Europe/London': 'London',
      'Europe/Paris': 'Paris',
      'Asia/Tokyo': 'Tokyo',
      'Asia/Shanghai': 'Shanghai',
      'Australia/Sydney': 'Sydney',
    };
    return names[timezone] || timezone;
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Clock - {getTimezoneName()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-2xl font-bold">
            {formatTime()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatDate()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
