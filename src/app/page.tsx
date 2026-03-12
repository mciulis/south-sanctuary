export default function Home() {
  return (
    <div className="min-h-screen bg-ss-cream flex flex-col items-center justify-center pt-20">
      <div className="text-center px-6">
        <p className="text-[11px] tracking-[0.3em] text-ss-taupe uppercase mb-6">
          230 S Canby · Portland, Oregon
        </p>
        <h1 className="font-display font-light text-ss-ink leading-none mb-4"
          style={{ fontSize: "clamp(52px, 10vw, 120px)" }}>
          South
        </h1>
        <h1 className="font-display font-light italic text-ss-ink leading-none"
          style={{ fontSize: "clamp(52px, 10vw, 120px)" }}>
          Sanctuary
        </h1>
        <div className="mt-10 w-12 h-px bg-ss-border mx-auto" />
        <p className="mt-8 text-sm text-ss-ink-soft tracking-wide max-w-xs mx-auto leading-relaxed">
          The story is coming.
        </p>
      </div>
    </div>
  );
}
