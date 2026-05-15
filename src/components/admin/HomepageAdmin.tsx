"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function photoUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/homepage/${path}`;
}

// ─── Section config ───────────────────────────────────────────────────────────

type SectionType = "hero" | "quote" | "setting" | "story" | "cta";

const SECTION_CONFIG: { id: string; label: string; type: SectionType }[] = [
  { id: "hero", label: "Hero", type: "hero" },
  { id: "quote", label: "Quote", type: "quote" },
  { id: "setting", label: "The Setting", type: "setting" },
  { id: "entry", label: "The Entry", type: "story" },
  { id: "kitchen", label: "The Kitchen", type: "story" },
  { id: "living-room", label: "The Living Room", type: "story" },
  { id: "retreat", label: "The Retreat", type: "story" },
  { id: "moving-cta", label: "Moving Sale CTA", type: "cta" },
];

// ─── Photo replacer ───────────────────────────────────────────────────────────

function PhotoReplacer({
  label,
  currentPath,
  onUploaded,
}: {
  label: string;
  currentPath: string | null | undefined;
  onUploaded: (path: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const url = photoUrl(currentPath);

  async function handleFile(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${Date.now()}.${ext}`;
    await supabase.storage.from("homepage").upload(path, file, { contentType: file.type, upsert: false });
    onUploaded(path);
    setUploading(false);
  }

  return (
    <div>
      <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex items-start gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="w-24 h-16 object-cover bg-gray-100 flex-shrink-0" />
        ) : (
          <div className="w-24 h-16 bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-300 text-xs">
            None
          </div>
        )}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Replace Photo"}
          </button>
          {currentPath && (
            <p className="text-[10px] text-gray-400 mt-1 truncate max-w-[180px]">
              {currentPath.split("/").pop()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  config,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialContent,
}: {
  config: typeof SECTION_CONFIG[number];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialContent: Record<string, any>;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [content, setContent] = useState<Record<string, any>>(initialContent);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key: string, value: unknown) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  function setBodyPara(index: number, value: string) {
    const updated = [...(content.body ?? [])];
    updated[index] = value;
    set("body", updated);
  }

  async function save() {
    setSaving(true);
    await supabase
      .from("homepage_sections")
      .upsert({ id: config.id, content, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const body: string[] = content.body ?? [];

  return (
    <div className="border border-gray-200 bg-white rounded">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-sm font-medium text-gray-800">{config.label}</span>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1"
        >
          {expanded ? "▲ Collapse" : "▼ Expand"}
        </button>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-5">

          {/* Hero */}
          {config.type === "hero" && (
            <>
              <Field label="Headline (line 1)" value={content.headline1 ?? ""} onChange={(v) => set("headline1", v)} />
              <Field label="Headline (line 2, italic)" value={content.headline2 ?? ""} onChange={(v) => set("headline2", v)} />
              <PhotoReplacer label="Background Photo" currentPath={content.main_photo} onUploaded={(p) => set("main_photo", p)} />
            </>
          )}

          {/* Quote */}
          {config.type === "quote" && (
            <>
              <Field label="Quote text" value={content.quote ?? ""} onChange={(v) => set("quote", v)} multiline />
              <Field label="Attribution" value={content.attribution ?? ""} onChange={(v) => set("attribution", v)} />
            </>
          )}

          {/* Setting */}
          {config.type === "setting" && (
            <>
              <Field label="Headline (line 1)" value={content.headline1 ?? ""} onChange={(v) => set("headline1", v)} />
              <Field label="Headline (line 2, italic)" value={content.headline2 ?? ""} onChange={(v) => set("headline2", v)} />
              {body.map((para, i) => (
                <Field key={i} label={`Body paragraph ${i + 1}`} value={para} onChange={(v) => setBodyPara(i, v)} multiline />
              ))}
            </>
          )}

          {/* Story sections */}
          {config.type === "story" && (
            <>
              <Field label="Section label" value={content.section_label ?? ""} onChange={(v) => set("section_label", v)} />
              <Field label="Headline (line 1)" value={content.headline1 ?? ""} onChange={(v) => set("headline1", v)} />
              <Field label="Headline (line 2, italic)" value={content.headline2 ?? ""} onChange={(v) => set("headline2", v)} />
              {body.map((para, i) => (
                <Field key={i} label={`Body paragraph ${i + 1}`} value={para} onChange={(v) => setBodyPara(i, v)} multiline />
              ))}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <PhotoReplacer label="Main Photo" currentPath={content.main_photo} onUploaded={(p) => set("main_photo", p)} />
                <PhotoReplacer label="Detail Photo" currentPath={content.detail_photo} onUploaded={(p) => set("detail_photo", p)} />
              </div>
            </>
          )}

          {/* Estate CTA */}
          {config.type === "cta" && (
            <>
              <Field label="Headline (line 1)" value={content.headline1 ?? ""} onChange={(v) => set("headline1", v)} />
              <Field label="Headline (line 2, italic)" value={content.headline2 ?? ""} onChange={(v) => set("headline2", v)} />
              {body.map((para, i) => (
                <Field key={i} label={`Body paragraph ${i + 1}`} value={para} onChange={(v) => setBodyPara(i, v)} multiline />
              ))}
              <Field label="Button text" value={content.button_text ?? ""} onChange={(v) => set("button_text", v)} />
            </>
          )}

          {/* Save */}
          <div className="flex justify-end pt-1">
            {saved ? (
              <span className="text-xs text-green-600">Saved</span>
            ) : (
              <button
                onClick={save}
                disabled={saving}
                className="text-xs bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Small field component ────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-gray-500 resize-y leading-relaxed"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-gray-500"
        />
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HomepageAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sectionData, setSectionData] = useState<Record<string, Record<string, any>> | null>(null);

  useEffect(() => {
    supabase
      .from("homepage_sections")
      .select("id, content")
      .then(({ data }) => {
        const map = Object.fromEntries((data ?? []).map((r) => [r.id, r.content]));
        setSectionData(map);
      });
  }, []);

  if (!sectionData) return <p className="text-gray-400 text-sm py-8">Loading…</p>;

  return (
    <>
      <div className="mb-4">
        <h2 className="font-semibold text-gray-800">Homepage</h2>
        <p className="text-xs text-gray-400 mt-1">
          Changes take effect on the live site within ~60 seconds.
        </p>
      </div>

      <div className="space-y-2">
        {SECTION_CONFIG.map((config) => (
          <SectionCard
            key={config.id}
            config={config}
            initialContent={sectionData[config.id] ?? {}}
          />
        ))}
      </div>
    </>
  );
}
