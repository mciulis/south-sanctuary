"use client";

import { useState } from "react";
import Image from "next/image";

interface StoryImage {
  src: string;
  alt: string;
  portrait?: boolean;
}

interface StorySectionProps {
  sectionLabel: string;
  headline1: string;
  headline2: string;
  body: string[];
  mainImage: StoryImage;
  detailImage?: StoryImage;
  imagePosition: "left" | "right";
  detailPosition?: "top" | "middle" | "bottom";
  bg?: "cream" | "cream-dark";
}

export default function StorySection({
  sectionLabel,
  headline1,
  headline2,
  body,
  mainImage,
  detailImage,
  imagePosition,
  detailPosition = "bottom",
  bg = "cream",
}: StorySectionProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const bgClass = bg === "cream" ? "bg-ss-cream" : "bg-ss-cream-dark";

  const DetailCard = detailImage ? (
    <button
      onClick={() => setLightboxOpen(true)}
      className={`w-[40%] shadow-[0_4px_28px_rgba(0,0,0,0.10)] overflow-hidden cursor-zoom-in ${
        imagePosition === "right" ? "mr-auto" : "ml-auto"
      }`}
    >
      <div
        className={`relative ${detailImage.portrait ? "aspect-[3/4]" : "aspect-[4/3]"}`}
      >
        <Image
          src={detailImage.src}
          alt={detailImage.alt}
          fill
          className="object-cover transition-transform duration-500 hover:scale-[1.03]"
        />
      </div>
    </button>
  ) : null;

  const textColumn = (
    <div
      className={`flex flex-col justify-center px-10 md:px-14 py-16 md:py-24 ${bgClass}`}
    >
      {/* Desktop-only: top position */}
      {detailPosition === "top" && DetailCard && (
        <div className="mb-10 hidden md:block">{DetailCard}</div>
      )}

      <p className="text-[10px] tracking-[0.28em] text-ss-taupe uppercase mb-8">
        {sectionLabel}
      </p>
      <h2
        className="font-display font-light text-ss-ink leading-[0.9] mb-1"
        style={{ fontSize: "clamp(36px, 4vw, 68px)" }}
      >
        {headline1}
      </h2>
      <h2
        className="font-display font-light italic text-ss-ink leading-[0.9] mb-10"
        style={{ fontSize: "clamp(36px, 4vw, 68px)" }}
      >
        {headline2}
      </h2>

      {/* Desktop-only: middle position */}
      {detailPosition === "middle" && DetailCard && (
        <div className="mb-8 hidden md:block">{DetailCard}</div>
      )}

      <div className="space-y-5 max-w-sm">
        {body.map((paragraph, i) => (
          <p key={i} className="text-sm text-ss-ink-soft leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Mobile: always after body. Desktop: only when detailPosition="bottom" */}
      {DetailCard && (
        <div
          className={`mt-10 ${detailPosition !== "bottom" ? "md:hidden" : ""}`}
        >
          {DetailCard}
        </div>
      )}
    </div>
  );

  const imageColumn = (
    <div className="relative h-full min-h-[70vw] md:min-h-0">
      <Image
        src={mainImage.src}
        alt={mainImage.alt}
        fill
        className="object-cover"
      />
    </div>
  );

  return (
    <>
      <section className={`grid md:grid-cols-2 ${bgClass}`}>
        {/* Image is always first in DOM so it appears on top on mobile */}
        <div className={imagePosition === "right" ? "md:order-2" : ""}>
          {imageColumn}
        </div>
        <div className={imagePosition === "right" ? "md:order-1" : ""}>
          {textColumn}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && detailImage && (
        <div
          className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors z-10"
            aria-label="Close"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <line x1="4" y1="4" x2="24" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="24" y1="4" x2="4" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* Image */}
          <div
            className="relative w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={detailImage.src}
              alt={detailImage.alt}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
