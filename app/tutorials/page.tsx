'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Search, Play, Clock, TrendingUp, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/header';

interface Tutorial {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  youtubeVideoId?: string;
  duration?: number;
  views: number;
  likes: number;
  isFeatured: boolean;
  thumbnailUrl?: string;
  tags: string[];
  createdAt: string;
}

interface VideoClip {
  id: string;
  title: string;
  youtubeVideoId: string;
  description?: string;
  duration?: number;
  thumbnailUrl?: string;
  impressions: number;
  clicks: number;
  isSponsored: boolean;
  tool: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    websiteUrl: string;
    category: string;
  };
}

type ContentItem = (Tutorial | VideoClip) & { type: 'tutorial' | 'videoClip' };

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [videoClips, setVideoClips] = useState<VideoClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [tutorialsRes, videoClipsRes] = await Promise.all([
        fetch('/api/tutorials'),
        fetch('/api/video-clips?featured=true'),
      ]);
      const tutorialsData = await tutorialsRes.json();
      const videoClipsData = await videoClipsRes.json();
      setTutorials(tutorialsData);
      setVideoClips(videoClipsData);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tutorials
  const filteredTutorials = tutorials.filter((tutorial) => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter video clips
  const filteredVideoClips = videoClips.filter((clip) => {
    const matchesSearch = clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (clip.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                         clip.tool.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || clip.tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Combine and tag content
  const allContent: ContentItem[] = [
    ...filteredTutorials.map(t => ({ ...t, type: 'tutorial' as const })),
    ...filteredVideoClips.map(v => ({ ...v, type: 'videoClip' as const })),
  ];

  const featuredContent = allContent.filter(item =>
    item.type === 'tutorial' ? (item as Tutorial).isFeatured : true
  );
  const regularContent = allContent.filter(item =>
    item.type === 'tutorial' ? !(item as Tutorial).isFeatured : false
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-500';
      case 'INTERMEDIATE': return 'bg-yellow-500';
      case 'ADVANCED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading tutorials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Learn AI Tools & Techniques
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            Master AI tools with step-by-step video tutorials
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-md bg-background"
          >
            <option value="all">All Categories</option>
            <option value="Getting Started">Getting Started</option>
            <option value="Image Generation">Image Generation</option>
            <option value="Content Writing">Content Writing</option>
            <option value="Code Assistant">Code Assistant</option>
            <option value="Productivity">Productivity</option>
          </select>
        </div>

        {/* Featured Content */}
        {featuredContent.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-2xl font-bold">Featured Content</h3>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {featuredContent.map((item) => (
                item.type === 'tutorial' ? (
                  <TutorialCard key={item.id} tutorial={item as Tutorial} getDifficultyColor={getDifficultyColor} />
                ) : (
                  <VideoClipCard key={item.id} videoClip={item as VideoClip} />
                )
              ))}
            </div>
          </div>
        )}

        {/* All Tutorials */}
        <div>
          <h3 className="text-2xl font-bold mb-4">All Tutorials</h3>
          {regularContent.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No tutorials found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {regularContent.map((item) => (
                item.type === 'tutorial' ? (
                  <TutorialCard key={item.id} tutorial={item as Tutorial} getDifficultyColor={getDifficultyColor} />
                ) : (
                  <VideoClipCard key={item.id} videoClip={item as VideoClip} />
                )
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function TutorialCard({ tutorial, getDifficultyColor }: { tutorial: Tutorial; getDifficultyColor: (d: string) => string }) {
  return (
    <Link href={`/tutorials/${tutorial.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="p-0">
          {tutorial.youtubeVideoId ? (
            <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
              <img
                src={tutorial.thumbnailUrl || `https://img.youtube.com/vi/${tutorial.youtubeVideoId}/maxresdefault.jpg`}
                alt={tutorial.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors">
                <Play className="h-6 w-6 text-white" />
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-t-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          )}
        </CardHeader>
        <CardContent className="p-2">
          <div className="flex items-center gap-1 mb-1.5">
            <Badge className={`${getDifficultyColor(tutorial.difficulty)} text-white text-[10px] px-1.5 py-0.5`}>
              {tutorial.difficulty.slice(0, 3)}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">{tutorial.category}</Badge>
          </div>
          <h3 className="text-sm font-semibold mb-1 line-clamp-2">{tutorial.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{tutorial.description}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {tutorial.duration && (
                <span className="flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {tutorial.duration}m
                </span>
              )}
              <span className="text-[10px]">{tutorial.views.toLocaleString()} views</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function VideoClipCard({ videoClip }: { videoClip: VideoClip }) {
  const trackClick = async () => {
    try {
      await fetch('/api/video-clicks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoClipId: videoClip.id,
          converted: true,
        }),
      });
    } catch (error) {
      console.error('Error tracking video click:', error);
    }
  };

  return (
    <a
      href={videoClip.tool.websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={trackClick}
    >
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer relative">
        {videoClip.isSponsored && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-yellow-500 text-white text-[10px] px-1.5 py-0.5">
              Sponsored
            </Badge>
          </div>
        )}
        <CardHeader className="p-0">
          <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
            <img
              src={videoClip.thumbnailUrl || `https://img.youtube.com/vi/${videoClip.youtubeVideoId}/maxresdefault.jpg`}
              alt={videoClip.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors">
              <Play className="h-6 w-6 text-white" />
            </div>
            {videoClip.tool.logoUrl && (
              <div className="absolute bottom-2 left-2">
                <img
                  src={videoClip.tool.logoUrl}
                  alt={videoClip.tool.name}
                  className="h-6 w-6 rounded bg-white/90 p-0.5"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <div className="flex items-center gap-1 mb-1.5">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">{videoClip.tool.category}</Badge>
          </div>
          <h3 className="text-sm font-semibold mb-1 line-clamp-2">{videoClip.title}</h3>
          <p className="text-xs text-muted-foreground mb-2">{videoClip.tool.name}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {videoClip.duration && (
                <span className="flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {Math.floor(videoClip.duration / 60)}m
                </span>
              )}
              <span className="text-[10px]">{videoClip.impressions.toLocaleString()} views</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
