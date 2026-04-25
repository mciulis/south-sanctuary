import { Metadata } from "next";
import { MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BlueprintGrid from "@/components/records/BlueprintGrid";
import PaintGrid from "@/components/records/PaintGrid";
import { QUIET_DISTINCTION_ICON_MAP } from "@/lib/records-icons";

export const metadata: Metadata = {
  title: "Records — South Sanctuary",
  description: "Upgrades, paint selections, original blueprints, and notable features of 230 S Canby, Portland.",
};

export const revalidate = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function resolveBlueprintSrc(src: string) {
  if (src.startsWith("http") || src.startsWith("/")) return src;
  return `${SUPABASE_URL}/storage/v1/object/public/blueprints/${src}`;
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <p className="text-[10px] tracking-[0.28em] text-ss-taupe uppercase flex-shrink-0">{label}</p>
      <div className="h-px bg-ss-border flex-1" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RecordsPage() {
  const { data } = await supabase
    .from("records_content")
    .select("id, content");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rc: Record<string, any[]> = Object.fromEntries(
    (data ?? []).map((row) => [row.id, row.content])
  );

  const overview: { label: string; value: string }[] = rc.overview ?? [];
  const upgrades: { year: string; item: string }[] = rc.upgrades ?? [];
  const distinctions: { icon: string; label: string }[] = rc.quiet_distinctions ?? [];
  const paint: { brand: string; name: string; hex: string; dark: boolean; rooms: string[] }[] = rc.paint ?? [];
  const blueprints: { src: string; caption: string }[] = (rc.blueprints ?? []).map(
    (b: { src: string; caption: string }) => ({ ...b, src: resolveBlueprintSrc(b.src) })
  );

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
          Records
        </h1>
      </div>

      <div className="px-6 md:px-16 max-w-5xl mx-auto pb-32 space-y-24">

        {/* ── Overview ────────────────────────────────────────────────────── */}
        <section>
          <SectionHeader label="Overview" />
          <div className="divide-y divide-ss-border">
            {overview.map((row) => (
              <div key={row.label} className="grid grid-cols-[200px_1fr] gap-6 py-3.5 items-baseline">
                <span className="text-[11px] tracking-[0.1em] text-ss-taupe uppercase">{row.label}</span>
                <span className="text-sm text-ss-ink">{row.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Quiet Distinctions ──────────────────────────────────────────── */}
        <section>
          <SectionHeader label="Quiet Distinctions" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
            {distinctions.map(({ icon, label }) => {
              const Icon = QUIET_DISTINCTION_ICON_MAP[icon] ?? MapPin;
              return (
                <div key={label} className="flex items-start gap-3">
                  <Icon size={15} className="text-ss-taupe mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-sm text-ss-ink">{label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Upgrades ────────────────────────────────────────────────────── */}
        <section>
          <SectionHeader label="Upgrades, Remodels & Refreshes" />
          <div>
            {upgrades.map((u, i) => (
              <div key={i} className="flex items-center py-3">
                <div className="w-[88px] flex-shrink-0 text-right pr-4">
                  <span className="text-[11px] tracking-[0.1em] text-ss-taupe tabular-nums">{u.year}</span>
                </div>
                <div className="relative flex items-center justify-center w-6 flex-shrink-0 self-stretch">
                  <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-ss-border" />
                  <div className="w-1.5 h-1.5 rounded-full bg-ss-border relative z-10" />
                </div>
                <span className="text-sm text-ss-ink pl-4 flex-1">{u.item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Paint ───────────────────────────────────────────────────────── */}
        <section>
          <SectionHeader label="Paint Selections" />
          <PaintGrid paints={paint} />
        </section>

        {/* ── Blueprints ──────────────────────────────────────────────────── */}
        <section>
          <SectionHeader label="Original Blueprints" />
          <p className="text-[11px] text-ss-taupe tracking-wide mb-8">
            J.T. Balla Design Service · Chapman Homes Inc. · Permit No. 116221 · 1983
          </p>
          <BlueprintGrid blueprints={blueprints} />
        </section>

      </div>
    </div>
  );
}
