import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/estate";
import ProductGrid from "@/components/moving-sale/ProductGrid";
import MovingCta from "@/components/story/MovingCta";

export const metadata: Metadata = {
  title: "Moving Sale — South Sanctuary",
  description:
    "Every piece in this home was chosen deliberately. The full collection is now available — offered fairly to someone who will give it a second life.",
};

export const revalidate = 60;

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("brand", { ascending: true, nullsFirst: false })
    .order("name");

  if (error) {
    console.error("Failed to fetch products:", error.message);
    return [];
  }
  return data as Product[];
}

export default async function MovingSalePage() {
  const [products, { data: sectionsData }] = await Promise.all([
    getProducts(),
    supabase.from("homepage_sections").select("id, content").eq("id", "moving-cta").single(),
  ]);

  return (
    <>
      {/* Hero — shares content with homepage moving CTA via Supabase */}
      <div className="pt-20">
        <MovingCta
          content={sectionsData?.content}
          hideButton
          backgroundImage="/images/moving-sale-hero.jpg"
        />
      </div>

      {/* Grid */}
      <section className="bg-ss-cream px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <ProductGrid products={products} />
        </div>
      </section>
    </>
  );
}
