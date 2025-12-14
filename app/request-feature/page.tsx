'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Lightbulb, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RequestFeaturePage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'FEATURE',
    useCase: '',
    priority: 'MEDIUM',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/submissions/feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          title: '',
          description: '',
          category: 'FEATURE',
          useCase: '',
          priority: 'MEDIUM',
          email: '',
        });
      } else {
        alert('Failed to submit request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
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
            <h2 className="text-2xl font-bold">Request Submitted!</h2>
            <p className="text-muted-foreground">
              Thank you for your feature request. We review all suggestions and will notify you of any updates.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setSubmitted(false)} className="flex-1">
                Submit Another Request
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
              <Lightbulb className="h-6 w-6" />
              Request a Feature
            </CardTitle>
            <CardDescription>
              Have an idea to improve AI Workspace? We'd love to hear it! Share your feature requests and help shape the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Feature Title *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Dark mode support, API integration, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Request Type *</Label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="FEATURE">New Feature</option>
                  <option value="ENHANCEMENT">Enhancement</option>
                  <option value="BUG">Bug Report</option>
                  <option value="UI_UX">UI/UX Improvement</option>
                  <option value="INTEGRATION">Integration Request</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your feature request in detail. What problem does it solve? How would it work?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="useCase">Use Case / Example</Label>
                <Textarea
                  id="useCase"
                  rows={4}
                  value={formData.useCase}
                  onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                  placeholder="Provide a real-world example of how this feature would be used..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="LOW">Low - Nice to have</option>
                  <option value="MEDIUM">Medium - Would be useful</option>
                  <option value="HIGH">High - Important feature</option>
                  <option value="CRITICAL">Critical - Blocking my usage</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                />
                <p className="text-xs text-muted-foreground">
                  We'll notify you when we review or implement your request.
                </p>
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Submitting...' : 'Submit Feature Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>✅ Your request is added to our review queue</li>
            <li>📊 We analyze all requests and prioritize based on community needs</li>
            <li>🔨 Popular features are scheduled for development</li>
            <li>📧 You'll receive updates if you provided an email</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
