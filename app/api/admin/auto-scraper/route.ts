import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AutoScraper } from '@/lib/auto-scraper';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Manual auto-scraper triggered by admin');

    const scraper = new AutoScraper();
    const results = await scraper.scrapeAll('MANUAL');

    const summary = {
      totalSources: results.length,
      totalFound: results.reduce((sum, r) => sum + r.toolsFound, 0),
      totalAdded: results.reduce((sum, r) => sum + r.toolsAdded, 0),
      totalUpdated: results.reduce((sum, r) => sum + r.toolsUpdated, 0),
      totalSkipped: results.reduce((sum, r) => sum + r.toolsSkipped, 0),
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      results,
    };

    console.log('✅ Auto-scraper completed:', summary);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error running auto-scraper:', error);
    return NextResponse.json(
      { error: 'Failed to run auto-scraper' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve scraper logs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const logs = await prisma?.scraperLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching scraper logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
