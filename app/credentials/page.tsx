'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Key, Trash2, Eye, EyeOff, ExternalLink, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Credential {
  id: string;
  toolId: string;
  username: string;
  customLoginUrl?: string;
  notes?: string;
  toolName: string;
  loginUrl?: string;
  logoUrl?: string;
  createdAt: string;
}

interface Tool {
  id: string;
  name: string;
  loginUrl?: string;
}

export default function CredentialsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [customLoginUrl, setCustomLoginUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchCredentials();
      fetchTools();
    }
  }, [status, router]);

  const fetchCredentials = async () => {
    try {
      const response = await fetch('/api/credentials');
      const data = await response.json();
      setCredentials(data);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/tools');
      const data = await response.json();
      // Show all tools - users can add credentials for any tool
      setTools(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tools:', error);
      setTools([]);
    }
  };

  const handleSaveCredential = async () => {
    if (!selectedToolId || !username || !password) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: selectedToolId,
          username,
          password,
          customLoginUrl,
          notes,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setSelectedToolId('');
        setUsername('');
        setPassword('');
        setCustomLoginUrl('');
        setNotes('');
        fetchCredentials();
      } else {
        alert('Failed to save credentials');
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      alert('Failed to save credentials');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCredential = async (id: string) => {
    if (!confirm('Are you sure you want to delete these credentials?')) {
      return;
    }

    try {
      const response = await fetch(`/api/credentials/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCredentials();
      }
    } catch (error) {
      console.error('Error deleting credentials:', error);
    }
  };

  const handleAutoLogin = async (credentialId: string, loginUrl: string) => {
    try {
      const response = await fetch(`/api/credentials/${credentialId}`);
      const data = await response.json();

      if (data.username && data.password && loginUrl) {
        // Open the login URL in a new tab
        window.open(loginUrl, '_blank');

        // Copy credentials to clipboard for manual entry
        // (Auto-filling across domains requires browser extensions)
        const credText = `Username: ${data.username}\nPassword: ${data.password}`;
        navigator.clipboard.writeText(credText);

        alert('Credentials copied to clipboard! Paste them in the login form.');
      }
    } catch (error) {
      console.error('Error fetching credentials for auto-login:', error);
      alert('Failed to retrieve credentials');
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
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/workspace" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Workspace
              </Link>
              <h1 className="text-2xl font-bold">Tool Credentials</h1>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Credentials
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add Tool Credentials</CardTitle>
              <CardDescription>
                Securely store your login credentials for quick access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tool">Tool</Label>
                <select
                  id="tool"
                  value={selectedToolId}
                  onChange={(e) => setSelectedToolId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md bg-background"
                >
                  <option value="">Select a tool...</option>
                  {tools.map((tool) => (
                    <option key={tool.id} value={tool.id}>
                      {tool.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username / Email</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customLoginUrl">Custom Login URL (optional)</Label>
                <Input
                  id="customLoginUrl"
                  type="url"
                  value={customLoginUrl}
                  onChange={(e) => setCustomLoginUrl(e.target.value)}
                  placeholder="https://example.com/login (overrides tool's default)"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use the tool's default login URL
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveCredential} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Credentials'}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {credentials.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No credentials saved yet</p>
                <p className="text-sm text-muted-foreground">
                  Add credentials to enable quick login to your tools
                </p>
              </CardContent>
            </Card>
          ) : (
            credentials.map((cred) => (
              <Card key={cred.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {cred.logoUrl && (
                        <img
                          src={cred.logoUrl}
                          alt={cred.toolName}
                          className="h-10 w-10 rounded object-contain"
                        />
                      )}
                      <div>
                        <CardTitle className="text-lg">{cred.toolName}</CardTitle>
                        <CardDescription>{cred.username}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(cred.customLoginUrl || cred.loginUrl) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAutoLogin(cred.id, cred.customLoginUrl || cred.loginUrl!)}
                          className="gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Quick Login
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCredential(cred.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {cred.notes && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{cred.notes}</p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
