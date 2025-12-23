import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔧 Optimizing database...');

    // Run VACUUM ANALYZE on PostgreSQL
    try {
      await prisma.$executeRawUnsafe('VACUUM ANALYZE');
      console.log('✅ VACUUM ANALYZE completed');
    } catch (error) {
      console.error('Error running VACUUM:', error);
    }

    // Reindex tables
    try {
      await prisma.$executeRawUnsafe('REINDEX DATABASE CONCURRENTLY');
      console.log('✅ REINDEX completed');
    } catch (error) {
      console.error('Error running REINDEX:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Database optimized successfully',
    });
  } catch (error: any) {
    console.error('Error optimizing database:', error);
    return NextResponse.json(
      { error: 'Failed to optimize database', message: error.message },
      { status: 500 }
    );
  }
}
