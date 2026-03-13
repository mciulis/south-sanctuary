import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/estate";
import ProductDetail from "@/components/estate-sale/ProductDetail";

export const revalidate = 60;

async function getProduct(id: number) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as Product;
}

async function getImages(productId: number) {
  const { data } = await supabase
    .from("product_images")
    .select("id, filename, sort_order")
    .eq("product_id", productId)
    .order("sort_order");
  return data ?? [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(parseInt(id));
  if (!product) return {};
  return {
    title: `${product.name} — Estate Sale`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) notFound();

  const [product, images] = await Promise.all([
    getProduct(productId),
    getImages(productId),
  ]);

  if (!product) notFound();

  return (
    <div className="bg-ss-cream min-h-screen">
      <ProductDetail product={product} images={images} />
    </div>
  );
}
