/**
 * useRealtimeBookings — The "Standard Plug Socket" for Bookings
 * 
 * KitchenKDS and AdminPOS use this to display upcoming table reservations.
 * 
 * Usage:
 *   const { bookings, todayBookings, updateBooking } = useRealtimeBookings();
 */

import { useMemo } from 'react';
import { useRealtimeContext } from '../context/RealtimeProvider';
import type { Booking } from '../types';

interface UseRealtimeBookingsOptions {
  /** Filter by booking status */
  status?: Booking['status'][];
  /** Only return bookings for today */
  todayOnly?: boolean;
}

interface UseRealtimeBookingsReturn {
  /** All bookings (filtered) */
  bookings: Booking[];
  /** Convenience: today's bookings only */
  todayBookings: Booking[];
  /** True while waiting for first data */
  isLoading: boolean;
  /** Create a new booking */
  createBooking: (booking: Booking) => Promise<void>;
  /** Update fields on a booking */
  updateBooking: (bookingId: string, fields: Record<string, any>) => Promise<void>;
}

export function useRealtimeBookings(options?: UseRealtimeBookingsOptions): UseRealtimeBookingsReturn {
  const { bookings: allBookings, isConnected, createBooking, updateBooking } = useRealtimeContext();

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const filtered = useMemo(() => {
    let result = allBookings;

    if (options?.status && options.status.length > 0) {
      result = result.filter((b) => options.status!.includes(b.status));
    }

    if (options?.todayOnly) {
      result = result.filter((b) => b.date === today);
    }

    return result;
  }, [allBookings, options?.status, options?.todayOnly, today]);

  const todayBookings = useMemo(() => {
    return allBookings.filter((b) => b.date === today);
  }, [allBookings, today]);

  return {
    bookings: filtered,
    todayBookings,
    isLoading: !isConnected && allBookings.length === 0,
    createBooking,
    updateBooking,
  };
}
