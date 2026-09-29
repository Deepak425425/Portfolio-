const fs = require('fs');
const path = require('path');

const TOOLS_DIR = path.join(__dirname, '../src/app/tools');
const toolDirs = fs.readdirSync(TOOLS_DIR).filter(f => fs.statSync(path.join(TOOLS_DIR, f)).isDirectory());

const TOOL_SEO_CONTENT = {
    "background-remover": {
        title: "Remove Backgrounds from Images Online",
        intro: "Instantly isolate subjects and create transparent backgrounds with our advanced AI background remover."
    },
    "image-border": {
        title: "Add Beautiful Borders & Frames to Images",
        intro: "Enhance your photos with classic frames, vintage Polaroid borders, and custom padding."
    },
    "color-palette": {
        title: "Generate Color Palettes from Images",
        intro: "Automatically extract dominant colors and create beautiful HEX palettes from any photo."
    },
    "image-upscaler": {
        title: "Upscale Images & Increase Resolution",
        intro: "Enhance low-resolution images, upscale photos, and improve clarity without losing quality."
    },
    "image-compare": {
        title: "Compare Images Side-by-Side",
        intro: "Visually compare two images using interactive sliders or side-by-side split views."
    },
    "passport-photo": {
        title: "Create Passport & ID Photos Online",
        intro: "Format, crop, and prepare photos to exact passport, visa, and ID dimensions for any country."
    }
};

for (const toolDir of toolDirs) {
    const pagePath = path.join(TOOLS_DIR, toolDir, 'page.tsx');
    if (!fs.existsSync(pagePath)) continue;

    let content = fs.readFileSync(pagePath, 'utf8');
    
    if (content.includes('{data.title}') || content.includes('{data.intro}')) {
        const data = TOOL_SEO_CONTENT[toolDir] || {
            title: `Free Online ${toolDir.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Tool`,
            intro: `Process and edit your images securely in your browser with Groton's free ${toolDir.replace('-', ' ')} utility.`
        };
        
        content = content.replace('{data.title}', data.title).replace('{data.intro}', data.intro);
        fs.writeFileSync(pagePath, content, 'utf8');
    }
}

console.log("Successfully fixed SEO text interpolation bugs.");
