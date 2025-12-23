'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingUp,
  MousePointerClick,
  Eye,
  BarChart3,
  Calendar,
} from 'lucide-react';

interface Analytics {
  overview: {
    totalRevenue: number;
    affiliateRevenue: number;
    videoRevenue: number;
    totalClicks: number;
    totalConversions: number;
    overallConversionRate: number;
  };
  affiliateStats: {
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    conversionRate: number;
  };
  videoStats: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
  };
  topTutorials: Array<{
    id: string;
    title: string;
    category: string;
    views: number;
    likes: number;
    clicks: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  }>;
  topPrograms: Array<{
    id: string;
    name: string;
    provider: string;
    clicks: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    commissionRate: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    affiliateRevenue: number;
    videoRevenue: number;
    totalRevenue: number;
  }>;
  period: number;
}

export default function RevenueAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/monetization/analytics?period=${period}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return value.toFixed(2) + '%';
  };

  if (loading || !analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Revenue Analytics & Performance
        </h3>
        <div className="flex gap-2">
          <Button
            variant={period === '7' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('7')}
          >
            7 Days
          </Button>
          <Button
            variant={period === '30' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('30')}
          >
            30 Days
          </Button>
          <Button
            variant={period === '90' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('90')}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">
              {formatCurrency(analytics.overview.totalRevenue)}
            </p>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <div>Affiliate: {formatCurrency(analytics.overview.affiliateRevenue)}</div>
              <div>Video: {formatCurrency(analytics.overview.videoRevenue)}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" />
              Total Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
              {analytics.overview.totalConversions}
            </p>
            <div className="text-xs text-muted-foreground mt-2">
              {analytics.overview.totalClicks} total clicks
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
              {formatPercent(analytics.overview.overallConversionRate)}
            </p>
            <div className="text-xs text-muted-foreground mt-2">
              Last {period} days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Tabs defaultValue="tutorials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tutorials">Top Tutorials</TabsTrigger>
          <TabsTrigger value="programs">Affiliate Programs</TabsTrigger>
          <TabsTrigger value="daily">Daily Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="tutorials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Performing Tutorials</CardTitle>
              <CardDescription>Ranked by revenue generated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topTutorials.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tutorial data available for this period
                  </p>
                ) : (
                  analytics.topTutorials.map((tutorial, index) => (
                    <div
                      key={tutorial.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <div>
                            <h4 className="font-semibold text-sm">{tutorial.title}</h4>
                            <p className="text-xs text-muted-foreground">{tutorial.category}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Views</p>
                          <p className="font-semibold">{tutorial.views}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Clicks</p>
                          <p className="font-semibold">{tutorial.clicks}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Conv.</p>
                          <p className="font-semibold">{tutorial.conversions}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Rate</p>
                          <p className="font-semibold">{formatPercent(tutorial.conversionRate)}</p>
                        </div>
                        <div className="text-center min-w-[80px]">
                          <p className="text-muted-foreground text-xs">Revenue</p>
                          <p className="font-bold text-green-600">
                            {formatCurrency(tutorial.revenue)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Affiliate Program Performance</CardTitle>
              <CardDescription>Ranked by total revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPrograms.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No affiliate program data available
                  </p>
                ) : (
                  analytics.topPrograms.map((program, index) => (
                    <div
                      key={program.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <div>
                            <h4 className="font-semibold text-sm">{program.name}</h4>
                            <p className="text-xs text-muted-foreground">{program.provider}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Clicks</p>
                          <p className="font-semibold">{program.clicks}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Conv.</p>
                          <p className="font-semibold">{program.conversions}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Rate</p>
                          <p className="font-semibold">{formatPercent(program.conversionRate)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Comm.</p>
                          <p className="font-semibold">{program.commissionRate}%</p>
                        </div>
                        <div className="text-center min-w-[80px]">
                          <p className="text-muted-foreground text-xs">Revenue</p>
                          <p className="font-bold text-green-600">
                            {formatCurrency(program.revenue)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily Revenue Breakdown</CardTitle>
              <CardDescription>Revenue by day for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.dailyRevenue.map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Affiliate</p>
                        <p className="font-semibold text-blue-600">
                          {formatCurrency(day.affiliateRevenue)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Video</p>
                        <p className="font-semibold text-purple-600">
                          {formatCurrency(day.videoRevenue)}
                        </p>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-bold text-green-600">
                          {formatCurrency(day.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
