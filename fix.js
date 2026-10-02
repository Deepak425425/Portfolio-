const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf-8');
css = css.replace(/\\\\/g, '\\');
fs.writeFileSync('src/app/globals.css', css);
console.log("Fixed!");
