import Image from "next/image";

export default function DeckSection() {
  return (
    <section className="bg-ss-cream">
      <div className="grid md:grid-cols-[45%_55%]">
        {/* Text */}
        <div className="px-10 md:px-16 py-16 md:py-24 flex flex-col justify-center">
          <p className="text-[10px] tracking-[0.28em] text-ss-taupe uppercase mb-8">
            The Deck
          </p>
          <h2
            className="font-display font-light text-ss-ink leading-[0.9] mb-2"
            style={{ fontSize: "clamp(42px, 5vw, 76px)" }}
          >
            EIGHT HUNDRED
          </h2>
          <h2
            className="font-display font-light italic text-ss-ink leading-[0.9] mb-10"
            style={{ fontSize: "clamp(42px, 5vw, 76px)" }}
          >
            Fifty Square Feet
          </h2>
          <div className="space-y-5 max-w-sm">
            <p className="text-sm text-ss-ink-soft leading-relaxed">
              Multi-tiered, so each level has its own mood. The main deck
              stretches wide — room for a long table, chairs, and still space
              left over. A gas line runs directly to the grill, so you never
              think about propane. Water access, too.
            </p>
            <p className="text-sm text-ss-ink-soft leading-relaxed">
              The boards were just replaced. Cleaned and painted. It&apos;s
              ready.
            </p>
            <p className="text-sm text-ss-ink-soft leading-relaxed">
              Private in every direction. Trees on all sides. Above, the master
              bedroom has its own deck — smaller, quieter, for mornings alone.
            </p>
          </div>
        </div>

        {/* Image */}
        <div className="relative" style={{ minHeight: "520px" }}>
          <Image
            src="/images/home/retreat-deck-01.jpg"
            alt="The multi-tiered deck surrounded by trees"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
