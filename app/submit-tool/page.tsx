'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SubmitToolPage() {
  const [formData, setFormData] = useState({
    toolName: '',
    websiteUrl: '',
    description: '',
    category: 'AI_ASSISTANT',
    pricing: 'FREEMIUM',
    features: '',
    submitterEmail: '',
    affiliateInfo: '',
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
          toolName: '',
          websiteUrl: '',
          description: '',
          category: 'AI_ASSISTANT',
          pricing: 'FREEMIUM',
          features: '',
          submitterEmail: '',
          affiliateInfo: '',
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
              Thank you for submitting an AI tool. Our team will review it and add it to the platform if approved.
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
              <Sparkles className="h-6 w-6" />
              Submit an AI Tool
            </CardTitle>
            <CardDescription>
              Know an amazing AI tool that's not listed? Submit it and help grow our community! We review all submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="toolName">Tool Name *</Label>
                <Input
                  id="toolName"
                  required
                  value={formData.toolName}
                  onChange={(e) => setFormData({ ...formData, toolName: e.target.value })}
                  placeholder="e.g., ChatGPT, Midjourney, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL *</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  required
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this AI tool does and its main features..."
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
                  <option value="AI_ASSISTANT">AI Assistant</option>
                  <option value="IMAGE_GENERATION">Image Generation</option>
                  <option value="VIDEO_GENERATION">Video Generation</option>
                  <option value="WRITING">Writing & Content</option>
                  <option value="CODE">Code & Development</option>
                  <option value="AUDIO">Audio & Music</option>
                  <option value="DATA_ANALYSIS">Data Analysis</option>
                  <option value="PRODUCTIVITY">Productivity</option>
                  <option value="MARKETING">Marketing & SEO</option>
                  <option value="DESIGN">Design</option>
                  <option value="OTHER">Other</option>
                </select>
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
                  <option value="PAID">Paid Only</option>
                  <option value="TRIAL">Free Trial</option>
                  <option value="CONTACT">Contact for Pricing</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Key Features (Optional)</Label>
                <Textarea
                  id="features"
                  rows={3}
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="List the main features, separated by commas or line breaks..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="submitterEmail">Your Email *</Label>
                <Input
                  id="submitterEmail"
                  type="email"
                  required
                  value={formData.submitterEmail}
                  onChange={(e) => setFormData({ ...formData, submitterEmail: e.target.value })}
                  placeholder="your@email.com"
                />
                <p className="text-xs text-muted-foreground">
                  We'll contact you if we need more information about the tool.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="affiliateInfo">Affiliate/Referral Info (Optional)</Label>
                <Input
                  id="affiliateInfo"
                  value={formData.affiliateInfo}
                  onChange={(e) => setFormData({ ...formData, affiliateInfo: e.target.value })}
                  placeholder="Affiliate code or referral link if applicable"
                />
                <p className="text-xs text-muted-foreground">
                  If you have an affiliate partnership with this tool, let us know.
                </p>
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Submitting...' : 'Submit AI Tool'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Submission Guidelines</h3>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>✅ Tool must be actively maintained and functional</li>
            <li>🤖 Must be AI-powered or AI-related</li>
            <li>🌐 Must have a working website or landing page</li>
            <li>📝 Provide accurate and detailed information</li>
            <li>⏱️ Review typically takes 2-5 business days</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
