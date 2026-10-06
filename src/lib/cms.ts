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

const DEFAULT_IMAGES: CmsImage[] = [
  // HERO
  { id: 'hero_main', name: 'Hero Main Image', src: '/campaign-worlds/download (22).jpeg', page: 'HOME', section: 'Hero' },
  { id: 'hero_support_1', name: 'Hero Supporting Image 1', src: '/campaign-worlds/Change_shoe_image_background_color_2K_20260929162637.jpg', page: 'HOME', section: 'Hero' },
  { id: 'hero_support_2', name: 'Hero Supporting Image 2', src: '/campaign-worlds/Create_vertical_e-commerce_produ…_2K_20260929162058.jpg', page: 'HOME', section: 'Hero' },
  { id: 'hero_support_3', name: 'Hero Supporting Image 3', src: '/campaign-worlds/Sunglasses_product_photography_2K_20260929162056.jpg', page: 'HOME', section: 'Hero' },
  { id: 'hero_support_4', name: 'Hero Supporting Image 4', src: '/campaign-worlds/Jacket_and_pants_fashion_display_2K_20260929162053.jpg', page: 'HOME', section: 'Hero' },

  // CAPABILITIES
  { id: 'capability_product', name: 'Product Imagery', src: '/campaign-worlds/LOGO DESIGN _ IDENTITY DESIGN _ ЛОГОТИП.jpeg', page: 'HOME', section: 'Capabilities' },
  { id: 'capability_model', name: 'Product-on-Model', src: '/campaign-worlds/groton-9.jpg', page: 'HOME', section: 'Capabilities' },
  { id: 'capability_apparel', name: 'Fashion Apparel', src: '/campaign-worlds/groton-1.jpg', page: 'HOME', section: 'Capabilities' },
  { id: 'capability_editorial', name: 'Editorial', src: '/campaign-worlds/High-Angle Editorial Fashion Portrait (1).jpeg', page: 'HOME', section: 'Capabilities' },

  // ARCHIVE (1:1 Visual Showcase)
  { id: 'archive_hero', name: 'Archive Main Visual', src: '/campaign-worlds/How to style Cat Print T shirts.jpeg', page: 'HOME', section: 'Editorial Archive' },
  { id: 'gallery_1', name: 'Editorial Archive 1', src: '/campaign-worlds/GROTON-work-selected-cat-print-742x418.webp', page: 'HOME', section: 'Editorial Archive' },
  { id: 'gallery_2', name: 'Editorial Archive 2', src: '/campaign-worlds/How to style Cat Print T shirts.jpeg', page: 'HOME', section: 'Editorial Archive' },
  { id: 'gallery_3', name: 'Editorial Archive 3', src: '/campaign-worlds/download (27).jpeg', page: 'HOME', section: 'Editorial Archive' },
  { id: 'gallery_4', name: 'Editorial Archive 4', src: '/campaign-worlds/Mali džentlmen, veliki stil_ 🎨.jpeg', page: 'HOME', section: 'Editorial Archive' },
  { id: 'gallery_5', name: 'Editorial Archive 5', src: '/campaign-worlds/mu_forart_.jpeg', page: 'HOME', section: 'Editorial Archive' },

  // PROCESS
  { id: 'process_raw', name: 'Raw Product Input', src: '/campaign-worlds/ghgh.jpeg', page: 'HOME', section: 'Process' },
  { id: 'process_final', name: 'Final Campaign Visual', src: '/campaign-worlds/1368386.jpg', page: 'HOME', section: 'Process' },

  // FASHION & APPAREL
  { id: 'fashion_1', name: 'Fashion Focus 1', src: '/campaign-worlds/groton-15.jpg', page: 'HOME', section: 'Fashion & Apparel' },
  { id: 'fashion_2', name: 'Fashion Focus 2', src: '/campaign-worlds/groton-12.jpg', page: 'HOME', section: 'Fashion & Apparel' },
  { id: 'fashion_3', name: 'Fashion Focus 3', src: '/campaign-worlds/groton-9.jpg', page: 'HOME', section: 'Fashion & Apparel' },

  // ABOUT
  { id: 'about_main_visual', name: 'About Main Visual', src: '/campaign-worlds/6610031H658_BYE260114.webp', page: 'ABOUT', section: 'Main Visual' },
  
  // SERVICES
  { id: 'service_ai_product', name: 'AI Product Images', src: '/campaign-worlds/groton-14.jpg', page: 'SERVICES', section: 'Services List' },
  { id: 'service_lifestyle', name: 'Lifestyle Product Imagery', src: '/campaign-worlds/groton-10.jpg', page: 'SERVICES', section: 'Services List' },
  { id: 'service_advertising', name: 'Advertising Creatives', src: '/campaign-worlds/groton-17.jpg', page: 'SERVICES', section: 'Services List' },
  { id: 'service_social', name: 'Social Media Content', src: '/campaign-worlds/groton-3.jpg', page: 'SERVICES', section: 'Services List' },
  { id: 'service_creative', name: 'Creative Direction', src: '/campaign-worlds/High-Angle Editorial Fashion Portrait (1).jpeg', page: 'SERVICES', section: 'Services List' },
  
  // WORK
  { id: 'work_1', name: 'Streetwear Comfort', src: '/campaign-worlds/download (27).jpeg', page: 'WORK', section: 'Portfolio' },
  { id: 'work_2', name: 'Sherpa Outerwear', src: '/campaign-worlds/Caffeine is culture ☕️.jpeg', page: 'WORK', section: 'Portfolio' },
  { id: 'work_3', name: 'Modern Elegance', src: '/campaign-worlds/groton-3.jpg', page: 'WORK', section: 'Portfolio' },
  { id: 'work_4', name: 'High-Angle Editorial', src: '/campaign-worlds/High-Angle Editorial Fashion Portrait (1).jpeg', page: 'WORK', section: 'Portfolio' },
  { id: 'work_5', name: 'Cat Print Styling', src: '/campaign-worlds/How to style Cat Print T shirts.jpeg', page: 'WORK', section: 'Portfolio' },
  { id: 'work_6', name: 'Editorial Lifestyle', src: '/campaign-worlds/mu_forart_.jpeg', page: 'WORK', section: 'Portfolio' },
  
  // CONTACT
  { id: 'contact_visual', name: 'Contact Visual', src: '/campaign-worlds/High-Angle Editorial Fashion Portrait (1).jpeg', page: 'CONTACT', section: 'Contact Form' },
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
