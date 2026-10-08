import fs from 'fs';
import path from 'path';

const isVercel = process.env.VERCEL === '1';
const CMS_FILE_PATH = isVercel ? '/tmp/cms.json' : path.join(process.cwd(), 'data', 'cms.json');

export type CmsImage = {
  id: string;
  name: string;
  src: string;
  page: string;
  section: string;
  mediaType?: 'image' | 'video';
  mimeType?: string;
};

import { BLOG_POSTS } from '@/lib/blog/data';

const DEFAULT_IMAGES: CmsImage[] = [
  // --- HOME PAGE ---
  // HERO (3D Orbit Center & Rotating Cards)
  { id: 'hero_main', name: 'Hero Center Model', src: '/campaign-worlds/groton-home-hero-model.png', page: 'HOME', section: 'Hero (Orbit Center)' },
  { id: 'hero_support_1', name: 'Orbit Card — Product (Footwear)', src: '/campaign-worlds/groton-home-hero-floating-shoes-3x4.webp', page: 'HOME', section: 'Hero (3D Orbit)' },
  { id: 'hero_support_2', name: 'Orbit Card — Apparel (T-Shirt)', src: '/campaign-worlds/groton-home-hero-floating-tshirt-3x4.webp', page: 'HOME', section: 'Hero (3D Orbit)' },
  { id: 'hero_support_3', name: 'Orbit Card — Eyewear (Sunglasses)', src: '/campaign-worlds/groton-home-hero-floating-sunglasses-3x4.webp', page: 'HOME', section: 'Hero (3D Orbit)' },
  { id: 'hero_support_4', name: 'Orbit Card — Campaign (Jacket)', src: '/campaign-worlds/groton-home-hero-floating-jacket-3x4.webp', page: 'HOME', section: 'Hero (3D Orbit)' },

  // PROCESS (Transformation Stages)
  { id: 'process_raw', name: 'Raw Product Input (Stage 01)', src: '/campaign-worlds/groton-home-process-raw-1x1.webp', page: 'HOME', section: 'Process Transformation' },
  { id: 'process_final', name: 'Final Campaign Visual (Stage 05)', src: '/campaign-worlds/groton-home-process-final-4x5.webp', page: 'HOME', section: 'Process Transformation' },

  // CAPABILITIES
  { id: 'capability_product', name: 'Product Photography Card', src: '/campaign-worlds/groton-home-capability-product-4x5.webp', page: 'HOME', section: 'Capabilities' },
  { id: 'capability_model', name: 'Product-on-Model Card', src: '/campaign-worlds/groton-home-capability-model-4x5.webp', page: 'HOME', section: 'Capabilities' },
  { id: 'capability_apparel', name: 'Fashion Apparel Card', src: '/campaign-worlds/groton-1.jpg', page: 'HOME', section: 'Capabilities' },
  { id: 'capability_editorial', name: 'Editorial Catalog Card', src: '/campaign-worlds/groton-home-capability-editorial-4x5.webp', page: 'HOME', section: 'Capabilities' },

  // EDITORIAL ARCHIVE
  { id: 'archive_hero', name: 'Editorial Showcase Visual', src: '/campaign-worlds/How to style Cat Print T shirts.jpeg', page: 'HOME', section: 'Editorial Archive' },

  // FASHION & APPAREL FOCUS
  { id: 'fashion_1', name: 'Fashion Focus 1 — Black Hoodie', src: '/campaign-worlds/groton-home-fashion-black-hoodie-3x4.webp', page: 'HOME', section: 'Fashion & Apparel' },
  { id: 'fashion_2', name: 'Fashion Focus 2 — Striped Shirt', src: '/campaign-worlds/groton-home-fashion-striped-shirt-3x4.webp', page: 'HOME', section: 'Fashion & Apparel' },
  { id: 'fashion_3', name: 'Fashion Focus 3 — Blue Hoodie', src: '/campaign-worlds/groton-home-fashion-blue-hoodie-3x4.webp', page: 'HOME', section: 'Fashion & Apparel' },

  // --- SERVICES PAGE ---
  { id: 'service_ecommerce_pdp', name: '01 — E-commerce & PDP Visuals', src: '/campaign-worlds/groton-services-advertising-3x4.webp', page: 'SERVICES', section: 'E-commerce & PDP' },
  { id: 'service_product_on_model', name: '02 — Product-on-Model', src: '/campaign-worlds/groton-services-ai-product-3x4.webp', page: 'SERVICES', section: 'Product-on-Model' },
  { id: 'service_lifestyle_editorial', name: '03 — Lifestyle & Editorial', src: '/campaign-worlds/groton-services-lifestyle-3x4.webp', page: 'SERVICES', section: 'Lifestyle & Editorial' },
  { id: 'service_campaign_advertising', name: '04 — Campaign & Advertising', src: '/campaign-worlds/groton-services-creative-direction-3x4.webp', page: 'SERVICES', section: 'Campaign & Advertising' },

  // --- WORK PAGE ---
  { id: 'work_1', name: '01 — Streetwear Comfort', src: '/campaign-worlds/GROTON-work-selected-streetwear-742x556.webp', page: 'WORK', section: 'Portfolio (Fashion)' },
  { id: 'work_2', name: '02 — Sherpa Outerwear', src: '/campaign-worlds/GROTON-work-selected-sherpa-outerwear-742x990.webp', page: 'WORK', section: 'Portfolio (Fashion)' },
  { id: 'work_3', name: '03 — Modern Elegance', src: '/campaign-worlds/GROTON-work-selected-modern-elegance-742x928.webp', page: 'WORK', section: 'Portfolio (Fashion)' },
  { id: 'work_4', name: '04 — High-Angle Editorial', src: '/campaign-worlds/GROTON-work-selected-high-angle-editorial-742x742.webp', page: 'WORK', section: 'Portfolio (Editorial)' },
  { id: 'work_5', name: '05 — Cat Print Styling', src: '/campaign-worlds/GROTON-work-selected-cat-print-742x418.webp', page: 'WORK', section: 'Portfolio (Fashion)' },
  { id: 'work_6', name: '06 — Editorial Lifestyle', src: '/campaign-worlds/GROTON-work-selected-editorial-lifestyle-742x990.webp', page: 'WORK', section: 'Portfolio (Fashion)' },

  // --- CONTACT PAGE ---
  { id: 'contact_visual', name: 'Contact Editorial Visual', src: '/campaign-worlds/groton-contact-visual-4x5.webp', page: 'CONTACT', section: 'Contact Visual' },

  // --- BLOG / INSIGHTS (All 30 Articles) ---
  ...BLOG_POSTS.map(post => ({
    id: `blog_${post.slug}`,
    name: post.title,
    src: post.coverImage,
    page: 'BLOG',
    section: `Article: ${post.category}`
  }))
];

