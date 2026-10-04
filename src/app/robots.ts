import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/studio',
        '/studio/*',
        '/testing',
        '/testing/*',
        '/api',
        '/api/*',
      ],
    },
    sitemap: 'https://groton.in/sitemap.xml',
  }
}
