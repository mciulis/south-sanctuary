export default function QuoteSection() {
  return (
    <section className="bg-ss-cream py-24 md:py-36 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <blockquote
          className="font-display font-light italic text-ss-ink leading-relaxed"
          style={{ fontSize: "clamp(22px, 3.5vw, 38px)" }}
        >
          &ldquo;Home is a refuge, a shelter from the storms, a sanctuary that
          steadies us when the world feels unkind.&rdquo;
        </blockquote>
        <cite className="block mt-8 text-[11px] tracking-[0.25em] text-ss-ink-soft uppercase not-italic">
          Mary Anne Byrne
        </cite>
      </div>
    </section>
  );
}
