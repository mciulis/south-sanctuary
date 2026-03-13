"use client";

import { useEffect, useState, useCallback } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { supabase } from "@/lib/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

interface GallerySection {
  id: number;
  name: string;
  sort_order: number;
}

interface GalleryPhoto {
  id: number;
  section_id: number;
  src: string;
  alt: string | null;
  width: number;
  height: number;
  sort_order: number;
}

function resolveUrl(src: string) {
  if (src.startsWith("http") || src.startsWith("/")) return src;
  return `${SUPABASE_URL}/storage/v1/object/public/gallery/${src}`;
}

export default function GalleryGrid() {
  const [sections, setSections] = useState<GallerySection[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    Promise.all([
      supabase.from("gallery_sections").select("*").order("sort_order"),
      supabase.from("gallery_photos").select("*").order("sort_order"),
    ]).then(([{ data: s }, { data: p }]) => {
      setSections((s as GallerySection[]) ?? []);
      setPhotos((p as GalleryPhoto[]) ?? []);
      setLoading(false);
    });
  }, []);

  const handleClick = useCallback(({ index }: { index: number }, sectionOffset: number) => {
    setLightboxIndex(sectionOffset + index);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <p className="text-ss-taupe text-sm">Loading…</p>
      </div>
    );
  }

  // Build flat slides array for lightbox (in section/sort order)
  const allSlides = sections.flatMap((section) =>
    photos
      .filter((p) => p.section_id === section.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((p) => ({ src: resolveUrl(p.src), alt: p.alt ?? "" }))
  );

  let offset = 0;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-20">
        {sections.map((section) => {
          const sectionPhotos = photos
            .filter((p) => p.section_id === section.id)
            .sort((a, b) => a.sort_order - b.sort_order);

          const albumPhotos = sectionPhotos.map((p) => ({
            src: resolveUrl(p.src),
            alt: p.alt ?? "",
            width: p.width,
            height: p.height,
          }));

          const sectionOffset = offset;
          offset += sectionPhotos.length;

          if (albumPhotos.length === 0) return null;

          return (
            <div key={section.id}>
              <p className="text-[10px] tracking-[0.28em] text-ss-taupe uppercase mb-6">
                {section.name}
              </p>
              <RowsPhotoAlbum
                photos={albumPhotos}
                targetRowHeight={380}
                rowConstraints={{ maxPhotos: 4 }}
                spacing={6}
                onClick={({ index }) => handleClick({ index }, sectionOffset)}
              />
            </div>
          );
        })}
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={allSlides}
        on={{ view: ({ index }) => setLightboxIndex(index) }}
        styles={{ container: { backgroundColor: "rgba(28, 27, 25, 0.97)" } }}
      />
    </>
  );
}
