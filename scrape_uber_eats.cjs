const https = require('https');
const fs = require('fs');
const path = require('path');

const URL = 'https://www.ubereats.com/gb/store/taste-of-village/qr14IwsCQfqrajk2wgY7Ig?srsltid=AfmBOopP-Qnyw_75NVBGfWha2yrEX_wYDTi0EU7j3WBLbRjvDcGpCA_F';

async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

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
  console.log('Fetching UberEats page...');
  const html = await fetchHtml(URL);
  
  console.log('Parsing __NEXT_DATA__...');
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
  
  if (!match) {
    console.log('Could not find __NEXT_DATA__, maybe they changed the structure or it requires JS. Attempting regex extraction of image URLs...');
    // Fallback: Just extract all high res image URLs we can find in the HTML
    const imgMatches = [...html.matchAll(/https:\/\/cn-geo1\.uber\.com\/image-proc\/resize\/eats\/format=webp\/width=\d+\/height=\d+\/ext=png\/quality=70\/srcb64=([a-zA-Z0-9+/=]+)/g)];
    console.log(`Found ${imgMatches.length} raw image URLs`);
    // But we need names and prices too. The read_url_content tool already gave us names and prices.
    return;
  }
  
  const nextData = JSON.parse(match[1]);
  // The structure is deeply nested. Let's recursively search for menu items
  const items = [];
  
  function searchItems(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    // Look for item signatures
    if (obj.title && obj.price && obj.uuid) {
        let price = obj.price;
        if (typeof price === 'object' && price.formattedPrice) {
            items.push(obj);
        }
    }
    
    for (const key in obj) {
      searchItems(obj[key]);
    }
  }
  
  searchItems(nextData);
  
  console.log(`Found ${items.length} items from JSON`);
  
  if (items.length === 0) {
     console.log('Fallback to regex extraction...');
     // Regex for titles and prices is hard. Let's write the HTML to a file and look at it.
     fs.writeFileSync('ubereats_raw.html', html);
     return;
  }

  // Deduplicate
  const uniqueItems = [];
  const seen = new Set();
  for (const item of items) {
    if (!seen.has(item.title)) {
      seen.add(item.title);
      uniqueItems.push(item);
    }
  }

  console.log(`Found ${uniqueItems.length} unique items`);

  const outDir = path.join(__dirname, 'public', 'assets', 'menu-tov');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const finalMenu = [];

  for (let i = 0; i < uniqueItems.length; i++) {
    const item = uniqueItems[i];
    let localImagePath = null;
    let localImageRef = null;

    let imgUrl = null;
    if (item.imageUrl) imgUrl = item.imageUrl;
    else if (item.image && item.image.items && item.image.items[0]) imgUrl = item.image.items[0].url;

    if (imgUrl) {
      // try to get highest res image by replacing width parameters
      let highResUrl = imgUrl.replace(/w=\d+/, 'w=1000').replace(/h=\d+/, 'h=1000');
      if (highResUrl.includes('srcb64')) {
          // Uber uses base64 encoded source urls often. We can just use the provided url.
      }
      
      const filename = `item_${i}.jpg`;
      localImagePath = path.join(outDir, filename);
      localImageRef = `/assets/menu-tov/${filename}`;
      
      try {
        await downloadImage(highResUrl, localImagePath);
        console.log(`Downloaded image for ${item.title}`);
      } catch (e) {
        console.error(`Failed to download image for ${item.title}:`, e.message);
        localImageRef = null;
      }
    }

    let priceVal = 0;
    if (typeof item.price === 'number') priceVal = item.price / 100;
    else if (item.price && item.price.formattedPrice) priceVal = parseFloat(item.price.formattedPrice.replace(/[^0-9.]/g, ''));

    finalMenu.push({
      id: `tov_${item.uuid || i}`,
      name: item.title,
      description: item.itemDescription || '', 
      price: priceVal,
      originalPrice: priceVal,
      category: 'menu', // We could try to map this if we had the hierarchy
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
