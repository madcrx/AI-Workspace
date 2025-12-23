import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clearedCaches: string[] = [];

    // Clear Next.js cache
    try {
      revalidatePath('/');
      revalidatePath('/tools');
      revalidatePath('/tutorials');
      revalidatePath('/workspace');
      clearedCaches.push('Next.js Route Cache');
    } catch (error) {
      console.error('Error clearing Next.js cache:', error);
    }

    // Clear .next cache directory (if running locally)
    try {
      if (process.env.NODE_ENV === 'development') {
        await execAsync('rm -rf .next/cache');
        clearedCaches.push('.next/cache directory');
      }
    } catch (error) {
      console.error('Error clearing .next cache:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Caches cleared successfully',
      clearedCaches,
    });
  } catch (error: any) {
    console.error('Error clearing caches:', error);
    return NextResponse.json(
      { error: 'Failed to clear caches', message: error.message },
      { status: 500 }
    );
  }
}
