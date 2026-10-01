import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import { BLOG_POSTS } from '@/lib/blog/data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://groton.in'
  
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/pricing',
    '/privacy-policy',
    '/services',
    '/terms-and-conditions',
    '/tools',
    '/work',
    '/blog'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : route === '/tools' ? 0.9 : 0.8,
  }))

  const toolsDir = path.join(process.cwd(), 'src', 'app', 'tools')
  let toolRoutes: MetadataRoute.Sitemap = []
  
  try {
    const dirs = fs.readdirSync(toolsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    toolRoutes = dirs.map((dir) => ({
      url: `${baseUrl}/tools/${dir}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (e) {
    console.error('Error reading tools directory for sitemap:', e)
  }

  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.datePublished),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...toolRoutes, ...blogRoutes]
}
