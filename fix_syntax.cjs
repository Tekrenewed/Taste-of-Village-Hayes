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

    // Fix identifiers with spaces
    content = content.replace(/Taste of Village([A-Z])/g, 'TasteOfVillage$1');
    content = content.replace(/([a-z])Taste of Village/g, '$1TasteOfVillage');
    content = content.replace(/isTaste-of-village/g, 'isTasteOfVillage');
    content = content.replace(/taste-of-village([A-Z])/g, 'tasteOfVillage$1');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed syntax in:', filePath);
    }
  }
});

console.log('Syntax fix complete.');
