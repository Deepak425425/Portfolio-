const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/testing/script-board/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The chunk to replace is inside handleExportPDF.
// We'll replace the block from `const framesText = ...` to `renderImageSlot` calls.

const oldBlock = `        const framesText = doc.splitTextToSize((sceneAssetLeft?.displayName ? "Left: " + sceneAssetLeft?.displayName : "Left: (None)") + " | " + (sceneAssetRight?.displayName ? "Right: " + sceneAssetRight?.displayName : "Right: (None)"), textWidth);
        const phraseText = doc.splitTextToSize(scene.phrase || "(Empty)", textWidth);
        const motionText = doc.splitTextToSize(scene.motionPrompt || "(Empty)", textWidth);
        const notesText = doc.splitTextToSize(scene.notes || "(Empty)", textWidth);
        
        const textHeight = 
          (5 + framesText.length * 4) +
          (10 + phraseText.length * 4) +
          (10 + motionText.length * 4) +
          (10 + notesText.length * 4) + 15;
        
        const blockHeight = Math.max(120, textHeight) + 30; 
        
        if (cursorY + blockHeight > pageHeight - 20) {
          doc.addPage();
          pageNum++;
          cursorY = margin;
          drawFooter(pageNum);
          drawHeader();
        }
        
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 7;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(title, margin, cursorY);
        
        cursorY += 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 10;
        
        // Render Images (LEFT and RIGHT)
        const renderImageSlot = async (imgData: string | null, x: number, y: number, w: number, label: string) => {
           if (imgData) {
             try {
               const img = new Image();
               img.crossOrigin = "Anonymous";
               img.src = imgData;
               await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
               const aspect = img.width / img.height;
               let finalW = w;
               let finalH = finalW / aspect;
               if (finalH > 130) { finalH = 130; finalW = 130 * aspect; }
               doc.addImage(img, "JPEG", x, y + 5, finalW, finalH);
               doc.setDrawColor(230, 230, 230);
               doc.rect(x, y + 5, finalW, finalH);
             } catch (e) {
               doc.setDrawColor(230, 230, 230);
               doc.rect(x, y + 5, w, 60);
               doc.setTextColor(150, 150, 150);
               doc.setFontSize(7);
               doc.text("ERROR", x + 5, y + 35);
             }
           } else {
             doc.setDrawColor(230, 230, 230);
             doc.rect(x, y + 5, w, 60);
             doc.setTextColor(150, 150, 150);
             doc.setFont("helvetica", "bold");
             doc.setFontSize(8);
             doc.text("EMPTY", x + 10, y + 35);
           }
           doc.setFont("helvetica", "bold");
           doc.setFontSize(7);
           doc.setTextColor(120, 120, 120);
           doc.text(label, x, y);
        };

        await renderImageSlot(sceneAssetLeft?.url || null, margin, cursorY, halfImgW, sceneAssetLeft?.displayName ? sceneAssetLeft.displayName.toUpperCase() : "LEFT IMAGE");
        await renderImageSlot(sceneAssetRight?.url || null, margin + halfImgW + gap, cursorY, halfImgW, sceneAssetRight?.displayName ? sceneAssetRight.displayName.toUpperCase() : "RIGHT IMAGE");`;


const newBlock = `        const filesString = \`1st Frame: \${sceneAssetLeft ? (sceneAssetLeft.displayName || "1st Frame") : "—"}\\n2nd Frame: \${sceneAssetRight ? (sceneAssetRight.displayName || "2nd Frame") : "—"}\`;
        const framesText = doc.splitTextToSize(filesString, textWidth);
        const phraseText = doc.splitTextToSize(scene.phrase || "(Empty)", textWidth);
        const motionText = doc.splitTextToSize(scene.motionPrompt || "(Empty)", textWidth);
        const notesText = doc.splitTextToSize(scene.notes || "(Empty)", textWidth);
        
        const textHeight = 
          (5 + framesText.length * 4) +
          (10 + phraseText.length * 4) +
          (10 + motionText.length * 4) +
          (10 + notesText.length * 4) + 15;
        
        const blockHeight = Math.max(120, textHeight) + 30; 
        
        if (cursorY + blockHeight > pageHeight - 20) {
          doc.addPage();
          pageNum++;
          cursorY = margin;
          drawFooter(pageNum);
          drawHeader();
        }
        
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 7;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(title, margin, cursorY);
        
        cursorY += 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 10;
        
        // Render Images (LEFT and RIGHT)
        const renderImageSlot = async (imgData: string | null, x: number, y: number, w: number, label: string) => {
           if (imgData) {
             try {
               const img = new Image();
               img.crossOrigin = "Anonymous";
               img.src = imgData;
               await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
               const aspect = img.width / img.height;
               let finalW = w;
               let finalH = finalW / aspect;
               if (finalH > 130) { finalH = 130; finalW = 130 * aspect; }
               doc.addImage(img, "JPEG", x, y + 5, finalW, finalH);
               doc.setDrawColor(230, 230, 230);
               doc.rect(x, y + 5, finalW, finalH);
             } catch (e) {
               doc.setDrawColor(240, 240, 240);
               doc.setFillColor(250, 250, 250);
               doc.rect(x, y + 5, w, 30, 'FD');
               doc.setTextColor(150, 150, 150);
               doc.setFontSize(7);
               doc.text("ERROR", x + 5, y + 20);
             }
           } else {
             doc.setDrawColor(240, 240, 240);
             doc.setFillColor(250, 250, 250);
             doc.rect(x, y + 5, w, 30, 'FD');
             doc.setTextColor(150, 150, 150);
             doc.setFont("helvetica", "bold");
             doc.setFontSize(8);
             doc.text("EMPTY", x + 10, y + 20);
           }
           doc.setFont("helvetica", "bold");
           doc.setFontSize(7);
           doc.setTextColor(120, 120, 120);
           doc.text(label, x, y);
        };

        const leftSlotName = sceneAssetLeft?.displayName ? sceneAssetLeft.displayName.toUpperCase() : "1ST FRAME";
        const rightSlotName = sceneAssetRight?.displayName ? sceneAssetRight.displayName.toUpperCase() : "2ND FRAME";

        await renderImageSlot(sceneAssetLeft?.url || null, margin, cursorY, halfImgW, leftSlotName);
        await renderImageSlot(sceneAssetRight?.url || null, margin + halfImgW + gap, cursorY, halfImgW, rightSlotName);`;

// Let's use regex to replace it properly
const regex = /const framesText = doc\.splitTextToSize[\s\S]*?await renderImageSlot\(sceneAssetRight\?\.url \|\| null, margin \+ halfImgW \+ gap, cursorY, halfImgW, sceneAssetRight\?\.displayName \? sceneAssetRight\.displayName\.toUpperCase\(\) : "RIGHT IMAGE"\);/;

content = content.replace(regex, newBlock);
fs.writeFileSync(filePath, content, 'utf8');
