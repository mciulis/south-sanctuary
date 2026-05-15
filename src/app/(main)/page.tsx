import { supabase } from "@/lib/supabase";
import HeroSection from "@/components/story/HeroSection";
import QuoteSection from "@/components/story/QuoteSection";
import SettingSection from "@/components/story/SettingSection";
import HomepageStory, { StorySectionData } from "@/components/story/HomepageStory";
import MovingCta from "@/components/story/MovingCta";

export const revalidate = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function photo(path: string | undefined | null, fallback: string): string {
  if (!path) return fallback;
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/homepage/${path}`;
}

export default async function Home() {
  const { data } = await supabase.from("homepage_sections").select("id, content");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s: Record<string, any> = Object.fromEntries(
    (data ?? []).map((row) => [row.id, row.content])
  );

  const storySections: StorySectionData[] = [
    {
      sectionLabel: s.entry?.section_label ?? "The Entry",
      headline1: s.entry?.headline1 ?? "THE HOUSE",
      headline2: s.entry?.headline2 ?? "Reveals Itself",
      body: s.entry?.body ?? [],
      mainImage: { src: photo(s.entry?.main_photo, "/images/home/living-south-windows-02.jpg"), alt: "Looking down through the glass railings into the main living space" },
      detailImage: { src: photo(s.entry?.detail_photo, "/images/home/detail-entry-01.jpg"), alt: "The entry hallway and staircase" },
      imagePosition: "left",
      detailPosition: "bottom",
      bg: "cream",
    },
    {
      sectionLabel: s.kitchen?.section_label ?? "The Kitchen",
      headline1: s.kitchen?.headline1 ?? "THE ROOM",
      headline2: s.kitchen?.headline2 ?? "Everyone Gathers In",
      body: s.kitchen?.body ?? [],
      mainImage: { src: photo(s.kitchen?.main_photo, "/images/home/kitchen-island-01.jpg"), alt: "The kitchen island with dark matte cabinetry and copper pendant lights" },
      detailImage: { src: photo(s.kitchen?.detail_photo, "/images/home/kitchen-fireplace-01.jpg"), alt: "The kitchen dining table and fireplace" },
      imagePosition: "right",
      detailPosition: "top",
      bg: "cream-dark",
    },
    {
      sectionLabel: s["living-room"]?.section_label ?? "The Living Room",
      headline1: s["living-room"]?.headline1 ?? "LIGHT THAT",
      headline2: s["living-room"]?.headline2 ?? "Changes",
      body: s["living-room"]?.body ?? [],
      mainImage: { src: photo(s["living-room"]?.main_photo, "/images/home/retreat-drinks-room-landscape-01.jpg"), alt: "The living room looking south through eleven windows into the forest canopy" },
      detailImage: { src: photo(s["living-room"]?.detail_photo, "/images/home/retreat-drinks-room-south-window-01.jpg"), alt: "Looking out through the south-facing windows into the trees" },
      imagePosition: "left",
      detailPosition: "bottom",
      bg: "cream",
    },
    {
      sectionLabel: s.retreat?.section_label ?? "The Primary",
      headline1: s.retreat?.headline1 ?? "DESIGNED FOR",
      headline2: s.retreat?.headline2 ?? "Still",
      body: s.retreat?.body ?? [],
      mainImage: { src: photo(s.retreat?.main_photo, "/images/home/retreat-bathroom-01.jpg"), alt: "The master bathroom — soaking tub in niche, floating oak vanity" },
      detailImage: { src: photo(s.retreat?.detail_photo, "/images/home/retreat-bedroom-master-02.jpg"), alt: "The warm glowing master closet" },
      imagePosition: "right",
      detailPosition: "bottom",
      bg: "cream-dark",
    },
  ];

  return (
    <>
      <HeroSection content={{
        ...s.hero,
        mainPhoto: photo(s.hero?.main_photo, "/images/home/hero-forest-view-01.jpg"),
      }} />
      <QuoteSection content={s.quote} />
      <SettingSection content={s.setting} />
      <HomepageStory sections={storySections} />
      <MovingCta content={s["moving-cta"]} />
    </>
  );
}
