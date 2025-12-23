import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

// POST track an affiliate link click
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      affiliateProgramId,
      tutorialId,
      userId,
      clickedUrl,
      sessionId,
    } = body;

    if (!affiliateProgramId || !clickedUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get request metadata
    const headersList = headers();
    const ipAddress =
      headersList.get('x-forwarded-for')?.split(',')[0] ||
      headersList.get('x-real-ip') ||
      'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    const referrer = headersList.get('referer') || headersList.get('referrer');

    // Create affiliate click record
    const affiliateClick = await prisma.affiliateClick.create({
      data: {
        affiliateProgramId,
        tutorialId,
        userId,
        clickedUrl,
        sessionId,
        ipAddress,
        userAgent,
        referrer,
        metadata: JSON.stringify({
          timestamp: new Date().toISOString(),
          platform: userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        }),
      },
    });

    // Update affiliate program click count
    await prisma.affiliateProgram.update({
      where: { id: affiliateProgramId },
      data: {
        totalClicks: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      clickId: affiliateClick.id,
      redirectUrl: clickedUrl,
    });
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}

// PUT update a click with conversion data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { clickId, converted, conversionValue, earnedAmount } = body;

    if (!clickId) {
      return NextResponse.json(
        { error: 'Click ID is required' },
        { status: 400 }
      );
    }

    // Update the click record
    const updatedClick = await prisma.affiliateClick.update({
      where: { id: clickId },
      data: {
        converted: converted || false,
        conversionValue,
        earnedAmount: earnedAmount || 0,
        conversionDate: converted ? new Date() : null,
      },
      include: {
        affiliateProgram: true,
      },
    });

    // Update affiliate program totals if converted
    if (converted) {
      await prisma.affiliateProgram.update({
        where: { id: updatedClick.affiliateProgramId },
        data: {
          totalConversions: { increment: 1 },
          totalEarnings: { increment: earnedAmount || 0 },
        },
      });
    }

    return NextResponse.json({
      success: true,
      click: updatedClick,
    });
  } catch (error) {
    console.error('Error updating affiliate click:', error);
    return NextResponse.json(
      { error: 'Failed to update click' },
      { status: 500 }
    );
  }
}
