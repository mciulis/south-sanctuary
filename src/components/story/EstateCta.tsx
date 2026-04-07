import Link from "next/link";
import Image from "next/image";

interface EstateCtaContent {
  headline1?: string;
  headline2?: string;
  body?: string[];
  button_text?: string;
}

export default function EstateCta({
  content = {},
  hideButton = false,
  backgroundImage,
  footnote,
}: {
  content?: EstateCtaContent;
  hideButton?: boolean;
  backgroundImage?: string;
  footnote?: string;
}) {
  const {
    headline1 = "THE ESTATE SALE",
    headline2 = "Is Now Open",
    body = ["Every piece in this home was chosen deliberately — for its material, its warmth, its relationship to the room it would live in and the other furniture it would live beside. The full collection is being offered fairly to someone who will give it a second life."],
    button_text = "Browse the Collection",
  } = content;

  return (
    <section className="relative bg-ss-taupe py-24 md:py-36 px-6 overflow-hidden">
      {backgroundImage && (
        <>
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover object-[center_65%]"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/55" />
        </>
      )}
      <div className="relative max-w-2xl mx-auto text-center">
        <h2
          className="font-display font-light text-white leading-[0.9] mb-2"
          style={{ fontSize: "clamp(42px, 7vw, 88px)" }}
        >
          {headline1}
        </h2>
        <h2
          className="font-display font-light italic text-white leading-[0.9] mb-12"
          style={{ fontSize: "clamp(42px, 7vw, 88px)" }}
        >
          {headline2}
        </h2>
        {body.map((para, i) => (
          <p key={i} className="text-base text-white/70 leading-relaxed max-w-md mx-auto mb-12">
            {para}
          </p>
        ))}
        {!hideButton && (
          <Link
            href="/estate-sale"
            className="inline-block border border-white/40 text-white text-[11px] tracking-[0.22em] uppercase px-10 py-4 hover:bg-white hover:text-ss-taupe transition-colors duration-300"
          >
            {button_text}
          </Link>
        )}
        {footnote && (
          <p className="text-[11px] italic text-white/65 mt-10 max-w-xs mx-auto leading-relaxed">
            {footnote}
          </p>
        )}
      </div>
    </section>
  );
}

