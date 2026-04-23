/**
 * ─── Order Status Constants ───
 * Single source of truth for all order statuses in the frontend.
 * Mirrors restaurant-os/internal/models/status.go exactly.
 * 
 * NEVER use raw strings like 'pending' — always import from here.
 */

export const ORDER_STATUS = {
  WEB_HOLDING: 'web_holding',
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

/**
 * ─── Order Source Constants ───
 */
export const ORDER_SOURCE = {
  POS: 'POS',
  WEB: 'Web',
  UBER_EATS: 'UberEats',
  DELIVEROO: 'Deliveroo',
  JUST_EAT: 'JustEat',
} as const;

export type OrderSource = typeof ORDER_SOURCE[keyof typeof ORDER_SOURCE];

/**
 * ─── Booking Status Constants ───
 */
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  ARRIVED: 'ARRIVED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
