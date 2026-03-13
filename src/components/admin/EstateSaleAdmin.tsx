"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Product, conditionLabel } from "@/types/estate";
import ProductPhotoModal from "./ProductPhotoModal";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function thumb(filename: string | null) {
  if (!filename) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/products/${filename}`;
}

const CONDITIONS = ["like_new", "light_wear", "heavy_wear", "damaged", "na"] as const;
const STATUSES = ["available", "reserved", "sold"] as const;

const statusColor: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  reserved: "bg-yellow-100 text-yellow-800",
  sold: "bg-gray-200 text-gray-500",
};

export default function EstateSaleAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<number, Partial<Product>>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [photoModal, setPhotoModal] = useState<Product | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .order("room")
      .order("name")
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, []);

  function edit(id: number, field: keyof Product, value: unknown) {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  function getVal<K extends keyof Product>(product: Product, field: K): Product[K] {
    return (edits[product.id]?.[field] ?? product[field]) as Product[K];
  }

  function isDirty(product: Product) {
    const e = edits[product.id];
    if (!e) return false;
    return Object.entries(e).some(([k, v]) => v !== product[k as keyof Product]);
  }

  async function saveRow(product: Product) {
    const e = edits[product.id];
    if (!e) return;
    setSaving((p) => ({ ...p, [product.id]: true }));
    await supabase.from("products").update(e).eq("id", product.id);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, ...e } : p))
    );
    setEdits((prev) => { const n = { ...prev }; delete n[product.id]; return n; });
    setSaving((p) => ({ ...p, [product.id]: false }));
    setSaved((p) => ({ ...p, [product.id]: true }));
    setTimeout(() => setSaved((p) => ({ ...p, [product.id]: false })), 2000);
  }

  const filtered = products.filter(
    (p) =>
      !filter ||
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.full_name.toLowerCase().includes(filter.toLowerCase()) ||
      (p.room ?? "").toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <p className="text-gray-400 text-sm py-8">Loading products…</p>;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">
          Estate Sale
          <span className="ml-2 font-normal text-gray-400">({products.length} items)</span>
        </h2>
        <input
          type="text"
          placeholder="Filter by name or room…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-gray-600"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[48px_2fr_1fr_120px_140px_110px_80px_80px] gap-x-3 px-4 py-2 bg-gray-50 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-400">
          <span></span>
          <span>Item</span>
          <span>Room</span>
          <span>Price</span>
          <span>Condition</span>
          <span>Status</span>
          <span>Photos</span>
          <span></span>
        </div>

        {/* Rows */}
        {filtered.map((product) => {
          const dirty = isDirty(product);
          return (
            <div
              key={product.id}
              className="grid grid-cols-[48px_2fr_1fr_120px_140px_110px_80px_80px] gap-x-3 px-4 py-2.5 border-b border-gray-100 items-center hover:bg-gray-50/50 transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 bg-gray-100 overflow-hidden flex-shrink-0">
                {thumb(product.main_photo_filename) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb(product.main_photo_filename)!}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">
                    ·
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 truncate">{product.full_name.split(" \u2013 ")[0] || ""}</p>
                <p className="text-sm text-gray-800 truncate font-medium">{product.name}</p>
              </div>

              {/* Room */}
              <p className="text-xs text-gray-500 truncate">{product.room ?? "—"}</p>

              {/* Price */}
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-xs">$</span>
                <input
                  type="number"
                  value={getVal(product, "sale_price") ?? ""}
                  onChange={(e) => edit(product.id, "sale_price", e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-20 border-b border-transparent hover:border-gray-300 focus:border-gray-600 bg-transparent py-0.5 text-sm focus:outline-none transition-colors"
                />
              </div>

              {/* Condition */}
              <select
                value={getVal(product, "condition")}
                onChange={(e) => edit(product.id, "condition", e.target.value)}
                className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-gray-500"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {conditionLabel[c] || "N/A"}
                  </option>
                ))}
              </select>

              {/* Status */}
              <select
                value={getVal(product, "status")}
                onChange={(e) => edit(product.id, "status", e.target.value)}
                className={`text-xs border-0 rounded px-2 py-1 font-medium focus:outline-none ${statusColor[getVal(product, "status")]}`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>

              {/* Photo count */}
              <button
                onClick={() => setPhotoModal(product)}
                className="text-xs text-blue-600 hover:underline text-left"
              >
                Edit photos
              </button>

              {/* Save */}
              <div className="flex justify-end">
                {saved[product.id] ? (
                  <span className="text-xs text-green-600">Saved</span>
                ) : dirty ? (
                  <button
                    onClick={() => saveRow(product)}
                    disabled={saving[product.id]}
                    className="text-xs bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700 disabled:opacity-50"
                  >
                    {saving[product.id] ? "…" : "Save"}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {photoModal && (
        <ProductPhotoModal
          product={photoModal}
          onClose={() => setPhotoModal(null)}
          onUpdated={(updated) => {
            setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setPhotoModal(updated);
          }}
        />
      )}
    </>
  );
}
