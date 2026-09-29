const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, '..', 'src', 'app', 'tools');
const dirs = fs.readdirSync(toolsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

const customMetadata = {
  'resize': { title: 'Image Resizer — Resize Images Online', desc: 'Resize images online with precise dimensions, aspect ratios and export controls using GROTON AI.' },
  'crop': { title: 'Image Cropper — Crop Images Online', desc: 'Crop images precisely with custom aspect ratios, zoom, positioning and high-resolution export.' },
  'filters': { title: 'Image Filters & Colour Grading', desc: 'Apply cinematic image effects, film looks, editorial filters and professional colour grading directly in your browser.' },
  'border': { title: 'Image Border Maker — Add Frames to Images', desc: 'Add classic, vintage, Polaroid, double, film and custom borders to images with high-resolution export.' },
  'passport-photo': { title: 'Passport Photo Maker — Passport & ID Photos', desc: 'Create correctly sized passport, visa and ID photo sheets with crop, print layout and export controls.' },
  'image-compare': { title: 'Image Compare — Compare Two Images Online', desc: 'Compare images with before-and-after sliders, side-by-side views, zoom and high-resolution export.' },
  'bulk-image-renamer': { title: 'Bulk Image Renamer — Rename Files Online', desc: 'Rename multiple images at once with custom patterns, numbering, and find-and-replace rules.' },
  'watermark-remover': { title: 'Watermark Remover — Content-Aware Object Removal', desc: 'Remove unwanted marks, objects, text and watermarks from images using intelligent browser-side inpainting.' },
  'cinematic-focus': { title: 'Cinematic Focus — Radial Blur & Focus Effects', desc: 'Create cinematic focus, film looks, editorial filters, analog textures and optical effects.' }
};

function formatName(str) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

dirs.forEach(dir => {
  const meta = customMetadata[dir] || {
    title: `${formatName(dir)} — Free Online Image Tool`,
    desc: `Use GROTON AI's free online ${formatName(dir).toLowerCase()} tool for professional image editing and production.`
  };
  
  const layoutContent = `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${meta.title}",
  description: "${meta.desc}",
  alternates: {
    canonical: "/tools/${dir}",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;

  fs.writeFileSync(path.join(toolsDir, dir, 'layout.tsx'), layoutContent);
});

// Write tools index layout
const toolsIndexLayout = `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GROTON AI Tools — Free Image Editing & Creative Tools",
  description: "Explore GROTON AI's browser-based image tools for resizing, cropping, compression, color palettes, collages, passport photos, borders, filters, image comparison and more.",
  alternates: {
    canonical: "/tools",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;
fs.writeFileSync(path.join(toolsDir, 'layout.tsx'), toolsIndexLayout);

console.log('Metadata layouts generated successfully.');
