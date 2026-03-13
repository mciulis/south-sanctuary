"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, conditionLabel } from "@/types/estate";
import ReserveForm from "./ReserveForm";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function getPhotoUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/products/${path}`;
}

function extractBrand(fullName: string): string | null {
  const parts = fullName.split(" \u2013 ");
  return parts.length > 1 ? parts[0].trim() : null;
}

interface ProductImage {
  id: string;
  filename: string;
  sort_order: number;
}

interface Props {
  product: Product;
  images: ProductImage[];
}

export default function ProductDetail({ product, images }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showReserve, setShowReserve] = useState(false);
  const [reserved, setReserved] = useState(false);

  const photos =
    images.length > 0
      ? images.map((img) => getPhotoUrl(img.filename))
      : product.main_photo_filename
      ? [getPhotoUrl(product.main_photo_filename)]
      : [];

  const brand = extractBrand(product.full_name);
  const condition = conditionLabel[product.condition] || "";
  const isUnavailable =
    reserved || product.status !== "available" || product.units_available === 0;
  const hasDiscount =
    product.discount_percent &&
    product.discount_percent !== "0%" &&
    product.discount_percent !== "-10%";

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
          {/* Photos */}
          <div>
            {/* Main photo */}
            <div className="relative aspect-square bg-ss-cream-dark overflow-hidden mb-3">
              {photos.length > 0 ? (
                <Image
                  src={photos[activeIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[10px] tracking-[0.2em] text-ss-taupe/40 uppercase text-center px-8">
                    No photo available
                  </p>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {photos.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`relative w-16 h-16 overflow-hidden flex-shrink-0 transition-opacity ${
                      i === activeIndex ? "opacity-100 ring-1 ring-ss-ink" : "opacity-50 hover:opacity-80"
                    }`}
                  >
                    <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <Link
              href="/estate-sale"
              className="text-[10px] tracking-[0.22em] text-ss-taupe uppercase mb-8 hover:text-ss-ink transition-colors inline-flex items-center gap-2"
            >
              ← The Estate Sale
            </Link>

            {brand && (
              <p className="text-[10px] tracking-[0.2em] text-ss-taupe uppercase mb-2">
                {brand}
              </p>
            )}

            <h1
              className="font-display font-light text-ss-ink leading-[0.95] mb-6"
              style={{ fontSize: "clamp(32px, 4vw, 56px)" }}
            >
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-xl text-ss-ink">
                {product.sale_price != null
                  ? `$${product.sale_price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                  : "Make an offer"}
              </span>
              {product.retail_price != null && hasDiscount && (
                <>
                  <span className="text-sm text-ss-taupe/60 line-through">
                    ${product.retail_price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-sm text-ss-taupe">{product.discount_percent} off retail</span>
                </>
              )}
            </div>

            {product.units > 1 && (
              <p className="text-[11px] text-ss-taupe tracking-wide mb-2">
                Set of {product.units} · priced for the set
              </p>
            )}

            {/* Condition + room */}
            <div className="flex gap-4 mb-8 flex-wrap">
              {condition && (
                <span className="text-[10px] tracking-[0.18em] uppercase text-ss-taupe border border-ss-border px-3 py-1">
                  {condition}
                </span>
              )}
              {product.room && (
                <span className="text-[10px] tracking-[0.18em] uppercase text-ss-taupe border border-ss-border px-3 py-1">
                  {product.room}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-ss-ink-soft leading-relaxed mb-8">
                {product.description}
              </p>
            )}

            {/* Dimensions */}
            {product.dimensions_display && product.dimensions_display !== "#VALUE!" && (
              <div className="border-t border-ss-border pt-5 mb-8">
                <p className="text-[10px] tracking-[0.2em] text-ss-taupe uppercase mb-1.5">
                  Dimensions
                </p>
                <p className="text-sm text-ss-ink">{product.dimensions_display}</p>
              </div>
            )}

            {/* Retail link */}
            {product.retail_url && (
              <div className="mb-8">
                <a
                  href={product.retail_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] tracking-[0.2em] text-ss-taupe uppercase underline underline-offset-4 hover:text-ss-ink transition-colors"
                >
                  See original listing ↗
                </a>
              </div>
            )}

            {/* Reserve CTA */}
            {isUnavailable ? (
              <div className="border border-ss-border text-center py-4 mt-auto">
                <p className="text-[11px] tracking-[0.22em] uppercase text-ss-taupe">
                  This item has been reserved
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowReserve(true)}
                className="border border-ss-ink text-ss-ink text-[11px] tracking-[0.22em] uppercase px-10 py-4 hover:bg-ss-ink hover:text-white transition-colors duration-300 mt-auto"
              >
                Reserve This Item
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reserve modal */}
      {showReserve && (
        <ReserveForm
          productId={product.id}
          productName={product.full_name}
          onSuccess={() => {
            setShowReserve(false);
            setReserved(true);
          }}
          onCancel={() => setShowReserve(false)}
        />
      )}

      {/* Success message */}
      {reserved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ss-ink text-white text-[11px] tracking-[0.2em] uppercase px-8 py-4 z-50">
          Request submitted — I&apos;ll be in touch soon.
        </div>
      )}
    </>
  );
}
