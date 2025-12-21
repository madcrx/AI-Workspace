'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ClockWidget } from './widgets/clock-widget';
import { NotepadWidget } from './widgets/notepad-widget';
import { CryptoWidget } from './widgets/crypto-widget';
import { WeatherWidget } from './widgets/weather-widget';
import { CalculatorWidget } from './widgets/calculator-widget';
import { StockWidget } from './widgets/stock-widget';
import { CalendarWidget } from './widgets/calendar-widget';
import { TodoWidget } from './widgets/todo-widget';
import { RSSWidget } from './widgets/rss-widget';

const AVAILABLE_WIDGETS = [
  { id: 'clock', name: 'Clock', component: ClockWidget },
  { id: 'calendar', name: 'Calendar', component: CalendarWidget },
  { id: 'notepad', name: 'Notepad', component: NotepadWidget },
  { id: 'crypto', name: 'Crypto Ticker', component: CryptoWidget },
  { id: 'weather', name: 'Weather', component: WeatherWidget },
  { id: 'calculator', name: 'Calculator', component: CalculatorWidget },
  { id: 'stock', name: 'Stock Ticker', component: StockWidget },
  { id: 'todo', name: 'To-Do List', component: TodoWidget },
  { id: 'rss', name: 'RSS Feed', component: RSSWidget },
];

export function SimplifiedWidgetSidebar() {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    // Load selected widgets from server
    const loadWidgets = async () => {
      try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          const widgets = data.widgets || [];
          setSelectedWidgets(widgets.map((w: any) => w.type));
        }
      } catch (error) {
        console.error('Error loading widgets:', error);
      }
    };
    loadWidgets();
  }, []);

  const toggleWidget = async (widgetId: string) => {
    let newSelected: string[];
    if (selectedWidgets.includes(widgetId)) {
      newSelected = selectedWidgets.filter(id => id !== widgetId);
    } else {
      newSelected = [...selectedWidgets, widgetId];
    }
    setSelectedWidgets(newSelected);

    // Save to server
    try {
      const widgetsData = newSelected.map(type => ({ type }));
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets: widgetsData }),
      });
    } catch (error) {
      console.error('Error saving widgets:', error);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left Sidebar - Widget Display */}
      <div
        className="w-80 border-r bg-muted/30 p-4 overflow-y-auto"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
      >
        <div className="space-y-4">
          {selectedWidgets.map((widgetId) => {
            const widgetDef = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
            if (!widgetDef) return null;

            const WidgetComponent = widgetDef.component;
            return (
              <div key={widgetId} className="widget-container">
                <WidgetComponent />
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel - Widget Selector */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Workspace Widgets</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Zoom:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  className="px-3 py-1 border rounded hover:bg-muted"
                >
                  −
                </button>
                <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
                <button
                  onClick={() => setZoom(Math.min(150, zoom + 10))}
                  className="px-3 py-1 border rounded hover:bg-muted"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {AVAILABLE_WIDGETS.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => toggleWidget(widget.id)}
                  >
                    <Checkbox
                      checked={selectedWidgets.includes(widget.id)}
                      onCheckedChange={() => toggleWidget(widget.id)}
                    />
                    <label className="flex-1 cursor-pointer font-medium">
                      {widget.name}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
