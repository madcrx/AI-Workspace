import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Tutorials data
    const tutorials = [
      {
        title: 'ChatGPT Complete Beginner Guide 2024',
        slug: 'chatgpt-complete-beginner-guide',
        description: 'Learn how to use ChatGPT effectively for content creation, coding, and productivity. This comprehensive guide covers prompts, tips, and best practices.',
        content: '# ChatGPT Complete Guide\n\nLearn everything you need to know about ChatGPT...',
        category: 'Getting Started',
        difficulty: 'BEGINNER',
        youtubeVideoId: 'JTxsNm9IdYU',
        affiliateLinks: JSON.stringify([
          { name: 'ChatGPT Plus Subscription', url: 'https://chat.openai.com/auth/login?next=/c/new' },
        ]),
        toolsUsed: JSON.stringify([]),
        duration: 15,
        views: 12500,
        likes: 850,
        isPublished: true,
        isFeatured: true,
        tags: JSON.stringify(['ChatGPT', 'AI', 'Productivity', 'Writing']),
      },
      {
        title: 'Midjourney AI Art Tutorial - Create Stunning Images',
        slug: 'midjourney-ai-art-tutorial',
        description: 'Master Midjourney to create professional AI-generated artwork. Learn prompting techniques, parameters, and advanced features.',
        content: '# Midjourney AI Art Tutorial\n\nDiscover how to create stunning images with Midjourney...',
        category: 'Image Generation',
        difficulty: 'INTERMEDIATE',
        youtubeVideoId: 'cXJJ891uwVo',
        affiliateLinks: JSON.stringify([
          { name: 'Midjourney Subscription', url: 'https://www.midjourney.com/account/' },
        ]),
        toolsUsed: JSON.stringify([]),
        duration: 22,
        views: 18200,
        likes: 1240,
        isPublished: true,
        isFeatured: true,
        tags: JSON.stringify(['Midjourney', 'AI Art', 'Image Generation', 'Design']),
      },
      {
        title: 'GitHub Copilot - AI Coding Assistant Guide',
        slug: 'github-copilot-guide',
        description: 'Boost your coding productivity with GitHub Copilot. Learn how to write code faster with AI-powered suggestions and completions.',
        content: '# GitHub Copilot Guide\n\nTransform your coding workflow with AI assistance...',
        category: 'Code Assistant',
        difficulty: 'INTERMEDIATE',
        youtubeVideoId: '0rbRvNe98TI',
        affiliateLinks: JSON.stringify([
          { name: 'GitHub Copilot', url: 'https://github.com/features/copilot' },
        ]),
        toolsUsed: JSON.stringify([]),
        duration: 18,
        views: 9800,
        likes: 720,
        isPublished: true,
        isFeatured: true,
        tags: JSON.stringify(['GitHub Copilot', 'Coding', 'AI', 'Development']),
      },
      {
        title: 'DALL-E 3 Tutorial - AI Image Generation with ChatGPT',
        slug: 'dalle-3-tutorial',
        description: 'Create amazing images with DALL-E 3 integrated into ChatGPT. Learn prompting strategies for the best results.',
        content: '# DALL-E 3 Tutorial\n\nGenerate incredible images using DALL-E 3...',
        category: 'Image Generation',
        difficulty: 'BEGINNER',
        youtubeVideoId: 'SyqOVBDkHsM',
        affiliateLinks: JSON.stringify([
          { name: 'ChatGPT Plus (DALL-E 3 Access)', url: 'https://chat.openai.com/auth/login' },
        ]),
        toolsUsed: JSON.stringify([]),
        duration: 12,
        views: 15600,
        likes: 980,
        isPublished: true,
        isFeatured: false,
        tags: JSON.stringify(['DALL-E', 'Image Generation', 'AI Art', 'OpenAI']),
      },
      {
        title: 'Claude AI Tutorial - Best ChatGPT Alternative',
        slug: 'claude-ai-tutorial',
        description: 'Discover Claude by Anthropic, a powerful AI assistant for analysis, writing, and coding with longer context windows.',
        content: '# Claude AI Tutorial\n\nExplore Claude AI capabilities...',
        category: 'Getting Started',
        difficulty: 'BEGINNER',
        youtubeVideoId: '_-qAL7vRVMs',
        affiliateLinks: JSON.stringify([
          { name: 'Claude Pro Subscription', url: 'https://claude.ai/' },
        ]),
        toolsUsed: JSON.stringify([]),
        duration: 14,
        views: 8900,
        likes: 620,
        isPublished: true,
        isFeatured: false,
        tags: JSON.stringify(['Claude', 'AI', 'Writing', 'Coding']),
      },
      {
        title: 'AI Content Writing with Jasper - Complete Guide',
        slug: 'jasper-ai-content-writing',
        description: 'Master Jasper AI for creating high-quality marketing content, blog posts, and social media copy at scale.',
        content: '# Jasper AI Content Writing\n\nLearn to create compelling content with Jasper...',
        category: 'Content Writing',
        difficulty: 'INTERMEDIATE',
        youtubeVideoId: 'mT2PcrKQ9Ao',
        affiliateLinks: JSON.stringify([
          { name: 'Jasper AI Trial', url: 'https://www.jasper.ai/' },
        ]),
        toolsUsed: JSON.stringify([]),
        duration: 20,
        views: 11200,
        likes: 840,
        isPublished: true,
        isFeatured: false,
        tags: JSON.stringify(['Jasper', 'Content Writing', 'Marketing', 'Copywriting']),
      },
      {
        title: 'Runway ML Tutorial - AI Video Editing Revolution',
        slug: 'runway-ml-tutorial',
        description: 'Transform your video editing workflow with Runway ML. Learn AI-powered video effects, generation, and editing techniques.',
        content: '# Runway ML Tutorial\n\nRevolutionize video editing with AI tools...',
        category: 'Productivity',
        difficulty: 'ADVANCED',
        youtubeVideoId: 'aLdlcWoWw9U',
        affiliateLinks: JSON.stringify([
          { name: 'Runway ML Subscription', url: 'https://runwayml.com/' },
        ]),
        toolsUsed: JSON.stringify([]),
        duration: 25,
        views: 7300,
        likes: 550,
        isPublished: true,
        isFeatured: false,
        tags: JSON.stringify(['Runway', 'Video Editing', 'AI', 'Creative']),
      },
      {
        title: 'ElevenLabs Voice AI - Text to Speech Tutorial',
        slug: 'elevenlabs-voice-ai-tutorial',
        description: 'Create realistic AI voices with ElevenLabs. Perfect for content creators, audiobooks, and voice overs.',
        content: '# ElevenLabs Voice AI\n\nGenerate professional voice overs with AI...',
        category: 'Productivity',
        difficulty: 'BEGINNER',
        youtubeVideoId: 'b_VgVStTVPE',
        affiliateLinks: JSON.stringify([
          { name: 'ElevenLabs Subscription', url: 'https://elevenlabs.io/' },
        ]),
        toolsUsed: JSON.stringify([]),
        duration: 16,
        views: 13400,
        likes: 920,
        isPublished: true,
        isFeatured: true,
        tags: JSON.stringify(['ElevenLabs', 'Voice AI', 'Text-to-Speech', 'Audio']),
      },
    ];

    // Check if tutorials already exist
    const existingCount = await prisma.tutorial.count();

    if (existingCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Database already has ${existingCount} tutorials. Clear them first if you want to reseed.`,
        existingCount,
      });
    }

    // Create tutorials
    let created = 0;
    for (const tutorial of tutorials) {
      try {
        await prisma.tutorial.create({
          data: tutorial,
        });
        created++;
      } catch (error) {
        console.error(`Error creating tutorial: ${tutorial.title}`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${created} tutorials`,
      tutorialsCreated: created,
      totalAttempted: tutorials.length,
    });
  } catch (error) {
    console.error('Error seeding tutorials:', error);
    return NextResponse.json(
      { error: 'Failed to seed tutorials', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
