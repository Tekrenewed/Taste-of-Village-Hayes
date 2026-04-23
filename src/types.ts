export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'starters' | 'curries' | 'biryani' | 'naan_breads' | 'grills' | 'drinks' | 'desserts';
  image: string;
  popular?: boolean;
  is86d?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  modifiers?: Record<string, string>;
  _cartKey?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  type: 'delivery' | 'collection' | 'dine-in' | 'takeaway';
  items: CartItem[];
  total: number;
  status: 'web_holding' | 'pending' | 'preparing' | 'ready' | 'completed' | 'no_show';
  timestamp: Date & { seconds?: number; nanoseconds?: number };
  tableNumber?: string;
  table_number?: number;
  provider?: string;
  isPaid?: boolean;
  notes?: string;
  source?: 'Web' | 'POS' | 'NFC';
  payment_status?: 'paid' | 'unpaid';
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  email?: string;
  date: string;
  time: string;
  guests: number;
  status: 'PENDING' | 'CONFIRMED' | 'ARRIVED' | 'CANCELLED' | 'NO_SHOW' | 'pending' | 'confirmed' | 'cancelled';
  tableId?: string;
  /** Alias for customerName — used in admin table displays */
  name?: string;
}

export interface BuilderOption {
  id: string;
  name: string;
  price: number;
  description?: string;
  tag?: string;
}

export interface BuilderConfig {
  basePrice: number;
  bases: BuilderOption[];
  noodles: BuilderOption[];
  syrups: BuilderOption[];
  scoops: BuilderOption[];
  extras: BuilderOption[];
  toppings: BuilderOption[];
}

export type ViewMode = 'customer' | 'admin';

// ─── Loyalty & Rewards ───

export interface Reward {
  id: string;
  type: 'free_item' | 'discount_percent' | 'discount_fixed';
  itemName?: string;           // e.g. "Rose Falooda" — for free_item rewards
  category?: string;           // e.g. "falooda" — for category-level rewards
  value?: number;              // discount amount (% or £)
  reason: string;              // "5th falooda milestone"
  status: 'available' | 'redeemed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  redeemedAt?: Date;
  redeemedOrderId?: string;
}

export interface CustomerProfile {
  id: string;                  // phone number (normalised)
  name: string;
  email?: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  itemCounts: Record<string, number>;   // { "f_rose_falooda": 4, "c_samosa_chaat": 3 }
  categoryCounts: Record<string, number>; // { "falooda": 8, "chaat": 5 }
  rewards: Reward[];
  qrCode?: string;             // Base64 QR for kiosk scanning
  joinedAt: Date;
  lastOrderAt: Date;
}

export interface RewardRule {
  id: string;
  type: 'item_milestone' | 'category_milestone' | 'spend_milestone';
  category?: string;           // "falooda", "chaat"
  threshold: number;           // every Nth item/£N spent
  rewardType: 'free_item' | 'discount_percent' | 'discount_fixed';
  rewardValue?: number;
  description: string;         // "Every 5th falooda is free!"
  active: boolean;
}

// ─── Staff & Scheduling ───

export interface Staff {
  id: string;
  name: string;
  role: string;
  pin: string;
  points?: number;
  createdAt: Date;
}

export interface RotaEntry {
  id: string;
  staff_id: string;
  day: string;
  start_time: string;
  end_time: string;
}

// ─── Table Sessions & Alerts ───

export interface TableSession {
  tableId: string;
  cart: CartItem[];
  activeOrderId?: string;
  updatedAt: Date;
}

export interface TableAlert {
  id: string;
  tableId: string;
  type: 'waiter' | 'bill';
  status: 'active' | 'dismissed';
  createdAt: Date | any;
}