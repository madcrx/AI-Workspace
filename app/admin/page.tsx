'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Wrench, Clock, Eye, MousePointer, Layers, ArrowLeft } from 'lucide-react';
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

interface Submission {
  id: string;
  name: string;
  description: string;
  category: string;
  pricing: string;
  status: string;
  createdAt: string;
  user: {
    email: string;
    name: string | null;
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapingResult, setScrapingResult] = useState<any>(null);
  const [fetchingImages, setFetchingImages] = useState(false);
  const [imageFetchResult, setImageFetchResult] = useState<any>(null);

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
      const [statsRes, submissionsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/submissions'),
      ]);

      const statsData = await statsRes.json();
      const submissionsData = await submissionsRes.json();

      setStats(statsData);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    try {
      await fetch(`/api/admin/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      fetchData();
    } catch (error) {
      console.error('Error approving submission:', error);
    }
  };

  const handleReject = async (submissionId: string) => {
    try {
      await fetch(`/api/admin/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', reviewNotes: 'Does not meet criteria' }),
      });

      fetchData();
    } catch (error) {
      console.error('Error rejecting submission:', error);
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

  if (loading || status === 'loading') {
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

        <Tabs defaultValue="submissions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="scraper">Scraper</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tool Submissions</CardTitle>
                <CardDescription>
                  Review and approve tool submissions from developers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No submissions to review
                    </p>
                  ) : (
                    submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{submission.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {submission.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{submission.category}</Badge>
                              <Badge variant="secondary">{submission.pricing}</Badge>
                              <Badge
                                variant={
                                  submission.status === 'PENDING'
                                    ? 'default'
                                    : submission.status === 'APPROVED'
                                    ? 'default'
                                    : 'destructive'
                                }
                              >
                                {submission.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Submitted by: {submission.user.name || submission.user.email}
                            </p>
                          </div>
                          {submission.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(submission.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(submission.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <CardTitle>All Tools</CardTitle>
                <CardDescription>
                  Manage all tools in the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tool management interface coming soon...
                </p>
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
                <p className="text-muted-foreground">
                  User management interface coming soon...
                </p>
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
