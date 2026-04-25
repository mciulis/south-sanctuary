"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { QUIET_DISTINCTION_ICONS } from "@/lib/records-icons";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function blueprintUrl(src: string) {
  if (src.startsWith("http") || src.startsWith("/")) return src;
  return `${SUPABASE_URL}/storage/v1/object/public/blueprints/${src}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface OverviewRow { label: string; value: string; }
interface UpgradeRow { year: string; item: string; }
interface DistinctionRow { icon: string; label: string; }
interface BlueprintRow { src: string; caption: string; }
interface PaintRow { brand: string; name: string; hex: string; dark: boolean; rooms: string[]; }

// ─── Shared helpers ───────────────────────────────────────────────────────────

function SectionShell({ title, children, onSave, saving }: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs tracking-widest uppercase text-gray-500">{title}</h3>
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-gray-800 text-white text-xs tracking-wide px-4 py-1.5 rounded hover:bg-gray-700 transition-colors disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      {children}
    </div>
  );
}

function SaveBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs tracking-widest uppercase px-6 py-3 rounded z-50">
      Saved
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function SortableOverviewRow({ row, onUpdate, onRemove }: {
  row: OverviewRow & { _id: string };
  onUpdate: (field: keyof OverviewRow, val: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 items-center">
      <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0">
        <GripVertical size={14} />
      </button>
      <input value={row.label} onChange={(e) => onUpdate("label", e.target.value)} placeholder="Label"
        className="w-44 border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 rounded" />
      <input value={row.value} onChange={(e) => onUpdate("value", e.target.value)} placeholder="Value"
        className="flex-1 border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 rounded" />
      <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"><Trash2 size={14} /></button>
    </div>
  );
}

function OverviewSection() {
  const [rows, setRows] = useState<(OverviewRow & { _id: string })[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    supabase.from("records_content").select("content").eq("id", "overview").single()
      .then(({ data }) => {
        if (data) setRows((data.content as OverviewRow[]).map((r, i) => ({ ...r, _id: `ov-${i}-${r.label}` })));
      });
  }, []);

  function update(id: string, field: keyof OverviewRow, val: string) {
    setRows((prev) => prev.map((r) => r._id === id ? { ...r, [field]: val } : r));
  }
  function addRow() {
    const _id = `ov-new-${Date.now()}`;
    setRows((prev) => [...prev, { label: "", value: "", _id }]);
  }
  function removeRow(id: string) { setRows((prev) => prev.filter((r) => r._id !== id)); }
  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRows((prev) => arrayMove(prev, prev.findIndex((r) => r._id === active.id), prev.findIndex((r) => r._id === over.id)));
    }
  }

  async function save() {
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clean = rows.map(({ _id, ...rest }) => rest);
    await supabase.from("records_content").upsert({ id: "overview", content: clean });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <SectionShell title="Overview" onSave={save} saving={saving}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={rows.map((r) => r._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {rows.map((row) => (
                <SortableOverviewRow key={row._id} row={row}
                  onUpdate={(field, val) => update(row._id, field, val)}
                  onRemove={() => removeRow(row._id)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button onClick={addRow} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mt-2">
          <Plus size={13} /> Add row
        </button>
      </SectionShell>
      <SaveBanner visible={saved} />
    </>
  );
}

// ─── Upgrades ─────────────────────────────────────────────────────────────────

function SortableUpgradeRow({ row, onUpdate, onRemove }: {
  row: UpgradeRow & { _id: string };
  onUpdate: (field: keyof UpgradeRow, val: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 items-center">
      <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0">
        <GripVertical size={14} />
      </button>
      <input value={row.year} onChange={(e) => onUpdate("year", e.target.value)} placeholder="Year"
        className="w-20 border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 rounded" />
      <input value={row.item} onChange={(e) => onUpdate("item", e.target.value)} placeholder="Description"
        className="flex-1 border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 rounded" />
      <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"><Trash2 size={14} /></button>
    </div>
  );
}

function UpgradesSection() {
  const [rows, setRows] = useState<(UpgradeRow & { _id: string })[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    supabase.from("records_content").select("content").eq("id", "upgrades").single()
      .then(({ data }) => {
        if (data) setRows((data.content as UpgradeRow[]).map((r, i) => ({ ...r, _id: `up-${i}-${r.year}` })));
      });
  }, []);

  function update(id: string, field: keyof UpgradeRow, val: string) {
    setRows((prev) => prev.map((r) => r._id === id ? { ...r, [field]: val } : r));
  }
  function addRow() {
    const _id = `up-new-${Date.now()}`;
    setRows((prev) => [{ year: new Date().getFullYear().toString(), item: "", _id }, ...prev]);
  }
  function removeRow(id: string) { setRows((prev) => prev.filter((r) => r._id !== id)); }
  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRows((prev) => arrayMove(prev, prev.findIndex((r) => r._id === active.id), prev.findIndex((r) => r._id === over.id)));
    }
  }

  async function save() {
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clean = rows.map(({ _id, ...rest }) => rest);
    await supabase.from("records_content").upsert({ id: "upgrades", content: clean });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <SectionShell title="Upgrades, Remodels & Refreshes" onSave={save} saving={saving}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={rows.map((r) => r._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {rows.map((row) => (
                <SortableUpgradeRow key={row._id} row={row}
                  onUpdate={(field, val) => update(row._id, field, val)}
                  onRemove={() => removeRow(row._id)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button onClick={addRow} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mt-2">
          <Plus size={13} /> Add upgrade
        </button>
      </SectionShell>
      <SaveBanner visible={saved} />
    </>
  );
}

// ─── Quiet Distinctions ───────────────────────────────────────────────────────

function SortableDistinctionRow({ row, onUpdate, onRemove }: {
  row: DistinctionRow & { _id: string };
  onUpdate: (field: keyof DistinctionRow, val: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 items-center">
      <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0">
        <GripVertical size={14} />
      </button>
      <select value={row.icon} onChange={(e) => onUpdate("icon", e.target.value)}
        className="w-44 border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-gray-400 rounded bg-white">
        {QUIET_DISTINCTION_ICONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <input value={row.label} onChange={(e) => onUpdate("label", e.target.value)} placeholder="Label"
        className="flex-1 border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 rounded" />
      <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"><Trash2 size={14} /></button>
    </div>
  );
}

function DistinctionsSection() {
  const [rows, setRows] = useState<(DistinctionRow & { _id: string })[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    supabase.from("records_content").select("content").eq("id", "quiet_distinctions").single()
      .then(({ data }) => {
        if (data) setRows((data.content as DistinctionRow[]).map((r, i) => ({ ...r, _id: `di-${i}-${r.label}` })));
      });
  }, []);

  function update(id: string, field: keyof DistinctionRow, val: string) {
    setRows((prev) => prev.map((r) => r._id === id ? { ...r, [field]: val } : r));
  }
  function addRow() {
    const _id = `di-new-${Date.now()}`;
    setRows((prev) => [...prev, { icon: "MapPin", label: "", _id }]);
  }
  function removeRow(id: string) { setRows((prev) => prev.filter((r) => r._id !== id)); }
  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRows((prev) => arrayMove(prev, prev.findIndex((r) => r._id === active.id), prev.findIndex((r) => r._id === over.id)));
    }
  }

  async function save() {
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clean = rows.map(({ _id, ...rest }) => rest);
    await supabase.from("records_content").upsert({ id: "quiet_distinctions", content: clean });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <SectionShell title="Quiet Distinctions" onSave={save} saving={saving}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={rows.map((r) => r._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {rows.map((row) => (
                <SortableDistinctionRow key={row._id} row={row}
                  onUpdate={(field, val) => update(row._id, field, val)}
                  onRemove={() => removeRow(row._id)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button onClick={addRow} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mt-2">
          <Plus size={13} /> Add item
        </button>
      </SectionShell>
      <SaveBanner visible={saved} />
    </>
  );
}

// ─── Paint (reorder only) ─────────────────────────────────────────────────────

interface SortablePaintItemProps { paint: PaintRow & { _id: string }; }

function SortablePaintItem({ paint }: SortablePaintItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: paint._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-white border border-gray-200 rounded px-3 py-2">
      <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
        <GripVertical size={14} />
      </button>
      <div className="w-8 h-8 rounded flex-shrink-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]" style={{ backgroundColor: paint.hex }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 truncate">{paint.name}</p>
        <p className="text-[11px] text-gray-400 truncate">{paint.brand}</p>
      </div>
      <p className="text-[11px] text-gray-400 truncate max-w-[140px]">{paint.rooms.join(", ")}</p>
    </div>
  );
}

function PaintSection() {
  const [paints, setPaints] = useState<(PaintRow & { _id: string })[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    supabase.from("records_content").select("content").eq("id", "paint").single()
      .then(({ data }) => {
        if (data) setPaints((data.content as PaintRow[]).map((p, i) => ({ ...p, _id: `${p.name}-${i}` })));
      });
  }, []);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPaints((prev) => {
        const oldIdx = prev.findIndex((p) => p._id === active.id);
        const newIdx = prev.findIndex((p) => p._id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  }

  async function save() {
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clean = paints.map(({ _id, ...rest }) => rest);
    await supabase.from("records_content").upsert({ id: "paint", content: clean });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <SectionShell title="Paint Selections — Reorder" onSave={save} saving={saving}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={paints.map((p) => p._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {paints.map((p) => <SortablePaintItem key={p._id} paint={p} />)}
            </div>
          </SortableContext>
        </DndContext>
        <p className="text-[11px] text-gray-400 mt-3">Drag to reorder. Save to apply.</p>
      </SectionShell>
      <SaveBanner visible={saved} />
    </>
  );
}

// ─── Blueprints (upload / delete / reorder) ───────────────────────────────────

interface SortableBlueprintProps {
  blueprint: BlueprintRow & { _id: string };
  onDelete: () => void;
  onCaptionChange: (val: string) => void;
}

function SortableBlueprint({ blueprint, onDelete, onCaptionChange }: SortableBlueprintProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: blueprint._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const url = blueprintUrl(blueprint.src);

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-white border border-gray-200 rounded px-3 py-2">
      <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0">
        <GripVertical size={14} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="w-20 h-14 object-cover bg-gray-100 flex-shrink-0 rounded" />
      <input
        value={blueprint.caption}
        onChange={(e) => onCaptionChange(e.target.value)}
        placeholder="Caption"
        className="flex-1 border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 rounded"
      />
      <button onClick={onDelete} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function BlueprintsSection() {
  const [blueprints, setBlueprints] = useState<(BlueprintRow & { _id: string })[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    supabase.from("records_content").select("content").eq("id", "blueprints").single()
      .then(({ data }) => {
        if (data) setBlueprints((data.content as BlueprintRow[]).map((b, i) => ({ ...b, _id: `bp-${i}-${b.src}` })));
      });
  }, []);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlueprints((prev) => {
        const oldIdx = prev.findIndex((b) => b._id === active.id);
        const newIdx = prev.findIndex((b) => b._id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  }

  function updateCaption(i: number, val: string) {
    setBlueprints((prev) => prev.map((b, idx) => idx === i ? { ...b, caption: val } : b));
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("blueprints").upload(path, file, { contentType: file.type });
      if (!error) {
        const newItem = { src: path, caption: file.name.replace(/\.[^.]+$/, ""), _id: `bp-new-${path}` };
        setBlueprints((prev) => [...prev, newItem]);
      }
    }
    setUploading(false);
  }

  async function deleteBlueprint(i: number) {
    const bp = blueprints[i];
    // Only delete from storage if it's a Supabase key (not a static path)
    if (!bp.src.startsWith("/") && !bp.src.startsWith("http")) {
      await supabase.storage.from("blueprints").remove([bp.src]);
    }
    setBlueprints((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clean = blueprints.map(({ _id, ...rest }) => rest);
    await supabase.from("records_content").upsert({ id: "blueprints", content: clean });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <SectionShell title="Original Blueprints" onSave={save} saving={saving}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={blueprints.map((b) => b._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {blueprints.map((bp, i) => (
                <SortableBlueprint
                  key={bp._id}
                  blueprint={bp}
                  onDelete={() => deleteBlueprint(i)}
                  onCaptionChange={(val) => updateCaption(i, val)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="mt-3">
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40"
          >
            <Plus size={13} /> {uploading ? "Uploading…" : "Upload blueprint"}
          </button>
        </div>
      </SectionShell>
      <SaveBanner visible={saved} />
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function RecordsAdmin() {
  return (
    <div className="space-y-8 max-w-3xl">
      <OverviewSection />
      <DistinctionsSection />
      <UpgradesSection />
      <PaintSection />
      <BlueprintsSection />
    </div>
  );
}
