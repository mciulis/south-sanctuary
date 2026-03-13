import Image from "next/image";

export default function LivingSection() {
  return (
    <section className="bg-ss-cream">
      {/* Full-width hero image */}
      <div className="relative w-full" style={{ height: "65vh" }}>
        <Image
          src="/images/home/living-south-windows-02.jpg"
          alt="Looking down through glass railings into the main living space"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Text + secondary image */}
      <div className="grid md:grid-cols-2 gap-0">
        {/* Text */}
        <div className="px-10 md:px-16 py-16 md:py-24 flex flex-col justify-center">
          <p className="text-[10px] tracking-[0.28em] text-ss-taupe uppercase mb-8">
            The Living
          </p>
          <h2
            className="font-display font-light text-ss-ink leading-[0.9] mb-2"
            style={{ fontSize: "clamp(42px, 6vw, 80px)" }}
          >
            LIGHT THAT
          </h2>
          <h2
            className="font-display font-light italic text-ss-ink leading-[0.9] mb-10"
            style={{ fontSize: "clamp(42px, 6vw, 80px)" }}
          >
            Changes
          </h2>
          <div className="space-y-5 max-w-sm">
            <p className="text-sm text-ss-ink-soft leading-relaxed">
              As you descend to the main floor, the room opens.
            </p>
            <p className="text-sm text-ss-ink-soft leading-relaxed">
              Eleven south-facing windows line the wall. The forest fills them.
              The light that comes through is never harsh — it shifts through the
              day, through the seasons, from pale morning gold to long afternoon
              amber. Double-height ceilings. Glass railings at the entry that
              frame the view before you&apos;ve even stepped inside.
            </p>
            <p className="text-sm text-ss-ink-soft leading-relaxed">
              This room doesn&apos;t need decorating. The trees do that.
            </p>
          </div>
        </div>

        {/* Secondary image */}
        <div className="relative" style={{ minHeight: "420px" }}>
          <Image
            src="/images/home/living-south-windows-01.jpg"
            alt="The main living room facing south toward the forest"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
