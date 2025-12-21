'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rss, Settings, ExternalLink } from 'lucide-react';

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
}

interface RSSWidgetProps {
  settings?: {
    feedUrl?: string;
  };
}

export function RSSWidget({ settings }: RSSWidgetProps) {
  const [items, setItems] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultFeed = settings?.feedUrl || 'AI News';

  useEffect(() => {
    // Mock RSS data - replace with real RSS parser in production
    const mockItems: RSSItem[] = [
      {
        title: 'Latest AI Developments in Machine Learning',
        link: 'https://example.com/1',
        pubDate: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        title: 'New GPT Model Released with Enhanced Capabilities',
        link: 'https://example.com/2',
        pubDate: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        title: 'AI Ethics Guidelines Updated for 2025',
        link: 'https://example.com/3',
        pubDate: new Date(Date.now() - 10800000).toISOString(),
      },
      {
        title: 'Breakthrough in Computer Vision Technology',
        link: 'https://example.com/4',
        pubDate: new Date(Date.now() - 14400000).toISOString(),
      },
    ];

    setItems(mockItems);
    setLoading(false);
  }, [defaultFeed]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="pt-4 pb-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading feed...</div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group hover:bg-muted p-2 rounded-sm transition-colors"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium group-hover:text-primary line-clamp-2">
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDate(item.pubDate)}
                    </div>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
