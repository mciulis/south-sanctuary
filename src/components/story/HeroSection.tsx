"use client";

import { useEffect, useRef } from "react";

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.35;
    }
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/home/hero-forest-view-01.jpg"
      >
        <source src="/videos/hero-forest.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-ss-ink/50" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <p className="text-[11px] tracking-[0.3em] text-white/50 uppercase mb-10">
          230 S Canby · Portland, Oregon
        </p>
        <h1
          className="font-display font-light text-white leading-[0.9]"
          style={{ fontSize: "clamp(72px, 13vw, 152px)" }}
        >
          South
        </h1>
        <h1
          className="font-display font-light italic text-white leading-[0.9]"
          style={{ fontSize: "clamp(72px, 13vw, 152px)" }}
        >
          Sanctuary
        </h1>
        <p className="mt-10 text-sm text-white/40 italic font-display tracking-wide">
          A home at the end of a quiet street.
        </p>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="w-px h-14 bg-white/25 mx-auto" />
      </div>
    </section>
  );
}
