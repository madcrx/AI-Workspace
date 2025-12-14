'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  preview: {
    bg: string;
    card: string;
    border: string;
    text: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Default',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#06b6d4',
    backgroundColor: '#ffffff',
    preview: {
      bg: '#ffffff',
      card: '#f8fafc',
      border: '#e2e8f0',
      text: '#1e293b',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    primaryColor: '#0ea5e9',
    secondaryColor: '#06b6d4',
    accentColor: '#14b8a6',
    backgroundColor: '#f0f9ff',
    preview: {
      bg: '#f0f9ff',
      card: '#e0f2fe',
      border: '#bae6fd',
      text: '#075985',
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    primaryColor: '#10b981',
    secondaryColor: '#14b8a6',
    accentColor: '#059669',
    backgroundColor: '#f0fdf4',
    preview: {
      bg: '#f0fdf4',
      card: '#dcfce7',
      border: '#bbf7d0',
      text: '#064e3b',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    primaryColor: '#f97316',
    secondaryColor: '#fb923c',
    accentColor: '#ea580c',
    backgroundColor: '#fff7ed',
    preview: {
      bg: '#fff7ed',
      card: '#ffedd5',
      border: '#fed7aa',
      text: '#7c2d12',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    primaryColor: '#8b5cf6',
    secondaryColor: '#a78bfa',
    accentColor: '#7c3aed',
    backgroundColor: '#faf5ff',
    preview: {
      bg: '#faf5ff',
      card: '#f3e8ff',
      border: '#e9d5ff',
      text: '#5b21b6',
    },
  },
  {
    id: 'rose',
    name: 'Rose Pink',
    primaryColor: '#f43f5e',
    secondaryColor: '#fb7185',
    accentColor: '#e11d48',
    backgroundColor: '#fff1f2',
    preview: {
      bg: '#fff1f2',
      card: '#ffe4e6',
      border: '#fecdd3',
      text: '#881337',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    primaryColor: '#6366f1',
    secondaryColor: '#818cf8',
    accentColor: '#4f46e5',
    backgroundColor: '#1e1b4b',
    preview: {
      bg: '#1e1b4b',
      card: '#312e81',
      border: '#4338ca',
      text: '#e0e7ff',
    },
  },
  {
    id: 'charcoal',
    name: 'Charcoal',
    primaryColor: '#64748b',
    secondaryColor: '#94a3b8',
    accentColor: '#475569',
    backgroundColor: '#1e293b',
    preview: {
      bg: '#1e293b',
      card: '#334155',
      border: '#475569',
      text: '#f1f5f9',
    },
  },
];

interface ThemePickerProps {
  currentTheme?: string;
  onThemeSelect: (theme: Theme) => void;
}

export function ThemePicker({ currentTheme = 'default', onThemeSelect }: ThemePickerProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme.id);
    onThemeSelect(theme);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace Theme</CardTitle>
        <CardDescription>
          Customize the look and feel of your workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme)}
              className={`relative rounded-lg border-2 transition-all hover:scale-105 ${
                selectedTheme === theme.id
                  ? 'border-primary shadow-lg'
                  : 'border-muted hover:border-muted-foreground/50'
              }`}
            >
              {/* Theme Preview */}
              <div
                className="aspect-video rounded-t-md p-3 flex flex-col gap-2"
                style={{ backgroundColor: theme.preview.bg }}
              >
                <div
                  className="h-8 rounded shadow-sm border flex items-center px-2"
                  style={{
                    backgroundColor: theme.preview.card,
                    borderColor: theme.preview.border,
                    color: theme.preview.text,
                  }}
                >
                  <div className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: theme.primaryColor }} />
                  <div className="h-1.5 w-full rounded" style={{ backgroundColor: theme.preview.border }} />
                </div>
                <div className="flex gap-2">
                  <div
                    className="h-6 flex-1 rounded shadow-sm"
                    style={{ backgroundColor: theme.preview.card, borderColor: theme.preview.border }}
                  />
                  <div
                    className="h-6 flex-1 rounded shadow-sm"
                    style={{ backgroundColor: theme.preview.card, borderColor: theme.preview.border }}
                  />
                </div>
              </div>

              {/* Theme Name */}
              <div className="p-2 bg-background">
                <p className="text-sm font-medium text-center">{theme.name}</p>
              </div>

              {/* Selected Indicator */}
              {selectedTheme === theme.id && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Color Details */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Selected Theme Colors:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {THEMES.find((t) => t.id === selectedTheme) && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs">Primary</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 rounded border"
                      style={{ backgroundColor: THEMES.find((t) => t.id === selectedTheme)!.primaryColor }}
                    />
                    <span className="text-xs font-mono">
                      {THEMES.find((t) => t.id === selectedTheme)!.primaryColor}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Secondary</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 rounded border"
                      style={{ backgroundColor: THEMES.find((t) => t.id === selectedTheme)!.secondaryColor }}
                    />
                    <span className="text-xs font-mono">
                      {THEMES.find((t) => t.id === selectedTheme)!.secondaryColor}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Accent</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 rounded border"
                      style={{ backgroundColor: THEMES.find((t) => t.id === selectedTheme)!.accentColor }}
                    />
                    <span className="text-xs font-mono">
                      {THEMES.find((t) => t.id === selectedTheme)!.accentColor}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Background</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 rounded border"
                      style={{ backgroundColor: THEMES.find((t) => t.id === selectedTheme)!.backgroundColor }}
                    />
                    <span className="text-xs font-mono">
                      {THEMES.find((t) => t.id === selectedTheme)!.backgroundColor}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
