import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/estate";
import ProductGrid from "@/components/estate-sale/ProductGrid";

export const metadata: Metadata = {
  title: "Estate Sale — South Sanctuary",
  description:
    "Every piece in this home was chosen deliberately. The full collection is now available — offered fairly to someone who will give it a second life.",
};

export const revalidate = 60;

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("room")
    .order("name");

  if (error) {
    console.error("Failed to fetch products:", error.message);
    return [];
  }
  return data as Product[];
}

export default async function EstateSalePage() {
  const products = await getProducts();

  return (
    <>
      {/* Hero */}
      <section className="bg-ss-taupe pt-36 pb-24 px-6 text-center">
        <p className="text-[10px] tracking-[0.28em] text-white/40 uppercase mb-8">
          230 S Canby · Portland
        </p>
        <h1
          className="font-display font-light text-white leading-[0.9] mb-2"
          style={{ fontSize: "clamp(52px, 8vw, 100px)" }}
        >
          THE ESTATE
        </h1>
        <h1
          className="font-display font-light italic text-white leading-[0.9] mb-12"
          style={{ fontSize: "clamp(52px, 8vw, 100px)" }}
        >
          Sale
        </h1>
        <p className="text-sm text-white/60 leading-relaxed max-w-md mx-auto">
          Every piece was chosen deliberately — for its material, its warmth,
          its relationship to the room it lived in. Now offered fairly to
          someone who will give it a second life.
        </p>
      </section>

      {/* Grid */}
      <section className="bg-ss-cream px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <ProductGrid products={products} />
        </div>
      </section>
    </>
  );
}
