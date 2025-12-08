'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function SubmitToolPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    websiteUrl: '',
    category: '',
    pricing: 'FREE',
    pricingDetails: '',
    features: '',
    tags: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submissionData = {
        ...formData,
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to submit tool');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/workspace');
      }, 2000);
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Submission Received!</CardTitle>
            <CardDescription>
              Your tool has been submitted for review. We'll notify you once it's approved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/workspace">
              <Button>Return to Workspace</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/workspace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Workspace
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Submit Your AI Tool</h1>
            <p className="text-lg text-muted-foreground">
              Share your AI tool with our community. All submissions are reviewed before being published.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tool Information</CardTitle>
              <CardDescription>
                Provide detailed information about your AI tool
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Tool Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description *</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full min-h-[80px] px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longDescription">Detailed Description</Label>
                  <textarea
                    id="longDescription"
                    name="longDescription"
                    value={formData.longDescription}
                    onChange={handleChange}
                    className="w-full min-h-[120px] px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL *</Label>
                  <Input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="Content Generation">Content Generation</option>
                      <option value="Image Generation">Image Generation</option>
                      <option value="Video Creation">Video Creation</option>
                      <option value="Code Assistant">Code Assistant</option>
                      <option value="Productivity">Productivity</option>
                      <option value="Data Analysis">Data Analysis</option>
                      <option value="Voice & Audio">Voice & Audio</option>
                      <option value="Research">Research</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricing">Pricing Model *</Label>
                    <select
                      id="pricing"
                      name="pricing"
                      value={formData.pricing}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      required
                    >
                      <option value="FREE">Free</option>
                      <option value="FREEMIUM">Freemium</option>
                      <option value="PAID">Paid</option>
                      <option value="SUBSCRIPTION">Subscription</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricingDetails">Pricing Details</Label>
                  <Input
                    id="pricingDetails"
                    name="pricingDetails"
                    value={formData.pricingDetails}
                    onChange={handleChange}
                    placeholder="e.g., Free tier available, Pro: $19/month"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Key Features (comma-separated)</Label>
                  <Input
                    id="features"
                    name="features"
                    value={formData.features}
                    onChange={handleChange}
                    placeholder="e.g., AI Generation, Custom Templates, API Access"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g., ai, automation, productivity"
                  />
                </div>

                {error && (
                  <div className="p-3 border border-destructive bg-destructive/10 text-destructive rounded-md text-sm">
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Submitting...' : 'Submit Tool for Review'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
