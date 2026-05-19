"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, conditionLabel } from "@/types/estate";
import Carousel from "@/components/ui/Carousel";
import { MARKETPLACE_PROFILE_URL } from "@/lib/marketplace";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function roundToNearest5(n: number) {
  return Math.round(n / 5) * 5;
}

function getPhotoUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/products/${path}`;
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
  const [carouselOpen, setCarouselOpen] = useState(false);

  const photos =
    images.length > 0
      ? images.map((img) => getPhotoUrl(img.filename))
      : product.main_photo_filename
      ? [getPhotoUrl(product.main_photo_filename)]
      : [];

  const brand = product.brand;
  const condition = conditionLabel[product.condition] || "";
  const isSold =
    product.status === "sold" || product.units_available === 0;
  const isPending = product.status === "pending";
  const effectiveDiscountPct =
    product.retail_price && product.sale_price && product.retail_price > product.sale_price
      ? Math.round((1 - product.sale_price / product.retail_price) * 100)
      : null;
  const hasDiscount = effectiveDiscountPct != null && effectiveDiscountPct > 0;

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
          {/* Photos */}
          <div>
            {/* Main photo */}
            <button
              onClick={() => photos.length > 0 && setCarouselOpen(true)}
              className={`relative aspect-square bg-ss-cream-dark overflow-hidden mb-3 w-full block ${photos.length > 0 ? "cursor-zoom-in" : ""}`}
            >
              {photos.length > 0 ? (
                <Image
                  src={photos[activeIndex]}
                  alt={product.name}
                  fill
                  className={`object-cover transition-transform duration-500 hover:scale-[1.02] ${isSold ? "grayscale opacity-70" : ""}`}
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
              {isSold && (
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] tracking-[0.22em] uppercase bg-ss-ink text-white px-3 py-1.5">
                    Sold
                  </span>
                </div>
              )}
              {isPending && (
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] tracking-[0.22em] uppercase bg-ss-taupe text-white px-3 py-1.5">
                    Pending
                  </span>
                </div>
              )}
            </button>

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
              href="/moving-sale"
              className="text-[10px] tracking-[0.22em] text-ss-taupe uppercase mb-8 hover:text-ss-ink transition-colors inline-flex items-center gap-2"
            >
              ← The Moving Sale
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
            <div className="flex items-baseline gap-3 mb-1">
              <span className={`text-xl ${isSold ? "text-ss-ink/50 line-through" : "text-ss-ink"}`}>
                {product.sale_price != null
                  ? `$${roundToNearest5(product.sale_price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                  : "Make an offer"}
              </span>
              {product.units > 1 && (
                <span className="text-sm text-ss-taupe">per item</span>
              )}
              {product.retail_price != null && hasDiscount && !isSold && (
                <>
                  <span className="text-sm text-ss-taupe/60 line-through">
                    ${product.retail_price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-sm text-ss-taupe">{effectiveDiscountPct}% off retail</span>
                </>
              )}
            </div>

            {/* Condition + unit count */}
            <div className="flex gap-4 mt-6 mb-8 flex-wrap">
              {condition && (
                <span className="text-[10px] tracking-[0.18em] uppercase text-ss-taupe border border-ss-border px-3 py-1">
                  {condition}
                </span>
              )}
              {product.units > 1 && (
                <span className="text-[10px] tracking-[0.18em] uppercase text-ss-taupe border border-ss-border px-3 py-1">
                  {product.units_available > 0
                    ? `${product.units_available} of ${product.units} available`
                    : `0 of ${product.units} available`}
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
            {(product.width_in || product.length_in || product.height_in) && (
              <div className="border-t border-ss-border pt-5 mb-8">
                <p className="text-[10px] tracking-[0.2em] text-ss-taupe uppercase mb-1.5">
                  Dimensions
                </p>
                <p className="text-sm text-ss-ink">
                  {[
                    product.width_in != null ? `${product.width_in}"w` : null,
                    product.length_in != null ? `${product.length_in}"d` : null,
                    product.height_in != null ? `${product.height_in}"h` : null,
                  ]
                    .filter(Boolean)
                    .join(" x ")}
                </p>
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
                  {(() => {
                    try {
                      const host = new URL(product.retail_url).hostname.replace(/^www\./, "");
                      const label = host.charAt(0).toUpperCase() + host.slice(1);
                      return `Buy new on ${label} ↗`;
                    } catch {
                      return "Buy new ↗";
                    }
                  })()}
                </a>
              </div>
            )}

            {/* CTA */}
            {isSold ? (
              <div className="border border-ss-border text-center py-4 mt-auto">
                <p className="text-[11px] tracking-[0.22em] uppercase text-ss-taupe">
                  Sold
                </p>
              </div>
            ) : isPending ? (
              <div className="border border-ss-border text-center py-4 mt-auto">
                <p className="text-[11px] tracking-[0.22em] uppercase text-ss-taupe mb-1">
                  Listing coming soon
                </p>
                <p className="text-[10px] text-ss-taupe/70">
                  Check back — this item will be on Marketplace shortly.
                </p>
              </div>
            ) : product.facebook_url ? (
              <div className="mt-auto space-y-3">
                <a
                  href={product.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center border border-ss-ink bg-ss-ink text-white text-[11px] tracking-[0.22em] uppercase px-10 py-4 hover:bg-white hover:text-ss-ink transition-colors duration-300"
                >
                  Shop on Facebook Marketplace ↗
                </a>
                <p className="mt-3 text-[10px] tracking-[0.16em] uppercase text-ss-taupe text-center">
                  First-come, first-serve. Message us on Marketplace to claim.
                </p>
              </div>
            ) : (
              <div className="mt-auto space-y-3">
                <a
                  href={MARKETPLACE_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center border border-ss-ink bg-ss-ink text-white text-[11px] tracking-[0.22em] uppercase px-10 py-4 hover:bg-white hover:text-ss-ink transition-colors duration-300"
                >
                  View on Facebook Marketplace ↗
                </a>
                <p className="mt-3 text-[10px] tracking-[0.16em] uppercase text-ss-taupe text-center">
                  First-come, first-serve. Message us on Marketplace to claim.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo carousel */}
      {carouselOpen && photos.length > 0 && (
        <Carousel
          slides={photos.map((url) => ({ src: url, alt: product.name }))}
          startIndex={activeIndex}
          onClose={() => setCarouselOpen(false)}
          onIndexChange={(i) => setActiveIndex(i)}
        />
      )}
    </>
  );
}
