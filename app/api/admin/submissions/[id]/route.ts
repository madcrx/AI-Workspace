import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status, reviewNotes } = body;

    const submission = await prisma.toolSubmission.findUnique({
      where: { id: params.id },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    if (status === 'APPROVED') {
      const submissionData = JSON.parse(submission.submissionData);

      const tool = await prisma.tool.create({
        data: {
          name: submission.name,
          slug: slugify(submission.name),
          description: submission.description,
          longDescription: submissionData.longDescription || null,
          category: submission.category,
          websiteUrl: submission.websiteUrl,
          pricing: submission.pricing,
          pricingDetails: submissionData.pricingDetails || null,
          features: JSON.stringify(submissionData.features || []),
          tags: JSON.stringify(submissionData.tags || []),
          isActive: true,
        },
      });

      await prisma.toolSubmission.update({
        where: { id: params.id },
        data: {
          status,
          reviewNotes,
          reviewedAt: new Date(),
          toolId: tool.id,
        },
      });
    } else {
      await prisma.toolSubmission.update({
        where: { id: params.id },
        data: {
          status,
          reviewNotes,
          reviewedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}
