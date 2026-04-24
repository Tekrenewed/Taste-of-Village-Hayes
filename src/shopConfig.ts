/**
 * Taste of Village — Central Shop Configuration
 * 
 * UPDATE THESE VALUES with your real shop details.
 * Every component reads from here, so you only need to change them once.
 */

/**
 * Taste of Village Hayes — Central Shop Configuration
 */

export const SHOP_CONFIG = {
  tenant_id: 'tov00da2-4444-4444-4444-000000000004',
  name: 'Taste Of Village',
  tagline: 'Authentic Desi Taste from Lahore & Gujranwala',
  whatsappNumber: '442034093786', // WhatsApp using landline format (or update with mobile if known)
  phoneNumber: '020 3409 3786',
  phoneNumberRaw: '+442034093786',
  address: '766B Uxbridge Rd, Hayes',
  postcode: 'UB4 0RU',
  w3w: '///example.words.here',
  instagram: 'https://www.instagram.com/tasteofvillagehayes/', // Placeholder
  facebook: 'https://www.facebook.com/p/Taste-of-Village-61551672639808/',
  tiktok: 'https://www.tiktok.com/@tasteofvillage1',
  website: 'https://tasteofvillagehayes.uk',
  openingHours: '12:00 PM – 11:00 PM',
  openingDays: 'Monday – Sunday',
  googleReviewUrl: 'https://share.google/53U4LKNE2c2wZ18rc',
} as const;

/**
 * 🚀 FEATURE FLAGS & ENVIRONMENT VARIABLES
 * - USE_API_MENU: If true, pulls Live Products from PostgreSQL (Taste of Village OS).
 *   If false, falls back to static `constants.ts` JSON for 100% uptime safety.
 */
export const FEATURES = {
  USE_API_MENU: import.meta.env.VITE_USE_API_MENU === 'false' ? false : true,
} as const;

/**
 * Active Promotion — change this ONE object to update the promo across the entire site.
 * Set `enabled: false` to disable all promotional pricing.
 */
export const ACTIVE_PROMO = {
  enabled: false,
  /** Multiplier applied to cart total (0.8 = 20% off, 0.7 = 30% off, 1.0 = no discount) */
  multiplier: 0.8,
  /** Percentage off (used for display labels) */
  percentOff: 20,
  /** Label shown next to the total in the cart */
  cartLabel: '-20% Applied',
  /** Text shown on the floating cart button */
  floatingLabel: '-20% OFF',
  /** Banner headline */
  bannerHeadline: '20% Off Your Entire Order Today!',
  /** Banner subtitle */
  bannerSubtitle: 'We love our social media family. Booking online? The 20% discount is applied automatically to your cart.',
  /** Banner fine print */
  bannerFinePrint: 'Prefer to order at the counter? Order in-store, show us your latest like or comment on our page, and we will apply the 20% discount manually at the till!',
} as const;

/**
 * Builds a WhatsApp deeplink URL with a pre-filled message.
 * This is 100% free — it just opens WhatsApp on the user's device.
 */
export function buildWhatsAppLink(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=${encoded}`;
}

/**
 * Builds a formatted WhatsApp order message from order details.
 */
export function buildOrderWhatsAppMessage(order: {
  id: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}): string {
  const itemLines = order.items
    .map(item => `• ${item.quantity}x ${item.name} — £${(item.price * item.quantity).toFixed(2)}`)
    .join('\n');

  return [
    `🧾 *NEW ORDER — ${order.id}*`,
    ``,
    `👤 *Customer:* ${order.customerName}`,
    `📞 *Phone:* ${order.customerPhone}`,
    `🏷️ *Type:* Collection`,
    ``,
    `*Items:*`,
    itemLines,
    ``,
    `💰 *Total: £${order.total.toFixed(2)}*`,
    ``,
    `⏰ Order placed: ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
  ].join('\n');
}
