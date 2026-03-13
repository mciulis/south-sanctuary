export default function SettingSection() {
  return (
    <section className="bg-ss-taupe py-24 md:py-36 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-[10px] tracking-[0.28em] text-white/40 uppercase mb-10">
          The Setting
        </p>
        <h2
          className="font-display font-light text-white leading-[0.9] mb-2"
          style={{ fontSize: "clamp(48px, 8vw, 96px)" }}
        >
          TUCKED INTO
        </h2>
        <h2
          className="font-display font-light italic text-white leading-[0.9] mb-14"
          style={{ fontSize: "clamp(48px, 8vw, 96px)" }}
        >
          The Trees
        </h2>
        <div className="space-y-6 text-left md:text-center">
          <p className="text-base text-white/75 leading-relaxed">
            The street ends here. No through traffic. No overhead lines —
            everything buried, the sky uninterrupted.
          </p>
          <p className="text-base text-white/75 leading-relaxed">
            A small creek runs through the property beyond the trees, a few
            hundred feet back. On still mornings, you can hear it. The lots on
            this side are twice the size of those across the street. Space,
            here, is not incidental. It is the premise.
          </p>
          <p className="text-base text-white/75 leading-relaxed">
            The city is minutes away. You would never know it.
          </p>
        </div>
      </div>
    </section>
  );
}
