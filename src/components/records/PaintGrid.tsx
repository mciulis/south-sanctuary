"use client";

import { useState } from "react";
import PaintCarousel, { PaintSlide } from "@/components/ui/PaintCarousel";

export default function PaintGrid({ paints }: { paints: PaintSlide[] }) {
  const [carouselIndex, setCarouselIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {paints.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setCarouselIndex(i)}
            className="flex flex-col text-left cursor-zoom-in group"
          >
            <div
              className="h-28 w-full mb-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] transition-transform duration-300 group-hover:scale-[1.02]"
              style={{ backgroundColor: p.hex }}
            />
            <p className="text-[9px] tracking-[0.2em] text-ss-taupe uppercase mb-0.5">{p.brand}</p>
            <p className="text-[13px] text-ss-ink font-medium mb-2">{p.name}</p>
            <div className="space-y-0.5">
              {p.rooms.map((r) => (
                <p key={r} className="text-[11px] text-ss-taupe leading-snug">{r}</p>
              ))}
            </div>
          </button>
        ))}
      </div>

      {carouselIndex !== null && (
        <PaintCarousel
          slides={paints}
          startIndex={carouselIndex}
          onClose={() => setCarouselIndex(null)}
        />
      )}
    </>
  );
}
