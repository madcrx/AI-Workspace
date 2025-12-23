import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Track video click/interaction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const {
      videoClipId,
      watched,
      converted,
      watchDuration,
    } = body;

    if (!videoClipId) {
      return NextResponse.json(
        { error: 'Video clip ID required' },
        { status: 400 }
      );
    }

    // Get video clip to calculate earnings
    const videoClip = await prisma.videoClip.findUnique({
      where: { id: videoClipId },
    });

    if (!videoClip) {
      return NextResponse.json(
        { error: 'Video clip not found' },
        { status: 404 }
      );
    }

    // Get request headers for tracking
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrer = request.headers.get('referer') || null;

    // Calculate earnings based on action
    let earnedAmount = 0;
    if (converted && videoClip.costPerClick > 0) {
      earnedAmount = videoClip.costPerClick;
    }

    // Create click record
    const videoClick = await prisma.videoClick.create({
      data: {
        videoClipId,
        userId: session?.user?.id || null,
        ipAddress,
        userAgent,
        referrer,
        watched: watched || false,
        converted: converted || false,
        watchDuration: watchDuration || null,
        earnedAmount,
      },
    });

    // Update video clip stats
    const updateData: any = {
      clicks: { increment: 1 },
    };

    if (converted) {
      updateData.conversions = { increment: 1 };
    }

    if (earnedAmount > 0) {
      updateData.totalEarnings = { increment: earnedAmount };
    }

    await prisma.videoClip.update({
      where: { id: videoClipId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      earnedAmount,
      videoClick,
    });
  } catch (error) {
    console.error('Error tracking video click:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}
