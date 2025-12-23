import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET monetization analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get affiliate program stats
    const affiliatePrograms = await prisma.affiliateProgram.findMany({
      where: { isActive: true },
      include: {
        affiliateClicks: {
          where: {
            createdAt: {
              gte: startDate,
            },
          },
        },
      },
    });

    // Get video clip stats
    const videoClips = await prisma.videoClip.findMany({
      where: { isActive: true },
      include: {
        tool: {
          select: {
            name: true,
            category: true,
          },
        },
        videoClicks: {
          where: {
            createdAt: {
              gte: startDate,
            },
          },
        },
      },
    });

    // Get tutorial stats
    const tutorials = await prisma.tutorial.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        category: true,
        views: true,
        likes: true,
        affiliateLinks: true,
      },
    });

    // Calculate affiliate revenue
    const affiliateClicks = await prisma.affiliateClick.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    const affiliateStats = {
      totalClicks: affiliateClicks.length,
      totalConversions: affiliateClicks.filter((c) => c.converted).length,
      totalRevenue: affiliateClicks.reduce((sum, c) => sum + c.earnedAmount, 0),
      conversionRate:
        affiliateClicks.length > 0
          ? (affiliateClicks.filter((c) => c.converted).length /
              affiliateClicks.length) *
            100
          : 0,
    };

    // Calculate video revenue
    const videoClicks = await prisma.videoClick.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    const videoStats = {
      totalImpressions: videoClips.reduce((sum, v) => sum + v.impressions, 0),
      totalClicks: videoClicks.length,
      totalConversions: videoClicks.filter((c) => c.converted).length,
      totalRevenue: videoClicks.reduce((sum, c) => sum + c.earnedAmount, 0),
    };

    // Get top performing tutorials
    const tutorialsWithClicks = await Promise.all(
      tutorials.map(async (tutorial) => {
        const clicks = await prisma.affiliateClick.count({
          where: {
            tutorialId: tutorial.id,
            createdAt: {
              gte: startDate,
            },
          },
        });

        const conversions = await prisma.affiliateClick.count({
          where: {
            tutorialId: tutorial.id,
            converted: true,
            createdAt: {
              gte: startDate,
            },
          },
        });

        const revenue = await prisma.affiliateClick
          .aggregate({
            where: {
              tutorialId: tutorial.id,
              createdAt: {
                gte: startDate,
              },
            },
            _sum: {
              earnedAmount: true,
            },
          })
          .then((result) => result._sum.earnedAmount || 0);

        return {
          id: tutorial.id,
          title: tutorial.title,
          category: tutorial.category,
          views: tutorial.views,
          likes: tutorial.likes,
          clicks,
          conversions,
          revenue,
          conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
        };
      })
    );

    // Sort by revenue
    tutorialsWithClicks.sort((a, b) => b.revenue - a.revenue);

    // Get top performing affiliate programs
    const programsWithStats = affiliatePrograms.map((program) => ({
      id: program.id,
      name: program.name,
      provider: program.provider,
      clicks: program.totalClicks,
      conversions: program.totalConversions,
      revenue: program.totalEarnings,
      conversionRate:
        program.totalClicks > 0
          ? (program.totalConversions / program.totalClicks) * 100
          : 0,
      commissionRate: program.commissionRate,
    }));

    programsWithStats.sort((a, b) => b.revenue - a.revenue);

    // Calculate daily revenue for chart
    const dailyRevenue = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const affiliateRev = await prisma.affiliateClick
        .aggregate({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
          _sum: {
            earnedAmount: true,
          },
        })
        .then((result) => result._sum.earnedAmount || 0);

      const videoRev = await prisma.videoClick
        .aggregate({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
          _sum: {
            earnedAmount: true,
          },
        })
        .then((result) => result._sum.earnedAmount || 0);

      dailyRevenue.push({
        date: date.toISOString().split('T')[0],
        affiliateRevenue: affiliateRev,
        videoRevenue: videoRev,
        totalRevenue: affiliateRev + videoRev,
      });
    }

    return NextResponse.json({
      overview: {
        totalRevenue: affiliateStats.totalRevenue + videoStats.totalRevenue,
        affiliateRevenue: affiliateStats.totalRevenue,
        videoRevenue: videoStats.totalRevenue,
        totalClicks: affiliateStats.totalClicks + videoStats.totalClicks,
        totalConversions:
          affiliateStats.totalConversions + videoStats.totalConversions,
        overallConversionRate:
          affiliateStats.totalClicks + videoStats.totalClicks > 0
            ? ((affiliateStats.totalConversions + videoStats.totalConversions) /
                (affiliateStats.totalClicks + videoStats.totalClicks)) *
              100
            : 0,
      },
      affiliateStats,
      videoStats,
      topTutorials: tutorialsWithClicks.slice(0, 10),
      topPrograms: programsWithStats.slice(0, 10),
      dailyRevenue,
      period: days,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
