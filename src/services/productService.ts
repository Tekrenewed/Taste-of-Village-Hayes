import { MenuItem } from '../types';
import { FEATURES } from '../shopConfig';
import { MENU_ITEMS as FALLBACK_MENU } from '../constants';
import type { FullMenuItem } from '../components/CustomisationModal';

const API_BASE = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://localhost:8080') : '';

export async function fetchLiveMenu(): Promise<FullMenuItem[]> {
  if (!FEATURES.USE_API_MENU) {
    return Promise.resolve(FALLBACK_MENU as FullMenuItem[]);
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/catalog`);
    if (!res.ok) {
      console.warn(`[ProductService] Catalog API returned ${res.status}. Falling back to constants.ts`);
      return FALLBACK_MENU as FullMenuItem[];
    }

    const data: Array<{
      id: string;
      brand_id: string;
      name: string;
      category: string;
      base_price: number;
      description: string;
      image_url: string;
      is_86d: boolean;
      is_active: boolean;
      variants?: any[];
      modifier_groups?: any[];
      allergens?: any[];
      nutrition?: any;
    }> = await res.json();

    if (!data || data.length === 0) {
      console.warn('[ProductService] Catalog is empty. Falling back to constants.ts');
      return FALLBACK_MENU as FullMenuItem[];
    }

    // Helper to normalize names for robust matching (removes spaces, punctuation)
    const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Fallback map for images and missing prices (DB may not have images or prices seeded yet)
    const fallbackMap = new Map(FALLBACK_MENU.map(m => [normalizeName(m.name), m]));

    const mappedItems: FullMenuItem[] = data.map(item => {
      const fallback = fallbackMap.get(normalizeName(item.name));
      
      const dbPrice = Number(item.base_price);
      // If DB price is 0, we fallback to constants.ts price. If neither, 0.
      const finalPrice = dbPrice > 0 ? dbPrice : (fallback?.price || 0);

      if (dbPrice === 0 && finalPrice === 0 && !item.is_86d) {
        console.warn(`[ProductService] Item "${item.name}" has 0 price in DB and no fallback price found.`);
      }

      return {
        id: item.id,
        name: item.name,
        // Prefer DB description (real menu copy), fallback to constants
        description: item.description || fallback?.description || '',
        category: formatCategory(item.category) as any,
        // Prefer DB price, fallback to constants if 0 (because we haven't seeded all DB prices yet)
        price: finalPrice,
        originalPrice: finalPrice,
        // Prefer uploaded image URL, fallback to constants, then placeholder
        image: item.image_url || fallback?.image || '/assets/placeholder.png',
        popular: fallback?.popular ?? false,
        is86d: item.is_86d,
        // New customisation fields — pass through directly
        variants: item.variants?.length ? item.variants : undefined,
        modifier_groups: item.modifier_groups?.length ? item.modifier_groups : undefined,
        allergens: item.allergens?.length ? item.allergens : undefined,
        nutrition: item.nutrition ?? undefined,
      };
    });

    console.log(`[ProductService] Loaded ${mappedItems.length} items (${mappedItems.filter(i => i.variants?.length).length} with variants, ${mappedItems.filter(i => i.allergens?.length).length} with allergens)`);
    return mappedItems;

  } catch (error) {
    console.error('[ProductService] Network Error:', error);
    return FALLBACK_MENU as FullMenuItem[];
  }
}

function formatCategory(dbCat: string): string {
  const c = dbCat.toLowerCase();
  const MAP: Record<string, string> = {
    'taste-of-village':           'taste-of-village',
    'dessert':           'dessert',
    'signature dessert': 'signature_desserts',
    'grill':             'chaat',
    'lunch':             'lunch',
    'drinks':            'refreshments',
    'english breakfast': 'english_breakfast',
    'sweet breakfast':   'sweet_breakfast',
    'desi breakfast':    'desi_breakfast',
    'breakfast drinks':  'breakfast_drinks',
    'ice cream':         'ice_cream',
    'salad':             'salad',
    'cake':              'cake',
  };
  return MAP[c] ?? c;
}
