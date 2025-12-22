import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get all active video clips (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement');
    const toolId = searchParams.get('toolId');
    const featured = searchParams.get('featured');

    const where: any = {
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: new Date() } },
      ],
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } },
          ],
        },
      ],
    };

    if (placement) {
      where.placement = placement;
    }

    if (toolId) {
      where.toolId = toolId;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    const videoClips = await prisma.videoClip.findMany({
      where,
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            websiteUrl: true,
            category: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { impressions: 'desc' },
      ],
      take: 20,
    });

    // Increment impressions for each clip
    await Promise.all(
      videoClips.map((clip: any) =>
        prisma.videoClip.update({
          where: { id: clip.id },
          data: { impressions: { increment: 1 } },
        })
      )
    );

    return NextResponse.json(videoClips);
  } catch (error) {
    console.error('Error fetching video clips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video clips' },
      { status: 500 }
    );
  }
}

// POST - Create video clip (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      youtubeVideoId,
      toolId,
      description,
      duration,
      isSponsored,
      sponsorAmount,
      costPerClick,
      placement,
      isFeatured,
      startDate,
      endDate,
    } = body;

    if (!title || !youtubeVideoId || !toolId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate thumbnail URL from YouTube
    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`;

    const videoClip = await prisma.videoClip.create({
      data: {
        title,
        youtubeVideoId,
        toolId,
        description,
        duration,
        thumbnailUrl,
        isSponsored: isSponsored || false,
        sponsorAmount: sponsorAmount || null,
        costPerClick: costPerClick || 0,
        placement: placement || 'SIDEBAR',
        isFeatured: isFeatured || false,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        tool: true,
      },
    });

    return NextResponse.json(videoClip);
  } catch (error) {
    console.error('Error creating video clip:', error);
    return NextResponse.json(
      { error: 'Failed to create video clip' },
      { status: 500 }
    );
  }
}
