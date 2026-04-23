import { doc, setDoc, updateDoc, getDoc, getDocs, collection, query, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import { MenuItem, BuilderConfig } from '../types';
import { BUILDER_CONFIG } from '../constants';
import tovMenuData from '../data/tov-menu.json';
import { FEATURES } from '../shopConfig';
import { fetchLiveMenu } from './productService';

const BUILDER_DOC_ID = 'builder_config';
const SETTINGS_COLLECTION = 'settings';
const MENU_COLLECTION = 'menu_items';

// In-memory cache to avoid repeated Firestore reads per page load
let cachedMenu: MenuItem[] | null = null;

/**
 * Returns menu items from PostgreSQL or Firestore based on flag.
 */
export async function getMenuItems(): Promise<MenuItem[]> {
  if (cachedMenu) return cachedMenu;

  if (FEATURES.USE_API_MENU) {
    cachedMenu = await fetchLiveMenu();
    return cachedMenu;
  }

  try {
    const snapshot = await getDocs(
      query(collection(db, MENU_COLLECTION), orderBy('sortOrder', 'asc'))
    );

    if (!snapshot.empty) {
      cachedMenu = snapshot.docs
        .map(d => ({ ...d.data(), id: d.id }) as MenuItem & { active?: boolean })
        .filter(item => (item as any).active !== false); // Respect active flag
      return cachedMenu;
    }
  } catch (error) {
    console.warn('[Menu] Firestore load failed, using constants fallback:', error);
  }

  // Fallback to hardcoded constants
  cachedMenu = tovMenuData as MenuItem[];
  return cachedMenu;
}

/**
 * Streams menu items by polling the live menu.
 */
export function streamMenuItems(callback: (items: MenuItem[]) => void): () => void {
  let isCancelled = false;

  const fetchMenu = async () => {
    try {
      // Regardless of USE_API_MENU flag, we are moving away from direct firestore listener here
      // fetchLiveMenu automatically handles falling back if needed in productService.ts
      const items = await fetchLiveMenu();
      if (!isCancelled) {
        cachedMenu = items;
        callback(items);
      }
    } catch (err) {
      console.error('[Menu] Polling error:', err);
      if (!isCancelled) callback(tovMenuData as MenuItem[]); // Fallback
    }
  };

  fetchMenu();
  const interval = setInterval(fetchMenu, 60000); // Poll every minute

  return () => {
    isCancelled = true;
    clearInterval(interval);
  };
}

/**
 * Invalidate the menu cache (call after admin edits).
 */
export function invalidateMenuCache() {
  cachedMenu = null;
}

/**
 * Adds a new menu item to Firestore.
 */
export async function addMenuItem(item: MenuItem): Promise<void> {
  const snapshot = await getDocs(collection(db, MENU_COLLECTION));
  const docRef = doc(db, MENU_COLLECTION, item.id);
  await setDoc(docRef, {
    ...item,
    active: true,
    sortOrder: snapshot.size, // Append to end
    createdAt: new Date(),
  });
  invalidateMenuCache();
}

/**
 * Updates a specific menu item (e.g. price or name) in Firestore.
 */
export async function updateMenuItem(id: string, data: Partial<MenuItem>): Promise<void> {
  try {
    const docRef = doc(db, MENU_COLLECTION, id);
    await updateDoc(docRef, { ...data, updatedAt: new Date() });
    invalidateMenuCache();
  } catch (error) {
    console.error("Error updating menu item:", error);
    throw error;
  }
}

/**
 * Soft-deletes a menu item by setting active=false.
 */
export async function deactivateMenuItem(id: string): Promise<void> {
  const docRef = doc(db, MENU_COLLECTION, id);
  await updateDoc(docRef, { active: false, updatedAt: new Date() });
  invalidateMenuCache();
}

/**
 * Fetches the Builder Configuration from Firestore (falls back to constants).
 */
export async function getBuilderConfig(): Promise<BuilderConfig | null> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, BUILDER_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as BuilderConfig;
    }
  } catch (error) {
    console.warn('[Builder] Firestore load failed, using constants fallback:', error);
  }
  return BUILDER_CONFIG;
}

/**
 * Saves or updates the Builder Configuration.
 */
export async function saveBuilderConfig(config: BuilderConfig): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, BUILDER_DOC_ID);
    await setDoc(docRef, { ...config, updatedAt: new Date() });
  } catch (error) {
    console.error("Error saving builder config:", error);
    throw error;
  }
}

/**
 * Uploads a menu item image to Firebase Storage and updates the Firestore doc.
 * Images are stored at: menu-images/{itemId}
 * Returns the public download URL.
 */
export async function uploadMenuImage(itemId: string, file: File): Promise<string> {
  // Create a storage reference
  const ext = file.name.split('.').pop() || 'jpg';
  const storageRef = ref(storage, `menu-images/${itemId}.${ext}`);

  // Upload the file
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: { itemId, uploadedAt: new Date().toISOString() },
  });

  // Get the download URL
  const downloadURL = await getDownloadURL(snapshot.ref);

  // Update the Firestore menu item with the new image URL
  const docRef = doc(db, MENU_COLLECTION, itemId);
  await updateDoc(docRef, { image: downloadURL, updatedAt: new Date() });
  invalidateMenuCache();

  return downloadURL;
}
