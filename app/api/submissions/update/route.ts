import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      toolId,
      toolName,
      updateType,
      currentValue,
      newValue,
      reason,
      contactEmail,
    } = data;

    // Verify tool exists
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
    });

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Create update request
    const updateRequest = await prisma.toolUpdateRequest.create({
      data: {
        toolId,
        updateType,
        currentValue: currentValue || null,
        newValue,
        reason,
        email: contactEmail || null,
        status: 'PENDING',
      },
    });

    // TODO: Send email notification to admin and submitter

    return NextResponse.json({
      success: true,
      message: 'Update request submitted successfully',
      requestId: updateRequest.id,
    });
  } catch (error) {
    console.error('Error submitting update request:', error);
    return NextResponse.json(
      { error: 'Failed to submit update request' },
      { status: 500 }
    );
  }
}
