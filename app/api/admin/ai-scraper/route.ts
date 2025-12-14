import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { scrapeAITools } from '@/lib/ai-tool-scraper';

let scrapingProgress = {
  isRunning: false,
  total: 0,
  current: 0,
  status: '',
  results: null as any,
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (scrapingProgress.isRunning) {
      return NextResponse.json(
        { error: 'Scraping already in progress' },
        { status: 409 }
      );
    }

    // Start scraping in background
    (async () => {
      scrapingProgress.isRunning = true;

      const result = await scrapeAITools((total, current, status) => {
        scrapingProgress = {
          isRunning: true,
          total,
          current,
          status,
          results: null,
        };
      });

      scrapingProgress = {
        isRunning: false,
        total: 0,
        current: 0,
        status: 'Completed',
        results: result,
      };
    })();

    return NextResponse.json({
      message: 'AI tool scraping started',
      status: 'running',
    });
  } catch (error) {
    console.error('Error starting AI scraper:', error);
    return NextResponse.json(
      { error: 'Failed to start scraper' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(scrapingProgress);
  } catch (error) {
    console.error('Error fetching scraper status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
