import Link from "next/link";

export default function EstateCta() {
  return (
    <section className="bg-ss-taupe py-24 md:py-36 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2
          className="font-display font-light text-white leading-[0.9] mb-2"
          style={{ fontSize: "clamp(42px, 7vw, 88px)" }}
        >
          EVERYTHING INSIDE
        </h2>
        <h2
          className="font-display font-light italic text-white leading-[0.9] mb-12"
          style={{ fontSize: "clamp(42px, 7vw, 88px)" }}
        >
          Has a Story Too
        </h2>
        <p className="text-base text-white/70 leading-relaxed max-w-md mx-auto mb-12">
          The furniture was collected over years — from makers we love, for
          rooms we&apos;ve lived in deeply. Now it&apos;s available for its next
          home. Each piece is priced for a fair, fast sale.
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
