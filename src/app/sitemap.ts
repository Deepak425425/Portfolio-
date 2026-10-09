import type { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/lib/blog/data'
import { TOOL_REGISTRY } from '@/lib/registry/tools'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://groton.in'
  
  const routes = [
    '',
    '/services',
    '/work',
    '/pricing',
    '/about',
    '/contact',
    '/tools',
    '/blog'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Active tool routes from TOOL_REGISTRY with null routes filtered out
  const registeredToolRoutes = TOOL_REGISTRY
    .filter((tool) => Boolean(tool.route && tool.route.startsWith('/tools/')))
    .map((tool) => tool.route as string)

  // Additional active tool routes that exist in the codebase
  const additionalToolRoutes = [
    '/tools/before-after',
  ]

  const allToolRoutes = Array.from(new Set([...registeredToolRoutes, ...additionalToolRoutes]))

  const toolRoutes = allToolRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...routes, ...blogRoutes, ...toolRoutes]
}
