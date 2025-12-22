'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowLeft, Clock, Eye, ThumbsUp, ExternalLink, Tag } from 'lucide-react';

interface Tutorial {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  difficulty: string;
  youtubeVideoId?: string;
  affiliateLinks: Array<{ name: string; url: string; description?: string; discount?: string }>;
  toolsUsed: string[];
  duration?: number;
  views: number;
  likes: number;
  thumbnailUrl?: string;
  tags: string[];
  createdAt: string;
}

export default function TutorialDetailPage({ params }: { params: { slug: string } }) {
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTutorial();
  }, [params.slug]);

  const fetchTutorial = async () => {
    try {
      const response = await fetch(`/api/tutorials/${params.slug}`);
      const data = await response.json();
      setTutorial(data);
    } catch (error) {
      console.error('Error fetching tutorial:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading tutorial...</p>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Tutorial not found</p>
          <Link href="/tutorials">
            <Button>Back to Tutorials</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/tutorials" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Tutorials
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Title and Meta */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge className={`
              ${tutorial.difficulty === 'BEGINNER' ? 'bg-green-500' : ''}
              ${tutorial.difficulty === 'INTERMEDIATE' ? 'bg-yellow-500' : ''}
              ${tutorial.difficulty === 'ADVANCED' ? 'bg-red-500' : ''}
              text-white
            `}>
              {tutorial.difficulty}
            </Badge>
            <Badge variant="outline">{tutorial.category}</Badge>
          </div>
          <h1 className="text-4xl font-bold mb-4">{tutorial.title}</h1>
          <p className="text-xl text-muted-foreground mb-4">{tutorial.description}</p>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {tutorial.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {tutorial.duration} minutes
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {tutorial.views.toLocaleString()} views
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              {tutorial.likes} likes
            </span>
          </div>
        </div>

        {/* YouTube Video */}
        {tutorial.youtubeVideoId && (
          <Card className="mb-8">
            <CardContent className="p-0">
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${tutorial.youtubeVideoId}`}
                  title={tutorial.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Affiliate Links Section */}
        {tutorial.affiliateLinks && tutorial.affiliateLinks.length > 0 && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                Special Offers & Deals
              </h2>
              <div className="space-y-3">
                {tutorial.affiliateLinks.map((link, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-background">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{link.name}</h3>
                        {link.description && (
                          <p className="text-sm text-muted-foreground mb-2">{link.description}</p>
                        )}
                        {link.discount && (
                          <Badge className="bg-green-500 text-white">{link.discount}</Badge>
                        )}
                      </div>
                      <Button
                        onClick={() => window.open(link.url, '_blank')}
                        className="flex-shrink-0"
                      >
                        Get Deal
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * These are affiliate links. We may earn a commission at no extra cost to you.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tutorial Content */}
        <Card className="mb-8">
          <CardContent className="p-6 prose prose-slate dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: tutorial.content.replace(/\n/g, '<br />') }} />
          </CardContent>
        </Card>

        {/* Tags */}
        {tutorial.tags && tutorial.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {tutorial.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
