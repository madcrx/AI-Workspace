'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemePicker, THEMES } from '@/components/workspace/theme-picker';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Workspace {
  id: string;
  name: string;
  theme: string;
}

export default function WorkspaceSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchWorkspace();
    }
  }, [status, router]);

  const fetchWorkspace = async () => {
    try {
      const response = await fetch('/api/workspace');
      const data = await response.json();
      if (data.length > 0) {
        setWorkspace(data[0]);
        // Apply the current theme on load
        if (data[0].theme) {
          const themeData = THEMES.find(t => t.id === data[0].theme);
          if (themeData) {
            applyTheme(themeData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching workspace:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSelect = async (theme: any) => {
    if (!workspace) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/workspaces/${workspace.id}/theme`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: theme.id }),
      });

      if (response.ok) {
        setWorkspace({ ...workspace, theme: theme.id });

        // Apply theme to document
        applyTheme(theme);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      alert('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const applyTheme = (theme: any) => {
    // Apply CSS variables for theme
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primaryColor);
    root.style.setProperty('--theme-secondary', theme.secondaryColor);
    root.style.setProperty('--theme-accent', theme.accentColor);
    root.style.setProperty('--theme-background', theme.backgroundColor);
    document.body.style.backgroundColor = theme.backgroundColor;

    // Dispatch custom event to notify other pages
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No workspace found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/workspace" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Workspace
              </Link>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Workspace Settings</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Workspace: {workspace.name}</h2>
            <p className="text-sm text-muted-foreground">
              Customize your workspace appearance and preferences
            </p>
          </div>

          <ThemePicker
            currentTheme={workspace.theme || 'default'}
            onThemeSelect={handleThemeSelect}
          />

          {saving && (
            <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
              Saving theme...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
