interface SettingContent {
  headline1?: string;
  headline2?: string;
  body?: string[];
}

export default function SettingSection({ content = {} }: { content?: SettingContent }) {
  const {
    headline1 = "TUCKED INTO",
    headline2 = "The Trees",
    body = ["Tucked into a quiet corner of the city, on a private street that ends at the trees, the modest exterior gives little away. Step inside and the house opens into something unexpected: breathtaking sightlines, natural light pouring through a south-facing wall of windows, and a forest that serves as an ever-changing canvas — summer\u2019s dense green canopy, autumn\u2019s amber and rust, winter\u2019s bare branches opening the view all the way to the sky."],
  } = content;

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
          {headline1}
        </h2>
        <h2
          className="font-display font-light italic text-white leading-[0.9] mb-14"
          style={{ fontSize: "clamp(44px, 7vw, 88px)" }}
        >
          {headline2}
        </h2>
        {body.map((para, i) => (
          <p key={i} className="text-base text-white/75 leading-relaxed max-w-xl mx-auto">
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}
