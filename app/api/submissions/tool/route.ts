import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      name,
      websiteUrl,
      loginUrl,
      description,
      longDescription,
      category,
      pricing,
      features,
      tags,
      contactEmail,
      logoUrl,
    } = data;

    // Create slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check for duplicates
    const existing = await prisma.tool.findFirst({
      where: {
        OR: [
          { slug },
          { websiteUrl },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Tool already exists in database' },
        { status: 409 }
      );
    }

    // Parse features and tags
    const featuresArray = features
      ? features.split('\n').filter((f: string) => f.trim())
      : [];
    const tagsArray = tags
      ? tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
      : [];

    // Create tool with pending status
    const tool = await prisma.tool.create({
      data: {
        name,
        slug,
        description,
        longDescription: longDescription || null,
        category,
        websiteUrl,
        loginUrl: loginUrl || null,
        logoUrl: logoUrl || null,
        pricing: pricing.toUpperCase(),
        features: featuresArray.length > 0 ? JSON.stringify(featuresArray) : null,
        tags: tagsArray.length > 0 ? JSON.stringify(tagsArray) : null,
        isActive: false, // Pending admin approval
        isFeatured: false,
        scrapedData: JSON.stringify({
          source: 'User Submission',
          submittedAt: new Date().toISOString(),
          contactEmail,
        }),
      },
    });

    // TODO: Send email notification to admin and submitter

    return NextResponse.json({
      success: true,
      message: 'Tool submitted successfully',
      toolId: tool.id,
    });
  } catch (error) {
    console.error('Error submitting tool:', error);
    return NextResponse.json(
      { error: 'Failed to submit tool' },
      { status: 500 }
    );
  }
}
