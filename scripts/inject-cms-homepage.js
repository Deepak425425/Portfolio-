const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/app/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add cmsImages state and fetch
if (!content.includes('cmsImages')) {
  const stateInsertPoint = content.indexOf('export default function Home() {') + 'export default function Home() {'.length;
  const stateLogic = `\n  const [cmsImages, setCmsImages] = useState<Record<string, string>>({});\n  useEffect(() => { fetch('/api/studio/cms').then(r => r.json()).then(data => { const map = data.reduce((acc: any, img: any) => ({ ...acc, [img.id]: img.src }), {}); setCmsImages(map); }).catch(() => {}); }, []);\n`;
  content = content.slice(0, stateInsertPoint) + stateLogic + content.slice(stateInsertPoint);
}

// 2. Replace hardcoded URLs
content = content.replace(
  /src="\/campaign-worlds\/download \(22\)\.jpeg"/g,
  'src={cmsImages.hero_main || "/campaign-worlds/download (22).jpeg"}'
);

content = content.replace(
  /src="\/campaign-worlds\/groton-1\.jpg"/g,
  'src={cmsImages.selected_work_1 || "/campaign-worlds/groton-1.jpg"}'
);

content = content.replace(
  /src="\/campaign-worlds\/groton-9\.jpg"/g,
  'src={cmsImages.selected_work_2 || "/campaign-worlds/groton-9.jpg"}'
);

content = content.replace(
  /src="\/campaign-worlds\/High-Angle Editorial Fashion Portrait \(1\)\.jpeg"/g,
  'src={cmsImages.selected_work_3 || "/campaign-worlds/High-Angle Editorial Fashion Portrait (1).jpeg"}'
);

content = content.replace(
  /src="\/campaign-worlds\/ghgh\.jpeg"/g,
  'src={cmsImages.about_visual || "/campaign-worlds/ghgh.jpeg"}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("page.tsx updated");
