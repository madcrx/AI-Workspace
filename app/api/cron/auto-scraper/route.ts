import { NextRequest, NextResponse } from 'next/server';
import { AutoScraper } from '@/lib/auto-scraper';

/**
 * Cron job endpoint for automated scraping
 * This can be triggered by Vercel Cron Jobs or external cron services
 *
 * To set up in Vercel, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/auto-scraper",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🕐 Cron job triggered: Auto-Scraper');

    const scraper = new AutoScraper();
    const results = await scraper.scrapeAll('CRON');

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      totalSources: results.length,
      totalFound: results.reduce((sum, r) => sum + r.toolsFound, 0),
      totalAdded: results.reduce((sum, r) => sum + r.toolsAdded, 0),
      totalUpdated: results.reduce((sum, r) => sum + r.toolsUpdated, 0),
      results,
    };

    console.log('✅ Cron job completed:', summary);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('❌ Cron job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
