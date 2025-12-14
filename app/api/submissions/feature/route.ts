import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      title,
      description,
      category,
      useCase,
      priority,
      email,
    } = data;

    // Create feature request
    const featureRequest = await prisma.featureRequest.create({
      data: {
        title,
        description,
        category,
        useCase: useCase || null,
        priority: priority.toUpperCase(),
        email: email || null,
        status: 'PENDING',
        votes: 0,
      },
    });

    // TODO: Send email notification to admin and submitter

    return NextResponse.json({
      success: true,
      message: 'Feature request submitted successfully',
      requestId: featureRequest.id,
    });
  } catch (error) {
    console.error('Error submitting feature request:', error);
    return NextResponse.json(
      { error: 'Failed to submit feature request' },
      { status: 500 }
    );
  }
}
