'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function UpdateToolPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    toolId: '',
    toolName: '',
    updateType: 'INFORMATION',
    currentValue: '',
    newValue: '',
    reason: '',
    contactEmail: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/tools');
      const data = await response.json();
      setTools(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tools:', error);
    }
  };

  const handleToolChange = (toolId: string) => {
    const selectedTool = tools.find(t => t.id === toolId);
    setFormData({
      ...formData,
      toolId,
      toolName: selectedTool ? selectedTool.name : '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/submissions/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          toolId: '',
          toolName: '',
          updateType: 'INFORMATION',
          currentValue: '',
          newValue: '',
          reason: '',
          contactEmail: '',
        });
      } else {
        alert('Failed to submit update request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting update request:', error);
      alert('Failed to submit update request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Update Request Submitted!</h2>
            <p className="text-muted-foreground">
              Thank you for helping us keep tool information accurate. We'll review your update request shortly.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setSubmitted(false)} className="flex-1">
                Submit Another Update
              </Button>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Return Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <RefreshCw className="h-6 w-6" />
              Update Tool Information
            </CardTitle>
            <CardDescription>
              Notice outdated or incorrect information? Help us keep our tool database accurate by submitting update requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="toolId">Select Tool *</Label>
                <select
                  id="toolId"
                  required
                  value={formData.toolId}
                  onChange={(e) => handleToolChange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Choose a tool...</option>
                  {tools.map((tool) => (
                    <option key={tool.id} value={tool.id}>
                      {tool.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="updateType">What needs to be updated? *</Label>
                <select
                  id="updateType"
                  required
                  value={formData.updateType}
                  onChange={(e) => setFormData({ ...formData, updateType: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="INFORMATION">General Information</option>
                  <option value="DESCRIPTION">Description</option>
                  <option value="FEATURES">Features</option>
                  <option value="PRICING">Pricing Model</option>
                  <option value="CATEGORY">Category</option>
                  <option value="WEBSITE_URL">Website URL</option>
                  <option value="LOGIN_URL">Login URL</option>
                  <option value="LOGO">Logo/Image</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentValue">Current Value</Label>
                <Textarea
                  id="currentValue"
                  rows={3}
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  placeholder="What does it currently say? (if applicable)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newValue">Correct Value *</Label>
                <Textarea
                  id="newValue"
                  required
                  rows={3}
                  value={formData.newValue}
                  onChange={(e) => setFormData({ ...formData, newValue: e.target.value })}
                  placeholder="What should it be?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Update *</Label>
                <Textarea
                  id="reason"
                  required
                  rows={4}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Why does this need to be updated? Provide sources or evidence if possible..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email (Optional)</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="your@email.com"
                />
                <p className="text-xs text-muted-foreground">
                  We'll notify you when your update is reviewed.
                </p>
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Submitting...' : 'Submit Update Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Why submit updates?</h3>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>✅ Help maintain accurate tool information</li>
            <li>🔍 Ensure users find the right tools</li>
            <li>🤝 Contribute to the community</li>
            <li>⚡ Updates are reviewed within 24-48 hours</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
