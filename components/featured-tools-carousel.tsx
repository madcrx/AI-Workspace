'use client';

import { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ExternalLink, Star } from 'lucide-react';
import Link from 'next/link';

interface FeaturedTool {
  id: string;
  name: string;
  description: string;
  category: string;
  websiteUrl: string;
  logoUrl: string | null;
  pricing: string;
  rating: number;
}

export function FeaturedToolsCarousel() {
  const [tools, setTools] = useState<FeaturedTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
  });

  useEffect(() => {
    fetchFeaturedTools();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(autoplay);
  }, [emblaApi]);

  const fetchFeaturedTools = async () => {
    try {
      const response = await fetch('/api/tools/featured');
      const data = await response.json();
      setTools(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching featured tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'FREE':
        return 'bg-green-500';
      case 'FREEMIUM':
        return 'bg-blue-500';
      case 'PAID':
      case 'SUBSCRIPTION':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading featured tools...</p>
      </div>
    );
  }

  if (tools.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="flex-none w-full md:w-1/2 lg:w-1/3 min-w-0"
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {tool.logoUrl && (
                        <img
                          src={tool.logoUrl}
                          alt={tool.name}
                          className="h-12 w-12 rounded object-contain flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <CardTitle className="text-lg truncate">{tool.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {tool.category}
                          </Badge>
                          <Badge className={`text-xs text-white ${getPricingColor(tool.pricing)}`}>
                            {tool.pricing}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-3 mb-4">
                    {tool.description}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {tool.rating > 0 ? tool.rating.toFixed(1) : 'New'}
                      </span>
                    </div>
                    <a
                      href={tool.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Visit
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {tools.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={scrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
