import HeroSection from "@/components/story/HeroSection";
import QuoteSection from "@/components/story/QuoteSection";
import SettingSection from "@/components/story/SettingSection";
import LivingSection from "@/components/story/LivingSection";
import KitchenSection from "@/components/story/KitchenSection";
import DeckSection from "@/components/story/DeckSection";
import RetreatSection from "@/components/story/RetreatSection";
import EstateCta from "@/components/story/EstateCta";

export default function Home() {
  return (
    <>
      <HeroSection />
      <QuoteSection />
      <SettingSection />
      <LivingSection />
      <KitchenSection />
      <DeckSection />
      <RetreatSection />
      <EstateCta />
    </>
  );
}
