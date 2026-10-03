import fs from 'fs';
import path from 'path';

const isVercel = process.env.VERCEL === '1';
const CMS_TEXT_PATH = isVercel ? '/tmp/cmsText.json' : path.join(process.cwd(), 'data', 'cmsText.json');

export type CmsTextRecord = {
  id: string;
  page: string;
  section: string;
  type: 'single-line' | 'multi-line';
  label: string;
  defaultValue: string;
  publishedValue?: string;
};

const DEFAULT_TEXT: CmsTextRecord[] = [
  // HOME
  { id: 'home_hero_heading', page: 'HOME', section: 'Hero', type: 'multi-line', label: 'Hero Heading', defaultValue: 'Product visuals that <br className="hidden md:block"/> make brands look better.' },
  { id: 'home_hero_desc', page: 'HOME', section: 'Hero', type: 'multi-line', label: 'Hero Description', defaultValue: 'Premium e-commerce imagery created for modern brands. We transform ordinary products into high-end commercial campaigns.' },
  { id: 'home_hero_cta_1', page: 'HOME', section: 'Hero', type: 'single-line', label: 'Primary CTA', defaultValue: 'Start A Project' },
  { id: 'home_hero_cta_2', page: 'HOME', section: 'Hero', type: 'single-line', label: 'Secondary CTA', defaultValue: 'View Our Work' },
  { id: 'home_cap_heading', page: 'HOME', section: 'Capabilities', type: 'multi-line', label: 'Capabilities Heading', defaultValue: 'E-commerce visuals, <br/>elevated.' },
  { id: 'home_cap_desc', page: 'HOME', section: 'Capabilities', type: 'multi-line', label: 'Capabilities Description', defaultValue: 'We specialize in creating premium product imagery for e-commerce brands. From clean catalog shots to highly art-directed campaign visuals, we ensure your products look their absolute best.' },
  
  // ABOUT
  { id: 'about_hero_heading', page: 'ABOUT', section: 'Hero', type: 'multi-line', label: 'Hero Heading', defaultValue: 'Art direction meets <br/>algorithmic scale.' },
  { id: 'about_hero_desc', page: 'ABOUT', section: 'Hero', type: 'multi-line', label: 'Hero Description', defaultValue: 'GROTON is a premium visual production studio designed for modern brands. We engineer hyper-realistic, campaign-ready visual assets that blur the line between traditional photography and artificial intelligence.' },
  { id: 'about_prob_heading', page: 'ABOUT', section: 'The Problem', type: 'single-line', label: 'Section Heading', defaultValue: 'Traditional production is too slow. AI is too generic.' },
  { id: 'about_appr_heading', page: 'ABOUT', section: 'Our Approach', type: 'single-line', label: 'Section Heading', defaultValue: 'Directed Generation.' },
  { id: 'about_cta_heading', page: 'ABOUT', section: 'CTA', type: 'single-line', label: 'CTA Heading', defaultValue: 'Elevate your visual language.' },
  
  // SERVICES
  { id: 'services_hero_heading', page: 'SERVICES', section: 'Hero', type: 'single-line', label: 'Hero Heading', defaultValue: 'Production Capabilities.' },
  { id: 'services_hero_desc', page: 'SERVICES', section: 'Hero', type: 'multi-line', label: 'Hero Description', defaultValue: 'A comprehensive suite of visual generation services, combining sophisticated art direction with the scale and speed of artificial intelligence.' },
  { id: 'services_s1_title', page: 'SERVICES', section: 'AI Product Images', type: 'single-line', label: 'Service Title', defaultValue: 'AI Product Images' },
  { id: 'services_s1_desc', page: 'SERVICES', section: 'AI Product Images', type: 'multi-line', label: 'Service Description', defaultValue: 'Premium product visuals designed for e-commerce, campaigns and brand communication.' },
  { id: 'services_s2_title', page: 'SERVICES', section: 'Lifestyle Product Imagery', type: 'single-line', label: 'Service Title', defaultValue: 'Lifestyle Product Imagery' },
  { id: 'services_s3_title', page: 'SERVICES', section: 'Advertising Creatives', type: 'single-line', label: 'Service Title', defaultValue: 'Advertising Creatives' },
  { id: 'services_s4_title', page: 'SERVICES', section: 'Social Media Content', type: 'single-line', label: 'Service Title', defaultValue: 'Social Media Content' },
  { id: 'services_s5_title', page: 'SERVICES', section: 'Creative Direction', type: 'single-line', label: 'Service Title', defaultValue: 'Creative Direction' },
  
  // WORK
  { id: 'work_hero_heading', page: 'WORK', section: 'Hero', type: 'single-line', label: 'Hero Heading', defaultValue: 'Selected Work.' },
  { id: 'work_cta_heading', page: 'WORK', section: 'CTA', type: 'single-line', label: 'CTA Heading', defaultValue: 'Ready to create something new?' },
  
  // CONTACT
  { id: 'contact_hero_heading', page: 'CONTACT', section: 'Hero', type: 'single-line', label: 'Hero Heading', defaultValue: 'Start a project.' },
  { id: 'contact_hero_desc', page: 'CONTACT', section: 'Hero', type: 'multi-line', label: 'Hero Description', defaultValue: 'Tell us what you are building. Our creative team will review your requirements and reach out to discuss visual direction, timelines, and next steps.' }
];

let memoryCache: CmsTextRecord[] | null = null;

export function getCmsText(): CmsTextRecord[] {
  if (memoryCache) return memoryCache;

  if (!fs.existsSync(CMS_TEXT_PATH)) {
    try {
      if (!fs.existsSync(path.dirname(CMS_TEXT_PATH))) {
        fs.mkdirSync(path.dirname(CMS_TEXT_PATH), { recursive: true });
      }
      fs.writeFileSync(CMS_TEXT_PATH, JSON.stringify(DEFAULT_TEXT, null, 2));
    } catch (e) {
      console.warn('Could not write CMS text file, using memory cache.', e);
      memoryCache = DEFAULT_TEXT;
      return memoryCache;
    }
    return DEFAULT_TEXT;
  }
  try {
    const saved = JSON.parse(fs.readFileSync(CMS_TEXT_PATH, 'utf-8'));
    const merged = [...saved];
    DEFAULT_TEXT.forEach(def => {
      if (!merged.find(m => m.id === def.id)) merged.push(def);
    });
    return merged;
  } catch (e) {
    return DEFAULT_TEXT;
  }
}

export function updateCmsText(id: string, newText: string) {
  const data = getCmsText();
  const updated = data.map(item => item.id === id ? { ...item, publishedValue: newText } : item);
  
  try {
    fs.writeFileSync(CMS_TEXT_PATH, JSON.stringify(updated, null, 2));
  } catch (e) {
    console.warn('Could not write CMS text file, updating memory cache only.', e);
  }
  
  memoryCache = updated;
  return updated;
}
