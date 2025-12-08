import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const submissionSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(10),
  websiteUrl: z.string().url(),
  category: z.string().min(1),
  pricing: z.enum(['FREE', 'FREEMIUM', 'PAID', 'SUBSCRIPTION']),
  features: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  pricingDetails: z.string().optional(),
  longDescription: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = submissionSchema.parse(body);

    const submission = await prisma.toolSubmission.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        description: validatedData.description,
        websiteUrl: validatedData.websiteUrl,
        category: validatedData.category,
        pricing: validatedData.pricing,
        submissionData: JSON.stringify(validatedData),
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit tool' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const submissions = await prisma.toolSubmission.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
