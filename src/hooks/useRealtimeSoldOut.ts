/**
 * useRealtimeSoldOut — The "Standard Plug Socket" for the 86 Board
 * 
 * StoreContext and any menu display can use this to know which items
 * are currently sold out, without touching Firestore directly.
 * 
 * Usage:
 *   const { soldOutItems, isItemSoldOut } = useRealtimeSoldOut();
 */

import { useMemo, useCallback } from 'react';
import { useRealtimeContext } from '../context/RealtimeProvider';

interface UseRealtimeSoldOutReturn {
  /** The current list of sold-out item IDs */
  soldOutItems: string[];
  /** Check if a specific item is sold out */
  isItemSoldOut: (itemId: string) => boolean;
}

export function useRealtimeSoldOut(): UseRealtimeSoldOutReturn {
  const { soldOutItems } = useRealtimeContext();

  const soldOutSet = useMemo(() => new Set(soldOutItems), [soldOutItems]);

  const isItemSoldOut = useCallback(
    (itemId: string) => soldOutSet.has(itemId),
    [soldOutSet]
  );

  return {
    soldOutItems,
    isItemSoldOut,
  };
}
