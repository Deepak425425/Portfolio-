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
  { id: 'hero_main', name: 'Hero Background', src: '/campaign-worlds/download (22).jpeg', page: 'home', section: 'Hero' },
  { id: 'selected_work_1', name: 'Selected Work 1', src: '/campaign-worlds/groton-1.jpg', page: 'home', section: 'Selected Work' },
  { id: 'selected_work_2', name: 'Selected Work 2', src: '/campaign-worlds/groton-9.jpg', page: 'home', section: 'Selected Work' },
  { id: 'selected_work_3', name: 'Selected Work 3', src: '/campaign-worlds/High-Angle Editorial Fashion Portrait (1).jpeg', page: 'home', section: 'Selected Work' },
  { id: 'about_visual', name: 'About Visual', src: '/campaign-worlds/ghgh.jpeg', page: 'home', section: 'About' },
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
    return JSON.parse(fs.readFileSync(CMS_FILE_PATH, 'utf-8'));
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
