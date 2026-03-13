import { Metadata } from "next";
import { Youtube, Facebook, Instagram, Linkedin, Phone, Mail, Globe, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — South Sanctuary",
  description: "Get in touch with the listing agent for 230 S Canby, Portland.",
};

const SOCIAL = [
  {
    icon: Youtube,
    label: "YouTube",
    href: "https://www.youtube.com/@cascadesothebys",
  },
  {
    icon: Facebook,
    label: "Facebook",
    href: "https://www.facebook.com/cascadesothebys/",
  },
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://www.instagram.com/cascade_sir/?hl=en",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/cascade-sothebys-international-realty",
  },
];

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <p className="text-[10px] tracking-[0.28em] text-ss-taupe uppercase flex-shrink-0">{label}</p>
      <div className="h-px bg-ss-border flex-1" />
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="bg-ss-cream min-h-screen">
      {/* Page header */}
      <div className="pt-36 pb-16 px-6 md:px-16 max-w-5xl mx-auto">
        <p className="text-[10px] tracking-[0.28em] text-ss-taupe uppercase mb-4">
          230 S Canby · Portland, OR USA
        </p>
        <h1
          className="font-display font-light text-ss-ink leading-[0.9]"
          style={{ fontSize: "clamp(52px, 7vw, 96px)" }}
        >
          Contact
        </h1>
      </div>

      <div className="px-6 md:px-16 max-w-5xl mx-auto pb-32 space-y-20">

        {/* ── Listing Agent ─────────────────────────────────────────────── */}
        <section>
          <SectionHeader label="Listing Agent" />

          <div className="grid md:grid-cols-[1fr_1fr] gap-12 md:gap-20">

            {/* Identity */}
            <div>
              <p className="text-[10px] tracking-[0.2em] text-ss-taupe uppercase mb-3">
                Cascade Hasson Sotheby&apos;s International Realty
              </p>
              <h2
                className="font-display font-light text-ss-ink leading-[0.95] mb-3"
                style={{ fontSize: "clamp(28px, 3.5vw, 48px)" }}
              >
                Kendall Bergstrom
              </h2>
              <p className="text-[11px] tracking-[0.12em] text-ss-taupe uppercase mb-0.5">
                Principal Broker
              </p>
              <p className="text-[11px] tracking-[0.12em] text-ss-taupe uppercase">
                Global Relocation Specialist
              </p>
            </div>

            {/* Contact details */}
            <div className="flex flex-col gap-5">
              <a
                href="tel:5037992596"
                className="flex items-center gap-4 group"
              >
                <Phone size={14} className="text-ss-taupe flex-shrink-0" strokeWidth={1.5} />
                <span className="text-sm text-ss-ink group-hover:text-ss-taupe transition-colors">
                  503-799-2596
                </span>
              </a>

              <a
                href="mailto:kendall.bergstrom@sothebysrealty.com"
                className="flex items-center gap-4 group"
              >
                <Mail size={14} className="text-ss-taupe flex-shrink-0" strokeWidth={1.5} />
                <span className="text-sm text-ss-ink group-hover:text-ss-taupe transition-colors break-all">
                  kendall.bergstrom@sothebysrealty.com
                </span>
              </a>

              <a
                href="https://kendallbergstrom.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <Globe size={14} className="text-ss-taupe flex-shrink-0" strokeWidth={1.5} />
                <span className="text-sm text-ss-ink group-hover:text-ss-taupe transition-colors">
                  kendallbergstrom.com
                </span>
              </a>

              <div className="flex items-start gap-4">
                <MapPin size={14} className="text-ss-taupe flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="text-sm text-ss-ink leading-relaxed">
                  310 N State Street, Suite 102<br />
                  Lake Oswego, OR 97034
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Brokerage ─────────────────────────────────────────────────── */}
        <section>
          <SectionHeader label="Brokerage" />
          <div className="flex items-center gap-6 flex-wrap">
            {SOCIAL.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex items-center gap-2.5 text-ss-taupe hover:text-ss-ink transition-colors group"
              >
                <Icon size={16} strokeWidth={1.5} />
                <span className="text-[10px] tracking-[0.18em] uppercase">{label}</span>
              </a>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
