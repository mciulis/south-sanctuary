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
  verticalListSortingStrategy,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

function photoUrl(src: string) {
  // If it's already a full URL, return as-is
  if (src.startsWith("http")) return src;
  // Static path
  if (src.startsWith("/")) return src;
  // Supabase storage
  return `${SUPABASE_URL}/storage/v1/object/public/gallery/${src}`;
}

// ─── Sortable photo thumbnail ───────────────────────────────────────────────

function SortablePhotoThumb({
  photo,
  onDelete,
}: {
  photo: GalleryPhoto;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="relative group aspect-square bg-gray-100 overflow-hidden"
    >
      <div {...attributes} {...listeners} className="absolute inset-0 cursor-grab active:cursor-grabbing z-10" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photoUrl(photo.src)} alt={photo.alt ?? ""} className="w-full h-full object-cover" />
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-1 right-1 z-20 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
      >
        ×
      </button>
    </div>
  );
}

// ─── Sortable section row ────────────────────────────────────────────────────

function SortableSectionRow({
  section,
  photos,
  expanded,
  onToggle,
  onRename,
  onDelete,
  onPhotoReorder,
  onPhotoDelete,
  onUpload,
}: {
  section: GallerySection;
  photos: GalleryPhoto[];
  expanded: boolean;
  onToggle: () => void;
  onRename: (label: string) => void;
  onDelete: () => void;
  onPhotoReorder: (photos: GalleryPhoto[]) => void;
  onPhotoDelete: (photo: GalleryPhoto) => void;
  onUpload: (files: FileList) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(section.name);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const photoSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handlePhotoReorder(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = photos.findIndex((p) => p.id === active.id);
    const newIdx = photos.findIndex((p) => p.id === over.id);
    onPhotoReorder(arrayMove(photos, oldIdx, newIdx).map((p, i) => ({ ...p, sort_order: i })));
  }

  async function handleUpload(files: FileList) {
    setUploading(true);
    await onUpload(files);
    setUploading(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="border border-gray-200 bg-white rounded"
    >
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing select-none px-1"
          title="Drag to reorder section"
        >
          ⠿
        </div>

        {/* Label / rename */}
        {editing ? (
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => { setEditing(false); onRename(label); }}
            onKeyDown={(e) => { if (e.key === "Enter") { setEditing(false); onRename(label); } if (e.key === "Escape") { setEditing(false); setLabel(section.name); } }}
            className="flex-1 border-b border-gray-400 bg-transparent text-sm font-medium focus:outline-none"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex-1 text-left text-sm font-medium text-gray-800 hover:text-gray-600"
            title="Click to rename"
          >
            {label}
          </button>
        )}

        <span className="text-xs text-gray-400">{photos.length} photo{photos.length !== 1 ? "s" : ""}</span>

        <button
          onClick={onToggle}
          className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1"
        >
          {expanded ? "▲ Collapse" : "▼ Expand"}
        </button>

        <button
          onClick={() => { if (confirm(`Delete section "${label}" and all its photos?`)) onDelete(); }}
          className="text-xs text-red-400 hover:text-red-600"
        >
          Delete
        </button>
      </div>

      {/* Photo grid */}
      {expanded && (
        <div className="px-4 pb-4">
          <DndContext sensors={photoSensors} collisionDetection={closestCenter} onDragEnd={handlePhotoReorder}>
            <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-6 gap-2 mb-3">
                {photos.map((photo) => (
                  <SortablePhotoThumb
                    key={photo.id}
                    photo={photo}
                    onDelete={() => onPhotoDelete(photo)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "+ Add Photos"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main GalleryAdmin ───────────────────────────────────────────────────────

export default function GalleryAdmin() {
  const [sections, setSections] = useState<GallerySection[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  const sectionSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

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

  function photosForSection(sectionId: number) {
    return photos.filter((p) => p.section_id === sectionId).sort((a, b) => a.sort_order - b.sort_order);
  }

  async function handleSectionReorder(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sections.findIndex((s) => s.id === active.id);
    const newIdx = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIdx, newIdx).map((s, i) => ({ ...s, sort_order: i }));
    setSections(reordered);
    await Promise.all(
      reordered.map((s) => supabase.from("gallery_sections").update({ sort_order: s.sort_order }).eq("id", s.id))
    );
  }

  async function renameSection(id: number, name: string) {
    await supabase.from("gallery_sections").update({ name }).eq("id", id);
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  }

  async function deleteSection(id: number) {
    // Delete photos from storage + DB
    const sectionPhotos = photosForSection(id);
    for (const photo of sectionPhotos) {
      if (!photo.src.startsWith("/") && !photo.src.startsWith("http")) {
        await supabase.storage.from("gallery").remove([photo.src]);
      }
      await supabase.from("gallery_photos").delete().eq("id", photo.id);
    }
    await supabase.from("gallery_sections").delete().eq("id", id);
    setSections((prev) => prev.filter((s) => s.id !== id));
    setPhotos((prev) => prev.filter((p) => p.section_id !== id));
  }

  async function addSection() {
    if (!newLabel.trim()) return;
    const sort_order = sections.length;
    const { data } = await supabase
      .from("gallery_sections")
      .insert({ name: newLabel.trim(), sort_order })
      .select()
      .single();
    if (data) {
      setSections((prev) => [...prev, data as GallerySection]);
      setExpanded((prev) => ({ ...prev, [(data as GallerySection).id]: true }));
    }
    setNewLabel("");
    setAdding(false);
  }

  async function reorderPhotos(sectionId: number, reordered: GalleryPhoto[]) {
    setPhotos((prev) => [
      ...prev.filter((p) => p.section_id !== sectionId),
      ...reordered,
    ]);
    await Promise.all(
      reordered.map((p) => supabase.from("gallery_photos").update({ sort_order: p.sort_order }).eq("id", p.id))
    );
  }

  async function deletePhoto(photo: GalleryPhoto) {
    if (!confirm("Delete this photo?")) return;
    if (!photo.src.startsWith("/") && !photo.src.startsWith("http")) {
      await supabase.storage.from("gallery").remove([photo.src]);
    }
    await supabase.from("gallery_photos").delete().eq("id", photo.id);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
  }

  async function uploadPhotos(sectionId: number, files: FileList) {
    const newPhotos: GalleryPhoto[] = [];
    const base = photosForSection(sectionId).length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${sectionId}/${Date.now()}-${i}.${ext}`;

      const { error } = await supabase.storage.from("gallery").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) { console.error(error); continue; }

      // Get image dimensions
      const dims = await getImageDimensions(file);

      const { data } = await supabase
        .from("gallery_photos")
        .insert({ section_id: sectionId, src: path, alt: null, width: dims.width, height: dims.height, sort_order: base + i })
        .select()
        .single();

      if (data) newPhotos.push(data as GalleryPhoto);
    }

    setPhotos((prev) => [...prev, ...newPhotos]);
  }

  if (loading) return <p className="text-gray-400 text-sm py-8">Loading gallery…</p>;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">
          Gallery
          <span className="ml-2 font-normal text-gray-400">({sections.length} sections)</span>
        </h2>
        <button
          onClick={() => setAdding(true)}
          className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700"
        >
          + New Section
        </button>
      </div>

      {adding && (
        <div className="mb-4 flex gap-2">
          <input
            autoFocus
            type="text"
            placeholder="Section name…"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addSection(); if (e.key === "Escape") { setAdding(false); setNewLabel(""); } }}
            className="border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-gray-600 w-56"
          />
          <button onClick={addSection} className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700">
            Add
          </button>
          <button onClick={() => { setAdding(false); setNewLabel(""); }} className="text-xs text-gray-400 hover:text-gray-700 px-2">
            Cancel
          </button>
        </div>
      )}

      <DndContext sensors={sectionSensors} collisionDetection={closestCenter} onDragEnd={handleSectionReorder}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sections.map((section) => (
              <SortableSectionRow
                key={section.id}
                section={section}
                photos={photosForSection(section.id)}
                expanded={!!expanded[section.id]}
                onToggle={() => setExpanded((prev) => ({ ...prev, [section.id]: !prev[section.id] }))}
                onRename={(label) => renameSection(section.id, label)}
                onDelete={() => deleteSection(section.id)}
                onPhotoReorder={(reordered) => reorderPhotos(section.id, reordered)}
                onPhotoDelete={deletePhoto}
                onUpload={(files) => uploadPhotos(section.id, files)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {sections.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-12">No sections yet. Add one above.</p>
      )}
    </>
  );
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { resolve({ width: 800, height: 600 }); URL.revokeObjectURL(url); };
    img.src = url;
  });
}
