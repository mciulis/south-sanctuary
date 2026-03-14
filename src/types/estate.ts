export interface Product {
  id: number;
  name: string;
  full_name: string;
  brand: string | null;
  description: string | null;
  sale_price: number | null;
  retail_price: number | null;
  discount_percent: string | null;
  condition: "like_new" | "light_wear" | "heavy_wear" | "damaged" | "na";
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
  like_new: "Like New",
  light_wear: "Light Wear",
  heavy_wear: "Heavy Wear",
  damaged: "Damaged",
  na: "",
};
