/**
 * Menu Migration Script — Seeds all menu items from constants.ts into Firestore.
 * Run once: node --loader ts-node/esm frontend/scripts/seed-menu.ts
 * 
 * Or more practically, this runs from the Admin Dashboard's "Sync Menu" button.
 */
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { MENU_ITEMS, BUILDER_CONFIG } from '../constants';

const MENU_COLLECTION = 'menu_items';
const SETTINGS_COLLECTION = 'settings';

/**
 * Seeds all hardcoded menu items into Firestore.
 * Uses the item's `id` as the doc ID for idempotent writes (safe to run multiple times).
 */
export async function seedMenuToFirestore(): Promise<{ seeded: number; skipped: number }> {
  let seeded = 0;
  let skipped = 0;

  // Check what already exists
  const existing = await getDocs(collection(db, MENU_COLLECTION));
  const existingIds = new Set(existing.docs.map(d => d.id));

  for (const item of MENU_ITEMS) {
    if (existingIds.has(item.id)) {
      skipped++;
      continue;
    }

    await setDoc(doc(db, MENU_COLLECTION, item.id), {
      ...item,
      active: true,        // Can be toggled to hide items without deleting
      sortOrder: MENU_ITEMS.indexOf(item),  // Preserve display order
      createdAt: new Date(),
    });
    seeded++;
  }

  // Also seed builder config
  await setDoc(doc(db, SETTINGS_COLLECTION, 'builder_config'), {
    ...BUILDER_CONFIG,
    updatedAt: new Date(),
  });

  console.log(`[MenuSeed] ${seeded} items seeded, ${skipped} already existed`);
  return { seeded, skipped };
}

/**
 * Updates image URLs in Firestore to match constants.ts.
 * Fixes stale/broken image paths without touching other fields.
 */
export async function updateMenuImages(): Promise<{ updated: number; skipped: number }> {
  let updated = 0;
  let skipped = 0;

  const imageMap = new Map<string, string>();
  for (const item of MENU_ITEMS) {
    imageMap.set(item.id, item.image);
  }

  const existing = await getDocs(collection(db, MENU_COLLECTION));
  for (const docSnap of existing.docs) {
    const correctImage = imageMap.get(docSnap.id);
    if (!correctImage) { skipped++; continue; }
    
    const currentImage = docSnap.data().image;
    if (currentImage !== correctImage) {
      await setDoc(doc(db, MENU_COLLECTION, docSnap.id), { image: correctImage }, { merge: true });
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`[ImageSync] ${updated} images updated, ${skipped} already correct`);
  return { updated, skipped };
}
