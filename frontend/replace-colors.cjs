const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
                results.push(file);
            }
        }
    });
    return results;
}

const targetDir = 'c:\\Users\\Admin\\chihung\\sportshop-graduation\\frontend\\src';
const files = walk(targetDir);
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace colors
    content = content.replace(/rose-/g, 'cyan-');
    content = content.replace(/yellow-/g, 'cyan-');
    content = content.replace(/red-/g, 'sky-');
    content = content.replace(/emerald-/g, 'teal-');
    
    // Hex colors in css/jsx
    content = content.replace(/#e11d48/g, '#0ea5e9'); // rose-600 -> sky-500
    content = content.replace(/#f43f5e/g, '#38bdf8'); // rose-500 -> sky-400
    content = content.replace(/#ef4444/g, '#0284c7'); // red-500 -> sky-600
    
    // rgb shadows
    content = content.replace(/rgba\(225,29,72/g, 'rgba(14,165,233'); // rose rgb to sky rgb
    content = content.replace(/rgba\(220, 38, 38/g, 'rgba(2,132,199');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
    }
});
console.log('Done replacement');
