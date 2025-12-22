import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get all video clips with stats (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videoClips = await prisma.videoClip.findMany({
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            category: true,
          },
        },
        _count: {
          select: {
            videoClicks: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Calculate stats
    const stats = {
      totalClips: videoClips.length,
      activeClips: videoClips.filter((c: any) => c.isActive).length,
      sponsoredClips: videoClips.filter((c: any) => c.isSponsored).length,
      totalImpressions: videoClips.reduce((sum: number, c: any) => sum + c.impressions, 0),
      totalClicks: videoClips.reduce((sum: number, c: any) => sum + c.clicks, 0),
      totalConversions: videoClips.reduce((sum: number, c: any) => sum + c.conversions, 0),
      totalEarnings: videoClips.reduce((sum: number, c: any) => sum + c.totalEarnings, 0),
      averageCTR: videoClips.length > 0
        ? (videoClips.reduce((sum: number, c: any) => sum + c.clicks, 0) /
          videoClips.reduce((sum: number, c: any) => sum + c.impressions, 0) * 100).toFixed(2)
        : '0',
    };

    return NextResponse.json({
      videoClips,
      stats,
    });
  } catch (error) {
    console.error('Error fetching video clips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video clips' },
      { status: 500 }
    );
  }
}

// DELETE - Delete video clip (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Video clip ID required' },
        { status: 400 }
      );
    }

    await prisma.videoClip.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting video clip:', error);
    return NextResponse.json(
      { error: 'Failed to delete video clip' },
      { status: 500 }
    );
  }
}

// PATCH - Update video clip (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Video clip ID required' },
        { status: 400 }
      );
    }

    const videoClip = await prisma.videoClip.update({
      where: { id },
      data: updateData,
      include: {
        tool: true,
      },
    });

    return NextResponse.json(videoClip);
  } catch (error) {
    console.error('Error updating video clip:', error);
    return NextResponse.json(
      { error: 'Failed to update video clip' },
      { status: 500 }
    );
  }
}
