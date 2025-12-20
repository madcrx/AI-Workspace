'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Wrench, Clock, Eye, MousePointer, Layers, ArrowLeft, BarChart3, TrendingUp } from 'lucide-react';
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

  const runAutoScraper = async () => {
    setAutoScraping(true);
    setAutoScraperResult(null);
    try {
      const response = await fetch('/api/admin/auto-scraper', {
        method: 'POST',
      });
      const data = await response.json();
      setAutoScraperResult(data);
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error running auto-scraper:', error);
      setAutoScraperResult({ error: 'Failed to run auto-scraper' });
    } finally {
      setAutoScraping(false);
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Link href="/workspace">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Workspace
              </Button>
            </Link>
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
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="auto-scraper">Auto-Scraper</TabsTrigger>
            <TabsTrigger value="scraper">Scraper</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <CardTitle>All Tools ({tools.length})</CardTitle>
                <CardDescription>
                  Manage all tools in the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tools.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No tools found
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tools.map((tool) => (
                      <div
                        key={tool.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
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
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{tool.name}</h3>
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
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {tool.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>{tool.views} views</span>
                                <span>{tool.clicks} clicks</span>
                                <span>{tool.reviewCount} reviews</span>
                                {tool.rating && (
                                  <span>⭐ {tool.rating.toFixed(1)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleActive(tool.id, tool.isActive)}
                            >
                              {tool.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
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
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
                            <th className="text-left p-3 font-medium">Status</th>
                            <th className="text-left p-3 font-medium">Workspace Apps</th>
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
                              <td className="p-3">
                                <Badge variant={user.isActive ? 'default' : 'destructive'}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td className="p-3">{user._count.workspaces}</td>
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
                                        variant={user.isActive ? 'secondary' : 'default'}
                                        onClick={() => handleToggleUserActive(user.id, user.isActive)}
                                      >
                                        {user.isActive ? 'Deactivate' : 'Activate'}
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

          <TabsContent value="auto-scraper">
            <Card>
              <CardHeader>
                <CardTitle>🤖 Auto-Scraper - Automatic Tool Discovery</CardTitle>
                <CardDescription>
                  Automatically discover and add new AI tools from multiple sources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">✨ Fully Automated Tool Discovery</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    The Auto-Scraper runs automatically every night at 2 AM (configured in Vercel Cron).
                    It scans multiple sources and automatically adds new AI tools to your database - no admin action required!
                  </p>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 list-disc list-inside space-y-1">
                    <li><strong>Product Hunt AI</strong> - Latest AI tools from Product Hunt</li>
                    <li><strong>GitHub Trending</strong> - Top AI repositories and tools</li>
                    <li><strong>AI Directories</strong> - Popular AI tool directories</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">How it Works:</h4>
                  <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                    <li>Scrapes multiple AI tool sources automatically</li>
                    <li>Extracts tool name, description, category, pricing</li>
                    <li><strong>Auto-activates</strong> new tools (no approval needed)</li>
                    <li>Updates existing tools with fresh data</li>
                    <li>Logs all actions for review</li>
                  </ol>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Manual Trigger:</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Run the auto-scraper manually to discover tools right now
                  </p>
                  <Button
                    onClick={runAutoScraper}
                    disabled={autoScraping}
                    className="w-full"
                    size="lg"
                  >
                    {autoScraping ? '🔄 Discovering Tools...' : '🚀 Run Auto-Scraper Now'}
                  </Button>
                </div>

                {autoScraperResult && (
                  <div className={`p-4 rounded-lg border ${
                    autoScraperResult.error
                      ? 'bg-red-50 border-red-200'
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <h4 className="font-semibold mb-2">Auto-Scraper Results:</h4>
                    {autoScraperResult.error ? (
                      <p className="text-sm text-red-600">{autoScraperResult.error}</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-white rounded">
                            <p className="text-muted-foreground">Sources Scraped</p>
                            <p className="text-xl font-bold">{autoScraperResult.totalSources}</p>
                          </div>
                          <div className="p-2 bg-white rounded">
                            <p className="text-muted-foreground">Tools Found</p>
                            <p className="text-xl font-bold text-blue-600">{autoScraperResult.totalFound}</p>
                          </div>
                          <div className="p-2 bg-white rounded">
                            <p className="text-muted-foreground">✨ New Tools Added</p>
                            <p className="text-xl font-bold text-green-600">{autoScraperResult.totalAdded}</p>
                          </div>
                          <div className="p-2 bg-white rounded">
                            <p className="text-muted-foreground">Updated</p>
                            <p className="text-xl font-bold text-yellow-600">{autoScraperResult.totalUpdated}</p>
                          </div>
                        </div>

                        {autoScraperResult.results && autoScraperResult.results.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="font-medium text-sm">Details by Source:</p>
                            {autoScraperResult.results.map((result: any, idx: number) => (
                              <div key={idx} className="text-xs p-2 bg-white rounded">
                                <p className="font-semibold">{result.source}</p>
                                <p>Found: {result.toolsFound} | Added: {result.toolsAdded} | Updated: {result.toolsUpdated}</p>
                                <p className="text-muted-foreground">Status: {result.status} ({result.executionTime}ms)</p>
                                {result.errors && result.errors.length > 0 && (
                                  <p className="text-red-600 mt-1">Errors: {result.errors.length}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Tip:</strong> The auto-scraper runs every night at 2 AM automatically.
                    All new tools are auto-activated and ready for users immediately!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scraper">
            <Card>
              <CardHeader>
                <CardTitle>Tool Scraper</CardTitle>
                <CardDescription>
                  Automatically check tool availability and update information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    The scraper runs automatically every 24 hours to check if tools are still available and updates their status.
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Checks if tool websites are accessible</li>
                    <li>Marks unavailable tools as inactive</li>
                    <li>Updates tool metadata</li>
                    <li>Auto-updates user workspaces with changes</li>
                  </ul>
                </div>

                <Button
                  onClick={runScraper}
                  disabled={scraping}
                  className="w-full"
                >
                  {scraping ? 'Running Scraper...' : 'Run Scraper Manually'}
                </Button>

                {scrapingResult && (
                  <div className={`p-4 rounded-lg border ${scrapingResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <h4 className="font-semibold mb-2">Scraping Results:</h4>
                    <div className="space-y-1 text-sm">
                      <p>Status: {scrapingResult.success ? '✅ Success' : '❌ Failed'}</p>
                      <p>Tools Updated: {scrapingResult.updated || 0}</p>
                      <p>Tools Removed: {scrapingResult.removed || 0}</p>
                      {scrapingResult.errors && scrapingResult.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Errors:</p>
                          <ul className="list-disc list-inside">
                            {scrapingResult.errors.slice(0, 5).map((error: string, idx: number) => (
                              <li key={idx} className="text-xs text-red-600">{error}</li>
                            ))}
                          </ul>
                          {scrapingResult.errors.length > 5 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ...and {scrapingResult.errors.length - 5} more errors
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Image Fetcher</CardTitle>
                <CardDescription>
                  Automatically fetch and update tool logos from provider websites
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    The image fetcher retrieves logos and favicons from tool websites using multiple methods:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Google Favicon Service (primary)</li>
                    <li>DuckDuckGo Icon Service (fallback)</li>
                    <li>Direct website favicon.ico</li>
                    <li>Common logo paths (/logo.png, /logo.svg, etc.)</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: This process may take several minutes for all tools.
                  </p>
                </div>

                <Button
                  onClick={runImageFetcher}
                  disabled={fetchingImages}
                  className="w-full"
                >
                  {fetchingImages ? 'Fetching Images...' : 'Fetch Tool Images'}
                </Button>

                {imageFetchResult && (
                  <div className={`p-4 rounded-lg border ${imageFetchResult.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <h4 className="font-semibold mb-2">Image Fetch Results:</h4>
                    <div className="space-y-1 text-sm">
                      <p>Total Tools: {imageFetchResult.total || 0}</p>
                      <p>Successfully Fetched: {imageFetchResult.successful || 0}</p>
                      <p>Failed: {imageFetchResult.failed || 0}</p>
                      {imageFetchResult.details && imageFetchResult.details.length > 0 && (
                        <div className="mt-3 max-h-[200px] overflow-y-auto">
                          <p className="font-medium mb-1">Details:</p>
                          <div className="space-y-1">
                            {imageFetchResult.details.slice(0, 10).map((detail: any, idx: number) => (
                              <div key={idx} className="text-xs">
                                {detail.success ? '✅' : '❌'} {detail.toolName}
                                {detail.error && <span className="text-red-600"> - {detail.error}</span>}
                              </div>
                            ))}
                          </div>
                          {imageFetchResult.details.length > 10 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ...and {imageFetchResult.details.length - 10} more
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
