'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { WorkspaceGrid } from '@/components/workspace/workspace-grid';
import { ToolPicker } from '@/components/workspace/tool-picker';
import { ToolContainer } from '@/components/workspace/tool-container';
import { Plus, Settings, LogOut, Sparkles, Palette, Search, ChevronRight, ChevronLeft, FolderPlus, Key } from 'lucide-react';
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

interface Container {
  id: string;
  name: string;
  color?: string;
  tools: any[];
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
  const [containers, setContainers] = useState<Container[]>([]);
  const [showContainerForm, setShowContainerForm] = useState(false);
  const [newContainerName, setNewContainerName] = useState('');
  const [selectedToolForContainer, setSelectedToolForContainer] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchWorkspaces();
      fetchCategories();
    }
  }, [status, router]);

  useEffect(() => {
    if (currentWorkspace) {
      applyFilters();
    }
  }, [currentWorkspace, searchQuery, selectedCategory, selectedPricing]);

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

  const handleCreateContainer = () => {
    if (!newContainerName.trim()) return;

    const newContainer: Container = {
      id: `container-${Date.now()}`,
      name: newContainerName.trim(),
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      tools: [],
    };

    setContainers([...containers, newContainer]);
    setNewContainerName('');
    setShowContainerForm(false);
  };

  const handleRenameContainer = (containerId: string, newName: string) => {
    setContainers(containers.map(c =>
      c.id === containerId ? { ...c, name: newName } : c
    ));
  };

  const handleDeleteContainer = (containerId: string) => {
    // Move tools back to main workspace
    const container = containers.find(c => c.id === containerId);
    if (container && container.tools.length > 0) {
      // Tools remain in the workspace, just remove from container
    }
    setContainers(containers.filter(c => c.id !== containerId));
  };

  const handleAddToolToContainer = (containerId: string) => {
    setSelectedToolForContainer(containerId);
  };

  const handleRemoveToolFromContainer = (containerId: string, toolId: string) => {
    setContainers(containers.map(c => {
      if (c.id === containerId) {
        return {
          ...c,
          tools: c.tools.filter(t => t.tool.id !== toolId),
        };
      }
      return c;
    }));
  };

  const handleMoveToolToContainer = (toolId: string, containerId: string) => {
    const tool = currentWorkspace?.tools.find(t => t.toolId === toolId);
    if (!tool) return;

    setContainers(containers.map(c => {
      if (c.id === containerId) {
        // Check if tool already in container
        if (!c.tools.find(t => t.tool.id === toolId)) {
          return {
            ...c,
            tools: [...c.tools, tool],
          };
        }
      }
      return c;
    }));

    setSelectedToolForContainer(null);
  };

  const getToolsNotInContainers = () => {
    const toolsInContainers = new Set(
      containers.flatMap(c => c.tools.map(t => t.tool.id))
    );
    return filteredTools.filter(t => !toolsInContainers.has(t.tool.id));
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
                onClick={() => setShowContainerForm(!showContainerForm)}
                className="gap-2"
              >
                <FolderPlus className="h-4 w-4" />
                New Container
              </Button>

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
                  Settings
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

      <div className="flex">
        <main className={`container mx-auto px-4 py-8 transition-all duration-300 ${sidebarOpen ? 'mr-[12.5%]' : ''}`}>
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

          {showContainerForm && (
            <div className="mb-6 p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Create New Container</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Container name..."
                  value={newContainerName}
                  onChange={(e) => setNewContainerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateContainer()}
                  autoFocus
                />
                <Button onClick={handleCreateContainer}>Create</Button>
                <Button variant="outline" onClick={() => setShowContainerForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {selectedToolForContainer && (
            <div className="mb-6 p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Select a tool to add to container</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
                {getToolsNotInContainers().map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleMoveToolToContainer(tool.toolId, selectedToolForContainer)}
                    className="p-2 border rounded hover:bg-accent transition-colors text-left"
                  >
                    <div className="text-sm font-medium truncate">{tool.tool.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{tool.tool.category}</div>
                  </button>
                ))}
              </div>
              <Button variant="outline" className="mt-2" onClick={() => setSelectedToolForContainer(null)}>
                Cancel
              </Button>
            </div>
          )}

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
            <>
              {/* Containers Section */}
              {containers.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Tool Containers</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {containers.map((container) => (
                      <ToolContainer
                        key={container.id}
                        container={container}
                        onRemoveTool={(toolId) => handleRemoveToolFromContainer(container.id, toolId)}
                        onRename={handleRenameContainer}
                        onDelete={handleDeleteContainer}
                        onAddTool={handleAddToolToContainer}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Individual Tools Section */}
              {getToolsNotInContainers().length > 0 ? (
                <>
                  {containers.length > 0 && (
                    <h2 className="text-xl font-semibold mb-4">Individual Tools</h2>
                  )}
                  <WorkspaceGrid
                    tools={getToolsNotInContainers()}
                    onRemoveTool={handleRemoveTool}
                    onUpdateLayout={handleUpdateLayout}
                  />
                </>
              ) : (
                <>
                  {containers.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        {searchQuery || selectedCategory !== 'all' || selectedPricing !== 'all'
                          ? 'No tools found matching your filters'
                          : 'No tools in workspace. Click "Show Tools" to get started!'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
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
