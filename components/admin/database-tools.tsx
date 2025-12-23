'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Database,
  RefreshCw,
  Download,
  Trash2,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
} from 'lucide-react';

interface DatabaseStatus {
  counts: {
    users: number;
    tools: number;
    tutorials: number;
    workspaces: number;
    reviews: number;
    affiliatePrograms: number;
    videoClips: number;
    scraperLogs: number;
  };
  expected: {
    users: number;
    tools: number;
    tutorials: number;
    affiliatePrograms: number;
  };
  needsReseed: boolean;
  databaseSize: string;
  tableSizes: Array<{ table: string; size: string; rows: number }>;
  timestamp: string;
}

export default function DatabaseTools() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [reseeding, setReseeding] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/database/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching database status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReseed = async () => {
    if (!confirm('Are you sure you want to reseed the database? This will add seed data but NOT delete existing records.')) {
      return;
    }

    setReseeding(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/database/reseed', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Database reseeded successfully!' });
        await fetchStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to reseed database' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while reseeding' });
    } finally {
      setReseeding(false);
    }
  };

  const handleBackup = async () => {
    setBackingUp(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/database/backup', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `Backup created: ${data.filename} (${data.size})`,
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create backup' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while creating backup' });
    } finally {
      setBackingUp(false);
    }
  };

  const handleOptimize = async () => {
    if (!confirm('Optimize the database? This may take a few minutes and will improve performance.')) {
      return;
    }

    setOptimizing(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/database/optimize', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Database optimized successfully!' });
        await fetchStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to optimize database' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while optimizing' });
    } finally {
      setOptimizing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Management Tools
          </CardTitle>
          <CardDescription>
            Monitor database status, reseed data, and perform maintenance operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Database Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Info className="h-5 w-5" />
                Database Status
              </h3>
              <Button variant="outline" size="sm" onClick={fetchStatus}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {status?.needsReseed && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Database needs reseeding!</strong> Some tables have fewer records than expected.
                  Click "Reseed Database" below to add missing seed data.
                </AlertDescription>
              </Alert>
            )}

            {!status?.needsReseed && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Database is properly seeded with all expected data.
                </AlertDescription>
              </Alert>
            )}

            {/* Record Counts */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{status?.counts.users || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    Expected: {status?.expected.users || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">AI Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{status?.counts.tools || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    Expected: {status?.expected.tools || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tutorials</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{status?.counts.tutorials || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    Expected: {status?.expected.tutorials || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Affiliate Programs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{status?.counts.affiliatePrograms || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    Expected: {status?.expected.affiliatePrograms || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Workspaces</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{status?.counts.workspaces || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{status?.counts.reviews || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Video Clips</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{status?.counts.videoClips || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Database Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{status?.databaseSize || 'N/A'}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Table Sizes */}
          {status?.tableSizes && status.tableSizes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Largest Tables</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Table</th>
                      <th className="text-right p-3 text-sm font-medium">Size</th>
                      <th className="text-right p-3 text-sm font-medium">Rows</th>
                    </tr>
                  </thead>
                  <tbody>
                    {status.tableSizes.slice(0, 10).map((table, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3 text-sm">{table.table}</td>
                        <td className="p-3 text-sm text-right">{table.size}</td>
                        <td className="p-3 text-sm text-right">{table.rows?.toLocaleString() || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold">Database Operations</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="hover:bg-accent/50 cursor-pointer" onClick={handleReseed}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <RefreshCw className="h-6 w-6 text-primary" />
                    <h4 className="font-semibold">Reseed Database</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add seed data to database (users, tools, tutorials, etc.)
                  </p>
                  <Button
                    className="w-full"
                    disabled={reseeding}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReseed();
                    }}
                  >
                    {reseeding ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Reseeding...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reseed Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:bg-accent/50 cursor-pointer" onClick={handleBackup}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Download className="h-6 w-6 text-blue-600" />
                    <h4 className="font-semibold">Backup Database</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a complete backup of the database
                  </p>
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={backingUp}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBackup();
                    }}
                  >
                    {backingUp ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Backup...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Create Backup
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:bg-accent/50 cursor-pointer" onClick={handleOptimize}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="h-6 w-6 text-yellow-600" />
                    <h4 className="font-semibold">Optimize Database</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Run VACUUM and REINDEX to improve performance
                  </p>
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={optimizing}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptimize();
                    }}
                  >
                    {optimizing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Optimize Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground text-center pt-4 border-t">
            Last updated: {status?.timestamp ? new Date(status.timestamp).toLocaleString() : 'Never'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
