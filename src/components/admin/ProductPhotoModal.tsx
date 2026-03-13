"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/estate";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

interface ProductImage {
  id: number;
  product_id: number;
  filename: string;
  sort_order: number;
}

function photoUrl(filename: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/products/${filename}`;
}

function SortablePhoto({
  image,
  isHero,
  onSetHero,
  onDelete,
}: {
  image: ProductImage;
  isHero: boolean;
  onSetHero: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-square bg-gray-100 overflow-hidden"
    >
      {/* Drag handle covers the image */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoUrl(image.filename)}
        alt=""
        className="w-full h-full object-cover"
      />

      {/* Hero badge */}
      {isHero && (
        <div className="absolute top-1.5 left-1.5 bg-amber-400 text-[10px] font-semibold px-1.5 py-0.5 z-20 pointer-events-none">
          HERO
        </div>
      )}

      {/* Action buttons (above drag overlay) */}
      <div className="absolute bottom-0 inset-x-0 flex gap-1 p-1.5 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        {!isHero && (
          <button
            onClick={(e) => { e.stopPropagation(); onSetHero(); }}
            className="flex-1 text-[10px] bg-white/90 text-gray-800 py-1 hover:bg-white transition-colors"
          >
            Set Hero
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="flex-1 text-[10px] bg-red-500/90 text-white py-1 hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function ProductPhotoModal({
  product,
  onClose,
  onUpdated,
}: {
  product: Product;
  onClose: () => void;
  onUpdated: (updated: Product) => void;
}) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    supabase
      .from("product_images")
      .select("*")
      .eq("product_id", product.id)
      .order("sort_order")
      .then(({ data }) => {
        setImages((data as ProductImage[]) ?? []);
        setLoading(false);
      });
  }, [product.id]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((i) => i.id === active.id);
    const newIndex = images.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(images, oldIndex, newIndex).map((img, idx) => ({
      ...img,
      sort_order: idx,
    }));
    setImages(reordered);

    // Persist new sort_order
    await Promise.all(
      reordered.map((img) =>
        supabase.from("product_images").update({ sort_order: img.sort_order }).eq("id", img.id)
      )
    );

    // If hero changed position, update main_photo_filename
    const newHero = reordered[0];
    if (newHero && newHero.filename !== product.main_photo_filename) {
      await setHero(newHero.filename, reordered);
    }
  }

  async function setHero(filename: string, currentImages?: ProductImage[]) {
    await supabase.from("products").update({ main_photo_filename: filename }).eq("id", product.id);
    onUpdated({ ...product, main_photo_filename: filename });

    // Reorder so hero is first
    const imgs = currentImages ?? images;
    const heroIdx = imgs.findIndex((i) => i.filename === filename);
    if (heroIdx > 0) {
      const reordered = arrayMove(imgs, heroIdx, 0).map((img, idx) => ({
        ...img,
        sort_order: idx,
      }));
      setImages(reordered);
      await Promise.all(
        reordered.map((img) =>
          supabase.from("product_images").update({ sort_order: img.sort_order }).eq("id", img.id)
        )
      );
    }
  }

  async function deletePhoto(image: ProductImage) {
    if (!confirm("Delete this photo?")) return;
    await supabase.storage.from("products").remove([image.filename]);
    await supabase.from("product_images").delete().eq("id", image.id);

    const remaining = images.filter((i) => i.id !== image.id);
    setImages(remaining);

    // If deleted hero, promote next
    if (image.filename === product.main_photo_filename) {
      const next = remaining[0] ?? null;
      await supabase
        .from("products")
        .update({ main_photo_filename: next?.filename ?? null })
        .eq("id", product.id);
      onUpdated({ ...product, main_photo_filename: next?.filename ?? null });
    }
  }

  async function uploadPhotos(files: FileList) {
    setUploading(true);
    const newImages: ProductImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop() ?? "jpg";
      const filename = `${product.id}/${Date.now()}-${i}.${ext}`;

      const { error } = await supabase.storage.from("products").upload(filename, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) { console.error(error); continue; }

      const sort_order = images.length + newImages.length;
      const { data } = await supabase
        .from("product_images")
        .insert({ product_id: product.id, filename, sort_order })
        .select()
        .single();

      if (data) newImages.push(data as ProductImage);
    }

    const allImages = [...images, ...newImages];
    setImages(allImages);

    // Set hero if product had none
    if (!product.main_photo_filename && allImages.length > 0) {
      await setHero(allImages[0].filename, allImages);
    }

    setUploading(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <p className="text-xs text-gray-400">{product.full_name.split(" \u2013 ")[0] || ""}</p>
            <h2 className="font-semibold text-gray-800">{product.name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none mt-0.5">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-3">
                Drag to reorder · First photo is the hero image
              </p>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img) => (
                      <SortablePhoto
                        key={img.id}
                        image={img}
                        isHero={img.filename === product.main_photo_filename}
                        onSetHero={() => setHero(img.filename)}
                        onDelete={() => deletePhoto(img)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {images.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No photos yet</p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-400">{images.length} photo{images.length !== 1 ? "s" : ""}</p>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && uploadPhotos(e.target.files)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload Photos"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
