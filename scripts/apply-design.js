const fs = require('fs');
const path = require('path');
const toolsDir = path.join(process.cwd(), 'src/app/tools');

const applyDesignSystem = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      applyDesignSystem(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Sliders
      content = content.replace(/accent-black/g, 'accent-[#8B7CFF]');
      
      // General Buttons
      content = content.replace(/bg-black(?![\w-])/g, 'bg-[#111111]');
      content = content.replace(/hover:bg-zinc-800/g, 'hover:bg-[#222222]');
      content = content.replace(/border-black(?![\w-])/g, 'border-[#111111]');
      
      // Tabs / Active States
      content = content.replace(/bg-blue-500/g, 'bg-[#8B7CFF]');
      content = content.replace(/text-blue-500/g, 'text-[#8B7CFF]');
      content = content.replace(/border-blue-500/g, 'border-[#8B7CFF]');
      
      // Inject ambient gradients if it's a raw main without ToolLayout
      if (content.includes('<main ') && !content.includes('<ToolLayout') && !content.includes('AMBIENT GRADIENTS') && !fullPath.includes('tools\\\\page.tsx')) {
        const ambientGradients = `
      {/* AMBIENT GRADIENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#DCD7FF] opacity-30 blur-[120px] rounded-full"></div>
         <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-[#E4E9FF] opacity-30 blur-[120px] rounded-full"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-[#FFF4E6] opacity-30 blur-[120px] rounded-full"></div>
         <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-[#F8DDEB] opacity-30 blur-[120px] rounded-full"></div>
      </div>
`;
        content = content.replace(/(<main[^>]*>)/, '$1' + ambientGradients);
        content = content.replace(/bg-white/g, 'bg-transparent'); // let gradient show through
        content = content.replace(/bg-\[\#EEF0F4\]/g, 'bg-[#F7F6F2]'); 
        
        // Ensure main is relative overflow-hidden for gradients
        if (!content.includes('relative') && content.includes('<main')) {
             content = content.replace(/(<main[^>]*className=["'])([^"']*)/, '$1$2 relative overflow-x-hidden ');
        }
      }

      fs.writeFileSync(fullPath, content);
    }
  }
};
applyDesignSystem(toolsDir);
console.log('Design system applied!');
