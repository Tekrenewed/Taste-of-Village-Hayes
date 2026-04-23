/**
 * RealtimeProvider — The Central Nervous System
 * 
 * This context provider manages ALL real-time subscriptions for the app.
 * UI components never touch Firestore/WebSocket directly — they use
 * custom hooks (useRealtimeOrders, useRealtimeBookings) that read from
 * this context.
 * 
 * Architecture:
 *   App.tsx wraps everything in <RealtimeProvider>
 *     → Provider creates the adapter (Firestore today, WebSocket tomorrow)
 *     → Provider manages subscriptions and holds the live data in state
 *     → Custom hooks read from this context
 *     → UI components use the hooks
 * 
 * To swap from Firestore to WebSocket:
 *   1. Create websocketAdapter.ts
 *   2. Change the import below from createFirestoreAdapter to createWebSocketAdapter
 *   3. Done. Every UI component stays exactly the same.
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { createPollingAdapter } from '../adapters/pollingAdapter';
import { SHOP_CONFIG } from '../shopConfig';
import type { RealtimeAdapter } from '../adapters/types';
import type { Order, Booking } from '../types';

// ─── Context Shape ───
interface RealtimeState {
  // Live data
  orders: Order[];
  bookings: Booking[];
  soldOutItems: string[];

  // Connection status
  isConnected: boolean;

  // Write operations (decoupled from the subscription layer)
  createOrder: (order: Order) => Promise<void>;
  updateOrder: (orderId: string, fields: Record<string, any>) => Promise<void>;
  createBooking: (booking: Booking) => Promise<void>;
  updateBooking: (bookingId: string, fields: Record<string, any>) => Promise<void>;

  // The raw adapter (escape hatch for edge cases)
  adapter: RealtimeAdapter;
}

const RealtimeContext = createContext<RealtimeState | null>(null);

// ─── Provider Component ───
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [soldOutItems, setSoldOutItems] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Create the adapter once and keep a stable reference
  const adapterRef = useRef<RealtimeAdapter | null>(null);
  if (!adapterRef.current) {
    // ┌─────────────────────────────────────────────────┐
    // │ THIS IS THE ONLY LINE YOU CHANGE TO SWAP INFRA  │
    // │ createFirestoreAdapter() → createWebSocketAdapter() │
    // └─────────────────────────────────────────────────┘
    adapterRef.current = createPollingAdapter();
  }
  const adapter = adapterRef.current;

  useEffect(() => {
    const tenantId = SHOP_CONFIG.tenant_id;

    // Subscribe to orders
    const unsubOrders = adapter.orders.subscribeToOrders(
      tenantId,
      (liveOrders) => {
        setOrders(liveOrders);
        setIsConnected(true);
      },
      (error) => {
        console.error('[RealtimeProvider] Order subscription error:', error);
        setIsConnected(false);
      }
    );

    // Subscribe to bookings
    const unsubBookings = adapter.bookings.subscribeToBookings(
      (liveBookings) => {
        setBookings(liveBookings);
      },
      (error) => {
        console.error('[RealtimeProvider] Booking subscription error:', error);
      }
    );

    // Subscribe to sold-out items
    const unsubSoldOut = adapter.menu.subscribeToSoldOut(
      (items) => {
        setSoldOutItems(items);
      },
      (error) => {
        console.error('[RealtimeProvider] Sold-out subscription error:', error);
      }
    );

    return () => {
      unsubOrders();
      unsubBookings();
      unsubSoldOut();
    };
  }, [adapter]);

  const value: RealtimeState = {
    orders,
    bookings,
    soldOutItems,
    isConnected,
    createOrder: (order) => adapter.orders.createOrder(order),
    updateOrder: (id, fields) => adapter.orders.updateOrder(id, fields),
    createBooking: (booking) => adapter.bookings.createBooking(booking),
    updateBooking: (id, fields) => adapter.bookings.updateBooking(id, fields),
    adapter,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

// ─── Hook to access the context (internal use by domain hooks) ───
export function useRealtimeContext(): RealtimeState {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error(
      'useRealtimeContext must be used within a <RealtimeProvider>. ' +
      'Wrap your App component with <RealtimeProvider>.'
    );
  }
  return ctx;
}

export { RealtimeContext };
