'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Megaphone, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdvertisePage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    advertisingType: 'BANNER',
    budget: '',
    duration: 'MONTHLY',
    targetAudience: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/submissions/advertise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          companyName: '',
          contactName: '',
          email: '',
          phone: '',
          website: '',
          advertisingType: 'BANNER',
          budget: '',
          duration: 'MONTHLY',
          targetAudience: '',
          message: '',
        });
      } else {
        alert('Failed to submit advertising inquiry. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting advertising inquiry:', error);
      alert('Failed to submit advertising inquiry. Please try again.');
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
            <h2 className="text-2xl font-bold">Inquiry Received!</h2>
            <p className="text-muted-foreground">
              Thank you for your interest in advertising with us. Our team will contact you within 1-2 business days to discuss opportunities.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setSubmitted(false)} className="flex-1">
                Submit Another Inquiry
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
              <Megaphone className="h-6 w-6" />
              Advertise With Us
            </CardTitle>
            <CardDescription>
              Reach thousands of AI enthusiasts and professionals. Get in touch to discuss advertising opportunities on AI Workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Your Company Inc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name *</Label>
                  <Input
                    id="contactName"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Company Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="advertisingType">Advertising Type *</Label>
                  <select
                    id="advertisingType"
                    required
                    value={formData.advertisingType}
                    onChange={(e) => setFormData({ ...formData, advertisingType: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="BANNER">Banner Ads</option>
                    <option value="FEATURED">Featured Listing</option>
                    <option value="SPONSORED">Sponsored Content</option>
                    <option value="NEWSLETTER">Newsletter Sponsorship</option>
                    <option value="CUSTOM">Custom Package</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Campaign Duration *</Label>
                  <select
                    id="duration"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="WEEKLY">1 Week</option>
                    <option value="MONTHLY">1 Month</option>
                    <option value="QUARTERLY">3 Months</option>
                    <option value="ANNUAL">12 Months</option>
                    <option value="CUSTOM">Custom Duration</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Monthly Budget Range *</Label>
                <select
                  id="budget"
                  required
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select budget range...</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="1000-2500">$1,000 - $2,500</option>
                  <option value="2500-5000">$2,500 - $5,000</option>
                  <option value="5000-10000">$5,000 - $10,000</option>
                  <option value="10000+">$10,000+</option>
                  <option value="CUSTOM">Custom Budget</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="e.g., AI developers, business professionals, content creators"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message / Campaign Goals *</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your advertising goals, target audience, and any specific requirements..."
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Submitting...' : 'Submit Advertising Inquiry'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Why Advertise Here?</h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>🎯 Targeted AI enthusiast audience</li>
              <li>📈 Growing user base</li>
              <li>💼 Professional environment</li>
              <li>🔧 Custom campaign options</li>
            </ul>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">What Happens Next?</h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>📧 Response within 1-2 business days</li>
              <li>📊 Custom proposal & pricing</li>
              <li>🤝 Flexible campaign terms</li>
              <li>📈 Performance analytics included</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
