import fs from 'fs';
import path from 'path';
import { put, list } from '@vercel/blob';

const isVercel = process.env.VERCEL === '1';

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
  // --- GLOBAL NAVIGATION ---
  { id: 'global.nav.brand', page: 'GLOBAL', section: 'Navigation', type: 'single-line', label: 'Brand Name', defaultValue: 'GROTON AI STUDIO' },
  { id: 'global.nav.work', page: 'GLOBAL', section: 'Navigation', type: 'single-line', label: 'Work Link', defaultValue: 'Work' },
  { id: 'global.nav.services', page: 'GLOBAL', section: 'Navigation', type: 'single-line', label: 'Services Link', defaultValue: 'Services' },
  { id: 'global.nav.pricing', page: 'GLOBAL', section: 'Navigation', type: 'single-line', label: 'Pricing Link', defaultValue: 'Pricing' },
  { id: 'global.nav.tools', page: 'GLOBAL', section: 'Navigation', type: 'single-line', label: 'Tools Link', defaultValue: 'Tools' },
  { id: 'global.nav.insights', page: 'GLOBAL', section: 'Navigation', type: 'single-line', label: 'Insights Link', defaultValue: 'Insights' },
  { id: 'global.nav.about', page: 'GLOBAL', section: 'Navigation', type: 'single-line', label: 'About Link', defaultValue: 'About' },
  { id: 'global.nav.contact', page: 'GLOBAL', section: 'Navigation', type: 'single-line', label: 'Contact Button', defaultValue: 'Contact' },

  // --- GLOBAL FOOTER ---
  { id: 'global.footer.brand', page: 'GLOBAL', section: 'Footer', type: 'single-line', label: 'Brand Name', defaultValue: 'GROTON AI STUDIO' },
  { id: 'global.footer.copyright', page: 'GLOBAL', section: 'Footer', type: 'single-line', label: 'Copyright', defaultValue: '© 2026 GROTON AI STUDIO' },
  { id: 'global.footer.credit', page: 'GLOBAL', section: 'Footer', type: 'single-line', label: 'Credit Line', defaultValue: 'A creative venture by' },
  { id: 'global.footer.creditLink', page: 'GLOBAL', section: 'Footer', type: 'single-line', label: 'Credit Link', defaultValue: 'Grafly Studio' },

  // --- HOME PAGE ---
  { id: 'home.hero.heading', page: 'HOME', section: 'Hero', type: 'multi-line', label: 'Heading', defaultValue: 'Product visuals that\nmake brands look better.' },
  { id: 'home.hero.desc', page: 'HOME', section: 'Hero', type: 'multi-line', label: 'Description', defaultValue: 'Premium e-commerce imagery created for modern brands. We transform ordinary products into high-end commercial campaigns.' },
  { id: 'home.hero.cta.primary', page: 'HOME', section: 'Hero', type: 'single-line', label: 'Primary CTA', defaultValue: 'Start A Project' },
  { id: 'home.hero.cta.secondary', page: 'HOME', section: 'Hero', type: 'single-line', label: 'Secondary CTA', defaultValue: 'View Our Work' },
  { id: 'home.hero.corner.label', page: 'HOME', section: 'Hero', type: 'single-line', label: 'Corner Label', defaultValue: 'GROTON' },
  { id: 'home.hero.corner.desc', page: 'HOME', section: 'Hero', type: 'multi-line', label: 'Corner Desc', defaultValue: 'Art Direction &\nE-Commerce Visuals' },

  { id: 'home.cap.label', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Section Label', defaultValue: 'CAPABILITIES' },
  { id: 'home.cap.heading', page: 'HOME', section: 'Capabilities', type: 'multi-line', label: 'Heading', defaultValue: 'E-commerce\nvisuals,\nelevated.' },
  { id: 'home.cap.desc', page: 'HOME', section: 'Capabilities', type: 'multi-line', label: 'Description', defaultValue: 'We specialize in creating premium product\nimagery for e-commerce brands. From clean\ncatalog shots to highly art-directed campaign\nvisuals, we ensure your products look their\nabsolute best.' },
  { id: 'home.cap.img1.label', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Card 1 Eyebrow', defaultValue: 'PRODUCT IMAGERY' },
  { id: 'home.cap.item1.title', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Item 1 Title', defaultValue: 'Product Photography' },
  { id: 'home.cap.item1.desc', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Item 1 Desc', defaultValue: '— Studio & Lifestyle' },
  { id: 'home.cap.img2.label', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Card 2 Eyebrow', defaultValue: 'PRODUCT-ON-MODEL' },
  { id: 'home.cap.item2.title', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Item 2 Title', defaultValue: 'Product-on-Model' },
  { id: 'home.cap.item2.desc', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Item 2 Desc', defaultValue: '— Fashion & Apparel' },
  { id: 'home.cap.img3.label', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Card 3 Eyebrow', defaultValue: 'FASHION & APPAREL' },
  { id: 'home.cap.item3.title', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Item 3 Title', defaultValue: 'Fashion & Apparel' },
  { id: 'home.cap.item3.desc', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Item 3 Desc', defaultValue: '— Catalog & Collection' },
  { id: 'home.cap.img4.label', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Card 4 Eyebrow', defaultValue: 'EDITORIAL' },
  { id: 'home.cap.item4.title', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Item 4 Title', defaultValue: 'Catalog & Marketplace Imagery' },
  { id: 'home.cap.item4.desc', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Item 4 Desc', defaultValue: '— Collection Consistency' },

  { id: 'home.archive.label', page: 'HOME', section: 'Archive', type: 'single-line', label: 'Section Label', defaultValue: 'Editorial Archive' },
  { id: 'home.archive.heading', page: 'HOME', section: 'Archive', type: 'single-line', label: 'Heading', defaultValue: 'Multiple Models. Multiple Products. Endless Possibilities.' },
  { id: 'home.archive.desc', page: 'HOME', section: 'Archive', type: 'multi-line', label: 'Description', defaultValue: 'Rather than relying on raw generation, every asset passes through an exacting studio pipeline—from art direction and casting to lighting and textural refinement. The result is commercial imagery with the fidelity, control, and presence of a premier editorial campaign.' },

  { id: 'home.process.label', page: 'HOME', section: 'Process', type: 'single-line', label: 'Section Label', defaultValue: 'The Process' },
  { id: 'home.process.heading', page: 'HOME', section: 'Process', type: 'multi-line', label: 'Heading', defaultValue: 'From Product\nto Campaign.' },
  { id: 'home.process.step1.title', page: 'HOME', section: 'Process', type: 'single-line', label: 'Step 1 Title', defaultValue: 'Product' },
  { id: 'home.process.step1.desc', page: 'HOME', section: 'Process', type: 'multi-line', label: 'Step 1 Desc', defaultValue: 'Provide your product or reference imagery.' },
  { id: 'home.process.step2.title', page: 'HOME', section: 'Process', type: 'single-line', label: 'Step 2 Title', defaultValue: 'Direction' },
  { id: 'home.process.step2.desc', page: 'HOME', section: 'Process', type: 'multi-line', label: 'Step 2 Desc', defaultValue: 'We establish the visual direction and lighting.' },
  { id: 'home.process.step3.title', page: 'HOME', section: 'Process', type: 'single-line', label: 'Step 3 Title', defaultValue: 'Production' },
  { id: 'home.process.step3.desc', page: 'HOME', section: 'Process', type: 'multi-line', label: 'Step 3 Desc', defaultValue: 'Products are developed into the required visual style.' },
  { id: 'home.process.step4.title', page: 'HOME', section: 'Process', type: 'single-line', label: 'Step 4 Title', defaultValue: 'Refinement' },
  { id: 'home.process.step4.desc', page: 'HOME', section: 'Process', type: 'multi-line', label: 'Step 4 Desc', defaultValue: 'Composition, styling, and details are meticulously polished.' },
  { id: 'home.process.step5.title', page: 'HOME', section: 'Process', type: 'single-line', label: 'Step 5 Title', defaultValue: 'Delivery' },
  { id: 'home.process.step5.desc', page: 'HOME', section: 'Process', type: 'multi-line', label: 'Step 5 Desc', defaultValue: 'Final commercial-ready visuals are delivered.' },

  { id: 'home.focus.label', page: 'HOME', section: 'Focus', type: 'single-line', label: 'Section Label', defaultValue: 'Focus' },
  { id: 'home.focus.heading', page: 'HOME', section: 'Focus', type: 'single-line', label: 'Heading', defaultValue: 'Fashion & Apparel.' },

  { id: 'home.why.heading', page: 'HOME', section: 'Why Us', type: 'multi-line', label: 'Heading', defaultValue: 'Built for\nE-commerce.' },
  { id: 'home.why.item1.title', page: 'HOME', section: 'Why Us', type: 'single-line', label: 'Item 1 Title', defaultValue: 'Consistent Presentation' },
  { id: 'home.why.item1.desc', page: 'HOME', section: 'Why Us', type: 'multi-line', label: 'Item 1 Desc', defaultValue: 'Maintain a unified visual language across your entire product catalog, ensuring brand consistency on every product page.' },
  { id: 'home.why.item2.title', page: 'HOME', section: 'Why Us', type: 'single-line', label: 'Item 2 Title', defaultValue: 'Premium Aesthetic' },
  { id: 'home.why.item2.desc', page: 'HOME', section: 'Why Us', type: 'multi-line', label: 'Item 2 Desc', defaultValue: 'Elevate your brand perception with lighting, framing, and compositions that rival top-tier physical studio productions.' },
  { id: 'home.why.item3.title', page: 'HOME', section: 'Why Us', type: 'single-line', label: 'Item 3 Title', defaultValue: 'Scalable Production' },
  { id: 'home.why.item3.desc', page: 'HOME', section: 'Why Us', type: 'multi-line', label: 'Item 3 Desc', defaultValue: 'Whether launching a single capsule collection or re-shooting a massive inventory, our process scales effortlessly.' },
  { id: 'home.why.item4.title', page: 'HOME', section: 'Why Us', type: 'single-line', label: 'Item 4 Title', defaultValue: 'Flexible Directions' },
  { id: 'home.why.item4.desc', page: 'HOME', section: 'Why Us', type: 'multi-line', label: 'Item 4 Desc', defaultValue: 'Pivot from clean white-background catalog shots to moody, editorial campaign visuals using the same core product assets.' },

  // --- ABOUT PAGE ---
  { id: 'about.hero.label', page: 'ABOUT', section: 'Hero', type: 'single-line', label: 'Section Label', defaultValue: 'ABOUT GROTON' },
  { id: 'about.hero.heading', page: 'ABOUT', section: 'Hero', type: 'multi-line', label: 'Heading', defaultValue: 'Built for e-commerce brands.' },
  { id: 'about.hero.desc', page: 'ABOUT', section: 'Hero', type: 'multi-line', label: 'Description', defaultValue: 'GROTON AI is a visual production studio helping e-commerce brands create premium product visuals and campaign-ready content using AI — faster and at scale.' },
  
  { id: 'about.p1.label', page: 'ABOUT', section: '01 — Purpose', type: 'single-line', label: 'Label', defaultValue: '01 — OUR PURPOSE' },
  { id: 'about.p1.title', page: 'ABOUT', section: '01 — Purpose', type: 'single-line', label: 'Title', defaultValue: 'Better visuals for bigger growth.' },
  { id: 'about.p1.desc', page: 'ABOUT', section: '01 — Purpose', type: 'multi-line', label: 'Description', defaultValue: 'We help e-commerce brands create premium visual content that helps their products stand out and grow.' },
  
  { id: 'about.p2.label', page: 'ABOUT', section: '02 — What We Do', type: 'single-line', label: 'Label', defaultValue: '02 — WHAT WE DO' },
  { id: 'about.p2.title', page: 'ABOUT', section: '02 — What We Do', type: 'single-line', label: 'Title', defaultValue: 'Product visuals, made easier.' },
  { id: 'about.p2.desc', page: 'ABOUT', section: '02 — What We Do', type: 'multi-line', label: 'Description', defaultValue: 'From product imagery and product-on-model visuals to campaign creatives, we create high-quality visual assets for modern commerce.' },
  
  { id: 'about.p3.label', page: 'ABOUT', section: '03 — Who We Work With', type: 'single-line', label: 'Label', defaultValue: '03 — WHO WE WORK WITH' },
  { id: 'about.p3.title', page: 'ABOUT', section: '03 — Who We Work With', type: 'single-line', label: 'Title', defaultValue: 'Modern e-commerce brands.' },
  { id: 'about.p3.desc', page: 'ABOUT', section: '03 — Who We Work With', type: 'multi-line', label: 'Description', defaultValue: 'We work with fashion, jewelry, beauty, lifestyle, D2C, and other product-led e-commerce brands.' },
  
  { id: 'about.vision.label', page: 'ABOUT', section: 'Vision', type: 'single-line', label: 'Label', defaultValue: 'OUR VISION' },
  { id: 'about.vision.heading', page: 'ABOUT', section: 'Vision', type: 'multi-line', label: 'Heading', defaultValue: 'To make premium visual production more accessible, scalable, and effective for every e-commerce brand.' },
  { id: 'about.vision.desc', page: 'ABOUT', section: 'Vision', type: 'single-line', label: 'Subtext', defaultValue: 'Less complexity. More creativity. Better results.' },

  // --- SERVICES PAGE ---
  { id: 'services.hero.label', page: 'SERVICES', section: 'Hero', type: 'single-line', label: 'Label', defaultValue: 'VISUAL PRODUCTION' },
  { id: 'services.hero.heading', page: 'SERVICES', section: 'Hero', type: 'multi-line', label: 'Heading', defaultValue: 'Visuals built for modern commerce.' },
  { id: 'services.hero.desc', page: 'SERVICES', section: 'Hero', type: 'multi-line', label: 'Description', defaultValue: 'From PDP and product-on-model imagery to lifestyle and campaign visuals, GROTON creates premium visual content built for e-commerce brands.' },
  
  { id: 'services.s1.category', page: 'SERVICES', section: 'Service 01 — PDP', type: 'single-line', label: 'Category', defaultValue: '01 — E-COMMERCE / PDP' },
  { id: 'services.s1.title', page: 'SERVICES', section: 'Service 01 — PDP', type: 'single-line', label: 'Title', defaultValue: 'E-commerce & PDP Visuals' },
  { id: 'services.s1.desc', page: 'SERVICES', section: 'Service 01 — PDP', type: 'multi-line', label: 'Description', defaultValue: 'Commerce-ready visuals built for product pages, marketplaces, catalogs, and online stores.' },
  
  { id: 'services.s2.category', page: 'SERVICES', section: 'Service 02 — Model', type: 'single-line', label: 'Category', defaultValue: '02 — PRODUCT-ON-MODEL' },
  { id: 'services.s2.title', page: 'SERVICES', section: 'Service 02 — Model', type: 'single-line', label: 'Title', defaultValue: 'Product-on-Model' },
  { id: 'services.s2.desc', page: 'SERVICES', section: 'Service 02 — Model', type: 'multi-line', label: 'Description', defaultValue: 'Realistic product-on-model imagery for fashion, apparel, jewellery, accessories, and other product-led brands.' },

  { id: 'services.s3.category', page: 'SERVICES', section: 'Service 03 — Lifestyle', type: 'single-line', label: 'Category', defaultValue: '03 — LIFESTYLE' },
  { id: 'services.s3.title', page: 'SERVICES', section: 'Service 03 — Lifestyle', type: 'single-line', label: 'Title', defaultValue: 'Lifestyle & Editorial' },
  { id: 'services.s3.desc', page: 'SERVICES', section: 'Service 03 — Lifestyle', type: 'multi-line', label: 'Description', defaultValue: 'Art-directed product visuals that place products into premium lifestyle and editorial contexts.' },

  { id: 'services.s4.category', page: 'SERVICES', section: 'Service 04 — Campaign', type: 'single-line', label: 'Category', defaultValue: '04 — CAMPAIGN' },
  { id: 'services.s4.title', page: 'SERVICES', section: 'Service 04 — Campaign', type: 'single-line', label: 'Title', defaultValue: 'Campaign & Advertising' },
  { id: 'services.s4.desc', page: 'SERVICES', section: 'Service 04 — Campaign', type: 'multi-line', label: 'Description', defaultValue: 'High-impact visual assets for product launches, campaigns, advertising, and digital brand communication.' },

  // --- WORK PAGE ---
  { id: 'work.hero.heading', page: 'WORK', section: 'Hero', type: 'single-line', label: 'Heading', defaultValue: 'Selected Work.' },
  { id: 'work.hero.label', page: 'WORK', section: 'Hero', type: 'single-line', label: 'Label', defaultValue: 'CLIENT WORK' },
  
  { id: 'work.p1.title', page: 'WORK', section: 'Project 01', type: 'single-line', label: 'Title', defaultValue: 'Streetwear Comfort' },
  { id: 'work.p1.cat', page: 'WORK', section: 'Project 01', type: 'single-line', label: 'Category', defaultValue: 'Fashion' },
  { id: 'work.p2.title', page: 'WORK', section: 'Project 02', type: 'single-line', label: 'Title', defaultValue: 'Sherpa Outerwear' },
  { id: 'work.p2.cat', page: 'WORK', section: 'Project 02', type: 'single-line', label: 'Category', defaultValue: 'Fashion' },
  { id: 'work.p3.title', page: 'WORK', section: 'Project 03', type: 'single-line', label: 'Title', defaultValue: 'Modern Elegance' },
  { id: 'work.p3.cat', page: 'WORK', section: 'Project 03', type: 'single-line', label: 'Category', defaultValue: 'Fashion' },
  { id: 'work.p4.title', page: 'WORK', section: 'Project 04', type: 'single-line', label: 'Title', defaultValue: 'High-Angle Editorial' },
  { id: 'work.p4.cat', page: 'WORK', section: 'Project 04', type: 'single-line', label: 'Category', defaultValue: 'Editorial' },
  { id: 'work.p5.title', page: 'WORK', section: 'Project 05', type: 'single-line', label: 'Title', defaultValue: 'Cat Print Styling' },
  { id: 'work.p5.cat', page: 'WORK', section: 'Project 05', type: 'single-line', label: 'Category', defaultValue: 'Fashion' },
  { id: 'work.p6.title', page: 'WORK', section: 'Project 06', type: 'single-line', label: 'Title', defaultValue: 'Editorial Lifestyle' },
  { id: 'work.p6.cat', page: 'WORK', section: 'Project 06', type: 'single-line', label: 'Category', defaultValue: 'Fashion' },
  
  { id: 'work.cta.heading', page: 'WORK', section: 'CTA', type: 'single-line', label: 'Heading', defaultValue: 'Ready to create something new?' },
  { id: 'work.cta.btn', page: 'WORK', section: 'CTA', type: 'single-line', label: 'Button', defaultValue: 'Start A Project' },

  // --- CONTACT PAGE ---
  { id: 'contact.hero.heading', page: 'CONTACT', section: 'Hero', type: 'single-line', label: 'Heading', defaultValue: 'Start a project.' },
  { id: 'contact.hero.desc', page: 'CONTACT', section: 'Hero', type: 'multi-line', label: 'Description', defaultValue: 'Tell us what you are building. Our creative team will review your requirements and reach out to discuss visual direction, timelines, and next steps.' },
  { id: 'contact.info.direct', page: 'CONTACT', section: 'Info', type: 'single-line', label: 'Direct Label', defaultValue: 'Direct Contact' },
  { id: 'contact.info.name', page: 'CONTACT', section: 'Info', type: 'single-line', label: 'Name', defaultValue: 'Deepak Kumawat' },
  { id: 'contact.info.social', page: 'CONTACT', section: 'Info', type: 'single-line', label: 'Social Label', defaultValue: 'Socials & Direct Line' },
  { id: 'contact.info.whatsapp', page: 'CONTACT', section: 'Info', type: 'single-line', label: 'WhatsApp', defaultValue: 'WhatsApp (+91 63780 83205)' },
  
  { id: 'contact.form.name.label', page: 'CONTACT', section: 'Form', type: 'single-line', label: 'Name Label', defaultValue: 'Name' },
  { id: 'contact.form.name.placeholder', page: 'CONTACT', section: 'Form', type: 'single-line', label: 'Name Placeholder', defaultValue: 'Jane Doe' },
  { id: 'contact.form.brand.label', page: 'CONTACT', section: 'Form', type: 'single-line', label: 'Brand Label', defaultValue: 'Brand / Company' },
  { id: 'contact.form.brand.placeholder', page: 'CONTACT', section: 'Form', type: 'single-line', label: 'Brand Placeholder', defaultValue: 'Your Brand' },
  { id: 'contact.form.email.label', page: 'CONTACT', section: 'Form', type: 'single-line', label: 'Email Label', defaultValue: 'Email' },
  { id: 'contact.form.email.placeholder', page: 'CONTACT', section: 'Form', type: 'single-line', label: 'Email Placeholder', defaultValue: 'jane@brand.com' },
  { id: 'contact.form.phone.label', page: 'CONTACT', section: 'Form', type: 'single-line', label: 'Phone Label', defaultValue: 'Phone (Optional)' },
  { id: 'contact.form.phone.placeholder', page: 'CONTACT', section: 'Form', type: 'single-line', label: 'Phone Placeholder', defaultValue: '+1 234 567 890' },
  { id: 'contact.form.type.label', page: 'CONTACT', section: 'Form', type: 'single-line', label: 'Type Label', defaultValue: 'Project Type' },
  { id: 'contact.form.budget.label', page: 'CONTACT', section: 'Form', type: 'single-line', label: 'Budget Label', defaultValue: 'Budget Range' },
  { id: 'contact.form.details.label', page: 'CONTACT', section: 'Form', type: 'single-line', label: 'Details Label', defaultValue: 'Project Details' },
  { id: 'contact.form.details.placeholder', page: 'CONTACT', section: 'Form', type: 'single-line', label: 'Details Placeholder', defaultValue: 'Tell us about the visual direction, quantity of assets, and timeline...' },
  { id: 'contact.form.submit', page: 'CONTACT', section: 'Form', type: 'single-line', label: 'Submit Button', defaultValue: 'Submit Inquiry' },

  // --- PRICING PAGE ---
  { id: 'pricing.hero.heading', page: 'PRICING', section: 'Hero', type: 'single-line', label: 'Heading', defaultValue: 'Transparent Engagement.' },
  { id: 'pricing.hero.desc', page: 'PRICING', section: 'Hero', type: 'multi-line', label: 'Description', defaultValue: 'We operate on clear, project-based tiers depending on the complexity of creative direction, required variations, and the volume of visual deliverables.' },
  { id: 'pricing.t1.name', page: 'PRICING', section: 'Tier 1', type: 'single-line', label: 'Name', defaultValue: 'Starter' },
  { id: 'pricing.t1.volume', page: 'PRICING', section: 'Tier 1', type: 'single-line', label: 'Volume', defaultValue: '25 Images' },
  { id: 'pricing.t1.price', page: 'PRICING', section: 'Tier 1', type: 'single-line', label: 'Price', defaultValue: '₹1,999' },
  { id: 'pricing.t1.unit', page: 'PRICING', section: 'Tier 1', type: 'single-line', label: 'Unit', defaultValue: '₹80 / Image' },
  { id: 'pricing.t1.desc', page: 'PRICING', section: 'Tier 1', type: 'multi-line', label: 'Description', defaultValue: 'Perfect for a foundational collection of high-quality product assets, clean catalog shots, or launching a new small capsule.' },
  { id: 'pricing.t2.badge', page: 'PRICING', section: 'Tier 2', type: 'single-line', label: 'Badge', defaultValue: 'Recommended' },
  { id: 'pricing.t2.name', page: 'PRICING', section: 'Tier 2', type: 'single-line', label: 'Name', defaultValue: 'Growth' },
  { id: 'pricing.t2.volume', page: 'PRICING', section: 'Tier 2', type: 'single-line', label: 'Volume', defaultValue: '50 Images' },
  { id: 'pricing.t2.price', page: 'PRICING', section: 'Tier 2', type: 'single-line', label: 'Price', defaultValue: '₹3,499' },
  { id: 'pricing.t2.unit', page: 'PRICING', section: 'Tier 2', type: 'single-line', label: 'Unit', defaultValue: '₹70 / Image' },
  { id: 'pricing.t2.desc', page: 'PRICING', section: 'Tier 2', type: 'multi-line', label: 'Description', defaultValue: 'The ideal volume for comprehensive e-commerce listings, dynamic social media batches, and cohesive brand storytelling.' },
  { id: 'pricing.t3.name', page: 'PRICING', section: 'Tier 3', type: 'single-line', label: 'Name', defaultValue: 'Scale' },
  { id: 'pricing.t3.volume', page: 'PRICING', section: 'Tier 3', type: 'single-line', label: 'Volume', defaultValue: '100 Images' },
  { id: 'pricing.t3.price', page: 'PRICING', section: 'Tier 3', type: 'single-line', label: 'Price', defaultValue: '₹5,999' },
  { id: 'pricing.t3.unit', page: 'PRICING', section: 'Tier 3', type: 'single-line', label: 'Unit', defaultValue: '₹60 / Image' },
  { id: 'pricing.t3.desc', page: 'PRICING', section: 'Tier 3', type: 'multi-line', label: 'Description', defaultValue: 'Built for high-volume catalogs, robust digital marketing campaigns, and brands scaling their entire visual inventory.' },
  { id: 'pricing.notes', page: 'PRICING', section: 'Notes', type: 'multi-line', label: 'Notes', defaultValue: 'Pricing applies to standard e-commerce/product imagery. Product-on-model, lifestyle, advanced compositing and campaign visuals are quoted separately.' },
  { id: 'pricing.cta.btn', page: 'PRICING', section: 'CTA', type: 'single-line', label: 'Button', defaultValue: 'Start A Project' },

  // --- BLOG PAGE ---
  { id: 'blog.hero.label', page: 'BLOG', section: 'Hero', type: 'single-line', label: 'Label', defaultValue: 'GROTON JOURNAL' },
  { id: 'blog.hero.heading', page: 'BLOG', section: 'Hero', type: 'multi-line', label: 'Heading', defaultValue: 'Insights for modern e-commerce.' },
  { id: 'blog.hero.desc', page: 'BLOG', section: 'Hero', type: 'multi-line', label: 'Description', defaultValue: 'Practical insights, visual workflows, and ideas for brands creating better product content at scale.' },
  { id: 'blog.post.back', page: 'BLOG', section: 'Post', type: 'single-line', label: 'Back Link', defaultValue: '&larr; Back to Journal' },
  { id: 'blog.post.share', page: 'BLOG', section: 'Post', type: 'single-line', label: 'Share Heading', defaultValue: 'Share this article' },
  { id: 'blog.post.related', page: 'BLOG', section: 'Post', type: 'single-line', label: 'Related Heading', defaultValue: 'Related Articles' },

  // --- TOOLS PAGE ---
  { id: 'tools.hero.label', page: 'TOOLS', section: 'Hero', type: 'single-line', label: 'Label', defaultValue: 'GROTON AI / TOOLS' },
  { id: 'tools.hero.heading', page: 'TOOLS', section: 'Hero', type: 'single-line', label: 'Heading', defaultValue: 'Save the time. Keep the creativity.' },
  { id: 'tools.hero.desc', page: 'TOOLS', section: 'Hero', type: 'single-line', label: 'Description', defaultValue: 'Built to make your creative workflow faster.' },

];

let memoryCache: CmsTextRecord[] | null = null;

function mergeWithDefaults(saved: CmsTextRecord[]): CmsTextRecord[] {
  const merged = [...saved];
  DEFAULT_TEXT.forEach(def => {
    if (!merged.find(m => m.id === def.id)) merged.push(def);
  });
  return merged;
}

export async function getCmsText(): Promise<CmsTextRecord[]> {
  if (memoryCache) return memoryCache;

  // 1. Try Vercel Blob if token is set
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: 'studio/cmsText.json' });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url, { cache: 'no-store' });
        if (res.ok) {
          const blobData = await res.json();
          if (Array.isArray(blobData) && blobData.length > 0) {
            const merged = mergeWithDefaults(blobData);
            memoryCache = merged;
            return merged;
          }
        }
      }
    } catch (e) {
      console.warn('Could not read cmsText.json from Blob:', e);
    }
  }

  // 2. Try /tmp/cmsText.json on Vercel
  const tmpPath = path.join('/tmp', 'cmsText.json');
  if (isVercel && fs.existsSync(tmpPath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));
      if (Array.isArray(saved) && saved.length > 0) {
        const merged = mergeWithDefaults(saved);
        memoryCache = merged;
        return merged;
      }
    } catch {}
  }

  // 3. Try bundled data/cmsText.json
  const bundledPath = path.join(process.cwd(), 'data', 'cmsText.json');
  if (fs.existsSync(bundledPath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(bundledPath, 'utf-8'));
      if (Array.isArray(saved) && saved.length > 0) {
        const merged = mergeWithDefaults(saved);
        memoryCache = merged;
        return merged;
      }
    } catch {}
  }

  memoryCache = DEFAULT_TEXT;
  return DEFAULT_TEXT;
}

export function getCmsTextSync(): CmsTextRecord[] {
  if (memoryCache) return memoryCache;

  const tmpPath = path.join('/tmp', 'cmsText.json');
  if (isVercel && fs.existsSync(tmpPath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));
      if (Array.isArray(saved) && saved.length > 0) return mergeWithDefaults(saved);
    } catch {}
  }

  const bundledPath = path.join(process.cwd(), 'data', 'cmsText.json');
  if (fs.existsSync(bundledPath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(bundledPath, 'utf-8'));
      if (Array.isArray(saved) && saved.length > 0) return mergeWithDefaults(saved);
    } catch {}
  }

  return DEFAULT_TEXT;
}

export async function updateCmsText(id: string, newText: string): Promise<CmsTextRecord[]> {
  const current = await getCmsText();
  const updated = current.map(item => item.id === id ? { ...item, publishedValue: newText } : item);

  memoryCache = updated;

  // 1. Write to /tmp/cmsText.json on Vercel
  if (isVercel) {
    try {
      fs.writeFileSync(path.join('/tmp', 'cmsText.json'), JSON.stringify(updated, null, 2));
    } catch (e) {
      console.warn('Could not write /tmp/cmsText.json', e);
    }
  }

  // 2. Write to bundled data/cmsText.json if writable
  try {
    const bundledPath = path.join(process.cwd(), 'data', 'cmsText.json');
    if (!fs.existsSync(path.dirname(bundledPath))) {
      fs.mkdirSync(path.dirname(bundledPath), { recursive: true });
    }
    fs.writeFileSync(bundledPath, JSON.stringify(updated, null, 2));
  } catch {}

  // 3. Persist to Vercel Blob if available
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await put('studio/cmsText.json', JSON.stringify(updated, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json'
      });
    } catch (e) {
      console.error('Failed to persist cmsText.json to Vercel Blob:', e);
    }
  }

  return updated;
}
