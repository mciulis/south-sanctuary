"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface PaintSlide {
  brand: string;
  name: string;
  hex: string;
  dark: boolean;
  rooms: string[];
}

interface PaintCarouselProps {
  slides: PaintSlide[];
  startIndex?: number;
  onClose: () => void;
}

export default function PaintCarousel({ slides, startIndex = 0, onClose }: PaintCarouselProps) {
  const [index, setIndex] = useState(startIndex);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback((n: number) => {
    setIndex(((n % slides.length) + slides.length) % slides.length);
  }, [slides.length]);

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
  const textColor = slide.dark ? "text-white/80" : "text-black/50";
  const textColorStrong = slide.dark ? "text-white" : "text-black/80";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col transition-colors duration-300"
      style={{ backgroundColor: slide.hex }}
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
        <span className={`text-[10px] tracking-[0.22em] ${textColor}`}>
          {index + 1} / {slides.length}
        </span>
        <button
          onClick={onClose}
          className={`transition-colors ${textColor} hover:${textColorStrong}`}
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Color info — centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <p className={`text-[10px] tracking-[0.25em] uppercase mb-3 ${textColor}`}>{slide.brand}</p>
        <p className={`font-display font-light leading-none mb-8 ${textColorStrong}`}
          style={{ fontSize: "clamp(36px, 8vw, 80px)" }}>
          {slide.name}
        </p>
        <p className={`text-[10px] tracking-[0.2em] uppercase mb-4 ${textColor}`}>{slide.hex}</p>
        <div className={`space-y-1.5 ${textColor}`}>
          {slide.rooms.map((r) => (
            <p key={r} className="text-sm">{r}</p>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-end px-5 py-5 flex-shrink-0 gap-6">
        <button
          onClick={() => go(index - 1)}
          className={`transition-colors text-lg leading-none ${textColor}`}
          aria-label="Previous"
        >←</button>
        <button
          onClick={() => go(index + 1)}
          className={`transition-colors text-lg leading-none ${textColor}`}
          aria-label="Next"
        >→</button>
      </div>
    </div>
  );
}
