import { supabaseAdmin } from "@/lib/supabase-admin";

export interface OfferTarget {
  reservation: {
    id: string;
    product_id: number;
    buyer_name: string;
    buyer_email: string;
    units_requested: number | null;
    offered_at: string | null;
    waitlist_position: number | null;
    status: string;
  };
  product: {
    id: number;
    name: string;
    sale_price: number | null;
  };
}

export async function loadOfferTarget(reservationId: string): Promise<OfferTarget | null> {
  const { data: reservation } = await supabaseAdmin
    .from("reservations")
    .select("id, product_id, buyer_name, buyer_email, units_requested, offered_at, waitlist_position, status")
    .eq("id", reservationId)
    .maybeSingle();

  if (!reservation) return null;

  const { data: product } = await supabaseAdmin
    .from("products")
    .select("id, name, sale_price")
    .eq("id", reservation.product_id)
    .single();

  if (!product) return null;

  return {
    reservation,
    product: {
      id: product.id,
      name: product.name,
      sale_price: product.sale_price,
    },
  };
}
