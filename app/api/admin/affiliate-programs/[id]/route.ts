import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH update an affiliate program
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = params;

    // Prepare update data
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.provider !== undefined) updateData.provider = body.provider;
    if (body.affiliateNetwork !== undefined) updateData.affiliateNetwork = body.affiliateNetwork;
    if (body.commissionType !== undefined) updateData.commissionType = body.commissionType;
    if (body.commissionRate !== undefined) updateData.commissionRate = parseFloat(body.commissionRate);
    if (body.costPerClick !== undefined) updateData.costPerClick = parseFloat(body.costPerClick);
    if (body.cookieDuration !== undefined) updateData.cookieDuration = body.cookieDuration ? parseInt(body.cookieDuration) : null;
    if (body.affiliateId !== undefined) updateData.affiliateId = body.affiliateId;
    if (body.apiKey !== undefined) updateData.apiKey = body.apiKey;
    if (body.trackingUrl !== undefined) updateData.trackingUrl = body.trackingUrl;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.minimumPayout !== undefined) updateData.minimumPayout = body.minimumPayout ? parseFloat(body.minimumPayout) : null;
    if (body.paymentSchedule !== undefined) updateData.paymentSchedule = body.paymentSchedule;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const program = await prisma.affiliateProgram.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error('Error updating affiliate program:', error);
    return NextResponse.json(
      { error: 'Failed to update program' },
      { status: 500 }
    );
  }
}

// DELETE an affiliate program
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.affiliateProgram.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Program deleted' });
  } catch (error) {
    console.error('Error deleting affiliate program:', error);
    return NextResponse.json(
      { error: 'Failed to delete program' },
      { status: 500 }
    );
  }
}
