'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Grip, Settings, X, Plus } from 'lucide-react';
import { ClockWidget } from './widgets/clock-widget';
import { NotepadWidget } from './widgets/notepad-widget';
import { CryptoWidget } from './widgets/crypto-widget';
import { WeatherWidget } from './widgets/weather-widget';
import { CalculatorWidget } from './widgets/calculator-widget';
import { StockWidget } from './widgets/stock-widget';
import { CalendarWidget } from './widgets/calendar-widget';
import { TodoWidget } from './widgets/todo-widget';
import { RSSWidget } from './widgets/rss-widget';

interface WidgetInstance {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  settings?: any;
}

const AVAILABLE_WIDGETS = [
  { id: 'clock', name: 'Clock', component: ClockWidget, defaultWidth: 280, defaultHeight: 120 },
  { id: 'calendar', name: 'Calendar', component: CalendarWidget, defaultWidth: 320, defaultHeight: 350 },
  { id: 'notepad', name: 'Notepad', component: NotepadWidget, defaultWidth: 320, defaultHeight: 300 },
  { id: 'crypto', name: 'Crypto Ticker', component: CryptoWidget, defaultWidth: 300, defaultHeight: 200 },
  { id: 'weather', name: 'Weather', component: WeatherWidget, defaultWidth: 300, defaultHeight: 180 },
  { id: 'calculator', name: 'Calculator', component: CalculatorWidget, defaultWidth: 280, defaultHeight: 400 },
  { id: 'stock', name: 'Stock Ticker', component: StockWidget, defaultWidth: 300, defaultHeight: 200 },
  { id: 'todo', name: 'To-Do List', component: TodoWidget, defaultWidth: 320, defaultHeight: 350 },
  { id: 'rss', name: 'RSS Feed', component: RSSWidget, defaultWidth: 350, defaultHeight: 400 },
];

