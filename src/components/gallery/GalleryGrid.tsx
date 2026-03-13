"use client";

import { useState, useCallback } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { gallerySections, allGalleryPhotos } from "@/data/galleryPhotos";

export default function GalleryGrid() {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const handleClick = useCallback(
    ({ index }: { index: number }, sectionOffset: number) => {
      setLightboxIndex(sectionOffset + index);
    },
    []
  );

  let offset = 0;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-20">
        {gallerySections.map((section) => {
          const sectionOffset = offset;
          offset += section.photos.length;

          return (
            <div key={section.label}>
              <p className="text-[10px] tracking-[0.28em] text-ss-taupe uppercase mb-6">
                {section.label}
              </p>
              <RowsPhotoAlbum
                photos={section.photos}
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
        slides={allGalleryPhotos.map((p) => ({ src: p.src, alt: p.alt }))}
        on={{
          view: ({ index }) => setLightboxIndex(index),
        }}
        styles={{
          container: { backgroundColor: "rgba(28, 27, 25, 0.97)" },
        }}
      />
    </>
  );
}
