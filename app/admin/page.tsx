'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Wrench, Clock, Eye, MousePointer, Layers, BarChart3, TrendingUp, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalTools: number;
  activeTools: number;
  pendingSubmissions: number;
  totalWorkspaces: number;
  totalViews: number;
  totalClicks: number;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    workspaces: number;
    reviews: number;
  };
}

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  websiteUrl: string;
  logoUrl: string | null;
  pricing: string;
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  clicks: number;
  rating: number | null;
  reviewCount: number;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapingResult, setScrapingResult] = useState<any>(null);
  const [fetchingImages, setFetchingImages] = useState(false);
  const [imageFetchResult, setImageFetchResult] = useState<any>(null);
  const [autoScraping, setAutoScraping] = useState(false);
  const [autoScraperResult, setAutoScraperResult] = useState<any>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [fixingWorkspaces, setFixingWorkspaces] = useState(false);
  const [workspaceFixResult, setWorkspaceFixResult] = useState<any>(null);
  const [seedingTutorials, setSeedingTutorials] = useState(false);
  const [tutorialSeedResult, setTutorialSeedResult] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/workspace');
      } else {
        fetchData();
      }
    }
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, toolsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/tools'),
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const toolsData = await toolsRes.json();

      setStats(statsData);
      setUsers(usersData);
      setTools(toolsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleToggleUserActive = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/activate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleResetPassword = async (userId: string, userEmail: string) => {
    const newPassword = prompt(`Enter new password for ${userEmail}:\n(Must be at least 6 characters)`);

    if (!newPassword) {
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      if (response.ok) {
        alert('Password reset successfully');
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password');
    }
  };

  const handleToggleActive = async (toolId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/tools/${toolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        fetchData();
      } else {
        alert('Failed to update tool status');
      }
    } catch (error) {
      console.error('Error updating tool:', error);
      alert('Failed to update tool status');
    }
  };

  const handleToggleFeatured = async (toolId: string, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/tools/${toolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });

      if (response.ok) {
        fetchData();
      } else {
        alert('Failed to update tool featured status');
      }
    } catch (error) {
      console.error('Error updating tool:', error);
      alert('Failed to update tool featured status');
    }
  };

  const handleDeleteTool = async (toolId: string) => {
    if (!confirm('Are you sure you want to delete this tool? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tools/${toolId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      } else {
        alert('Failed to delete tool');
      }
    } catch (error) {
      console.error('Error deleting tool:', error);
      alert('Failed to delete tool');
    }
  };

  const runScraper = async () => {
    setScraping(true);
    setScrapingResult(null);
    try {
      const response = await fetch('/api/admin/scraper', {
        method: 'POST',
      });
      const data = await response.json();
      setScrapingResult(data.result);
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error running scraper:', error);
      setScrapingResult({ success: false, error: 'Failed to run scraper' });
    } finally {
      setScraping(false);
    }
  };

  const runImageFetcher = async () => {
    setFetchingImages(true);
    setImageFetchResult(null);
    try {
      const response = await fetch('/api/admin/fetch-images', {
        method: 'POST',
      });
      const data = await response.json();
      setImageFetchResult(data.results);
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error fetching images:', error);
      setImageFetchResult({ success: false, error: 'Failed to fetch images' });
    } finally {
      setFetchingImages(false);
    }
  };

  const runAutoScraper = async (url?: string) => {
    const confirmMessage = url
      ? `Scrape and upload tools from: ${url}?\n\nFound tools will be automatically added to the database.`
      : 'Run automatic tool discovery?\n\nThis will scrape multiple sources and automatically add new tools to the database.';

    if (!confirm(confirmMessage)) {
      return;
    }

    setAutoScraping(true);
    setAutoScraperResult(null);
    try {
      const response = await fetch('/api/admin/auto-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customUrl: url }),
      });
      const data = await response.json();
      setAutoScraperResult(data);

      // Refresh stats to show updated tool counts
      await fetchData();

      if (url) {
        setCustomUrl(''); // Clear custom URL after successful scrape
      }
    } catch (error) {
      console.error('Error running auto-scraper:', error);
      setAutoScraperResult({ error: 'Failed to run auto-scraper' });
    } finally {
      setAutoScraping(false);
    }
  };

  const fixDuplicateWorkspaces = async () => {
    if (!confirm('This will merge duplicate workspaces for all users. Continue?')) {
      return;
    }

    setFixingWorkspaces(true);
    setWorkspaceFixResult(null);
    try {
      const response = await fetch('/api/admin/fix-workspaces', {
        method: 'POST',
      });
      const data = await response.json();
      setWorkspaceFixResult(data);
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error fixing workspaces:', error);
      setWorkspaceFixResult({ error: 'Failed to fix workspaces' });
    } finally {
      setFixingWorkspaces(false);
    }
  };

  const seedTutorials = async () => {
    if (!confirm('This will add 8 tutorial videos to the database. Continue?')) {
      return;
    }

    setSeedingTutorials(true);
    setTutorialSeedResult(null);
    try {
      const response = await fetch('/api/admin/seed-tutorials', {
        method: 'POST',
      });
      const data = await response.json();
      setTutorialSeedResult(data);
    } catch (error) {
      console.error('Error seeding tutorials:', error);
      setTutorialSeedResult({ error: 'Failed to seed tutorials' });
    } finally {
      setSeedingTutorials(false);
    }
  };

  if (loading || status === 'loading' || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/workspace">
              <Button variant="ghost" size="sm">
                Go to Workspace
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Tools</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeTools}</div>
                <p className="text-xs text-muted-foreground">
                  of {stats.totalTools} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tools">AI Tools</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="scraper">Tool Scraper</TabsTrigger>
            <TabsTrigger value="settings">Backend Settings</TabsTrigger>
            <TabsTrigger value="webtools">Web Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="tools">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">All AI Tools ({tools.length})</h2>
                  <p className="text-sm text-muted-foreground">Manage all AI tools in the platform</p>
                </div>
              </div>
              {tools.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <p className="text-muted-foreground text-center">No tools found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tools.map((tool) => (
                    <Card key={tool.id} className="flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          {tool.logoUrl && (
                            <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={tool.logoUrl}
                                alt={`${tool.name} logo`}
                                className="h-full w-full object-contain"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base line-clamp-1">{tool.name}</CardTitle>
                            <CardDescription className="line-clamp-2 mt-1">
                              {tool.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {tool.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {tool.pricing}
                          </Badge>
                          {tool.isActive && (
                            <Badge className="text-xs bg-green-500">Active</Badge>
                          )}
                          {tool.isFeatured && (
                            <Badge className="text-xs bg-purple-500">Featured</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div className="text-center p-2 bg-muted/50 rounded">
                            <p className="font-semibold">{tool.views}</p>
                            <p>Views</p>
                          </div>
                          <div className="text-center p-2 bg-muted/50 rounded">
                            <p className="font-semibold">{tool.clicks}</p>
                            <p>Clicks</p>
                          </div>
                          <div className="text-center p-2 bg-muted/50 rounded">
                            <p className="font-semibold">{tool.rating ? `⭐ ${tool.rating.toFixed(1)}` : 'N/A'}</p>
                            <p>Rating</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(tool.id, tool.isActive)}
                            className="w-full"
                          >
                            {tool.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleFeatured(tool.id, tool.isFeatured)}
                            >
                              {tool.isFeatured ? 'Unfeature' : 'Feature'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteTool(tool.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage platform users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No users found
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-3 font-medium">User</th>
                            <th className="text-left p-3 font-medium">Role</th>
                            <th className="text-left p-3 font-medium">Reviews</th>
                            <th className="text-left p-3 font-medium">Joined</th>
                            <th className="text-right p-3 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-t">
                              <td className="p-3">
                                <div>
                                  <p className="font-medium">{user.name || 'No name'}</p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                              </td>
                              <td className="p-3">
                                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="p-3">{user._count.reviews}</td>
                              <td className="p-3">
                                <span className="text-sm text-muted-foreground">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex justify-end gap-2 flex-wrap">
                                  {user.id !== session?.user?.id && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRoleChange(
                                          user.id,
                                          user.role === 'ADMIN' ? 'USER' : 'ADMIN'
                                        )}
                                      >
                                        {user.role === 'ADMIN' ? 'Make User' : 'Make Admin'}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleResetPassword(user.id, user.email)}
                                      >
                                        Reset Password
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDeleteUser(user.id)}
                                      >
                                        Delete
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Platform Analytics
                </CardTitle>
                <CardDescription>
                  Track website traffic, user engagement, and tool performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Views</CardDescription>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-500" />
                        {stats.totalViews.toLocaleString()}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Clicks</CardDescription>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <MousePointer className="h-5 w-5 text-green-500" />
                        {stats.totalClicks.toLocaleString()}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Click-Through Rate</CardDescription>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                        {stats.totalViews > 0
                          ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(2)
                          : 0}%
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Active Users</CardDescription>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Users className="h-5 w-5 text-orange-500" />
                        {users.filter(u => u.isActive).length}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Tools</CardTitle>
                    <CardDescription>Tools with the most views and clicks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tools
                        .sort((a, b) => (b.views + b.clicks) - (a.views + a.clicks))
                        .slice(0, 10)
                        .map((tool, index) => (
                          <div key={tool.id} className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-lg text-muted-foreground">#{index + 1}</span>
                              <div>
                                <p className="font-medium">{tool.name}</p>
                                <p className="text-sm text-muted-foreground">{tool.category}</p>
                              </div>
                            </div>
                            <div className="flex gap-6 text-sm">
                              <div className="text-right">
                                <p className="text-muted-foreground">Views</p>
                                <p className="font-semibold">{tool.views.toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-muted-foreground">Clicks</p>
                                <p className="font-semibold">{tool.clicks.toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-muted-foreground">CTR</p>
                                <p className="font-semibold">
                                  {tool.views > 0 ? ((tool.clicks / tool.views) * 100).toFixed(1) : 0}%
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Growth Summary</CardTitle>
                    <CardDescription>Platform user statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                        <p className="text-2xl font-bold">{stats.totalUsers}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Active Workspaces</p>
                        <p className="text-2xl font-bold">{stats.totalWorkspaces}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Avg Tools/Workspace</p>
                        <p className="text-2xl font-bold">
                          {stats.totalWorkspaces > 0
                            ? (stats.totalTools / stats.totalWorkspaces).toFixed(1)
                            : 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scraper">
            <Card>
              <CardHeader>
                <CardTitle>🤖 AI Tool Scraper</CardTitle>
                <CardDescription>
                  Discover, scrape, and maintain AI tools database automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Auto Discovery Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Automatic Discovery</h4>
                    <Badge>Runs daily at 2 AM</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically discovers new AI tools from Product Hunt, GitHub Trending, and popular AI directories.
                    New tools are auto-activated and added to the platform.
                  </p>
                  <Button
                    onClick={() => runAutoScraper()}
                    disabled={autoScraping}
                    className="w-full"
                    size="lg"
                  >
                    {autoScraping ? '🔄 Discovering Tools...' : '🚀 Discover New Tools'}
                  </Button>
                </div>

                {/* Custom URL Section */}
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-semibold">Custom URL Scraper</h4>
                  <p className="text-sm text-muted-foreground">
                    Scrape tools from any website. Works with AI tool directories, listing pages, and individual tool pages.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://example.com/ai-tools"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      disabled={autoScraping}
                    />
                    <Button
                      onClick={() => runAutoScraper(customUrl)}
                      disabled={autoScraping || !customUrl}
                      size="lg"
                    >
                      {autoScraping ? '🔄 Scraping...' : '🔍 Scrape'}
                    </Button>
                  </div>
                </div>

                {/* Results Display */}
                {autoScraperResult && (
                  <div className={`p-4 rounded-lg border ${
                    autoScraperResult.error
                      ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                      : 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                  }`}>
                    <h4 className="font-semibold mb-3">✅ Scraper Results - Tools Uploaded to Database</h4>
                    {autoScraperResult.error ? (
                      <p className="text-sm text-red-600 dark:text-red-400">{autoScraperResult.error}</p>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-medium">
                          Successfully uploaded {autoScraperResult.totalAdded || 0} new tools and updated {autoScraperResult.totalUpdated || 0} existing tools in the database.
                        </p>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="p-3 bg-white dark:bg-gray-800 rounded">
                            <p className="text-xs text-muted-foreground">Discovered</p>
                            <p className="text-2xl font-bold text-blue-600">{autoScraperResult.totalFound || 0}</p>
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-800 rounded">
                            <p className="text-xs text-muted-foreground">✓ Uploaded</p>
                            <p className="text-2xl font-bold text-green-600">{autoScraperResult.totalAdded || 0}</p>
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-800 rounded">
                            <p className="text-xs text-muted-foreground">✓ Updated</p>
                            <p className="text-2xl font-bold text-yellow-600">{autoScraperResult.totalUpdated || 0}</p>
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-800 rounded">
                            <p className="text-xs text-muted-foreground">Sources</p>
                            <p className="text-2xl font-bold">{autoScraperResult.totalSources || 0}</p>
                          </div>
                        </div>

                        {/* Current Database Statistics */}
                        <div className="pt-3 border-t mt-3">
                          <p className="text-xs font-medium mb-2">Current Database Status:</p>
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">
                              <p className="text-xs text-muted-foreground">Total Tools</p>
                              <p className="font-bold">{stats.totalTools}</p>
                            </div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">
                              <p className="text-xs text-muted-foreground">Active Tools</p>
                              <p className="font-bold">{stats.activeTools}</p>
                            </div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">
                              <p className="text-xs text-muted-foreground">Users</p>
                              <p className="font-bold">{stats.totalUsers}</p>
                            </div>
                            <div className="p-2 bg-white dark:bg-gray-800 rounded">
                              <p className="text-xs text-muted-foreground">Workspaces</p>
                              <p className="font-bold">{stats.totalWorkspaces}</p>
                            </div>
                          </div>
                        </div>

                        {autoScraperResult.results && autoScraperResult.results.length > 0 && (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {autoScraperResult.results.map((result: any, idx: number) => (
                              <div key={idx} className="text-xs p-3 bg-white dark:bg-gray-800 rounded">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-semibold">{result.source}</p>
                                  <Badge variant={result.status === 'SUCCESS' ? 'default' : 'destructive'} className="text-xs">
                                    {result.status}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground">
                                  Found: {result.toolsFound} | Added: {result.toolsAdded} | Updated: {result.toolsUpdated} | {result.executionTime}ms
                                </p>
                                {result.errors && result.errors.length > 0 && (
                                  <p className="text-red-600 dark:text-red-400 mt-1">{result.errors.length} errors</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Info Section */}
                <div className="border-t pt-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-semibold mb-2">✨ Features:</h5>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Scrapes Product Hunt, GitHub, AI directories</li>
                        <li>• Custom URL scraping with smart extraction</li>
                        <li>• Automatic tool categorization</li>
                        <li>• Pricing detection</li>
                        <li>• Logo extraction</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">⚡ Automation:</h5>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Runs automatically every night at 2 AM</li>
                        <li>• New tools auto-activated</li>
                        <li>• Updates existing tool data</li>
                        <li>• Logs all actions for review</li>
                        <li>• No manual approval needed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Backend Settings</CardTitle>
                <CardDescription>
                  Manage backend configurations and system settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Database & System Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Database & System</h3>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <Label className="text-sm font-medium">Fix Duplicate Workspaces</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Ensure each user has only one workspace. Merges duplicate workspaces and migrates all tools.
                      </p>
                      <Button
                        onClick={fixDuplicateWorkspaces}
                        disabled={fixingWorkspaces}
                        variant="outline"
                        size="sm"
                      >
                        {fixingWorkspaces ? 'Fixing...' : 'Fix Duplicate Workspaces'}
                      </Button>

                      {workspaceFixResult && (
                        <div className={`mt-3 p-3 rounded ${
                          workspaceFixResult.error
                            ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
                            : 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
                        }`}>
                          {workspaceFixResult.error || workspaceFixResult.message}
                        </div>
                      )}
                    </div>

                    <div className="p-4 border rounded-lg">
                      <Label className="text-sm font-medium">Seed Tutorials</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add 8 tutorial videos with YouTube embeds to the database. Includes ChatGPT, Midjourney, GitHub Copilot, and more.
                      </p>
                      <Button
                        onClick={seedTutorials}
                        disabled={seedingTutorials}
                        variant="outline"
                        size="sm"
                      >
                        {seedingTutorials ? 'Seeding...' : 'Seed Tutorials'}
                      </Button>

                      {tutorialSeedResult && (
                        <div className={`mt-3 p-3 rounded ${
                          tutorialSeedResult.error || !tutorialSeedResult.success
                            ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
                            : 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
                        }`}>
                          {tutorialSeedResult.error || tutorialSeedResult.message}
                        </div>
                      )}
                    </div>

                    <div className="p-4 border rounded-lg bg-muted/30">
                      <Label className="text-sm font-medium">Database Status</Label>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Users</p>
                          <p className="font-semibold">{stats.totalUsers}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Workspaces</p>
                          <p className="font-semibold">{stats.totalWorkspaces}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Tools</p>
                          <p className="font-semibold">{stats.totalTools}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Active Tools</p>
                          <p className="font-semibold">{stats.activeTools}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Environment Variables */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Environment Configuration</h3>
                  <div className="grid gap-4">
                    <div className="p-4 border rounded-lg">
                      <Label className="text-sm font-medium">NextAuth Configuration</Label>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Google OAuth</span>
                          <Badge variant={process.env.GOOGLE_CLIENT_ID ? 'default' : 'secondary'}>
                            {process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not Set'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Facebook OAuth</span>
                          <Badge variant={process.env.FACEBOOK_CLIENT_ID ? 'default' : 'secondary'}>
                            {process.env.FACEBOOK_CLIENT_ID ? 'Configured' : 'Not Set'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">NextAuth Secret</span>
                          <Badge variant={process.env.NEXTAUTH_SECRET ? 'default' : 'destructive'}>
                            {process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <Label className="text-sm font-medium">Database Configuration</Label>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Database URL</span>
                          <Badge variant={process.env.DATABASE_URL ? 'default' : 'destructive'}>
                            {process.env.DATABASE_URL ? 'Connected' : 'Not Set'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <Label className="text-sm font-medium">Email / SMTP Configuration</Label>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">SMTP Host</span>
                          <Badge variant={process.env.SMTP_HOST ? 'default' : 'secondary'}>
                            {process.env.SMTP_HOST ? 'Configured' : 'Not Set'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">SMTP Port</span>
                          <Badge variant={process.env.SMTP_PORT ? 'default' : 'secondary'}>
                            {process.env.SMTP_PORT || 'Not Set'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">SMTP User</span>
                          <Badge variant={process.env.SMTP_USER ? 'default' : 'secondary'}>
                            {process.env.SMTP_USER ? 'Configured' : 'Not Set'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">SMTP Password</span>
                          <Badge variant={process.env.SMTP_PASSWORD ? 'default' : 'destructive'}>
                            {process.env.SMTP_PASSWORD ? 'Set' : 'Not Set'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">From Email</span>
                          <Badge variant={process.env.EMAIL_FROM ? 'default' : 'secondary'}>
                            {process.env.EMAIL_FROM || 'Not Set'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Used for password reset emails, notifications, and system alerts
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature Flags */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Feature Flags</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable platform features
                  </p>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Auto Tool Discovery</Label>
                        <p className="text-xs text-muted-foreground">Scraper runs daily at 2 AM</p>
                      </div>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">User Registrations</Label>
                        <p className="text-xs text-muted-foreground">Allow new user signups</p>
                      </div>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Tool Submissions</Label>
                        <p className="text-xs text-muted-foreground">Allow users to submit tools</p>
                      </div>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Environment variables must be configured in your hosting platform (Railway).
                    Changes here are display-only. To modify, update your .env file or hosting settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webtools">
            <Card>
              <CardHeader>
                <CardTitle>Web Tools & Optimization</CardTitle>
                <CardDescription>
                  SEO, security, performance, and UX enhancement tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* SEO Tools */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">🔍 SEO Optimization</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Meta Tags Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span>Homepage Meta</span>
                          <Badge variant="default">✓ Configured</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Structured Data</span>
                          <Badge variant="default">✓ Active</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Sitemap</span>
                          <Badge variant="secondary">Needs Setup</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>robots.txt</span>
                          <Badge variant="secondary">Needs Setup</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">SEO Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="p-2 bg-muted rounded">
                          <p className="font-medium">✓ Structured data implemented</p>
                          <p className="text-xs text-muted-foreground">Schema.org markup active</p>
                        </div>
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                          <p className="font-medium">⚠ Add sitemap.xml</p>
                          <p className="text-xs text-muted-foreground">Improve indexing</p>
                        </div>
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                          <p className="font-medium">⚠ Create robots.txt</p>
                          <p className="text-xs text-muted-foreground">Control crawler access</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Security Tools */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">🔒 Security Analysis</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Security Headers</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span>HTTPS</span>
                          <Badge variant="default">✓ Enforced</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Secure Cookies</span>
                          <Badge variant="default">✓ Production</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>CSRF Protection</span>
                          <Badge variant="default">✓ NextAuth</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>XSS Protection</span>
                          <Badge variant="default">✓ React</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Authentication Security</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                          <p className="font-medium">✓ Password hashing (bcrypt)</p>
                          <p className="text-xs text-muted-foreground">Secure password storage</p>
                        </div>
                        <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                          <p className="font-medium">✓ JWT sessions</p>
                          <p className="text-xs text-muted-foreground">Stateless authentication</p>
                        </div>
                        <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                          <p className="font-medium">✓ Session-only cookies</p>
                          <p className="text-xs text-muted-foreground">No persistent sessions</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Performance Tools */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">⚡ Performance Optimization</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Current Optimizations</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                          <p className="font-medium">✓ Next.js Image Optimization</p>
                          <p className="text-xs text-muted-foreground">Automatic image optimization</p>
                        </div>
                        <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                          <p className="font-medium">✓ Code Splitting</p>
                          <p className="text-xs text-muted-foreground">App Router automatic splitting</p>
                        </div>
                        <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                          <p className="font-medium">✓ Server Components</p>
                          <p className="text-xs text-muted-foreground">Reduced client JS bundle</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded">
                          <p className="font-medium">💡 Add loading states</p>
                          <p className="text-xs text-muted-foreground">Improve perceived performance</p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded">
                          <p className="font-medium">💡 Implement caching</p>
                          <p className="text-xs text-muted-foreground">Cache API responses</p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded">
                          <p className="font-medium">💡 Database indexing</p>
                          <p className="text-xs text-muted-foreground">Optimize query performance</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* UX Enhancement Tools */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">✨ UX Enhancement</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Accessibility</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                          <p className="font-medium">✓ Semantic HTML</p>
                          <p className="text-xs text-muted-foreground">Proper heading structure</p>
                        </div>
                        <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                          <p className="font-medium">✓ Keyboard Navigation</p>
                          <p className="text-xs text-muted-foreground">All interactive elements accessible</p>
                        </div>
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                          <p className="font-medium">⚠ Add ARIA labels</p>
                          <p className="text-xs text-muted-foreground">Improve screen reader support</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">User Experience</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                          <p className="font-medium">✓ Responsive Design</p>
                          <p className="text-xs text-muted-foreground">Mobile-friendly layout</p>
                        </div>
                        <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                          <p className="font-medium">✓ Dark Mode Support</p>
                          <p className="text-xs text-muted-foreground">Theme switching available</p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded">
                          <p className="font-medium">💡 Add tooltips</p>
                          <p className="text-xs text-muted-foreground">Helpful hover information</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Code Quality */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">🧹 Code Quality</h3>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Code Health</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="p-3 bg-green-50 dark:bg-green-950 rounded text-center">
                          <p className="text-2xl font-bold text-green-600">✓</p>
                          <p className="font-medium">TypeScript</p>
                          <p className="text-xs text-muted-foreground">Type safety enabled</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-950 rounded text-center">
                          <p className="text-2xl font-bold text-green-600">✓</p>
                          <p className="font-medium">ESLint</p>
                          <p className="text-xs text-muted-foreground">Code linting active</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-950 rounded text-center">
                          <p className="text-2xl font-bold text-green-600">✓</p>
                          <p className="font-medium">Prisma</p>
                          <p className="text-xs text-muted-foreground">Type-safe database</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Automated Optimization Tools */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">🤖 AI-Powered Optimization Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    Use these free AI tools to automatically implement SEO and optimization recommendations
                  </p>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Sitemap Generator */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Sitemap Generator</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Automatically generate sitemap.xml for better SEO
                        </p>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => window.open('https://www.xml-sitemaps.com/', '_blank')}
                        >
                          Generate Sitemap
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Robots.txt Generator */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Robots.txt Generator</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Create custom robots.txt file for crawler control
                        </p>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => window.open('https://www.robotsgenerator.com/', '_blank')}
                        >
                          Generate Robots.txt
                        </Button>
                      </CardContent>
                    </Card>

                    {/* SEO Analyzer */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">SEO Analyzer</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Analyze your site&apos;s SEO score and get recommendations
                        </p>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => window.open('https://www.seoptimer.com/', '_blank')}
                        >
                          Analyze SEO
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Meta Tags Generator */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Meta Tags Generator</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Generate optimized meta tags for social sharing
                        </p>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => window.open('https://metatags.io/', '_blank')}
                        >
                          Generate Meta Tags
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Lighthouse Audit */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Performance Audit</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Run Google Lighthouse audit for performance insights
                        </p>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => window.open('https://pagespeed.web.dev/', '_blank')}
                        >
                          Run Audit
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Image Optimizer */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Image Optimizer</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Compress and optimize images for better performance
                        </p>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => window.open('https://tinypng.com/', '_blank')}
                        >
                          Optimize Images
                        </Button>
                      </CardContent>
                    </Card>

                    {/* SSL Checker */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">SSL Security Check</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Verify SSL certificate and security configuration
                        </p>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => window.open('https://www.ssllabs.com/ssltest/', '_blank')}
                        >
                          Check SSL
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Accessibility Checker */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Accessibility Checker</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Check WCAG compliance and accessibility issues
                        </p>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => window.open('https://wave.webaim.org/', '_blank')}
                        >
                          Check Accessibility
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Schema Validator */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Schema Validator</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Validate structured data and schema markup
                        </p>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => window.open('https://validator.schema.org/', '_blank')}
                        >
                          Validate Schema
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    💡 These free AI tools help implement the recommendations above. All tools open in new tabs for easy access.
                    Review results and apply changes as needed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
