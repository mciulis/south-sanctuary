import Link from "next/link";

const NAV_LINKS = [
  { label: "Story", href: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "Moving Sale", href: "/moving-sale" },
];

export default function Footer() {
  return (
    <footer className="bg-ss-ink text-ss-cream relative overflow-hidden">
      {/* Ghost headline */}
      <div
        aria-hidden
        className="absolute bottom-8 left-6 md:left-14 pointer-events-none select-none leading-none"
      >
        <span className="font-display font-light text-white/[0.04] whitespace-nowrap"
          style={{ fontSize: "clamp(60px, 12vw, 160px)" }}>
          SOUTH
        </span>
        <br />
        <span className="font-display font-light italic text-white/[0.04] whitespace-nowrap"
          style={{ fontSize: "clamp(60px, 12vw, 160px)" }}>
          SANCTUARY
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 md:px-14 pt-16 pb-8">
        <div className="flex flex-col md:flex-row gap-12 md:gap-24 mb-16">
          {/* Address */}
          <div>
            <p className="text-[10px] tracking-[0.2em] text-ss-cream/40 uppercase mb-4">
              Address
            </p>
            <p className="text-sm text-ss-cream/70 leading-relaxed">
              230 S Canby Street
              <br />
              Portland, Oregon
            </p>
          </div>

          {/* Sitemap */}
          <div>
            <p className="text-[10px] tracking-[0.2em] text-ss-cream/40 uppercase mb-4">
              Sitemap
            </p>
            <nav className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-ss-cream/70 hover:text-ss-cream transition-colors tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row justify-between gap-2">
          <p className="text-[10px] text-ss-cream/30 tracking-wider">
            © 2025 South Sanctuary
          </p>
          <p className="text-[10px] text-ss-cream/30 tracking-wider">
            230 S Canby · Portland, OR
          </p>
        </div>
      </div>
    </footer>
  );
}
