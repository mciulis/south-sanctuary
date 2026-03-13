import Image from "next/image";

interface StoryImage {
  src: string;
  alt: string;
  portrait?: boolean;
}

interface StorySectionProps {
  sectionLabel: string;
  headline1: string;
  headline2: string;
  body: string[];
  mainImage: StoryImage;
  detailImage?: StoryImage;
  imagePosition: "left" | "right";
  detailPosition?: "top" | "middle" | "bottom";
  bg?: "cream" | "cream-dark";
}

export default function StorySection({
  sectionLabel,
  headline1,
  headline2,
  body,
  mainImage,
  detailImage,
  imagePosition,
  detailPosition = "bottom",
  bg = "cream",
}: StorySectionProps) {
  const bgClass = bg === "cream" ? "bg-ss-cream" : "bg-ss-cream-dark";

  const DetailCard = detailImage ? (
    <div
      className={`w-[58%] shadow-[0_4px_28px_rgba(0,0,0,0.10)] overflow-hidden ${
        imagePosition === "right" ? "mr-auto" : "ml-auto"
      }`}
    >
      <div
        className={`relative ${detailImage.portrait ? "aspect-[3/4]" : "aspect-[4/3]"}`}
      >
        <Image
          src={detailImage.src}
          alt={detailImage.alt}
          fill
          className="object-cover"
        />
      </div>
    </div>
  ) : null;

  const textColumn = (
    <div
      className={`flex flex-col justify-center px-10 md:px-14 py-16 md:py-24 ${bgClass}`}
    >
      {detailPosition === "top" && DetailCard && (
        <div className="mb-10">{DetailCard}</div>
      )}

      <p className="text-[10px] tracking-[0.28em] text-ss-taupe uppercase mb-8">
        {sectionLabel}
      </p>
      <h2
        className="font-display font-light text-ss-ink leading-[0.9] mb-1"
        style={{ fontSize: "clamp(36px, 4vw, 68px)" }}
      >
        {headline1}
      </h2>
      <h2
        className="font-display font-light italic text-ss-ink leading-[0.9] mb-10"
        style={{ fontSize: "clamp(36px, 4vw, 68px)" }}
      >
        {headline2}
      </h2>

      {detailPosition === "middle" && DetailCard && (
        <div className="mb-8">{DetailCard}</div>
      )}

      <div className="space-y-5 max-w-sm">
        {body.map((paragraph, i) => (
          <p key={i} className="text-sm text-ss-ink-soft leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {detailPosition === "bottom" && DetailCard && (
        <div className="mt-10">{DetailCard}</div>
      )}
    </div>
  );

  const imageColumn = (
    <div className="relative min-h-[320px] md:min-h-[620px]">
      <Image
        src={mainImage.src}
        alt={mainImage.alt}
        fill
        className="object-cover"
      />
    </div>
  );

  return (
    <section className={`grid md:grid-cols-2 ${bgClass}`}>
      {imagePosition === "left" ? (
        <>
          {imageColumn}
          {textColumn}
        </>
      ) : (
        <>
          {textColumn}
          {imageColumn}
        </>
      )}
    </section>
  );
}
