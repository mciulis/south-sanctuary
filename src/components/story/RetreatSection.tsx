import Image from "next/image";

export default function RetreatSection() {
  return (
    <section className="bg-ss-cream-dark">
      {/* Full-width image */}
      <div className="relative w-full" style={{ height: "65vh" }}>
        <Image
          src="/images/home/retreat-bathroom-01.jpg"
          alt="The master bathroom — soaking tub, floating oak vanity, glass shower"
          fill
          className="object-cover object-center"
        />
      </div>

      {/* Text below, centered */}
      <div className="max-w-xl mx-auto text-center px-8 py-20 md:py-28">
        <p className="text-[10px] tracking-[0.28em] text-ss-taupe uppercase mb-10">
          The Retreat
        </p>
        <h2
          className="font-display font-light text-ss-ink leading-[0.9] mb-2"
          style={{ fontSize: "clamp(42px, 6vw, 80px)" }}
        >
          DESIGNED FOR
        </h2>
        <h2
          className="font-display font-light italic text-ss-ink leading-[0.9] mb-12"
          style={{ fontSize: "clamp(42px, 6vw, 80px)" }}
        >
          Still
        </h2>
        <div className="space-y-5 text-left">
          <p className="text-sm text-ss-ink-soft leading-relaxed">
            We found a café in Bratislava — a place called Fach. In the middle
            of the city, it was absolutely quiet. Warm wood. Clean lines. A room
            that asked nothing of you.
          </p>
          <p className="text-sm text-ss-ink-soft leading-relaxed">
            That&apos;s what we wanted for the master bathroom.
          </p>
          <p className="text-sm text-ss-ink-soft leading-relaxed">
            The soaking tub sits in a niche framed by a window to the trees. A
            floating oak vanity. A glass shower. Everything considered, nothing
            excess. The master bedroom has its own private deck, and a closet
            that glows warm when you open it.
          </p>
          <p className="text-sm text-ss-ink-soft leading-relaxed">
            It is the kind of retreat that makes the rest of the house feel even
            better by contrast.
          </p>
        </div>
      </div>
    </section>
  );
}
