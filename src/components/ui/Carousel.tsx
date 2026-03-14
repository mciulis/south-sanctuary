"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

export interface CarouselSlide {
  src: string;
  alt: string;
  caption?: string;
}

interface CarouselProps {
  slides: CarouselSlide[];
  startIndex?: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

export default function Carousel({ slides, startIndex = 0, onClose, onIndexChange }: CarouselProps) {
  const [index, setIndex] = useState(startIndex);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback((n: number) => {
    const next = ((n % slides.length) + slides.length) % slides.length;
    setIndex(next);
    onIndexChange?.(next);
  }, [slides.length, onIndexChange]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === "ArrowRight") go(index + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go, onClose]);

  const slide = slides[index];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/93 flex flex-col"
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) go(index + (diff > 0 ? 1 : -1));
        touchStartX.current = null;
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
        <span className="text-[10px] tracking-[0.22em] text-white/40">
          {index + 1} / {slides.length}
        </span>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Image */}
      <div className="relative flex-1 min-h-0">
        <Image
          src={slide.src}
          alt={slide.alt}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-5 py-5 flex-shrink-0">
        <p className="text-[10px] tracking-[0.18em] text-white/40 uppercase">
          {slide.caption ?? ""}
        </p>
        <div className="flex gap-6">
          <button
            onClick={() => go(index - 1)}
            className="text-white/50 hover:text-white transition-colors text-lg leading-none"
            aria-label="Previous"
          >
            ←
          </button>
          <button
            onClick={() => go(index + 1)}
            className="text-white/50 hover:text-white transition-colors text-lg leading-none"
            aria-label="Next"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
