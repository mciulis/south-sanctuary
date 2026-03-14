"use client";

import { useState } from "react";
import StorySection from "./StorySection";
import Carousel, { CarouselSlide } from "@/components/ui/Carousel";

export interface StorySectionData {
  sectionLabel: string;
  headline1: string;
  headline2: string;
  body: string[];
  mainImage: { src: string; alt: string };
  detailImage?: { src: string; alt: string };
  imagePosition: "left" | "right";
  detailPosition?: "top" | "middle" | "bottom";
  bg?: "cream" | "cream-dark";
}

export default function HomepageStory({ sections }: { sections: StorySectionData[] }) {
  const [carouselIndex, setCarouselIndex] = useState<number | null>(null);

  // Build a flat slide list and a map of section+type → global index
  const slides: CarouselSlide[] = [];
  const indexMap: { sectionIdx: number; isDetail: boolean; slideIdx: number }[] = [];

  sections.forEach((section, si) => {
    const mainIdx = slides.length;
    slides.push({ src: section.mainImage.src, alt: section.mainImage.alt, caption: section.sectionLabel });
    indexMap.push({ sectionIdx: si, isDetail: false, slideIdx: mainIdx });

    if (section.detailImage) {
      const detailIdx = slides.length;
      slides.push({ src: section.detailImage.src, alt: section.detailImage.alt, caption: section.sectionLabel });
      indexMap.push({ sectionIdx: si, isDetail: true, slideIdx: detailIdx });
    }
  });

  function slideIndex(sectionIdx: number, isDetail: boolean): number {
    return indexMap.find((e) => e.sectionIdx === sectionIdx && e.isDetail === isDetail)?.slideIdx ?? 0;
  }

  return (
    <>
      {sections.map((section, i) => (
        <StorySection
          key={i}
          {...section}
          onMainImageClick={() => setCarouselIndex(slideIndex(i, false))}
          onDetailImageClick={() => setCarouselIndex(slideIndex(i, true))}
        />
      ))}

      {carouselIndex !== null && (
        <Carousel
          slides={slides}
          startIndex={carouselIndex}
          onClose={() => setCarouselIndex(null)}
        />
      )}
    </>
  );
}
