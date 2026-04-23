const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    });
  });
}

(async () => {
  // Read the JSON data
  const rawData = fs.readFileSync(path.join('C:\\Users\\DELL\\.gemini\\antigravity\\brain\\d47190d8-66ef-4ccc-8d72-fc6f5579478b\\browser\\scratchpad_r913kpwr.md'), 'utf-8');
  const jsonMatch = rawData.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch) {
    console.error('Could not find JSON block in scratchpad');
    return;
  }
  
  const extractedItems = JSON.parse(jsonMatch[1]);
  
  const outDir = path.join(__dirname, 'public', 'assets', 'menu-tov');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const finalMenu = [];

  for (let i = 0; i < extractedItems.length; i++) {
    const item = extractedItems[i];
    let localImagePath = null;
    let localImageRef = null;

    if (item.image && item.image.startsWith('http')) {
      const filename = `item_${i}.jpg`;
      localImagePath = path.join(outDir, filename);
      localImageRef = `/assets/menu-tov/${filename}`;
      
      try {
        await downloadImage(item.image, localImagePath);
        console.log(`Downloaded image for ${item.name}`);
      } catch (e) {
        console.error(`Failed to download image for ${item.name}:`, e.message);
        localImageRef = null;
      }
    }

    let priceVal = parseFloat(item.price.replace('£', ''));

    finalMenu.push({
      id: `tov_${i}`,
      name: item.name,
      description: item.description || '', 
      price: priceVal,
      originalPrice: priceVal,
      category: 'menu', 
      image: localImageRef || '/assets/placeholder.png',
      popular: false
    });
  }

  const dataDir = path.join(__dirname, 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(dataDir, 'tov-menu.json'), JSON.stringify(finalMenu, null, 2));
  console.log('Done generating tov-menu.json');

})();
