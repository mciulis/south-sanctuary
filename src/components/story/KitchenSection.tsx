import Image from "next/image";

export default function KitchenSection() {
  return (
    <section className="bg-ss-cream-dark">
      <div className="grid md:grid-cols-[55%_45%]">
        {/* Image */}
        <div className="relative order-2 md:order-1" style={{ minHeight: "560px" }}>
          <Image
            src="/images/home/kitchen-island-01.jpg"
            alt="The kitchen island with dark matte cabinetry and copper pendant lights"
            fill
            className="object-cover"
          />
        </div>

        {/* Text */}
        <div className="order-1 md:order-2 px-10 md:px-16 py-16 md:py-24 flex flex-col justify-center bg-ss-cream-dark">
          <p className="text-[10px] tracking-[0.28em] text-ss-taupe uppercase mb-8">
            The Kitchen
          </p>
          <h2
            className="font-display font-light text-ss-ink leading-[0.9] mb-2"
            style={{ fontSize: "clamp(42px, 5vw, 76px)" }}
          >
            THE ROOM
          </h2>
          <h2
            className="font-display font-light italic text-ss-ink leading-[0.9] mb-10"
            style={{ fontSize: "clamp(42px, 5vw, 76px)" }}
          >
            Everyone Gathers In
          </h2>
          <div className="space-y-5 max-w-sm">
            <p className="text-sm text-ss-ink-soft leading-relaxed">
              The island is deeper than most — built for cooking alongside
              someone, and for four people to lean in around it.
            </p>
            <p className="text-sm text-ss-ink-soft leading-relaxed">
              Dark matte cabinetry. White quartz. Copper pendants overhead. A
              westward window that catches the afternoon. At the far end, a
              fireplace. The dining table lives here too, because this room
              always becomes the center of things.
            </p>
            <p className="text-sm text-ss-ink-soft leading-relaxed">
              It is, without meaning to be, the best room in the house for a
              conversation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
