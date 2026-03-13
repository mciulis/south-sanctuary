import HeroSection from "@/components/story/HeroSection";
import QuoteSection from "@/components/story/QuoteSection";
import SettingSection from "@/components/story/SettingSection";
import StorySection from "@/components/story/StorySection";
import EstateCta from "@/components/story/EstateCta";

export default function Home() {
  return (
    <>
      <HeroSection />
      <QuoteSection />
      <SettingSection />

      {/* The Entry */}
      <StorySection
        sectionLabel="The Entry"
        headline1="THE HOUSE"
        headline2="Reveals Itself"
        body={[
          "The glass railings announce the home's intention before anything else does. Custom-built and open, they frame the treeline the moment you walk in — and as you descend to the main floor, the house gradually reveals itself.",
          "The ceilings rise. The windows multiply. The sense of space becomes something you feel before you can describe it. Standing at the bottom of the stairs, looking south through eleven windows into the canopy beyond, you understand immediately why this place feels the way it does.",
        ]}
        mainImage={{
          src: "/images/home/living-south-windows-02.jpg",
          alt: "Looking down through the glass railings into the main living space",
        }}
        detailImage={{
          src: "/images/home/detail-entry-01.jpg",
          alt: "The entry hallway and staircase",
        }}
        imagePosition="left"
        detailPosition="bottom"
        bg="cream"
      />

      {/* The Kitchen */}
      <StorySection
        sectionLabel="The Kitchen"
        headline1="THE ROOM"
        headline2="Everyone Gathers In"
        body={[
          "The kitchen was designed around a simple idea: that the best conversations happen when people are standing close together, leaning over something warm. The island runs deep — wide enough for two people cooking side by side, with room for four more to pull up a stool.",
          "Dark matte cabinetry meets white quartz in a contrast that feels both modern and resolved, anchored by copper pendant lights overhead. A window faces west and catches the afternoon. A fireplace holds the far wall. The dining table lives here too — because in this house, as in most good houses, the kitchen is where the night always ends up.",
        ]}
        mainImage={{
          src: "/images/home/kitchen-island-01.jpg",
          alt: "The kitchen island with dark matte cabinetry and copper pendant lights",
        }}
        detailImage={{
          src: "/images/home/kitchen-fireplace-01.jpg",
          alt: "The kitchen dining table and fireplace",
        }}
        imagePosition="right"
        detailPosition="top"
        bg="cream-dark"
      />

      {/* The Living Room */}
      <StorySection
        sectionLabel="The Living Room"
        headline1="LIGHT THAT"
        headline2="Changes"
        body={[
          "The main room earns its name. Tall ceilings draw the eye up while eleven south-facing windows draw it outward — into the trees, into the light, into a view that shifts through the day without ever feeling harsh or overexposed.",
          "It's the kind of room that makes you want to slow down: to read, to host, to watch a winter afternoon turn amber through the glass. The forest is the furniture here. Everything else is secondary.",
        ]}
        mainImage={{
          src: "/images/home/gallery-living-east-01.jpg",
          alt: "The living room with floor-to-ceiling south-facing windows and the forest beyond",
        }}
        detailImage={{
          src: "/images/home/retreat-drinks-room-portrait-01.jpg",
          alt: "Overhead view of the living space looking down through the south windows",
          portrait: true,
        }}
        imagePosition="left"
        detailPosition="middle"
        bg="cream"
      />

      {/* The Retreat */}
      <StorySection
        sectionLabel="The Retreat"
        headline1="DESIGNED FOR"
        headline2="Still"
        body={[
          "We found a café in Bratislava called Fach — tucked into the middle of the city, a room that asked only that you slow down. Warm wood, clean lines, still water. We thought of it often when designing the master bathroom.",
          "The soaking tub sits in its own niche, framed by a window to the trees. A floating oak vanity. A glass shower. Every detail considered, nothing in excess. The master bedroom has its own private deck, and a closet that glows warmly when you step into it.",
        ]}
        mainImage={{
          src: "/images/home/retreat-bathroom-01.jpg",
          alt: "The master bathroom — soaking tub in niche, floating oak vanity",
        }}
        detailImage={{
          src: "/images/home/retreat-bedroom-master-02.jpg",
          alt: "The warm glowing master closet",
        }}
        imagePosition="right"
        detailPosition="bottom"
        bg="cream-dark"
      />

      <EstateCta />
    </>
  );
}
