"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, GripVertical } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OverviewRow { label: string; value: string; }
interface UpgradeRow { year: string; item: string; }
interface DistinctionRow { icon: string; label: string; }

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

function OverviewSection() {
  const [rows, setRows] = useState<OverviewRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("records_content").select("content").eq("id", "overview").single()
      .then(({ data }) => { if (data) setRows(data.content as OverviewRow[]); });
  }, []);

  function update(i: number, field: keyof OverviewRow, val: string) {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  }

  function addRow() {
    setRows((prev) => [...prev, { label: "", value: "" }]);
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    await supabase.from("records_content").upsert({ id: "overview", content: rows });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <SectionShell title="Overview" onSave={save} saving={saving}>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={row.label}
                onChange={(e) => update(i, "label", e.target.value)}
                placeholder="Label"
                className="w-44 border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 rounded"
              />
              <input
                value={row.value}
                onChange={(e) => update(i, "value", e.target.value)}
                placeholder="Value"
                className="flex-1 border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 rounded"
              />
              <button onClick={() => removeRow(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addRow} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mt-2">
          <Plus size={13} /> Add row
        </button>
      </SectionShell>
      <SaveBanner visible={saved} />
    </>
  );
}

// ─── Upgrades ─────────────────────────────────────────────────────────────────

function UpgradesSection() {
  const [rows, setRows] = useState<UpgradeRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("records_content").select("content").eq("id", "upgrades").single()
      .then(({ data }) => { if (data) setRows(data.content as UpgradeRow[]); });
  }, []);

  function update(i: number, field: keyof UpgradeRow, val: string) {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  }

  function addRow() {
    setRows((prev) => [{ year: new Date().getFullYear().toString(), item: "" }, ...prev]);
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    await supabase.from("records_content").upsert({ id: "upgrades", content: rows });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <SectionShell title="Upgrades, Remodels & Refreshes" onSave={save} saving={saving}>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={row.year}
                onChange={(e) => update(i, "year", e.target.value)}
                placeholder="Year"
                className="w-20 border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 rounded"
              />
              <input
                value={row.item}
                onChange={(e) => update(i, "item", e.target.value)}
                placeholder="Description"
                className="flex-1 border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 rounded"
              />
              <button onClick={() => removeRow(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addRow} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mt-2">
          <Plus size={13} /> Add upgrade
        </button>
      </SectionShell>
      <SaveBanner visible={saved} />
    </>
  );
}

// ─── Quiet Distinctions ───────────────────────────────────────────────────────

const ICON_OPTIONS = [
  "Car", "Coffee", "Leaf", "MapPin", "Mountain", "Package",
  "ShoppingCart", "SquareParking", "Sun", "Trees", "Waves", "Wrench", "Zap",
];

function DistinctionsSection() {
  const [rows, setRows] = useState<DistinctionRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("records_content").select("content").eq("id", "quiet_distinctions").single()
      .then(({ data }) => { if (data) setRows(data.content as DistinctionRow[]); });
  }, []);

  function update(i: number, field: keyof DistinctionRow, val: string) {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  }

  function addRow() {
    setRows((prev) => [...prev, { icon: "MapPin", label: "" }]);
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    await supabase.from("records_content").upsert({ id: "quiet_distinctions", content: rows });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <SectionShell title="Quiet Distinctions" onSave={save} saving={saving}>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select
                value={row.icon}
                onChange={(e) => update(i, "icon", e.target.value)}
                className="w-36 border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-gray-400 rounded bg-white"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <input
                value={row.label}
                onChange={(e) => update(i, "label", e.target.value)}
                placeholder="Label"
                className="flex-1 border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 rounded"
              />
              <button onClick={() => removeRow(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addRow} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mt-2">
          <Plus size={13} /> Add item
        </button>
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
    </div>
  );
}
