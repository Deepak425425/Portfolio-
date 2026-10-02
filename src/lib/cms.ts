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
};

const DEFAULT_IMAGES: CmsImage[] = [
  { id: 'hero_main', name: 'Hero Background', src: '/campaign-worlds/download (22).jpeg', page: 'HOME', section: 'Hero' },
  { id: 'selected_work_1', name: 'Selected Work 1', src: '/campaign-worlds/groton-1.jpg', page: 'HOME', section: 'Selected Work' },
  { id: 'selected_work_2', name: 'Selected Work 2', src: '/campaign-worlds/groton-9.jpg', page: 'HOME', section: 'Selected Work' },
  { id: 'selected_work_3', name: 'Selected Work 3', src: '/campaign-worlds/High-Angle Editorial Fashion Portrait (1).jpeg', page: 'HOME', section: 'Selected Work' },
  { id: 'about_visual', name: 'About Visual', src: '/campaign-worlds/ghgh.jpeg', page: 'HOME', section: 'About' },
  { id: 'about_main_visual', name: 'About Main Visual', src: '/campaign-worlds/6610031H658_BYE260114.webp', page: 'ABOUT', section: 'Main Visual' },
  { id: 'service_ai_product', name: 'AI Product Images', src: '/campaign-worlds/groton-14.jpg', page: 'SERVICES', section: 'Services List' },
  { id: 'service_lifestyle', name: 'Lifestyle Product Imagery', src: '/campaign-worlds/groton-10.jpg', page: 'SERVICES', section: 'Services List' },
  { id: 'service_advertising', name: 'Advertising Creatives', src: '/campaign-worlds/groton-17.jpg', page: 'SERVICES', section: 'Services List' },
  { id: 'service_social', name: 'Social Media Content', src: '/campaign-worlds/groton-3.jpg', page: 'SERVICES', section: 'Services List' },
  { id: 'service_creative', name: 'Creative Direction', src: '/campaign-worlds/High-Angle Editorial Fashion Portrait (1).jpeg', page: 'SERVICES', section: 'Services List' },
  { id: 'work_1', name: 'Streetwear Comfort', src: '/campaign-worlds/download (27).jpeg', page: 'WORK', section: 'Portfolio' },
  { id: 'work_2', name: 'Sherpa Outerwear', src: '/campaign-worlds/Caffeine is culture ~ ,?.jpeg', page: 'WORK', section: 'Portfolio' },
  { id: 'work_3', name: 'Modern Elegance', src: '/campaign-worlds/groton-3.jpg', page: 'WORK', section: 'Portfolio' },
  { id: 'work_4', name: 'High-Angle Editorial', src: '/campaign-worlds/High-Angle Editorial Fashion Portrait (1).jpeg', page: 'WORK', section: 'Portfolio' },
  { id: 'work_5', name: 'Cat Print Styling', src: '/campaign-worlds/How to style Cat Print T shirts.jpeg', page: 'WORK', section: 'Portfolio' },
  { id: 'work_6', name: 'Editorial Lifestyle', src: '/campaign-worlds/mu_forart_.jpeg', page: 'WORK', section: 'Portfolio' },
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

export function updateCmsImage(id: string, newSrc: string) {
  const data = getCmsData();
  const updated = data.map(img => img.id === id ? { ...img, src: newSrc } : img);
  
  try {
    fs.writeFileSync(CMS_FILE_PATH, JSON.stringify(updated, null, 2));
  } catch (e) {
    console.warn('Could not write CMS file, updating memory cache only.', e);
  }
  
  memoryCache = updated;
  return updated;
}
