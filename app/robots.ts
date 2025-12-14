import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/workspace/settings/', '/credentials/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/workspace/settings/', '/credentials/'],
      },
    ],
    sitemap: 'https://aiworkspace.com/sitemap.xml',
  };
}
