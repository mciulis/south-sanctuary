import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/estate";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function getPhotoUrl(filename: string | null): string | null {
  if (!filename) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/products/${filename}`;
}

function roundToNearest5(n: number) {
  return Math.round(n / 5) * 5;
}

export default function ProductCard({ product }: { product: Product }) {
  const photoUrl = getPhotoUrl(product.main_photo_filename);
  const isSold = product.status === "sold" || product.units_available === 0;
  const isPending = product.status === "pending";
  const brand = product.brand;
  const effectiveDiscountPct =
    product.retail_price && product.sale_price && product.retail_price > product.sale_price
      ? Math.round((1 - product.sale_price / product.retail_price) * 100)
      : null;
  const hasDiscount = effectiveDiscountPct != null && effectiveDiscountPct > 0;

  return (
    <div className="group block">
      {/* Image + info — links to detail page */}
      <Link href={`/moving-sale/${product.id}`} className="block">
        <div className="relative aspect-square bg-ss-cream-dark overflow-hidden mb-3">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                isSold ? "grayscale opacity-70" : ""
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[10px] tracking-[0.2em] text-ss-taupe/40 uppercase text-center px-4">
                {product.name}
              </p>
            </div>
          )}
          {isSold && (
            <div className="absolute top-3 left-3">
              <span className="text-[9px] tracking-[0.2em] uppercase bg-ss-ink text-white px-2 py-1">
                Sold
              </span>
            </div>
          )}
          {isPending && (
            <div className="absolute top-3 left-3">
              <span className="text-[9px] tracking-[0.2em] uppercase bg-ss-taupe text-white px-2 py-1">
                Pending
              </span>
            </div>
          )}
          {!isSold && !isPending && product.units_available > 1 && (
            <div className="absolute top-3 right-3">
              <span className="text-[9px] tracking-[0.2em] uppercase bg-white/90 text-ss-ink px-2 py-1">
                {product.units_available} available
              </span>
            </div>
          )}
        </div>

        <div>
          {brand && (
            <p className={`text-[10px] tracking-[0.15em] uppercase mb-0.5 ${isSold ? "text-ss-taupe/50" : "text-ss-taupe"}`}>
              {brand}
            </p>
          )}
          <p className={`text-[11px] leading-snug mb-1 ${isSold ? "text-ss-ink/50" : "text-ss-ink"}`}>{product.name}</p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className={`text-[12px] font-medium ${isSold ? "text-ss-ink/50 line-through" : "text-ss-ink"}`}>
              {product.sale_price != null
                ? `$${roundToNearest5(product.sale_price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                : "Make an offer"}
            </p>
            {product.retail_price != null && hasDiscount && !isSold && (
              <>
                <p className="text-[10px] text-ss-taupe/60 line-through">
                  ${product.retail_price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] text-ss-taupe">
                  {effectiveDiscountPct}% off
                </p>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Marketplace action link — only for available, with-URL items */}
      {!isSold && !isPending && product.facebook_url && (
        <a
          href={product.facebook_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-[10px] tracking-[0.15em] text-ss-ink uppercase underline underline-offset-4 hover:text-ss-taupe transition-colors"
        >
          Shop on Marketplace ↗
        </a>
      )}
      {isPending && (
        <p className="mt-2 text-[10px] tracking-[0.15em] text-ss-taupe/70 uppercase">
          Listing coming soon
        </p>
      )}
    </div>
  );
}
