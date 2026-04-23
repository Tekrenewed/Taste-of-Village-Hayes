/**
 * Realtime Adapter Types
 * 
 * These types define the "standard plug socket" interface.
 * Both firestoreAdapter and future websocketAdapter must
 * conform to these same function signatures.
 * 
 * UI components import ONLY from hooks (useRealtimeOrders, etc).
 * Hooks import ONLY from this adapter layer.
 * The adapter layer is the ONLY place that touches Firestore/WebSocket.
 */

import { Order, Booking } from '../types';

// ─── Subscription Function Signature ───
// Every adapter returns an unsubscribe function.
// This is the universal contract.
export type Unsubscribe = () => void;

// ─── Order Adapter ───
export interface OrderAdapter {
  /** Subscribe to live order updates for a tenant */
  subscribeToOrders(
    tenantId: string,
    callback: (orders: Order[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe;

  /** Subscribe to a single order (for tracking page) */
  subscribeToSingleOrder(
    orderId: string,
    callback: (order: Order | null) => void,
    onError?: (error: Error) => void
  ): Unsubscribe;

  /** Write an order (POS/Web submission) */
  createOrder(order: Order): Promise<void>;

  /** Update fields on an order */
  updateOrder(orderId: string, fields: Record<string, any>): Promise<void>;
}

// ─── Booking Adapter ───
export interface BookingAdapter {
  /** Subscribe to live booking updates */
  subscribeToBookings(
    callback: (bookings: Booking[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe;

  /** Create a new booking */
  createBooking(booking: Booking): Promise<void>;

  /** Update fields on a booking */
  updateBooking(bookingId: string, fields: Record<string, any>): Promise<void>;
}

// ─── Menu Adapter ───
export interface MenuAdapter {
  /** Subscribe to live sold-out list changes */
  subscribeToSoldOut(
    callback: (soldOutItems: string[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe;
}

// ─── Combined Adapter (for the Provider) ───
export interface RealtimeAdapter {
  orders: OrderAdapter;
  bookings: BookingAdapter;
  menu: MenuAdapter;
}
