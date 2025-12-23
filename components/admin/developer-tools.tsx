'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Code,
  Download,
  Trash2,
  Activity,
  Server,
  Cpu,
  HardDrive,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Terminal,
} from 'lucide-react';

interface SystemHealth {
  healthy: boolean;
  timestamp: string;
  database: {
    healthy: boolean;
    latency: string;
  };
  system: {
    platform: string;
    arch: string;
    nodeVersion: string;
    cpuCount: number;
    cpuModel: string;
    loadAverage: string[];
    totalMemory: string;
    freeMemory: string;
    usedMemory: string;
    memoryUsagePercent: string;
  };
  process: {
    pid: number;
    uptime: string;
    heapUsed: string;
    heapTotal: string;
    rss: string;
  };
}

export default function DeveloperTools() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearingCache, setClearingCache] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/admin/system/health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Error fetching system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Clear all caches? This will clear Next.js route cache and may temporarily slow down the site.')) {
      return;
    }

    setClearingCache(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/system/cache/clear', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `Caches cleared: ${data.clearedCaches.join(', ')}`,
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to clear caches' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while clearing caches' });
    } finally {
      setClearingCache(false);
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

  const copyEnvTemplate = () => {
    const template = `# Database
DATABASE_URL=your_database_url_here

# NextAuth
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Email/SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=noreply@yoursite.com
SMTP_FROM_NAME=AI Workspace

# OAuth - Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OAuth - GitHub
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# AI Services
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Analytics
NEXT_PUBLIC_GA_ID=
`;

    navigator.clipboard.writeText(template);
    setMessage({ type: 'success', text: 'Environment template copied to clipboard!' });
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
            <Code className="h-5 w-5" />
            Developer Tools & System Monitoring
          </CardTitle>
          <CardDescription>
            System health, performance monitoring, and development utilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* System Health Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </h3>
              <div className="flex items-center gap-2">
                {health?.healthy ? (
                  <Badge className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Healthy
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Issues Detected
                  </Badge>
                )}
                <Button variant="outline" size="sm" onClick={fetchHealth}>
                  Refresh
                </Button>
              </div>
            </div>

            {/* Health Status Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className={health?.database.healthy ? 'border-green-200' : 'border-red-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Database
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {health?.database.healthy ? 'Connected' : 'Error'}
                    </span>
                    <Badge variant={health?.database.healthy ? 'default' : 'destructive'}>
                      {health?.database.latency}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Server Uptime
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{health?.process.uptime || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground mt-1">PID: {health?.process.pid}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* System Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Information
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-mono">{health?.system.platform}</p>
                  <p className="text-xs text-muted-foreground mt-1">{health?.system.arch}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Node.js</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-mono">{health?.system.nodeVersion}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    CPU
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-mono">{health?.system.cpuCount} cores</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {health?.system.cpuModel}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Memory & Performance */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">System Memory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-mono">{health?.system.totalMemory}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Used:</span>
                    <span className="font-mono">{health?.system.usedMemory}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Free:</span>
                    <span className="font-mono">{health?.system.freeMemory}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Usage:</span>
                      <span>{health?.system.memoryUsagePercent}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Process Memory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Heap Used:</span>
                    <span className="font-mono">{health?.process.heapUsed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Heap Total:</span>
                    <span className="font-mono">{health?.process.heapTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">RSS:</span>
                    <span className="font-mono">{health?.process.rss}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Load Average */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Load Average (1m, 5m, 15m)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {health?.system.loadAverage.map((load, index) => (
                    <div key={index} className="flex-1">
                      <p className="text-2xl font-bold font-mono">{load}</p>
                      <p className="text-xs text-muted-foreground">
                        {index === 0 ? '1 min' : index === 1 ? '5 min' : '15 min'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Developer Actions */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Developer Actions
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="hover:bg-accent/50 cursor-pointer" onClick={handleBackup}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Download className="h-6 w-6 text-blue-600" />
                    <h4 className="font-semibold">Backup Website</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a complete database backup for disaster recovery
                  </p>
                  <Button
                    className="w-full"
                    disabled={backingUp}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBackup();
                    }}
                  >
                    {backingUp ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
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

              <Card className="hover:bg-accent/50 cursor-pointer" onClick={handleClearCache}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Trash2 className="h-6 w-6 text-red-600" />
                    <h4 className="font-semibold">Clear Caches</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Clear Next.js route cache and other cached data
                  </p>
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={clearingCache}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearCache();
                    }}
                  >
                    {clearingCache ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:bg-accent/50 cursor-pointer" onClick={copyEnvTemplate}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Code className="h-6 w-6 text-green-600" />
                    <h4 className="font-semibold">Environment Template</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Copy .env template with all required variables
                  </p>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyEnvTemplate();
                    }}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Copy Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Links */}
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="grid md:grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => window.open('/api/admin/stats', '_blank')}
              >
                View API Stats
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => window.open('/api/tutorials', '_blank')}
              >
                View Tutorials API
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => window.open('/api/tools', '_blank')}
              >
                View Tools API
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => window.open('https://github.com/vercel/next.js/tree/canary/docs', '_blank')}
              >
                Next.js Documentation
              </Button>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground text-center pt-4 border-t">
            Last updated: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'Never'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
