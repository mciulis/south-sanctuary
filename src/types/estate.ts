export interface Product {
  id: number;
  name: string;
  full_name: string;
  brand: string | null;
  description: string | null;
  sale_price: number | null;
  retail_price: number | null;
  discount_percent: number | null; // Override discount (0–100). Null = use formula based on condition.
  condition: "new" | "used_like_new" | "used_good" | "used_fair" | "damaged";
  room: string | null;
  length_in: number | null;
  width_in: number | null;
  height_in: number | null;
  dimensions_display: string | null;
  units: number;
  units_available: number;
  retail_url: string | null;
  main_photo_filename: string | null;
  status: "available" | "reserved" | "sold";
  available_by: string | null; // ISO date string e.g. "2026-05-15"
}

export const conditionLabel: Record<string, string> = {
  new: "New",
  used_like_new: "Used – Like New",
  used_good: "Used – Good",
  used_fair: "Used – Fair",
  damaged: "Damaged",
};

// Default discount % by condition. Used when discount_percent is null on the product.
export const CONDITION_DISCOUNTS: Record<string, number> = {
  new: 35,
  used_like_new: 45,
  used_good: 55,
  used_fair: 70,
  damaged: 90,
};

export type ReservationStatus = "pending" | "cancelled" | "withdrawn";
export type PaymentState = "none" | "deposit_paid" | "paid_in_full";
export type PickupState = "not_scheduled" | "scheduled" | "picked_up";

export interface Reservation {
  id: string;
  product_id: number;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  message: string | null;
  status: ReservationStatus;
  created_at: string;
  units_requested: number;
  waitlist_position: number | null;
  payment_state: PaymentState;
  pickup_state: PickupState;
  offered_at: string | null;
  deposit_amount: number | null;
  deposit_received_at: string | null;
  total_amount_paid: number | null;
  paid_in_full_at: string | null;
  pickup_at: string | null;
  picked_up_at: string | null;
  pickup_location: string | null;
}
