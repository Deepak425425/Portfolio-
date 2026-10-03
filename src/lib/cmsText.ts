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
  // --- GLOBAL NAVIGATION ---
  { id: 'global.nav.brand', page: 'GLOBAL', section: 'Navigation', type: 'single-line', label: 'Brand Name', defaultValue: 'GROTON AI STUDIO' },
  { id: 'global.nav.work', page: 'GLOBAL', section: 'Navigation', type: 'single-line', label: 'Work Link', defaultValue: 'Work' },
  { id: 'global.nav.services', page: 'GLOBAL', section: 'Navigation', type: 'single-line', label: 'Services Link', defaultValue: 'Services' },
  { id: 'global.nav.pricing', page: 'GLOBAL', section: 'Navigation', type: 'single-line', label: 'Pricing Link', defaultValue: 'Pricing' },
  { id: 'global.nav.tools', page: 'GLOBAL', section: 'Navigation', type: 'single-line', label: 'Tools Link', defaultValue: 'Tools' },
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

  { id: 'home.cap.label', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Section Label', defaultValue: 'Capabilities' },
  { id: 'home.cap.heading', page: 'HOME', section: 'Capabilities', type: 'multi-line', label: 'Heading', defaultValue: 'E-commerce visuals,\nelevated.' },
  { id: 'home.cap.desc', page: 'HOME', section: 'Capabilities', type: 'multi-line', label: 'Description', defaultValue: 'We specialize in creating premium product imagery for e-commerce brands. From clean catalog shots to highly art-directed campaign visuals, we ensure your products look their absolute best.' },
  { id: 'home.cap.item1.title', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Item 1 Title', defaultValue: 'Product Photography' },
  { id: 'home.cap.item1.desc', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Item 1 Desc', defaultValue: '— Studio & Lifestyle' },
  { id: 'home.cap.item2.title', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Item 2 Title', defaultValue: 'Product-on-Model' },
  { id: 'home.cap.item2.desc', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Item 2 Desc', defaultValue: '— Fashion & Apparel' },
  { id: 'home.cap.item3.title', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Item 3 Title', defaultValue: 'Campaign Visuals' },
  { id: 'home.cap.item3.desc', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Item 3 Desc', defaultValue: '— Art Directed Compositions' },
  { id: 'home.cap.item4.title', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Item 4 Title', defaultValue: 'Catalog & Marketplace Imagery' },
  { id: 'home.cap.item4.desc', page: 'HOME', section: 'Capabilities', type: 'single-line', label: 'Item 4 Desc', defaultValue: '— Collection Consistency' },

  { id: 'home.archive.label', page: 'HOME', section: 'Archive', type: 'single-line', label: 'Section Label', defaultValue: 'Editorial Archive' },
  { id: 'home.archive.heading', page: 'HOME', section: 'Archive', type: 'single-line', label: 'Heading', defaultValue: 'A visual collection.' },

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
  { id: 'about.hero.heading', page: 'ABOUT', section: 'Hero', type: 'multi-line', label: 'Heading', defaultValue: 'Art direction meets\nalgorithmic scale.' },
  { id: 'about.hero.desc', page: 'ABOUT', section: 'Hero', type: 'multi-line', label: 'Description', defaultValue: 'GROTON is a premium visual production studio designed for modern brands. We engineer hyper-realistic, campaign-ready visual assets that blur the line between traditional photography and artificial intelligence.' },
  { id: 'about.prob.label', page: 'ABOUT', section: 'The Problem', type: 'single-line', label: 'Section Label', defaultValue: 'The Problem' },
  { id: 'about.prob.heading', page: 'ABOUT', section: 'The Problem', type: 'multi-line', label: 'Heading', defaultValue: 'Traditional production is too slow. AI is too generic.' },
  { id: 'about.prob.p1', page: 'ABOUT', section: 'The Problem', type: 'multi-line', label: 'Paragraph 1', defaultValue: 'Modern brands require a massive volume of visual content—from e-commerce hero shots to social media campaigns and display advertising. Traditional physical photoshoots involve heavy logistics, locations, permits, and rigid timelines.' },
  { id: 'about.prob.p2', page: 'ABOUT', section: 'The Problem', type: 'multi-line', label: 'Paragraph 2', defaultValue: 'Conversely, standard AI generation often produces generic, unpredictable, or off-brand results that fail to meet premium brand standards.' },
  { id: 'about.appr.label', page: 'ABOUT', section: 'Our Approach', type: 'single-line', label: 'Section Label', defaultValue: 'Our Approach' },
  { id: 'about.appr.heading', page: 'ABOUT', section: 'Our Approach', type: 'single-line', label: 'Heading', defaultValue: 'Directed Generation.' },
  { id: 'about.appr.p1', page: 'ABOUT', section: 'Our Approach', type: 'multi-line', label: 'Paragraph 1', defaultValue: 'We solve this by placing experienced creative directors at the helm of advanced AI synthesis. We don\'t just type prompts; we establish visual systems. We define the lighting logic, the color theory, the material textures, and the compositional hierarchy.' },
  { id: 'about.appr.p2', page: 'ABOUT', section: 'Our Approach', type: 'multi-line', label: 'Paragraph 2', defaultValue: 'This hybrid approach allows us to deliver production-grade realism and brand consistency at a scale and speed that traditional studios cannot match.' },
  { id: 'about.cta.heading', page: 'ABOUT', section: 'CTA', type: 'multi-line', label: 'Heading', defaultValue: 'Elevate your visual language.' },
  { id: 'about.cta.btn', page: 'ABOUT', section: 'CTA', type: 'single-line', label: 'Button', defaultValue: 'Start A Project' },

  // --- SERVICES PAGE ---
  { id: 'services.hero.heading', page: 'SERVICES', section: 'Hero', type: 'multi-line', label: 'Heading', defaultValue: 'Production Capabilities.' },
  { id: 'services.hero.desc', page: 'SERVICES', section: 'Hero', type: 'multi-line', label: 'Description', defaultValue: 'A comprehensive suite of visual generation services, combining sophisticated art direction with the scale and speed of artificial intelligence.' },
  
  { id: 'services.s1.title', page: 'SERVICES', section: 'Service 01', type: 'single-line', label: 'Title', defaultValue: 'AI Product Images' },
  { id: 'services.s1.desc', page: 'SERVICES', section: 'Service 01', type: 'multi-line', label: 'Description', defaultValue: 'Premium product visuals designed for e-commerce, campaigns and brand communication.' },
  { id: 'services.s1.details', page: 'SERVICES', section: 'Service 01', type: 'multi-line', label: 'Details', defaultValue: 'We ingest your physical products or existing photography and synthesize them into high-fidelity, photorealistic environments. By controlling lighting, materials, and composition algorithmically, we bypass the logistical constraints of physical sets while maintaining absolute realism.' },
  
  { id: 'services.s2.title', page: 'SERVICES', section: 'Service 02', type: 'single-line', label: 'Title', defaultValue: 'Lifestyle Product Imagery' },
  { id: 'services.s2.desc', page: 'SERVICES', section: 'Service 02', type: 'multi-line', label: 'Description', defaultValue: 'Editorial and lifestyle scenes created around your products.' },
  { id: 'services.s2.details', page: 'SERVICES', section: 'Service 02', type: 'multi-line', label: 'Details', defaultValue: 'We place your products in aspirational, photorealistic environments that tell a brand story. From sun-drenched interiors to high-end architectural spaces, we create contextual imagery without the need for location scouting or physical sets.' },

  { id: 'services.s3.title', page: 'SERVICES', section: 'Service 03', type: 'single-line', label: 'Title', defaultValue: 'Advertising Creatives' },
  { id: 'services.s3.desc', page: 'SERVICES', section: 'Service 03', type: 'multi-line', label: 'Description', defaultValue: 'Performance-focused visual concepts for paid social and digital campaigns.' },
  { id: 'services.s3.details', page: 'SERVICES', section: 'Service 03', type: 'multi-line', label: 'Details', defaultValue: 'Data-driven creative for digital advertising. We generate vast variations of visual concepts, allowing brands to test multiple visual angles, environments, and compositions for paid acquisition campaigns without blowing out the production budget.' },

  { id: 'services.s4.title', page: 'SERVICES', section: 'Service 04', type: 'single-line', label: 'Title', defaultValue: 'Social Media Content' },
  { id: 'services.s4.desc', page: 'SERVICES', section: 'Service 04', type: 'multi-line', label: 'Description', defaultValue: 'High-quality visual systems for consistent brand communication.' },
  { id: 'services.s4.details', page: 'SERVICES', section: 'Service 04', type: 'multi-line', label: 'Details', defaultValue: 'Maintaining a premium social feed requires volume without sacrificing art direction. We build visual systems and generate batches of cohesive, on-brand imagery to fuel your organic social media strategy for months at a time.' },

  { id: 'services.s5.title', page: 'SERVICES', section: 'Service 05', type: 'single-line', label: 'Title', defaultValue: 'Creative Direction' },
  { id: 'services.s5.desc', page: 'SERVICES', section: 'Service 05', type: 'multi-line', label: 'Description', defaultValue: 'Concept development, visual direction, art direction and campaign thinking.' },
  { id: 'services.s5.details', page: 'SERVICES', section: 'Service 05', type: 'multi-line', label: 'Details', defaultValue: 'AI is a tool; art direction is the differentiator. Our creative directors work with you to establish the visual language, lighting logic, color theory, and conceptual framework before a single pixel is generated.' },

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
  { id: 'pricing.t1.price', page: 'PRICING', section: 'Tier 1', type: 'single-line', label: 'Price', defaultValue: '₹2,499' },
  { id: 'pricing.t1.unit', page: 'PRICING', section: 'Tier 1', type: 'single-line', label: 'Unit', defaultValue: '₹100 / Image' },
  { id: 'pricing.t1.desc', page: 'PRICING', section: 'Tier 1', type: 'multi-line', label: 'Description', defaultValue: 'Perfect for a foundational collection of high-quality product assets, clean catalog shots, or launching a new small capsule.' },
  { id: 'pricing.t2.badge', page: 'PRICING', section: 'Tier 2', type: 'single-line', label: 'Badge', defaultValue: 'Recommended' },
  { id: 'pricing.t2.name', page: 'PRICING', section: 'Tier 2', type: 'single-line', label: 'Name', defaultValue: 'Growth' },
  { id: 'pricing.t2.volume', page: 'PRICING', section: 'Tier 2', type: 'single-line', label: 'Volume', defaultValue: '50 Images' },
  { id: 'pricing.t2.price', page: 'PRICING', section: 'Tier 2', type: 'single-line', label: 'Price', defaultValue: '₹4,499' },
  { id: 'pricing.t2.unit', page: 'PRICING', section: 'Tier 2', type: 'single-line', label: 'Unit', defaultValue: '₹90 / Image' },
  { id: 'pricing.t2.desc', page: 'PRICING', section: 'Tier 2', type: 'multi-line', label: 'Description', defaultValue: 'The ideal volume for comprehensive e-commerce listings, dynamic social media batches, and cohesive brand storytelling.' },
  { id: 'pricing.t3.name', page: 'PRICING', section: 'Tier 3', type: 'single-line', label: 'Name', defaultValue: 'Scale' },
  { id: 'pricing.t3.volume', page: 'PRICING', section: 'Tier 3', type: 'single-line', label: 'Volume', defaultValue: '100 Images' },
  { id: 'pricing.t3.price', page: 'PRICING', section: 'Tier 3', type: 'single-line', label: 'Price', defaultValue: '₹7,999' },
  { id: 'pricing.t3.unit', page: 'PRICING', section: 'Tier 3', type: 'single-line', label: 'Unit', defaultValue: '₹80 / Image' },
  { id: 'pricing.t3.desc', page: 'PRICING', section: 'Tier 3', type: 'multi-line', label: 'Description', defaultValue: 'Built for high-volume catalogs, robust digital marketing campaigns, and brands scaling their entire visual inventory.' },
  { id: 'pricing.notes', page: 'PRICING', section: 'Notes', type: 'multi-line', label: 'Notes', defaultValue: 'Pricing applies to standard e-commerce/product imagery. Product-on-model, lifestyle, advanced compositing and campaign visuals are quoted separately.' },
  { id: 'pricing.cta.btn', page: 'PRICING', section: 'CTA', type: 'single-line', label: 'Button', defaultValue: 'Start A Project' },

  // --- BLOG PAGE ---
  { id: 'blog.hero.label', page: 'BLOG', section: 'Hero', type: 'single-line', label: 'Label', defaultValue: 'GROTON JOURNAL' },
  { id: 'blog.hero.heading', page: 'BLOG', section: 'Hero', type: 'multi-line', label: 'Heading', defaultValue: 'Insights on product\nimagery and brand\nvisuals.' },
  { id: 'blog.hero.desc', page: 'BLOG', section: 'Hero', type: 'multi-line', label: 'Description', defaultValue: 'Thoughts, guides, and creative workflows for modern e-commerce brands, creative directors, and digital studios.' },
  { id: 'blog.post.back', page: 'BLOG', section: 'Post', type: 'single-line', label: 'Back Link', defaultValue: '&larr; Back to Journal' },
  { id: 'blog.post.share', page: 'BLOG', section: 'Post', type: 'single-line', label: 'Share Heading', defaultValue: 'Share this article' },
  { id: 'blog.post.related', page: 'BLOG', section: 'Post', type: 'single-line', label: 'Related Heading', defaultValue: 'Related Articles' },

  // --- TOOLS PAGE ---
  { id: 'tools.hero.label', page: 'TOOLS', section: 'Hero', type: 'single-line', label: 'Label', defaultValue: 'GROTON AI / TOOLS' },
  { id: 'tools.hero.heading', page: 'TOOLS', section: 'Hero', type: 'single-line', label: 'Heading', defaultValue: 'Image tools, without the busywork.' },
  { id: 'tools.hero.desc', page: 'TOOLS', section: 'Hero', type: 'single-line', label: 'Description', defaultValue: 'Small tools. Serious image work.' },

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
