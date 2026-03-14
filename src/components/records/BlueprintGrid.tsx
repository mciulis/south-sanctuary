"use client";

import { useState } from "react";
import Image from "next/image";
import Carousel, { CarouselSlide } from "@/components/ui/Carousel";

interface Blueprint {
  src: string;
  caption: string;
}

export default function BlueprintGrid({ blueprints }: { blueprints: Blueprint[] }) {
  const [carouselIndex, setCarouselIndex] = useState<number | null>(null);

  const slides: CarouselSlide[] = blueprints.map((bp) => ({
    src: bp.src,
    alt: bp.caption,
    caption: bp.caption,
  }));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {blueprints.map((bp, i) => (
          <button
            key={bp.src}
            onClick={() => setCarouselIndex(i)}
            className="group text-left cursor-zoom-in"
          >
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden mb-2">
              <Image
                src={bp.src}
                alt={bp.caption}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <p className="text-[10px] tracking-[0.1em] text-ss-taupe">{bp.caption}</p>
          </button>
        ))}
      </div>

      {carouselIndex !== null && (
        <Carousel
          slides={slides}
          startIndex={carouselIndex}
          onClose={() => setCarouselIndex(null)}
        />
      )}
    </>
  );
}
