const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

// Add the required utility classes if they don't exist
if (!cssContent.includes('.glass-pine')) {
  cssContent += `
@layer utilities {
  .glass-pine {
    @apply bg-pine/90 backdrop-blur-md border border-pine-light/30 shadow-[0_8px_32px_rgba(27,59,54,0.5)];
  }
  .pine-card {
    @apply bg-pine-light/40 border border-terracotta/20 backdrop-blur-sm;
  }
  .warm-glow {
    box-shadow: 0 0 20px rgba(138, 61, 42, 0.4);
  }
}
`;
  fs.writeFileSync(cssPath, cssContent);
}

const dirPath = path.join(__dirname, 'src', 'pages', 'AdminPOS');
const files = fs.readdirSync(dirPath);

files.forEach(file => {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace brand colors
    content = content.replace(/brand-obsidian/g, 'pine');
    content = content.replace(/brand-cream/g, 'cream');
    content = content.replace(/brand-electricPeach/g, 'terracotta');
    content = content.replace(/glass-obsidian/g, 'glass-pine');
    content = content.replace(/obsidian-card/g, 'pine-card');
    content = content.replace(/electric-glow/g, 'warm-glow');
    content = content.replace(/brand-text/g, 'cream'); // since cream is the text color in dark mode
    content = content.replace(/brand-pistachio/g, 'green-600');

    fs.writeFileSync(filePath, content);
  }
});

// Also replace in AdminPOS.tsx
const adminPosPath = path.join(__dirname, 'src', 'pages', 'AdminPOS.tsx');
let adminContent = fs.readFileSync(adminPosPath, 'utf8');
adminContent = adminContent.replace(/brand-obsidian/g, 'pine');
adminContent = adminContent.replace(/brand-cream/g, 'cream');
adminContent = adminContent.replace(/brand-electricPeach/g, 'terracotta');
adminContent = adminContent.replace(/glass-obsidian/g, 'glass-pine');
adminContent = adminContent.replace(/obsidian-card/g, 'pine-card');
adminContent = adminContent.replace(/electric-glow/g, 'warm-glow');
adminContent = adminContent.replace(/brand-text/g, 'cream');
adminContent = adminContent.replace(/brand-pistachio/g, 'green-600');
fs.writeFileSync(adminPosPath, adminContent);

console.log('Rebranding complete.');
