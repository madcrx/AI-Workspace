import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// In-memory storage for scraping progress
let scrapingProgress = {
  isRunning: false,
  total: 0,
  current: 0,
  status: '',
  results: null as any,
};

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(scrapingProgress);
  } catch (error) {
    console.error('Error fetching scraper progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export function updateProgress(total: number, current: number, status: string) {
  scrapingProgress = {
    isRunning: true,
    total,
    current,
    status,
    results: null,
  };
}

export function completeProgress(results: any) {
  scrapingProgress = {
    isRunning: false,
    total: 0,
    current: 0,
    status: 'Completed',
    results,
  };
}

export function resetProgress() {
  scrapingProgress = {
    isRunning: false,
    total: 0,
    current: 0,
    status: '',
    results: null,
  };
}
