"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, conditionLabel } from "@/types/estate";
import ReserveForm from "./ReserveForm";
import Carousel from "@/components/ui/Carousel";

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
  const [showReserve, setShowReserve] = useState(false);
  const [localUnitsAvailable, setLocalUnitsAvailable] = useState(product.units_available);
  const [quantity, setQuantity] = useState(1);
  const [reservedToast, setReservedToast] = useState(false);

  const photos =
    images.length > 0
      ? images.map((img) => getPhotoUrl(img.filename))
      : product.main_photo_filename
      ? [getPhotoUrl(product.main_photo_filename)]
      : [];

  const brand = product.brand;
  const condition = conditionLabel[product.condition] || "";
  const availableLabel = (() => {
    if (!product.available_by) return null;
    const date = new Date(product.available_by + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date <= today) return "Available now";
    return "Available " + date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  })();
  const isUnavailable =
    product.status !== "available" || localUnitsAvailable === 0;
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
                  className="object-cover transition-transform duration-500 hover:scale-[1.02]"
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
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-xl text-ss-ink">
                {product.sale_price != null
                  ? `$${roundToNearest5(product.sale_price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                  : "Make an offer"}
              </span>
              {product.units > 1 && (
                <span className="text-sm text-ss-taupe">per item</span>
              )}
              {product.retail_price != null && hasDiscount && (
                <>
                  <span className="text-sm text-ss-taupe/60 line-through">
                    ${product.retail_price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-sm text-ss-taupe">{effectiveDiscountPct}% off retail</span>
                </>
              )}
            </div>
            {product.sale_price != null && product.units > 1 && quantity > 1 && (
              <p className="text-[11px] text-ss-taupe mb-1">
                Total: ${roundToNearest5(product.sale_price * quantity).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            )}

            {/* Condition + availability + unit count */}
            <div className="flex gap-4 mb-8 flex-wrap">
              {condition && (
                <span className="text-[10px] tracking-[0.18em] uppercase text-ss-taupe border border-ss-border px-3 py-1">
                  {condition}
                </span>
              )}
              {availableLabel && (
                <span className="text-[10px] tracking-[0.18em] uppercase text-ss-taupe border border-ss-border px-3 py-1">
                  {availableLabel}
                </span>
              )}
              {product.units > 1 && (
                <span className="text-[10px] tracking-[0.18em] uppercase text-ss-taupe border border-ss-border px-3 py-1">
                  {localUnitsAvailable > 0
                    ? `${localUnitsAvailable} of ${product.units} available`
                    : `0 of ${product.units} — fully reserved`}
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

            {/* Reserve CTA */}
            {isUnavailable ? (
              <div className="border border-ss-border text-center py-4 mt-auto">
                <p className="text-[11px] tracking-[0.22em] uppercase text-ss-taupe">
                  This item has been reserved
                </p>
              </div>
            ) : (
              <div className="mt-auto">
                {localUnitsAvailable > 1 && (
                  <div className="flex items-center gap-4 mb-5">
                    <span className="text-[10px] tracking-[0.2em] text-ss-taupe uppercase">
                      Quantity
                    </span>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 border border-ss-border text-ss-ink hover:border-ss-ink transition-colors flex items-center justify-center text-sm"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm text-ss-ink">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(localUnitsAvailable, q + 1))}
                        className="w-8 h-8 border border-ss-border text-ss-ink hover:border-ss-ink transition-colors flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setShowReserve(true)}
                  className="w-full border border-ss-ink text-ss-ink text-[11px] tracking-[0.22em] uppercase px-10 py-4 hover:bg-ss-ink hover:text-white transition-colors duration-300"
                >
                  Reserve {quantity > 1 ? `${quantity} Units` : "This Item"}
                </button>
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

      {/* Reserve modal */}
      {showReserve && (
        <ReserveForm
          productId={product.id}
          productName={product.full_name}
          quantity={quantity}
          unitsAvailable={localUnitsAvailable}
          onSuccess={(unitsReserved) => {
            setShowReserve(false);
            setLocalUnitsAvailable((prev) => {
              const remaining = prev - unitsReserved;
              setQuantity(Math.min(quantity, Math.max(1, remaining)));
              return remaining;
            });
            setReservedToast(true);
          }}
          onCancel={() => setShowReserve(false)}
        />
      )}

      {/* Success message */}
      {reservedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ss-ink text-white text-[11px] tracking-[0.2em] uppercase px-8 py-4 z-50">
          Request submitted — I&apos;ll be in touch soon.
        </div>
      )}
    </>
  );
}
