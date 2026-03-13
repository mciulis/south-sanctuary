import Link from "next/link";
import Image from "next/image";
import { Product, conditionLabel } from "@/types/estate";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function getPhotoUrl(filename: string | null): string | null {
  if (!filename) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/products/${filename}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const photoUrl = getPhotoUrl(product.main_photo_filename);
  const condition = conditionLabel[product.condition] || "";
  const isUnavailable = product.status !== "available" || product.units_available === 0;

  return (
    <Link href={`/estate-sale/${product.id}`} className="group block">
      {/* Image */}
      <div className="relative aspect-square bg-ss-cream-dark overflow-hidden mb-3">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
              isUnavailable ? "opacity-50" : ""
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
        {isUnavailable && (
          <div className="absolute inset-0 flex items-end p-3">
            <span className="text-[9px] tracking-[0.2em] uppercase bg-ss-ink text-white px-2 py-1">
              Reserved
            </span>
          </div>
        )}
        {product.units > 1 && (
          <div className="absolute top-3 right-3">
            <span className="text-[9px] tracking-[0.2em] uppercase bg-white/90 text-ss-ink px-2 py-1">
              Set of {product.units}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <p className="text-[11px] text-ss-ink leading-snug mb-0.5">{product.name}</p>
        {condition && (
          <p className="text-[10px] text-ss-taupe tracking-wide mb-0.5">{condition}</p>
        )}
        <div className="flex items-baseline gap-2">
          <p className="text-[11px] text-ss-ink">
            {product.sale_price != null
              ? `$${product.sale_price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
              : "Make an offer"}
          </p>
          {product.retail_price != null && product.discount_percent && product.discount_percent !== "0%" && (
            <p className="text-[10px] text-ss-taupe line-through">
              ${product.retail_price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
