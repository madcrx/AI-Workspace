'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClockWidget } from './widgets/clock-widget';
import { NotepadWidget } from './widgets/notepad-widget';
import { CryptoWidget } from './widgets/crypto-widget';
import { WeatherWidget } from './widgets/weather-widget';
import { CalculatorWidget } from './widgets/calculator-widget';
import { StockWidget } from './widgets/stock-widget';
import { CalendarWidget } from './widgets/calendar-widget';
import { TodoWidget } from './widgets/todo-widget';
import { RSSWidget } from './widgets/rss-widget';
import { ChevronDown, ChevronRight, Settings as SettingsIcon } from 'lucide-react';

interface WidgetSettings {
  timezone?: string;
  location?: string;
  coins?: string[];
  symbols?: string[];
  unit?: 'celsius' | 'fahrenheit';
  feedUrl?: string;
}

interface WidgetConfig {
  type: string;
  settings?: WidgetSettings;
}

const AVAILABLE_WIDGETS = [
  {
    id: 'clock',
    name: 'Clock',
    component: ClockWidget,
    hasSettings: true,
    settingsFields: ['timezone']
  },
  {
    id: 'calendar',
    name: 'Calendar',
    component: CalendarWidget,
    hasSettings: false
  },
  {
    id: 'notepad',
    name: 'Notepad',
    component: NotepadWidget,
    hasSettings: false
  },
  {
    id: 'crypto',
    name: 'Crypto Ticker',
    component: CryptoWidget,
    hasSettings: true,
    settingsFields: ['coins']
  },
  {
    id: 'weather',
    name: 'Weather',
    component: WeatherWidget,
    hasSettings: true,
    settingsFields: ['location', 'unit']
  },
  {
    id: 'calculator',
    name: 'Calculator',
    component: CalculatorWidget,
    hasSettings: false
  },
  {
    id: 'stock',
    name: 'Stock Ticker',
    component: StockWidget,
    hasSettings: true,
    settingsFields: ['symbols']
  },
  {
    id: 'todo',
    name: 'To-Do List',
    component: TodoWidget,
    hasSettings: false
  },
  {
    id: 'rss',
    name: 'RSS Feed',
    component: RSSWidget,
    hasSettings: true,
    settingsFields: ['feedUrl']
  },
];

interface SimplifiedWidgetSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SimplifiedWidgetSidebar({ isOpen, onClose }: SimplifiedWidgetSidebarProps) {
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>([]);
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const [widgetSettings, setWidgetSettings] = useState<Map<string, WidgetSettings>>(new Map());