export function EnhancedWidgetSidebar() {
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [settingsWidget, setSettingsWidget] = useState<WidgetInstance | null>(null);
  const [draggingWidget, setDraggingWidget] = useState<string | null>(null);
  const [resizingWidget, setResizingWidget] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [widgetSettings, setWidgetSettings] = useState<any>({});
  const [widgetPage, setWidgetPage] = useState(0);

  const WIDGETS_PER_PAGE = 6;
  const totalPages = Math.ceil(AVAILABLE_WIDGETS.length / WIDGETS_PER_PAGE);
  const paginatedWidgets = AVAILABLE_WIDGETS.slice(
    widgetPage * WIDGETS_PER_PAGE,
    (widgetPage + 1) * WIDGETS_PER_PAGE
  );

  useEffect(() => {
    const saved = localStorage.getItem('enhanced-widgets');
    if (saved) {
      try {
        setWidgets(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading widgets:', e);
      }
    }
  }, []);

  const saveWidgets = (updatedWidgets: WidgetInstance[]) => {
    setWidgets(updatedWidgets);
    localStorage.setItem('enhanced-widgets', JSON.stringify(updatedWidgets));
  };

  const addWidget = (type: string) => {
    const widgetDef = AVAILABLE_WIDGETS.find(w => w.id === type);
    if (!widgetDef) return;

    const newWidget: WidgetInstance = {
      id: `${type}-${Date.now()}`,
      type,
      x: 20,
      y: 100 + (widgets.length * 30), // Start below header (header is ~64px)
      width: widgetDef.defaultWidth,
      height: widgetDef.defaultHeight,
      settings: {},
    };

    saveWidgets([...widgets, newWidget]);
    setIsAddDialogOpen(false);
  };

  const removeWidget = (id: string) => {
    saveWidgets(widgets.filter(w => w.id !== id));
  };

  const handleMouseDown = (e: React.MouseEvent, widgetId: string, isResize: boolean = false) => {
    e.stopPropagation();
    if (isResize) {
      setResizingWidget(widgetId);
    } else {
      setDraggingWidget(widgetId);
    }
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingWidget) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      saveWidgets(
        widgets.map(w =>
          w.id === draggingWidget
            ? { ...w, x: Math.max(0, w.x + dx), y: Math.max(80, w.y + dy) }
            : w
        )
      );

      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (resizingWidget) {
      // Only allow height resizing, width stays fixed
      const dy = e.clientY - dragStart.y;

      saveWidgets(
        widgets.map(w =>
          w.id === resizingWidget
            ? {
                ...w,
                height: Math.max(150, w.height + dy),
              }
            : w
        )
      );

      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDraggingWidget(null);
    setResizingWidget(null);
  };

  useEffect(() => {
    if (draggingWidget || resizingWidget) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingWidget, resizingWidget, dragStart]);

  const openSettings = (widget: WidgetInstance) => {
    setSettingsWidget(widget);
    setWidgetSettings(widget.settings || {});
  };

  const saveSettings = () => {
    if (!settingsWidget) return;

    saveWidgets(
      widgets.map(w =>
        w.id === settingsWidget.id ? { ...w, settings: widgetSettings } : w
      )
    );
    setSettingsWidget(null);
  };

  const renderWidget = (widget: WidgetInstance) => {
    const widgetDef = AVAILABLE_WIDGETS.find(w => w.id === widget.type);
    if (!widgetDef) return null;

    const WidgetComponent = widgetDef.component;

    return (
      <div
        key={widget.id}
        className="absolute bg-background border rounded-lg shadow-lg overflow-hidden pointer-events-auto"
        style={{
          left: `${widget.x}px`,
          top: `${widget.y}px`,
          width: `${widget.width}px`,
          height: `${widget.height}px`,
          cursor: draggingWidget === widget.id ? 'grabbing' : 'auto',
          zIndex: draggingWidget === widget.id ? 1000 : 100,
        }}
      >
        {/* Widget header with drag handle */}
        <div
          className="absolute top-0 left-0 right-0 h-8 bg-muted/50 flex items-center justify-between px-2 cursor-move"
          onMouseDown={(e) => handleMouseDown(e, widget.id)}
        >
          <div className="flex items-center gap-2">
            <Grip className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium">{widgetDef.name}</span>
          </div>
          <div className="flex items-center gap-1">
            {widget.type !== 'calendar' && widget.type !== 'calculator' && widget.type !== 'notepad' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => openSettings(widget)}
              >
                <Settings className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => removeWidget(widget.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Widget content */}
        <div className="pt-8 p-2 h-full overflow-auto">
          <WidgetComponent
            onSettings={() => openSettings(widget)}
            settings={widget.settings}
          />
        </div>

        {/* Resize handle - vertical only */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-primary/20 hover:bg-primary/40 transition-colors flex items-center justify-center"
          onMouseDown={(e) => handleMouseDown(e, widget.id, true)}
        >
          <div className="w-12 h-1 rounded-full bg-primary/60"></div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Add Widget Button */}
      <Button
        onClick={() => setIsAddDialogOpen(true)}
        className="fixed left-4 bottom-4 z-50 rounded-full shadow-lg"
        size="lg"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Widget
      </Button>

      {/* Widgets Container */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        {widgets.map(renderWidget)}
      </div>

      {/* Add Widget Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Widget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 py-4">
              {paginatedWidgets.map(widget => (
                <Button
                  key={widget.id}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => addWidget(widget.id)}
                >
                  <span className="font-medium">{widget.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {widget.defaultWidth}x{widget.defaultHeight}
                  </span>
                </Button>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWidgetPage(Math.max(0, widgetPage - 1))}
                  disabled={widgetPage === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {widgetPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWidgetPage(Math.min(totalPages - 1, widgetPage + 1))}
                  disabled={widgetPage === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Widget Settings Dialog */}
      <Dialog open={!!settingsWidget} onOpenChange={() => setSettingsWidget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {AVAILABLE_WIDGETS.find(w => w.id === settingsWidget?.type)?.name} Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {settingsWidget?.type === 'weather' && (
              <>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={widgetSettings.location || 'New York'}
                    onChange={(e) =>
                      setWidgetSettings({ ...widgetSettings, location: e.target.value })
                    }
                    placeholder="Enter city or location"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a city name (e.g., "New York", "London", "Tokyo")
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Temperature Unit</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={widgetSettings.unit || 'fahrenheit'}
                    onChange={(e) =>
                      setWidgetSettings({ ...widgetSettings, unit: e.target.value })
                    }
                  >
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                    <option value="celsius">Celsius (°C)</option>
                  </select>
                </div>
              </>
            )}

            {settingsWidget?.type === 'clock' && (
              <div className="space-y-2">
                <Label>Timezone</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={widgetSettings.timezone || 'America/New_York'}
                  onChange={(e) =>
                    setWidgetSettings({ ...widgetSettings, timezone: e.target.value })
                  }
                >
                  <option value="America/New_York">Eastern (US)</option>
                  <option value="America/Chicago">Central (US)</option>
                  <option value="America/Denver">Mountain (US)</option>
                  <option value="America/Los_Angeles">Pacific (US)</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Shanghai">Shanghai</option>
                  <option value="Australia/Sydney">Sydney</option>
                </select>
              </div>
            )}

            {settingsWidget?.type === 'crypto' && (
              <>
                <div className="space-y-2">
                  <Label>Cryptocurrencies (comma-separated abbreviations)</Label>
                  <Input
                    value={widgetSettings.coins || 'BTC,ETH,BNB'}
                    onChange={(e) =>
                      setWidgetSettings({ ...widgetSettings, coins: e.target.value })
                    }
                    placeholder="BTC,ETH,ADA,SOL"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use abbreviations (e.g., BTC, ETH, ADA, SOL, DOGE, MATIC)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={widgetSettings.currency || 'usd'}
                    onChange={(e) =>
                      setWidgetSettings({ ...widgetSettings, currency: e.target.value })
                    }
                  >
                    <option value="usd">USD ($)</option>
                    <option value="eur">EUR (€)</option>
                    <option value="gbp">GBP (£)</option>
                    <option value="jpy">JPY (¥)</option>
                    <option value="aud">AUD (A$)</option>
                    <option value="cad">CAD (C$)</option>
                  </select>
                </div>
              </>
            )}

            {settingsWidget?.type === 'stock' && (
              <div className="space-y-2">
                <Label>Stock Symbols (comma-separated)</Label>
                <Input
                  value={widgetSettings.symbols?.join(',') || 'AAPL,GOOGL,MSFT,TSLA'}
                  onChange={(e) =>
                    setWidgetSettings({
                      ...widgetSettings,
                      symbols: e.target.value.split(',').map(s => s.trim()),
                    })
                  }
                  placeholder="AAPL,GOOGL,MSFT"
                />
              </div>
            )}

            {settingsWidget?.type === 'rss' && (
              <div className="space-y-2">
                <Label>RSS Feed URL or Name</Label>
                <Input
                  value={widgetSettings.feedUrl || 'AI News'}
                  onChange={(e) =>
                    setWidgetSettings({ ...widgetSettings, feedUrl: e.target.value })
                  }
                  placeholder="https://example.com/rss or Feed Name"
                />
              </div>
            )}

            <Button onClick={saveSettings} className="w-full">
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
