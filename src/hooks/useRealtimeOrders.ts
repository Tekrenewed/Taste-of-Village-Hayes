/**
 * useRealtimeOrders — The "Standard Plug Socket" for Orders
 * 
 * KitchenKDS, WaiterPad, AdminPOS, and Dashboard all use this hook.
 * They don't know (or care) if the data comes from:
 *   - Firestore onSnapshot (today)
 *   - A WebSocket connection (tomorrow)
 *   - A mock array (in tests)
 * 
 * Usage:
 *   const { orders, isLoading, isConnected, updateOrder } = useRealtimeOrders();
 *   const { orders: pendingOrders } = useRealtimeOrders({ status: ['pending', 'preparing'] });
 */

import { useMemo } from 'react';
import { useRealtimeContext } from '../context/RealtimeProvider';
import type { Order } from '../types';

interface UseRealtimeOrdersOptions {
  /** Filter orders by status. If not provided, returns all orders. */
  status?: Order['status'][];
  /** Filter by order type (dine-in, collection, etc.) */
  type?: Order['type'][];
  /** Sort direction. Default: descending (newest first) */
  sortDirection?: 'asc' | 'desc';
}

interface UseRealtimeOrdersReturn {
  /** The live orders, filtered and sorted */
  orders: Order[];
  /** True while waiting for the first data snapshot */
  isLoading: boolean;
  /** True when the real-time connection is active */
  isConnected: boolean;
  /** Update fields on an order (bumps, status changes, etc.) */
  updateOrder: (orderId: string, fields: Record<string, any>) => Promise<void>;
  /** Create a new order */
  createOrder: (order: Order) => Promise<void>;
}

export function useRealtimeOrders(options?: UseRealtimeOrdersOptions): UseRealtimeOrdersReturn {
  const { orders: allOrders, isConnected, updateOrder, createOrder } = useRealtimeContext();

  const filtered = useMemo(() => {
    let result = allOrders;

    // Filter by status
    if (options?.status && options.status.length > 0) {
      result = result.filter((o) => options.status!.includes(o.status));
    }

    // Filter by type
    if (options?.type && options.type.length > 0) {
      result = result.filter((o) => options.type!.includes(o.type));
    }

    // Sort
    const dir = options?.sortDirection === 'asc' ? 1 : -1;
    result = [...result].sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : (a.timestamp as any)?.seconds ? (a.timestamp as any).seconds * 1000 : 0;
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : (b.timestamp as any)?.seconds ? (b.timestamp as any).seconds * 1000 : 0;
      return dir * (timeA - timeB);
    });

    return result;
  }, [allOrders, options?.status, options?.type, options?.sortDirection]);

  return {
    orders: filtered,
    isLoading: !isConnected && allOrders.length === 0,
    isConnected,
    updateOrder,
    createOrder,
  };
}
