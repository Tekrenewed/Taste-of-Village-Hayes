/**
 * Customer Loyalty Service — Firestore-backed CRM
 * 
 * Tracks customer visits, spend, and loyalty points.
 * Points are earned at 1 point per £1 spent (rounded down).
 * 
 * Collection: `customers` (keyed by phone number hash)
 */

import { doc, getDoc, setDoc, updateDoc, increment, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const CUSTOMERS_COLLECTION = 'customers';

export interface CustomerRecord {
  id: string;          // Firestore doc ID (phone number sanitized)
  phone: string;       // Original phone number
  name: string;        // Most recent name used
  totalSpent: number;  // Lifetime spend in £
  orderCount: number;  // Total number of orders
  loyaltyPoints: number; // 1 point per £1
  lastOrderAt: string; // ISO timestamp
  createdAt: string;   // ISO timestamp
}

/**
 * Sanitize phone number to use as a Firestore document ID.
 * Strips spaces, dashes, and special chars.
 */
function phoneToDocId(phone: string): string {
  return phone.replace(/[^0-9+]/g, '').replace(/^\+/, 'p');
}

/**
 * Look up a customer by phone number.
 * Returns null if not found.
 */
export async function getCustomer(phone: string): Promise<CustomerRecord | null> {
  if (!phone || phone.trim().length < 5) return null;
  
  try {
    const docId = phoneToDocId(phone);
    const docRef = doc(db, CUSTOMERS_COLLECTION, docId);
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as CustomerRecord;
    }
    return null;
  } catch (err) {
    console.error('[CRM] Failed to look up customer:', err);
    return null;
  }
}

/**
 * Upsert a customer record after an order is completed.
 * - New customer: creates a record with initial points
 * - Existing customer: increments spend, count, and points
 */
export async function upsertCustomerOnOrder(
  phone: string,
  name: string,
  orderTotal: number
): Promise<void> {
  if (!phone || phone.trim().length < 5) return;
  
  const docId = phoneToDocId(phone);
  const docRef = doc(db, CUSTOMERS_COLLECTION, docId);
  const pointsEarned = Math.floor(orderTotal); // 1 point per £1
  
  try {
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
      // Existing customer — increment fields
      await updateDoc(docRef, {
        name: name || snap.data().name, // Update name if provided
        totalSpent: increment(orderTotal),
        orderCount: increment(1),
        loyaltyPoints: increment(pointsEarned),
        lastOrderAt: new Date().toISOString(),
      });
      console.log(`[CRM] Updated customer ${phone}: +${pointsEarned} pts`);
    } else {
      // New customer — create record
      await setDoc(docRef, {
        phone,
        name: name || 'Guest',
        totalSpent: orderTotal,
        orderCount: 1,
        loyaltyPoints: pointsEarned,
        lastOrderAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      console.log(`[CRM] Created new customer ${phone}: ${pointsEarned} pts`);
    }
  } catch (err) {
    console.error('[CRM] Failed to upsert customer:', err);
    // Non-fatal — order still goes through even if CRM fails
  }
}

/**
 * Get all customers, sorted by loyalty points (top fans first).
 */
export async function getAllCustomers(maxResults: number = 100): Promise<CustomerRecord[]> {
  try {
    const q = query(
      collection(db, CUSTOMERS_COLLECTION),
      orderBy('loyaltyPoints', 'desc'),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomerRecord));
  } catch (err) {
    console.error('[CRM] Failed to fetch customers:', err);
    return [];
  }
}

/**
 * Redeem loyalty points for a customer.
 * Returns true if successful, false if insufficient points.
 */
export async function redeemPoints(phone: string, points: number): Promise<boolean> {
  if (!phone) return false;
  
  const customer = await getCustomer(phone);
  if (!customer || customer.loyaltyPoints < points) return false;
  
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, phoneToDocId(phone));
    await updateDoc(docRef, {
      loyaltyPoints: increment(-points),
    });
    console.log(`[CRM] Redeemed ${points} pts for ${phone}`);
    return true;
  } catch (err) {
    console.error('[CRM] Failed to redeem points:', err);
    return false;
  }
}
