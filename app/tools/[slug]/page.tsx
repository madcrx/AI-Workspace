'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ExternalLink, Plus, Star, ArrowLeft } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string | null;
  category: string;
  websiteUrl: string;
  loginUrl: string | null;
  logoUrl: string | null;
  pricing: string;
  pricingDetails: string | null;
  features: string;
  tags: string;
  rating: number | null;
  reviewCount: number;
  views: number;
}

export default function ToolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (params.slug) {
      fetchTool(params.slug as string);
    }
  }, [params.slug]);

  const fetchTool = async (slug: string) => {
    try {
      const response = await fetch(`/api/tools/slug/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setTool(data);
      } else {
        router.push('/tools');
      }
    } catch (error) {
      console.error('Error fetching tool:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWorkspace = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!tool) return;

    try {
      const workspacesRes = await fetch('/api/workspaces');
      const workspaces = await workspacesRes.json();
      let workspaceId = workspaces[0]?.id;

      if (!workspaceId) {
        const createRes = await fetch('/api/workspaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'My Workspace' }),
        });
        const newWorkspace = await createRes.json();
        workspaceId = newWorkspace.id;
      }

      const response = await fetch(`/api/workspaces/${workspaceId}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId: tool.id }),
      });

      if (response.ok) {
        alert('Tool added to workspace!');
        router.push('/workspace');
      }
    } catch (error) {
      console.error('Error adding tool:', error);
    }
  };

  const submitRating = async (rating: number) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      await fetch(`/api/tools/${tool?.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
      setUserRating(rating);
      if (tool) {
        fetchTool(tool.slug);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!tool) {
    return null;
  }

  const features = tool.features ? JSON.parse(tool.features) : [];
  const tags = tool.tags ? JSON.parse(tool.tags) : [];

  const getPricingBadgeColor = (pricing: string) => {
    switch (pricing) {
      case 'FREE':
        return 'bg-green-500 text-white';
      case 'FREEMIUM':
        return 'bg-blue-500 text-white';
      case 'PAID':
        return 'bg-orange-500 text-white';
      case 'SUBSCRIPTION':
        return 'bg-purple-500 text-white';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/tools" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Tools
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">AI Workspace</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              {tool.logoUrl ? (
                <img src={tool.logoUrl} alt={tool.name} className="h-16 w-16 object-contain" />
              ) : (
                <Sparkles className="h-10 w-10 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold mb-2">{tool.name}</h1>
              <p className="text-lg text-muted-foreground mb-3">{tool.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{tool.category}</Badge>
                <Badge className={getPricingBadgeColor(tool.pricing)}>{tool.pricing}</Badge>
                {tags.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Rating */}
          <Card>
            <CardHeader>
              <CardTitle>Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => submitRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          (hoverRating || userRating) >= star
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {tool.rating ? tool.rating.toFixed(1) : '0.0'} / 5.0 ({tool.reviewCount} reviews)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={addToWorkspace} className="gap-2 flex-1">
              <Plus className="h-4 w-4" />
              Add to Workspace
            </Button>
            <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" className="gap-2 w-full">
                <ExternalLink className="h-4 w-4" />
                Visit Website
              </Button>
            </a>
          </div>

          {/* Description */}
          {tool.longDescription && (
            <Card>
              <CardHeader>
                <CardTitle>About {tool.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{tool.longDescription}</p>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {features.map((feature: string, idx: number) => (
                    <li key={idx} className="text-muted-foreground">{feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Pricing Details */}
          {tool.pricingDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{tool.pricingDetails}</p>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">{tool.views}</div>
                  <div className="text-sm text-muted-foreground">Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{tool.reviewCount}</div>
                  <div className="text-sm text-muted-foreground">Reviews</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
