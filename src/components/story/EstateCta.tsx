import Link from "next/link";

export default function EstateCta() {
  return (
    <section className="bg-ss-taupe py-24 md:py-36 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2
          className="font-display font-light text-white leading-[0.9] mb-2"
          style={{ fontSize: "clamp(42px, 7vw, 88px)" }}
        >
          THE COLLECTION
        </h2>
        <h2
          className="font-display font-light italic text-white leading-[0.9] mb-12"
          style={{ fontSize: "clamp(42px, 7vw, 88px)" }}
        >
          Is Now Available
        </h2>
        <p className="text-base text-white/70 leading-relaxed max-w-md mx-auto mb-12">
          Every piece in this home was chosen deliberately — for its material,
          its warmth, its relationship to the room it would live in. The full
          collection is now available, offered fairly to someone who will give
          it a second life.
        </p>
        <Link
          href="/estate-sale"
          className="inline-block border border-white/40 text-white text-[11px] tracking-[0.22em] uppercase px-10 py-4 hover:bg-white hover:text-ss-taupe transition-colors duration-300"
        >
          Browse the Collection
        </Link>
      </div>
    </section>
  );
}
