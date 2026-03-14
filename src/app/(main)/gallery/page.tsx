import { Metadata } from "next";
import GalleryGrid from "@/components/gallery/GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery — South Sanctuary",
  description:
    "A room-by-room tour of 230 S Canby, Portland — from the glass-railed entry to the forest-facing living room, the master retreat, and beyond.",
};

export default function GalleryPage() {
  return (
    <>
      <section className="bg-ss-cream pt-36 pb-4 px-6 text-center">
        <p className="text-[10px] tracking-[0.28em] text-ss-taupe uppercase mb-8">
          230 S Canby · Portland, OR USA
        </p>
        <h1
          className="font-display font-light text-ss-ink leading-[0.9] mb-1"
          style={{ fontSize: "clamp(52px, 8vw, 100px)" }}
        >
          THE GALLERY
        </h1>
        <h1
          className="font-display font-light italic text-ss-ink leading-[0.9]"
          style={{ fontSize: "clamp(52px, 8vw, 100px)" }}
        >
          of 230 S Canby
        </h1>
      </section>

      <div className="bg-ss-cream">
        <GalleryGrid />
      </div>
    </>
  );
}
