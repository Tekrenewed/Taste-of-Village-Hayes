const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src', 'pages', 'AdminPOS');
const files = fs.readdirSync(dirPath);

files.forEach(file => {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Safe replacements
    content = content.replace(/Falooda & Co/g, 'Taste of Village');
    content = content.replace(/FALOODA & CO/g, 'TASTE OF VILLAGE');
    content = content.replace(/FALOODA &amp; CO/g, 'TASTE OF VILLAGE');
    content = content.replace(/Falooda OS/g, 'Taste of Village');
    content = content.replace(/FALOODA <span className="text-terracotta">OS<\/span>/g, 'TASTE OF <span className="text-terracotta">VILLAGE</span>');
    content = content.replace(/Falooda <span className="text-terracotta">OS<\/span>/g, 'Taste of <span className="text-terracotta">Village</span>');
    content = content.replace(/Falooda/g, 'Taste of Village');
    
    // PosPanel.tsx specific 
    content = content.replace(/falooda/g, 'curry'); // just for the dummy category check logic
    
    // KdsPanel already fixed
    
    fs.writeFileSync(filePath, content);
  }
});

// AdminPOS.tsx
const adminPosPath = path.join(__dirname, 'src', 'pages', 'AdminPOS.tsx');
let adminContent = fs.readFileSync(adminPosPath, 'utf8');
adminContent = adminContent.replace(/Falooda/g, 'Taste of Village');
fs.writeFileSync(adminPosPath, adminContent);

console.log('Text Rebranding complete.');
