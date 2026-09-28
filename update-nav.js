const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('page.tsx')) {
      results.push(file);
    }
  });
  return results;
}
const files = walk('src/app');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('/tools') && !file.includes('tools')) return;
  
  const target1 = '<Link href="/about" className="hover:text-black transition-colors">About</Link>';
  const target2 = '<Link href="/about" className="text-black transition-colors">About</Link>';
  
  const linkStr = '<Link href="/tools" className="hover:text-black transition-colors">Tools</Link>\n            ';
  
  if (content.includes(target1)) {
    content = content.replace(target1, linkStr + target1);
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  } else if (content.includes(target2)) {
    content = content.replace(target2, linkStr + target2);
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
