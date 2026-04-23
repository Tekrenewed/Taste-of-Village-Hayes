/**
 * Loyalty & Rewards Engine
 * 
 * - Tracks per-customer purchase history (item counts, category counts, spend)
 * - Evaluates reward rules after every completed order
 * - Generates rewards (free items, discounts) at milestones
 * - Exposes getCustomerProfile / getRewards for customer-facing pages
 */

import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { CustomerProfile, Reward, RewardRule, Order, CartItem } from '../types';

const CUSTOMERS_COLLECTION = 'customers';

// ─── Default Reward Rules ───
// These are the active rules. Configurable from admin in the future.
export const DEFAULT_REWARD_RULES: RewardRule[] = [
  {
    id: 'falooda_5th_free',
    type: 'category_milestone',
    category: 'falooda',
    threshold: 5,
    rewardType: 'free_item',
    description: 'Every 5th falooda is on us! 🍨',
    active: true,
  },
  {
    id: 'chaat_5th_free',
    type: 'category_milestone',
    category: 'chaat',
    threshold: 5,
    rewardType: 'free_item',
    description: 'Every 5th chaat portion is free! 🎉',
    active: true,
  },
  {
    id: 'spend_50_reward',
    type: 'spend_milestone',
    threshold: 50,
    rewardType: 'discount_fixed',
    rewardValue: 5,
    description: 'Spend £50, get £5 off your next order! 💰',
    active: true,
  },
  {
    id: 'breakfast_5th_free',
    type: 'category_milestone',
    category: 'breakfast',
    threshold: 5,
    rewardType: 'free_item',
    description: 'Every 5th breakfast is on us! 🍳',
    active: true,
  },
];

// ─── Phone Normalisation ───
function normalisePhone(phone: string): string {
  return phone.replace(/\s+/g, '').replace(/^(\+44|0044)/, '0');
}

// ─── Birthday Reward Check ───
// Returns a 10% discount reward valid for the entire birthday month
function checkBirthdayReward(customer: CustomerProfile): Reward | null {
  const birthday = (customer as any).birthday;
  if (!birthday || !birthday.month || !birthday.day) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Check if we've already given a birthday reward this year
  const birthdayRewardYear = (customer as any).birthdayRewardYear;
  if (birthdayRewardYear === currentYear) return null;

  // Check if current month is the birthday month
  const currentMonth = now.getMonth() + 1; // 1-indexed
  if (currentMonth !== birthday.month) return null;

  // Calculate end of birthday month for expiry
  const endOfMonth = new Date(currentYear, birthday.month, 0, 23, 59, 59); // last day of month

  return {
    id: `birthday_${currentYear}_${Date.now()}`,
    type: 'discount_percent',
    value: 10,
    reason: '🎂 Happy Birthday! 10% off ALL orders this month!',
    status: 'available',
    createdAt: new Date(),
    expiresAt: endOfMonth,
  };
}

// ─── Get or Create Customer Profile ───
export async function getOrCreateCustomer(
  phone: string,
  name?: string,
  email?: string,
  birthday?: { month: number; day: number }
): Promise<CustomerProfile> {
  const normPhone = normalisePhone(phone);
  const docRef = doc(db, CUSTOMERS_COLLECTION, normPhone);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const data = snap.data();
    // Update name/email/birthday if provided and not yet set
    const updates: any = {};
    if (name && !data.name) updates.name = name;
    if (email && !data.email) updates.email = email;
    if (birthday && !data.birthday) updates.birthday = birthday;
    if (Object.keys(updates).length > 0) {
      await updateDoc(docRef, updates);
    }
    return {
      ...data,
      ...updates,
      id: snap.id,
      rewards: data.rewards || [],
      joinedAt: data.joinedAt?.toDate ? data.joinedAt.toDate() : new Date(data.joinedAt),
      lastOrderAt: data.lastOrderAt?.toDate ? data.lastOrderAt.toDate() : new Date(data.lastOrderAt),
    } as CustomerProfile;
  }

  // New customer
  const newProfile: any = {
    name: name || 'Customer',
    email: email || '',
    phone: normPhone,
    totalOrders: 0,
    totalSpent: 0,
    itemCounts: {},
    categoryCounts: {},
    rewards: [],
    joinedAt: new Date(),
    lastOrderAt: new Date(),
    ...(birthday ? { birthday } : {}),
  };

  await setDoc(docRef, newProfile);
  return { ...newProfile, id: normPhone } as CustomerProfile;
}