  useEffect(() => {
    // Load widgets from server
    const loadWidgets = async () => {
      try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          const configs = data.widgets || [];
          setWidgetConfigs(configs);

          // Load settings for each widget
          const settingsMap = new Map();
          configs.forEach((config: WidgetConfig) => {
            if (config.settings) {
              settingsMap.set(config.type, config.settings);
            }
          });
          setWidgetSettings(settingsMap);
        }
      } catch (error) {
        console.error('Error loading widgets:', error);
      }
    };
    loadWidgets();
  }, []);

  const saveWidgets = async (configs: WidgetConfig[]) => {
    setWidgetConfigs(configs);

    // Save to server
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets: configs }),
      });
    } catch (error) {
      console.error('Error saving widgets:', error);
    }
  };

  const toggleWidget = (widgetId: string) => {
    const isSelected = widgetConfigs.some(w => w.type === widgetId);
    let newConfigs: WidgetConfig[];

    if (isSelected) {
      newConfigs = widgetConfigs.filter(w => w.type !== widgetId);
      // Remove settings for this widget
      const newSettings = new Map(widgetSettings);
      newSettings.delete(widgetId);
      setWidgetSettings(newSettings);
    } else {
      newConfigs = [...widgetConfigs, { type: widgetId }];
    }

    saveWidgets(newConfigs);
  };

  const updateWidgetSettings = (widgetId: string, settings: WidgetSettings) => {
    const newSettings = new Map(widgetSettings);
    newSettings.set(widgetId, settings);
    setWidgetSettings(newSettings);

    // Update the widget config with settings
    const newConfigs = widgetConfigs.map(config =>
      config.type === widgetId
        ? { ...config, settings }
        : config
    );
    saveWidgets(newConfigs);
  };

  const renderWidgetSettings = (widget: any) => {
    const settings = widgetSettings.get(widget.id) || {};

    return (
      <div className="pl-8 pr-3 py-2 space-y-2 bg-muted/30">
        {widget.settingsFields?.includes('timezone') && (
          <div>
            <label className="text-xs font-medium mb-1 block">Timezone</label>
            <Select
              value={settings.timezone || 'America/New_York'}
              onValueChange={(value) => updateWidgetSettings(widget.id, { ...settings, timezone: value })}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern</SelectItem>
                <SelectItem value="America/Chicago">Central</SelectItem>
                <SelectItem value="America/Denver">Mountain</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                <SelectItem value="Australia/Sydney">Sydney</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {widget.settingsFields?.includes('location') && (
          <div>
            <label className="text-xs font-medium mb-1 block">Location</label>
            <Input
              value={settings.location || ''}
              onChange={(e) => updateWidgetSettings(widget.id, { ...settings, location: e.target.value })}
              placeholder="City name"
              className="h-7 text-xs"
            />
          </div>
        )}

        {widget.settingsFields?.includes('unit') && (
          <div>
            <label className="text-xs font-medium mb-1 block">Unit</label>
            <Select
              value={settings.unit || 'fahrenheit'}
              onValueChange={(value: 'celsius' | 'fahrenheit') => updateWidgetSettings(widget.id, { ...settings, unit: value })}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="celsius">Celsius / km/h</SelectItem>
                <SelectItem value="fahrenheit">Fahrenheit / mph</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {widget.settingsFields?.includes('coins') && (
          <div>
            <label className="text-xs font-medium mb-1 block">Coins (comma-separated)</label>
            <Input
              value={settings.coins?.join(', ') || ''}
              onChange={(e) => updateWidgetSettings(widget.id, {
                ...settings,
                coins: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              placeholder="BTC, ETH, SOL"
              className="h-7 text-xs"
            />
          </div>
        )}

        {widget.settingsFields?.includes('symbols') && (
          <div>
            <label className="text-xs font-medium mb-1 block">Stock Symbols (comma-separated)</label>
            <Input
              value={settings.symbols?.join(', ') || ''}
              onChange={(e) => updateWidgetSettings(widget.id, {
                ...settings,
                symbols: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              placeholder="AAPL, GOOGL, MSFT"
              className="h-7 text-xs"
            />
          </div>
        )}

        {widget.settingsFields?.includes('feedUrl') && (
          <div>
            <label className="text-xs font-medium mb-1 block">RSS Feed URL</label>
            <Input
              value={settings.feedUrl || ''}
              onChange={(e) => updateWidgetSettings(widget.id, { ...settings, feedUrl: e.target.value })}
              placeholder="https://example.com/feed.xml"
              className="h-7 text-xs"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Left Sidebar - Widget Display */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-muted/30 border-r transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-80 z-20 overflow-y-auto p-4`}
      >
        <div className="space-y-4">
          {widgetConfigs.map((config) => {
            const widgetDef = AVAILABLE_WIDGETS.find(w => w.id === config.type);
            if (!widgetDef) return null;

            const WidgetComponent = widgetDef.component;
            const settings = widgetSettings.get(config.type);

            return (
              <div key={config.type} className="widget-container">
                <WidgetComponent settings={settings} />
              </div>
            );
          })}
          {widgetConfigs.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              <p>No widgets selected</p>
              <p className="text-xs mt-2">Select widgets to display</p>
            </div>
          )}
        </div>
      </aside>

      {/* Widget Selector Overlay (only when sidebar is open) */}
      {isOpen && (
        <div className="fixed left-80 top-16 h-[calc(100vh-4rem)] w-96 bg-background border-r z-20 overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Widget Selector</h3>
            <p className="text-xs text-muted-foreground mt-1">Select and configure your widgets</p>
          </div>

          <div className="divide-y">
            {AVAILABLE_WIDGETS.map((widget) => {
              const isSelected = widgetConfigs.some(w => w.type === widget.id);
              const isExpanded = expandedWidget === widget.id;

              return (
                <div key={widget.id}>
                  <div className="flex items-center p-3 hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleWidget(widget.id)}
                      className="mr-3"
                    />
                    <label
                      className="flex-1 cursor-pointer font-medium text-sm"
                      onClick={() => toggleWidget(widget.id)}
                    >
                      {widget.name}
                    </label>

                    {widget.hasSettings && isSelected && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedWidget(isExpanded ? null : widget.id)}
                        className="h-7 w-7 p-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {widget.hasSettings && isSelected && isExpanded && renderWidgetSettings(widget)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
