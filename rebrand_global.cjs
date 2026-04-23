const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    let originalContent = content;

    content = content.replace(/Falooda & Co/gi, 'Taste of Village');
    content = content.replace(/Falooda OS/gi, 'Taste of Village OS');
    content = content.replace(/FALOODA/g, 'TASTE OF VILLAGE');
    content = content.replace(/falooda/g, 'taste-of-village'); 
    content = content.replace(/Falooda/g, 'Taste of Village');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log('Rebranded:', filePath);
    }
  }
});

console.log('Global rebranding complete.');
