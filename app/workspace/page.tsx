'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { WorkspaceGrid } from '@/components/workspace/workspace-grid';
import { ToolPicker } from '@/components/workspace/tool-picker';
import { EnhancedWidgetSidebar } from '@/components/workspace/enhanced-widget-sidebar';
import { Plus, Settings, LogOut, Sparkles, Palette, Search, ChevronRight, ChevronLeft, Key } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface Workspace {
  id: string;
  name: string;
  layout: string;
  theme: string;
  tools: any[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}


export default function WorkspacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [showToolPicker, setShowToolPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPricing, setSelectedPricing] = useState('all');
  const [filteredTools, setFilteredTools] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [availableTools, setAvailableTools] = useState<any[]>([]);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [userCredentials, setUserCredentials] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchWorkspaces();
      fetchCategories();
      fetchCredentials();
    }
  }, [status, router]);

  const fetchCredentials = async () => {
    try {
      const response = await fetch('/api/credentials');
      const data = await response.json();
      const credMap = new Map();
      if (Array.isArray(data)) {
        data.forEach((cred: any) => {
          credMap.set(cred.toolId, cred);
        });
      }
      setUserCredentials(credMap);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    }
  };

  useEffect(() => {
    if (currentWorkspace) {
      applyFilters();
      // Apply theme if set
      if (currentWorkspace.theme && currentWorkspace.theme !== 'default') {
        applyWorkspaceTheme(currentWorkspace.theme);
      }
    }
  }, [currentWorkspace, searchQuery, selectedCategory, selectedPricing]);

  // Listen for theme changes from settings page
  useEffect(() => {
    const handleThemeChange = (event: any) => {
      const theme = event.detail;
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', theme.primaryColor);
      root.style.setProperty('--theme-secondary', theme.secondaryColor);
      root.style.setProperty('--theme-accent', theme.accentColor);
      root.style.setProperty('--theme-background', theme.backgroundColor);
      document.body.style.backgroundColor = theme.backgroundColor;
    };

    // Refresh workspace data when page gains focus (e.g., navigating back from settings)
    const handleFocus = () => {
      fetchWorkspaces();
    };

    window.addEventListener('themeChanged', handleThemeChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const applyWorkspaceTheme = (themeId: string) => {
    // Theme colors mapping
    const themes: any = {
      ocean: { primary: '#0ea5e9', secondary: '#06b6d4', accent: '#14b8a6', bg: '#f0f9ff' },
      forest: { primary: '#10b981', secondary: '#14b8a6', accent: '#059669', bg: '#f0fdf4' },
      sunset: { primary: '#f97316', secondary: '#fb923c', accent: '#ea580c', bg: '#fff7ed' },
      lavender: { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#7c3aed', bg: '#faf5ff' },
      rose: { primary: '#f43f5e', secondary: '#fb7185', accent: '#e11d48', bg: '#fff1f2' },
      midnight: { primary: '#6366f1', secondary: '#818cf8', accent: '#4f46e5', bg: '#1e1b4b' },
      charcoal: { primary: '#64748b', secondary: '#94a3b8', accent: '#475569', bg: '#1e293b' },
    };

    const theme = themes[themeId];
    if (theme) {
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', theme.primary);
      root.style.setProperty('--theme-secondary', theme.secondary);
      root.style.setProperty('--theme-accent', theme.accent);
      root.style.setProperty('--theme-background', theme.bg);
      document.body.style.backgroundColor = theme.bg;
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspace');
      const data = await response.json();
      setWorkspaces(data);
      if (data.length > 0) {
        setCurrentWorkspace(data[0]);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAvailableTools = async () => {
    try {
      const response = await fetch('/api/tools');
      const data = await response.json();
      setAvailableTools(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching available tools:', error);
      setAvailableTools([]);
    }
  };

  useEffect(() => {
    if (sidebarOpen) {
      fetchAvailableTools();
    }
  }, [sidebarOpen]);

  const applyFilters = () => {
    if (!currentWorkspace) return;

    let filtered = currentWorkspace.tools;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((workspaceTool) =>
        workspaceTool.tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workspaceTool.tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((workspaceTool) =>
        workspaceTool.tool.category === selectedCategory
      );
    }

    // Filter by pricing
    if (selectedPricing !== 'all') {
      filtered = filtered.filter((workspaceTool) =>
        workspaceTool.tool.pricing.toLowerCase() === selectedPricing.toLowerCase()
      );
    }

    setFilteredTools(filtered);
  };

  const handleAddTool = async (toolId: string) => {
    if (!currentWorkspace) return;

    try {
      const response = await fetch(`/api/workspace/${currentWorkspace.id}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId }),
      });

      if (response.ok) {
        fetchWorkspaces();
      }
    } catch (error) {
      console.error('Error adding tool:', error);
    }
  };

  const handleRemoveTool = async (toolId: string) => {
    if (!currentWorkspace) return;

    try {
      const response = await fetch(
        `/api/workspace/${currentWorkspace.id}/tools/${toolId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        fetchWorkspaces();
      }
    } catch (error) {
      console.error('Error removing tool:', error);
    }
  };

  const handleUpdateLayout = async (tools: any[]) => {
    if (!currentWorkspace) return;

    try {
      await fetch(`/api/workspace/${currentWorkspace.id}/tools`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools }),
      });

      fetchWorkspaces();
    } catch (error) {
      console.error('Error updating layout:', error);
    }
  };



  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 text-primary animate-pulse mx-auto mb-2" />
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const existingToolIds = currentWorkspace?.tools.map(t => t.toolId) || [];

  return (
    <div className="min-h-screen bg-background">
      <EnhancedWidgetSidebar />
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">AI Workspace</span>
              </Link>
              {currentWorkspace && (
                <span className="text-muted-foreground">/ {currentWorkspace.name}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {sidebarOpen ? 'Hide' : 'Show'} Tools
              </Button>

              <Link href="/workspace/settings">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Display Settings
                </Button>
              </Link>

              <Link href="/credentials">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Key className="h-4 w-4" />
                  Credentials
                </Button>
              </Link>

              <Link href="/tools">
                <Button variant="ghost" size="sm">
                  Browse Tools
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex justify-center">
        <main className={`w-full max-w-7xl px-4 py-8 transition-all duration-300 ${sidebarOpen ? 'pr-[calc(12.5%+1rem)]' : ''}`}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {session?.user?.name || 'User'}!
              </h1>
              <p className="text-muted-foreground">
                Manage your AI tools and customize your workspace
              </p>
            </div>
          </div>

          {currentWorkspace && currentWorkspace.tools.length > 0 && (
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border rounded-md bg-background"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedPricing}
                onChange={(e) => setSelectedPricing(e.target.value)}
                className="px-4 py-2 border rounded-md bg-background"
              >
                <option value="all">All Pricing</option>
                <option value="free">Free</option>
                <option value="freemium">Freemium</option>
                <option value="paid">Paid</option>
                <option value="subscription">Subscription</option>
              </select>
            </div>
          )}

          {currentWorkspace ? (
            filteredTools.length > 0 ? (
              <WorkspaceGrid
                tools={filteredTools}
                onRemoveTool={handleRemoveTool}
                onUpdateLayout={handleUpdateLayout}
                userCredentials={userCredentials}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery || selectedCategory !== 'all' || selectedPricing !== 'all'
                    ? 'No tools found matching your filters'
                    : 'No tools in workspace. Click "Show Tools" to get started!'}
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No workspace found</p>
            </div>
          )}
        </main>

        {/* Collapsible Sidebar */}
        <aside
          className={`fixed right-0 top-16 h-[calc(100vh-4rem)] bg-background border-l transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          } w-[12.5%] min-w-[200px] max-w-[300px] z-20 overflow-hidden flex flex-col`}
        >
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-2">Available Tools</h2>
            <Input
              placeholder="Search..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {availableTools
              .filter(tool =>
                !existingToolIds.includes(tool.id) &&
                (sidebarSearch === '' || tool.name.toLowerCase().includes(sidebarSearch.toLowerCase()))
              )
              .map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleAddTool(tool.id)}
                  className="w-full p-2 mb-2 text-left border rounded hover:bg-accent transition-colors"
                >
                  <div className="text-xs font-medium truncate">{tool.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{tool.category}</div>
                </button>
              ))}
          </div>
        </aside>
      </div>

      <ToolPicker
        open={showToolPicker}
        onClose={() => setShowToolPicker(false)}
        onAddTool={handleAddTool}
        existingToolIds={existingToolIds}
      />
    </div>
  );
}
