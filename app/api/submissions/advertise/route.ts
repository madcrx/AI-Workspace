import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      companyName,
      contactName,
      email,
      phone,
      website,
      advertisingType,
      budget,
      duration,
      targetAudience,
      message,
    } = data;

    // Create advertising request
    const advertisingRequest = await prisma.advertisingRequest.create({
      data: {
        companyName,
        contactName,
        email,
        phone: phone || null,
        website: website || null,
        advertisingType,
        budget,
        duration,
        targetAudience: targetAudience || null,
        message,
        status: 'PENDING',
      },
    });

    // TODO: Send email notification to admin and submitter

    return NextResponse.json({
      success: true,
      message: 'Advertising inquiry submitted successfully',
      requestId: advertisingRequest.id,
    });
  } catch (error) {
    console.error('Error submitting advertising inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to submit advertising inquiry' },
      { status: 500 }
    );
  }
}