/**
 * Updates a customer's birthday (can be called from rewards page).
 */
export async function updateCustomerBirthday(
  phone: string,
  birthday: { month: number; day: number }
): Promise<void> {
  const normPhone = normalisePhone(phone);
  const docRef = doc(db, CUSTOMERS_COLLECTION, normPhone);
  await updateDoc(docRef, { birthday });
}

// ─── Get Customer Profile (read-only) ───
export async function getCustomerProfile(phone: string): Promise<CustomerProfile | null> {
  const normPhone = normalisePhone(phone);
  const docRef = doc(db, CUSTOMERS_COLLECTION, normPhone);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    id: snap.id,
    rewards: data.rewards || [],
    joinedAt: data.joinedAt?.toDate ? data.joinedAt.toDate() : new Date(data.joinedAt),
    lastOrderAt: data.lastOrderAt?.toDate ? data.lastOrderAt.toDate() : new Date(data.lastOrderAt),
  } as CustomerProfile;
}

// ─── Process Order Completion → Update Profile + Check Rewards ───
export async function processOrderForLoyalty(order: Order): Promise<Reward[]> {
  if (!order.customerPhone) return [];

  const customer = await getOrCreateCustomer(
    order.customerPhone,
    order.customerName
  );
  const normPhone = normalisePhone(order.customerPhone);
  const docRef = doc(db, CUSTOMERS_COLLECTION, normPhone);

  // Increment counters
  const newItemCounts = { ...customer.itemCounts };
  const newCategoryCounts = { ...customer.categoryCounts };

// ─── Category Aliases ───
// Maps sub-categories to a parent for loyalty counting
// e.g. english_breakfast, sweet_breakfast, desi_breakfast → "breakfast"
const CATEGORY_ALIASES: Record<string, string> = {
  english_breakfast: 'breakfast',
  sweet_breakfast: 'breakfast',
  desi_breakfast: 'breakfast',
  breakfast_drinks: 'breakfast',
};

  order.items.forEach((item: CartItem) => {
    const itemId = item.id;
    const category = item.category;
    const qty = item.quantity || 1;

    newItemCounts[itemId] = (newItemCounts[itemId] || 0) + qty;
    if (category) {
      // Count the raw category
      newCategoryCounts[category] = (newCategoryCounts[category] || 0) + qty;
      // Also count the aliased parent category (e.g. english_breakfast → breakfast)
      const alias = CATEGORY_ALIASES[category];
      if (alias) {
        newCategoryCounts[alias] = (newCategoryCounts[alias] || 0) + qty;
      }
    }
  });

  const newTotalOrders = customer.totalOrders + 1;
  const newTotalSpent = customer.totalSpent + order.total;

  // Evaluate rules → generate new rewards
  const newRewards: Reward[] = [];

  for (const rule of DEFAULT_REWARD_RULES) {
    if (!rule.active) continue;

    if (rule.type === 'category_milestone' && rule.category) {
      const oldCount = customer.categoryCounts[rule.category] || 0;
      const newCount = newCategoryCounts[rule.category] || 0;

      // Check if we crossed a milestone threshold
      const oldMilestones = Math.floor(oldCount / rule.threshold);
      const newMilestones = Math.floor(newCount / rule.threshold);

      if (newMilestones > oldMilestones) {
        const reward: Reward = {
          id: `${rule.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type: rule.rewardType,
          category: rule.category,
          reason: rule.description,
          status: 'available',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        };
        if (rule.rewardValue) reward.value = rule.rewardValue;
        newRewards.push(reward);
      }
    }

    if (rule.type === 'spend_milestone') {
      const oldMilestones = Math.floor(customer.totalSpent / rule.threshold);
      const newMilestones = Math.floor(newTotalSpent / rule.threshold);

      if (newMilestones > oldMilestones) {
        const reward: Reward = {
          id: `${rule.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type: rule.rewardType,
          value: rule.rewardValue,
          reason: rule.description,
          status: 'available',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };
        newRewards.push(reward);
      }
    }
  }

  // Check for birthday reward
  const birthdayReward = checkBirthdayReward({
    ...customer,
    totalOrders: newTotalOrders,
    totalSpent: newTotalSpent,
  });
  if (birthdayReward) {
    newRewards.push(birthdayReward);
  }

  // Save everything
  const allRewards = [...(customer.rewards || []), ...newRewards];

  const updatePayload: any = {
    totalOrders: newTotalOrders,
    totalSpent: newTotalSpent,
    itemCounts: newItemCounts,
    categoryCounts: newCategoryCounts,
    rewards: allRewards.map(r => ({
      ...r,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      expiresAt: r.expiresAt instanceof Date ? r.expiresAt.toISOString() : r.expiresAt,
      ...(r.redeemedAt ? { redeemedAt: r.redeemedAt instanceof Date ? r.redeemedAt.toISOString() : r.redeemedAt } : {}),
    })),
    lastOrderAt: new Date().toISOString(),
  };

  // Mark birthday reward year to prevent duplicates
  if (birthdayReward) {
    updatePayload.birthdayRewardYear = new Date().getFullYear();
  }

  await updateDoc(docRef, updatePayload);

  return newRewards;
}

// ─── Get Available Rewards for Customer ───
export async function getAvailableRewards(phone: string): Promise<Reward[]> {
  const customer = await getCustomerProfile(phone);
  if (!customer) return [];

  const now = new Date();
  return customer.rewards.filter(r =>
    r.status === 'available' &&
    new Date(r.expiresAt) > now
  );
}

// ─── Redeem a Reward ───
export async function redeemReward(phone: string, rewardId: string, orderId?: string): Promise<boolean> {
  const normPhone = normalisePhone(phone);
  const docRef = doc(db, CUSTOMERS_COLLECTION, normPhone);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return false;

  const data = snap.data();
  const now = new Date();
  const rewards = (data.rewards || []).map((r: any) => {
    if (r.id === rewardId && r.status === 'available' && new Date(r.expiresAt) > now) {
      return {
        ...r,
        status: 'redeemed',
        redeemedAt: new Date().toISOString(),
        redeemedOrderId: orderId || '',
      };
    }
    return r;
  });

  await updateDoc(docRef, { rewards });
  return true;
}

// ─── Get loyalty progress (for UI display) ───
export function getLoyaltyProgress(profile: CustomerProfile): {
  category: string;
  currentCount: number;
  threshold: number;
  remaining: number;
  progressPercent: number;
}[] {
  return DEFAULT_REWARD_RULES
    .filter(r => r.type === 'category_milestone' && r.active && r.category)
    .map(rule => {
      const count = profile.categoryCounts[rule.category!] || 0;
      const inCycle = count % rule.threshold;
      const remaining = rule.threshold - inCycle;
      return {
        category: rule.category!,
        currentCount: inCycle,
        threshold: rule.threshold,
        remaining,
        progressPercent: (inCycle / rule.threshold) * 100,
      };
    });
}

// ─── Get spend progress ───
export function getSpendProgress(profile: CustomerProfile): {
  currentSpent: number;
  threshold: number;
  remaining: number;
  progressPercent: number;
} | null {
  const rule = DEFAULT_REWARD_RULES.find(r => r.type === 'spend_milestone' && r.active);
  if (!rule) return null;
  const inCycle = profile.totalSpent % rule.threshold;
  return {
    currentSpent: inCycle,
    threshold: rule.threshold,
    remaining: Math.max(0, rule.threshold - inCycle),
    progressPercent: (inCycle / rule.threshold) * 100,
  };
}
