import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const STORE_ID = 'f4100da2-1111-1111-1111-000000000001';
const BASE_URL = 'https://www.taste-of-villageandco.co.uk/#/order';
const NUM_TABLES = 10;
const OUTPUT_DIR = path.join(__dirname, '..', 'qr_outputs');

// Make output dir if not exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log(`Generating QR codes for ${NUM_TABLES} tables...`);

const generateQRs = async () => {
  for (let table = 1; table <= NUM_TABLES; table++) {
    const url = `${BASE_URL}?store=${STORE_ID}&table=${table}`;
    const filename = path.join(OUTPUT_DIR, `Table_${table}_QR.png`);
    
    try {
      await QRCode.toFile(filename, url, {
        color: {
          dark: '#2A1F1F',  // Brand Obsidian
          light: '#0000' // Transparent background
        },
        width: 1024,
        margin: 2
      });
      console.log(`✅ Generated: ${filename}`);
      console.log(`   URL: ${url}`);
    } catch (err) {
      console.error(`❌ Failed to generate QR for Table ${table}:`, err);
    }
  }
  
  // Also generate a generic "Collection" QR code
  try {
    const collectionUrl = `${BASE_URL}?store=${STORE_ID}`;
    const collectionFilename = path.join(OUTPUT_DIR, `Collection_QR.png`);
    await QRCode.toFile(collectionFilename, collectionUrl, {
      color: { dark: '#2A1F1F', light: '#0000' },
      width: 1024, margin: 2
    });
    console.log(`✅ Generated Collection Order QR: ${collectionFilename}`);
  } catch(err) {
     console.error(`❌ Failed to generate Collection QR:`, err);
  }
  
  console.log('\n🎉 Finished generating all QR codes! Check the /qr_outputs folder.');
};

generateQRs();
