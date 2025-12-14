import { Metadata } from 'next';

export const siteConfig = {
  name: 'AI Workspace',
  description: 'Discover and manage 1000+ AI tools in your personalized workspace. Access the best AI assistants, image generators, code tools, and more.',
  url: 'https://aiworkspace.com',
  ogImage: 'https://aiworkspace.com/og-image.png',
  links: {
    twitter: 'https://twitter.com/aiworkspace',
    github: 'https://github.com/aiworkspace',
  },
};

export const defaultMetadata: Metadata = {
  title: {
    default: 'AI Workspace - Discover & Manage 1000+ AI Tools',
    template: '%s | AI Workspace',
  },
  description: siteConfig.description,
  keywords: [
    'AI tools',
    'artificial intelligence',
    'AI workspace',
    'AI assistants',
    'ChatGPT',
    'Midjourney',
    'AI image generator',
    'AI code tools',
    'machine learning',
    'productivity tools',
    'AI directory',
    'AI marketplace',
    'workspace management',
    'AI software',
    'automation tools',
  ],
  authors: [{ name: 'AI Workspace Team' }],
  creator: 'AI Workspace',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'AI Workspace - Discover & Manage 1000+ AI Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@aiworkspace',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export function generateToolMetadata(tool: {
  name: string;
  description: string;
  category: string;
  logoUrl?: string;
}): Metadata {
  return {
    title: `${tool.name} - ${tool.category} AI Tool`,
    description: `${tool.description.slice(0, 155)}...`,
    keywords: [
      tool.name,
      tool.category,
      'AI tool',
      'artificial intelligence',
      'workspace',
    ],
    openGraph: {
      title: `${tool.name} - ${tool.category} AI Tool`,
      description: tool.description,
      images: tool.logoUrl ? [{ url: tool.logoUrl }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} - ${tool.category} AI Tool`,
      description: tool.description,
      images: tool.logoUrl ? [tool.logoUrl] : [],
    },
  };
}