let memoryCache: CmsImage[] | null = null;

export function getCmsData(): CmsImage[] {
  if (memoryCache) return memoryCache;

  if (!fs.existsSync(CMS_FILE_PATH)) {
    try {
      if (!fs.existsSync(path.dirname(CMS_FILE_PATH))) {
        fs.mkdirSync(path.dirname(CMS_FILE_PATH), { recursive: true });
      }
      fs.writeFileSync(CMS_FILE_PATH, JSON.stringify(DEFAULT_IMAGES, null, 2));
    } catch (e) {
      console.warn('Could not write CMS file, using memory cache.', e);
      memoryCache = DEFAULT_IMAGES;
      return memoryCache;
    }
    return DEFAULT_IMAGES;
  }
  try {
    const saved = JSON.parse(fs.readFileSync(CMS_FILE_PATH, 'utf-8'));
    // Merge missing defaults in case of new items
    const merged = [...saved];
    DEFAULT_IMAGES.forEach(def => {
      if (!merged.find(m => m.id === def.id)) merged.push(def);
    });
    return merged;
  } catch (e) {
    return DEFAULT_IMAGES;
  }
}

export function updateCmsImage(id: string, newSrc: string, mediaType?: 'image' | 'video', mimeType?: string) {
  const data = getCmsData();
  const updated = data.map(img => img.id === id ? { ...img, src: newSrc, mediaType: mediaType || img.mediaType, mimeType: mimeType || img.mimeType } : img);
  
  try {
    fs.writeFileSync(CMS_FILE_PATH, JSON.stringify(updated, null, 2));
  } catch (e) {
    console.warn('Could not write CMS file, updating memory cache only.', e);
  }
  
  memoryCache = updated;
  return updated;
}
