"use client";

import Image from "next/image";
import { track } from "@vercel/analytics";

interface HeroContent {
  headline1?: string;
  headline2?: string;
  mainPhoto?: string;
}

export default function HeroSection({ content = {} }: { content?: HeroContent }) {
  const { headline1 = "South", headline2 = "Sanctuary", mainPhoto = "/images/home/hero-forest-view-01.jpg" } = content;
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Image
        src={mainPhoto}
        alt="The forest behind South Sanctuary"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-ss-ink/48" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <div className="mb-8 flex flex-col items-center gap-1.5">
          <p className="text-[11px] tracking-[0.3em] text-white font-medium uppercase">
            230 S Canby
          </p>
          <p className="text-[11px] tracking-[0.3em] text-white font-medium uppercase">
            Portland, OR USA
          </p>
        </div>
        <h1
          className="font-display font-light text-white leading-[0.9]"
          style={{ fontSize: "clamp(72px, 13vw, 152px)" }}
        >
          {headline1}
        </h1>
        <h1
          className="font-display font-light italic text-white leading-[0.9]"
          style={{ fontSize: "clamp(72px, 13vw, 152px)" }}
        >
          {headline2}
        </h1>
        <div className="mt-8 flex gap-6">
          <a
            href="https://www.zillow.com/homedetails/230-S-Canby-St-Portland-OR-97219/53834795_zpid/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("listing_click", { platform: "zillow" })}
            className="text-[11px] tracking-[0.3em] text-white font-medium uppercase underline underline-offset-4 hover:text-white/75 transition-colors"
          >
            View on Zillow
          </a>
          <a
            href="https://www.redfin.com/OR/Portland/230-S-Canby-St-97219/home/26390460"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("listing_click", { platform: "redfin" })}
            className="text-[11px] tracking-[0.3em] text-white font-medium uppercase underline underline-offset-4 hover:text-white/75 transition-colors"
          >
            View on Redfin
          </a>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="w-px h-14 bg-white/25 mx-auto" />
      </div>
    </section>
  );
}
