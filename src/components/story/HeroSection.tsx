import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Image
        src="/images/home/hero-forest-view-01.jpg"
        alt="The forest behind South Sanctuary"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-ss-ink/48" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <p className="text-[11px] tracking-[0.3em] text-white/75 uppercase mb-10">
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
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="w-px h-14 bg-white/25 mx-auto" />
      </div>
    </section>
  );
}
