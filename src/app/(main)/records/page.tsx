import { Metadata } from "next";
import {
  Zap, Car, MapPin, Leaf, Package, Wrench, Trees, Sun, Waves, Mountain,
  ShoppingCart, Coffee, SquareParking,
} from "lucide-react";
import BlueprintGrid from "@/components/records/BlueprintGrid";
import PaintGrid from "@/components/records/PaintGrid";

export const metadata: Metadata = {
  title: "Records — South Sanctuary",
  description: "Upgrades, paint selections, original blueprints, and notable features of 230 S Canby, Portland.",
};

// ─── Data ────────────────────────────────────────────────────────────────────

const OVERVIEW = [
  { label: "Neighborhood", value: "John's Landing, Portland" },
  { label: "Built", value: "1984" },
  { label: "Builder", value: "Chapman Homes Inc." },
  { label: "Stories", value: "2" },
  { label: "Lot Size", value: "100 × 100 ft (10,000 sf)" },
  { label: "Size", value: "~2,700 sf" },
  { label: "Deck", value: "~800 sf" },
  { label: "Bedrooms / Bathrooms", value: "3 bd / 2.5 ba" },
  { label: "Garage", value: "2-car attached" },
];

const BENEFITS = [
  { icon: Waves, label: "10 min Walk to Waterfront" },
  { icon: Mountain, label: "Neighborhood Mountain Views" },
  { icon: MapPin, label: "Quiet Dead-End Street" },
  { icon: Trees, label: "Private Backyard" },
  { icon: Leaf, label: "Minimal Yard Maintenance" },
  { icon: Car, label: "Two-Car Garage" },
  { icon: Wrench, label: "Robust Garage Workshop" },
  { icon: Package, label: "Ample Kitchen, Laundry, Garage Storage" },
  { icon: SquareParking, label: "Easy Visitor Parking" },
  { icon: ShoppingCart, label: "Zupans, Fred Meyer within 1 Mile" },
  { icon: Coffee, label: "Starbucks, Jola within 20 Min Walk" },
  { icon: Zap, label: "Buried Electrical Lines" },
  { icon: Sun, label: "Street Lights" },
];

const UPGRADES = [
  { year: "2026", item: "Complete Deck Refurbish and Repaint" },
  { year: "2024", item: "Custom-Built Garage Workshop" },
  { year: "2024", item: "New Electrical Panel" },
  { year: "2024", item: "New Sump Pump" },
  { year: "2023", item: "Guest Bath Full Remodel" },
  { year: "2023", item: "Primary Bath Full Remodel" },
  { year: "2017", item: "New Paint in All Rooms" },
  { year: "2017", item: "New Maple Floors" },
  { year: "2017", item: "New Solid Core Doors" },
  { year: "2017", item: "New Kitchen Cabinets, Countertops & Appliances" },
];

const PAINT = [
  {
    brand: "Benjamin Moore",
    name: "Simply White",
    hex: "#F7F4EF",
    dark: false,
    rooms: ["Primary Bedroom", "White Walls", "White Ceilings"],
  },
  {
    brand: "Benjamin Moore",
    name: "Light French Gray",
    hex: "#C2BDB5",
    dark: false,
    rooms: ["Kitchen", "Bonus Room", "Guest Bedrooms"],
  },
  {
    brand: "Benjamin Moore",
    name: "Whisper",
    hex: "#E4E0D8",
    dark: false,
    rooms: ["Laundry Room", "Primary Bath Ceiling"],
  },
  {
    brand: "Benjamin Moore",
    name: "Hale Navy",
    hex: "#233447",
    dark: true,
    rooms: ["Bonus Room"],
  },
  {
    brand: "Benjamin Moore",
    name: "Evening Sky",
    hex: "#4F6B7A",
    dark: true,
    rooms: ["Half Bathroom"],
  },
  {
    brand: "Sherwin Williams",
    name: "Polite White",
    hex: "#EDE8DF",
    dark: false,
    rooms: ["Secondary Full Bathroom"],
  },
  {
    brand: "Benjamin Moore",
    name: "Classic Gray",
    hex: "#C9C5BC",
    dark: false,
    rooms: ["Garage"],
  },
];

const BLUEPRINTS = [
  { src: "/images/blueprints/sheet-1-elevations.jpg", caption: "Sheet 1 — Elevations & Roof Framing" },
  { src: "/images/blueprints/sheet-2-upper-level.jpg", caption: "Sheet 2 — Upper Level Floor Plan" },
  { src: "/images/blueprints/sheet-3-entry-level.jpg", caption: "Sheet 3 — Entry Level Floor Plan" },
  { src: "/images/blueprints/sheet-4-foundation.jpg", caption: "Sheet 4 — Foundation Plan & Sections" },
  { src: "/images/blueprints/building-permit-1983.jpg", caption: "Original Building Permit, 1983" },
];

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

export default function RecordsPage() {
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
            {OVERVIEW.map((row) => (
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
            {BENEFITS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon size={15} className="text-ss-taupe mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-sm text-ss-ink">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Upgrades ────────────────────────────────────────────────────── */}
        <section>
          <SectionHeader label="Upgrades, Remodels & Refreshes" />
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[88px] top-0 bottom-0 w-px bg-ss-border" />
            {UPGRADES.map((u, i) => (
              <div key={i} className="relative grid grid-cols-[88px_1fr] gap-6 py-3 items-center">
                {/* Year */}
                <span className="text-[11px] tracking-[0.1em] text-ss-taupe tabular-nums text-right pr-4">{u.year}</span>
                {/* Dot — absolutely centered on the line */}
                <div className="absolute left-[88px] top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-ss-border z-10" />
                <span className="text-sm text-ss-ink pl-3">{u.item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Paint ───────────────────────────────────────────────────────── */}
        <section>
          <SectionHeader label="Paint Selections" />
          <PaintGrid paints={PAINT} />
        </section>

        {/* ── Blueprints ──────────────────────────────────────────────────── */}
        <section>
          <SectionHeader label="Original Blueprints" />
          <p className="text-[11px] text-ss-taupe tracking-wide mb-8">
            J.T. Balla Design Service · Chapman Homes Inc. · Permit No. 116221 · 1983
          </p>
          <BlueprintGrid blueprints={BLUEPRINTS} />
        </section>

      </div>
    </div>
  );
}
