"use client";

import Image from "next/image";
import Link from "next/link";
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
        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/moving-sale"
            onClick={() => track("listing_click", { platform: "moving_sale" })}
            className="border border-white/80 text-white px-8 py-3 text-sm font-medium hover:bg-white hover:text-ss-ink transition-colors"
          >
            Shop the moving sale
          </Link>
          <p className="text-xs text-white/80 text-center px-4">
            Moving Sale Open House on Sunday, May 24, 1–4pm ·{" "}
            <a
              href="/open-house.ics"
              onClick={() => track("listing_click", { platform: "open_house_calendar" })}
              className="underline underline-offset-4 hover:text-white transition-colors"
            >
              Add to calendar
            </a>
          </p>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="w-px h-14 bg-white/25 mx-auto" />
      </div>
    </section>
  );
}
