'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SubmitToolPage() {
  const [formData, setFormData] = useState({
    name: '',
    websiteUrl: '',
    loginUrl: '',
    description: '',
    longDescription: '',
    category: '',
    pricing: 'FREE',
    features: '',
    tags: '',
    contactEmail: '',
    logoUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/submissions/tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          websiteUrl: '',
          loginUrl: '',
          description: '',
          longDescription: '',
          category: '',
          pricing: 'FREE',
          features: '',
          tags: '',
          contactEmail: '',
          logoUrl: '',
        });
      } else {
        alert('Failed to submit tool. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting tool:', error);
      alert('Failed to submit tool. Please try again.');
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
            <h2 className="text-2xl font-bold">Tool Submitted!</h2>
            <p className="text-muted-foreground">
              Thank you for submitting your AI tool. Our team will review it within 24-48 hours.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setSubmitted(false)} className="flex-1">
                Submit Another Tool
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
              <Upload className="h-6 w-6" />
              Submit Your AI Tool
            </CardTitle>
            <CardDescription>
              Share your AI tool with our community. All submissions are reviewed before being added to the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tool Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My AI Tool"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select Category</option>
                    <option value="Content Creation">Content Creation</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Image Generation">Image Generation</option>
                    <option value="Code Assistant">Code Assistant</option>
                    <option value="Data Analysis">Data Analysis</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL *</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    required
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://yourtool.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginUrl">Login URL (Optional)</Label>
                  <Input
                    id="loginUrl"
                    type="url"
                    value={formData.loginUrl}
                    onChange={(e) => setFormData({ ...formData, loginUrl: e.target.value })}
                    placeholder="https://yourtool.com/login"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricing">Pricing Model *</Label>
                <select
                  id="pricing"
                  required
                  value={formData.pricing}
                  onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="FREE">Free</option>
                  <option value="FREEMIUM">Freemium</option>
                  <option value="PAID">Paid</option>
                  <option value="SUBSCRIPTION">Subscription</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your tool (max 200 characters)"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Detailed Description</Label>
                <Textarea
                  id="longDescription"
                  rows={5}
                  value={formData.longDescription}
                  onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                  placeholder="Provide a comprehensive description of your tool, its capabilities, and use cases..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Key Features (one per line)</Label>
                <Textarea
                  id="features"
                  rows={4}
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="AI-powered content generation&#10;Multi-language support&#10;API integration&#10;Real-time collaboration"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="AI, automation, productivity"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://yourtool.com/logo.png"
                />
                <p className="text-xs text-muted-foreground">
                  Provide a direct link to your logo (PNG, JPG, or SVG). We'll download and host it locally.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="your@email.com"
                />
                <p className="text-xs text-muted-foreground">
                  We'll use this to notify you about your submission status.
                </p>
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Submitting...' : 'Submit Tool for Review'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
