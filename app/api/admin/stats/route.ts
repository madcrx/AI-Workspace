import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalUsers,
      totalTools,
      activeTools,
      totalWorkspaces,
      totalViews,
      totalClicks,
      totalTutorials,
      tutorials,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.tool.count(),
      prisma.tool.count({ where: { isActive: true } }),
      prisma.workspace.count(),
      prisma.tool.aggregate({ _sum: { views: true } }),
      prisma.tool.aggregate({ _sum: { clicks: true } }),
      prisma.tutorial.count(),
      prisma.tutorial.findMany({ select: { affiliateLinks: true } }),
    ]);

    // Count total affiliate links across all tutorials
    const totalAffiliateLinks = tutorials.reduce(
      (acc: number, tutorial: any) => acc + (tutorial.affiliateLinks?.length || 0),
      0
    );

    const stats = {
      totalUsers,
      totalTools,
      activeTools,
      pendingSubmissions: 0, // Tool submissions feature removed
      totalWorkspaces,
      totalViews: totalViews._sum.views || 0,
      totalClicks: totalClicks._sum.clicks || 0,
      totalTutorials,
      totalAffiliateLinks,
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
