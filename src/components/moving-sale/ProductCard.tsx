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
  const brand = product.brand;
  const effectiveDiscountPct =
    product.retail_price && product.sale_price && product.retail_price > product.sale_price
      ? Math.round((1 - product.sale_price / product.retail_price) * 100)
      : null;
  const hasDiscount = effectiveDiscountPct != null && effectiveDiscountPct > 0;

  return (
    <Link href={`/moving-sale/${product.id}`} className="group block">
      {/* Image */}
      <div className="relative aspect-square bg-ss-cream-dark overflow-hidden mb-3">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
              isSold ? "opacity-40" : ""
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
          <div className="absolute inset-0 flex items-end p-3">
            <span className="text-[9px] tracking-[0.2em] uppercase bg-ss-ink text-white px-2 py-1">
              Sold
            </span>
          </div>
        )}
        {!isSold && product.units_available > 1 && (
          <div className="absolute top-3 right-3">
            <span className="text-[9px] tracking-[0.2em] uppercase bg-white/90 text-ss-ink px-2 py-1">
              {product.units_available} available
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        {brand && (
          <p className="text-[10px] tracking-[0.15em] text-ss-taupe uppercase mb-0.5">
            {brand}
          </p>
        )}
        <p className="text-[11px] text-ss-ink leading-snug mb-1">{product.name}</p>
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-[12px] text-ss-ink font-medium">
            {product.sale_price != null
              ? `$${roundToNearest5(product.sale_price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
              : "Make an offer"}
          </p>
          {product.retail_price != null && hasDiscount && (
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
  );
}
