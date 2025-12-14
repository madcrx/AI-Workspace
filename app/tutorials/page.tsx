'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Search, Play, Clock, TrendingUp, ArrowLeft } from 'lucide-react';

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

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      const response = await fetch('/api/tutorials');
      const data = await response.json();
      setTutorials(data);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTutorials = tutorials.filter((tutorial) => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredTutorials = filteredTutorials.filter(t => t.isFeatured);
  const regularTutorials = filteredTutorials.filter(t => !t.isFeatured);

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
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">AI Workspace</span>
              </Link>
              <span className="text-muted-foreground">/</span>
              <h1 className="text-xl font-semibold">AI Tutorials</h1>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Learn AI Tools & Techniques
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            Master AI tools with step-by-step video tutorials and affiliate deals
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

        {/* Featured Tutorials */}
        {featuredTutorials.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-2xl font-bold">Featured Tutorials</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} getDifficultyColor={getDifficultyColor} />
              ))}
            </div>
          </div>
        )}

        {/* All Tutorials */}
        <div>
          <h3 className="text-2xl font-bold mb-4">All Tutorials</h3>
          {regularTutorials.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No tutorials found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularTutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} getDifficultyColor={getDifficultyColor} />
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
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                <Play className="h-12 w-12 text-white" />
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-t-lg flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`${getDifficultyColor(tutorial.difficulty)} text-white text-xs`}>
              {tutorial.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">{tutorial.category}</Badge>
          </div>
          <CardTitle className="mb-2 line-clamp-2">{tutorial.title}</CardTitle>
          <CardDescription className="line-clamp-2 mb-4">{tutorial.description}</CardDescription>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              {tutorial.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {tutorial.duration}min
                </span>
              )}
              <span>{tutorial.views.toLocaleString()} views</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
