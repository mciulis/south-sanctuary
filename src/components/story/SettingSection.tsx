export default function SettingSection() {
  return (
    <section className="bg-ss-taupe py-24 md:py-36 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-[10px] tracking-[0.28em] text-white/40 uppercase mb-10">
          The Setting
        </p>
        <h2
          className="font-display font-light text-white leading-[0.9] mb-2"
          style={{ fontSize: "clamp(44px, 7vw, 88px)" }}
        >
          TUCKED INTO
        </h2>
        <h2
          className="font-display font-light italic text-white leading-[0.9] mb-14"
          style={{ fontSize: "clamp(44px, 7vw, 88px)" }}
        >
          The Trees
        </h2>
        <p className="text-base text-white/75 leading-relaxed max-w-xl mx-auto">
          Tucked into a corner of the city, on a quiet dead-end street, backed
          against the private wooded greenery that defines Portland&apos;s best
          neighborhoods — the modest exterior gives little away. Step inside and
          the house opens into something unexpected: breathtaking sightlines,
          natural light pouring through a south-facing wall of windows, and a
          forest that changes with every season.
        </p>
      </div>
    </section>
  );
}
