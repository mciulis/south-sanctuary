"use client";

import { useState } from "react";
import Image from "next/image";

interface Blueprint {
  src: string;
  caption: string;
}

export default function BlueprintGrid({ blueprints }: { blueprints: Blueprint[] }) {
  const [lightbox, setLightbox] = useState<Blueprint | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {blueprints.map((bp) => (
          <button
            key={bp.src}
            onClick={() => setLightbox(bp)}
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

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/92 flex flex-col items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors z-10"
            aria-label="Close"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <line x1="4" y1="4" x2="24" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="24" y1="4" x2="4" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div
            className="relative w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.src}
              alt={lightbox.caption}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.2em] text-white/50 uppercase">
            {lightbox.caption}
          </p>
        </div>
      )}
    </>
  );
}
