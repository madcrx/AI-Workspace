import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get counts for all major tables
    const [
      userCount,
      toolCount,
      tutorialCount,
      workspaceCount,
      reviewCount,
      affiliateProgramCount,
      videoClipCount,
      scraperLogCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.tool.count(),
      prisma.tutorial.count(),
      prisma.workspace.count(),
      prisma.review.count(),
      prisma.affiliateProgram.count(),
      prisma.videoClip.count(),
      prisma.scraperLog.count(),
    ]);

    // Expected minimum counts (from seed data)
    const expected = {
      users: 2, // admin + demo user
      tools: 50, // At least 50 tools from seed
      tutorials: 8, // 8 tutorials from seed
      affiliatePrograms: 5, // 5 affiliate programs from seed
    };

    // Check if reseed is needed
    const needsReseed =
      userCount < expected.users ||
      toolCount < expected.tools ||
      tutorialCount < expected.tutorials ||
      affiliateProgramCount < expected.affiliatePrograms;

    // Get database size (PostgreSQL specific)
    let databaseSize = 'N/A';
    try {
      const sizeResult = await prisma.$queryRaw<Array<{ size: string }>>`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `;
      databaseSize = sizeResult[0]?.size || 'N/A';
    } catch (error) {
      console.error('Error getting database size:', error);
    }

    // Get table sizes
    let tableSizes: any[] = [];
    try {
      tableSizes = await prisma.$queryRaw<
        Array<{ table: string; size: string; rows: number }>
      >`
        SELECT
          schemaname || '.' || tablename as table,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          n_live_tup as rows
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 20
      `;
    } catch (error) {
      console.error('Error getting table sizes:', error);
    }

    return NextResponse.json({
      counts: {
        users: userCount,
        tools: toolCount,
        tutorials: tutorialCount,
        workspaces: workspaceCount,
        reviews: reviewCount,
        affiliatePrograms: affiliateProgramCount,
        videoClips: videoClipCount,
        scraperLogs: scraperLogCount,
      },
      expected,
      needsReseed,
      databaseSize,
      tableSizes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching database status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database status' },
      { status: 500 }
    );
  }
}
