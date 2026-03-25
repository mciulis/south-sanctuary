"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Product, conditionLabel, CONDITION_DISCOUNTS } from "@/types/estate";
import ProductPhotoModal from "./ProductPhotoModal";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function thumb(filename: string | null) {
  if (!filename) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/products/${filename}`;
}

const CONDITIONS = ["new", "used_like_new", "used_good", "used_fair", "damaged"] as const;
const STATUSES = ["available", "reserved", "sold"] as const;

const statusColor: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  reserved: "bg-yellow-100 text-yellow-800",
  sold: "bg-gray-200 text-gray-500",
};

const BLANK_NEW_PRODUCT = {
  name: "",
  full_name: "",
  brand: "",
  units: 1,
  retail_price: "",
  condition: "new" as const,
  available_by: "",
};

export default function EstateSaleAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<number, Partial<Product>>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [photoModal, setPhotoModal] = useState<Product | null>(null);
  const [filter, setFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ ...BLANK_NEW_PRODUCT });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .order("brand", { ascending: true, nullsFirst: false })
      .order("name")
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, []);

  function edit(id: number, field: keyof Product, value: unknown) {
    setEdits((prev) => {
      const product = products.find((p) => p.id === id)!;
      const next: Partial<Product> = { ...(prev[id] ?? {}), [field]: value as Product[typeof field] };

      // Auto-compute sale_price when any pricing input changes
      if (["retail_price", "condition", "discount_percent"].includes(field)) {
        const retail = ("retail_price" in next ? next.retail_price : product.retail_price) as number | null;
        const condition = ("condition" in next ? next.condition : product.condition) as string;
        const override = ("discount_percent" in next ? next.discount_percent : product.discount_percent) as number | null;
        const pct = override ?? CONDITION_DISCOUNTS[condition] ?? 0;
        next.sale_price = retail != null ? Math.round(retail * (1 - pct / 100)) : null;
      }

      return { ...prev, [id]: next };
    });
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

  async function addProduct() {
    if (!newProduct.name.trim()) return;
    setAdding(true);
    setAddError(null);

    const retail = newProduct.retail_price ? parseFloat(newProduct.retail_price as string) : null;
    const pct = CONDITION_DISCOUNTS[newProduct.condition] ?? 0;
    const sale_price = retail != null ? Math.round(retail * (1 - pct / 100)) : null;
    const units = Number(newProduct.units) || 1;

    const { data, error } = await supabase.from("products").insert({
      name: newProduct.name.trim(),
      full_name: newProduct.full_name.trim() || newProduct.name.trim(),
      brand: newProduct.brand.trim() || null,
      units,
      units_available: units,
      retail_price: retail,
      sale_price,
      condition: newProduct.condition,
      available_by: newProduct.available_by || null,
      status: "available",
    }).select().single();

    if (error) {
      setAddError("Something went wrong. Please try again.");
      setAdding(false);
      return;
    }

    setProducts((prev) => [...prev, data as Product].sort((a, b) =>
      (a.brand ?? "").localeCompare(b.brand ?? "") || a.name.localeCompare(b.name)
    ));
    setNewProduct({ ...BLANK_NEW_PRODUCT });
    setShowAddForm(false);
    setAdding(false);
  }

  async function deleteProduct(id: number) {
    setDeleting(id);
    await supabase.from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setConfirmDelete(null);
    setDeleting(null);
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
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Filter by name…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-gray-600"
          />
          <button
            onClick={() => { setShowAddForm(true); setAddError(null); }}
            className="bg-gray-800 text-white text-sm px-4 py-1.5 hover:bg-gray-700 transition-colors"
          >
            + Add Item
          </button>
        </div>
      </div>

      {/* Add item form */}
      {showAddForm && (
        <div className="mb-4 border border-gray-300 bg-gray-50 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">New Item</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Beau Table Lamp"
                className="w-full border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Full Name</label>
              <input
                type="text"
                value={newProduct.full_name}
                onChange={(e) => setNewProduct((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="Defaults to name if blank"
                className="w-full border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Brand</label>
              <input
                type="text"
                value={newProduct.brand}
                onChange={(e) => setNewProduct((p) => ({ ...p, brand: e.target.value }))}
                placeholder="e.g. Blu Dot"
                className="w-full border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Units</label>
              <input
                type="number"
                min={1}
                value={newProduct.units}
                onChange={(e) => setNewProduct((p) => ({ ...p, units: parseInt(e.target.value) || 1 }))}
                className="w-full border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Retail Price</label>
              <input
                type="number"
                value={newProduct.retail_price}
                onChange={(e) => setNewProduct((p) => ({ ...p, retail_price: e.target.value }))}
                placeholder="$"
                className="w-full border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Condition</label>
              <select
                value={newProduct.condition}
                onChange={(e) => setNewProduct((p) => ({ ...p, condition: e.target.value as typeof newProduct.condition }))}
                className="w-full border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-gray-600 bg-white"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{conditionLabel[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Available By</label>
              <input
                type="date"
                value={newProduct.available_by}
                onChange={(e) => setNewProduct((p) => ({ ...p, available_by: e.target.value }))}
                className="w-full border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-gray-600"
              />
            </div>
          </div>
          {addError && <p className="text-sm text-red-600 mb-3">{addError}</p>}
          <div className="flex gap-3">
            <button
              onClick={addProduct}
              disabled={adding || !newProduct.name.trim()}
              className="bg-gray-800 text-white text-sm px-5 py-1.5 hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {adding ? "Adding…" : "Add Item"}
            </button>
            <button
              onClick={() => { setShowAddForm(false); setNewProduct({ ...BLANK_NEW_PRODUCT }); }}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded overflow-hidden" onClick={(e) => { if ((e.target as HTMLElement).closest("button") === null) setConfirmDelete(null); }}>
        {/* Table header */}
        <div className="grid grid-cols-[48px_2fr_1fr_220px_150px_130px_110px_80px_80px_40px] gap-x-3 px-4 py-2 bg-gray-50 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-400">
          <span></span>
          <span>Item</span>
          <span>Room</span>
          <span>Pricing</span>
          <span>Condition</span>
          <span>Available By</span>
          <span>Status</span>
          <span>Photos</span>
          <span></span>
          <span></span>
        </div>

        {/* Rows */}
        {filtered.map((product) => {
          const dirty = isDirty(product);
          const currentEdits = edits[product.id] ?? {};
          const isOverride = "discount_percent" in currentEdits
            ? currentEdits.discount_percent != null
            : product.discount_percent != null;
          const overrideVal = "discount_percent" in currentEdits
            ? currentEdits.discount_percent
            : product.discount_percent;
          const formulaDiscount = CONDITION_DISCOUNTS[getVal(product, "condition")] ?? 0;

          return (
            <div
              key={product.id}
              className="grid grid-cols-[48px_2fr_1fr_220px_150px_130px_110px_80px_80px_40px] gap-x-3 px-4 py-2.5 border-b border-gray-100 items-center hover:bg-gray-50/50 transition-colors"
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
                <input
                  value={getVal(product, "brand") ?? ""}
                  onChange={(e) => edit(product.id, "brand", e.target.value || null)}
                  placeholder="Brand"
                  className="w-full text-[10px] text-gray-400 border-b border-transparent hover:border-gray-300 focus:border-gray-600 bg-transparent focus:outline-none transition-colors truncate"
                />
                <p className="text-sm text-gray-800 truncate font-medium">{product.name}</p>
              </div>

              {/* Room */}
              <p className="text-xs text-gray-500 truncate">{product.room ?? "—"}</p>

              {/* Pricing */}
              <div className="space-y-1">
                {/* Retail */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400 w-9 shrink-0">Retail</span>
                  <span className="text-[10px] text-gray-400">$</span>
                  <input
                    type="number"
                    value={getVal(product, "retail_price") ?? ""}
                    onChange={(e) => edit(product.id, "retail_price", e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-16 border-b border-transparent hover:border-gray-300 focus:border-gray-600 bg-transparent py-0.5 text-xs focus:outline-none transition-colors"
                  />
                </div>

                {/* Discount — only shown when retail price is set */}
                {getVal(product, "retail_price") != null && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400 w-9 shrink-0">Disc.</span>
                    {isOverride ? (
                      <div className="flex items-center gap-0.5">
                        <input
                          type="number"
                          value={overrideVal ?? ""}
                          onChange={(e) => edit(product.id, "discount_percent", e.target.value ? parseFloat(e.target.value) : null)}
                          className="w-10 border-b border-amber-400 focus:border-amber-600 bg-transparent py-0.5 text-xs focus:outline-none"
                        />
                        <span className="text-[10px] text-gray-400">%</span>
                        <button
                          onClick={() => edit(product.id, "discount_percent", null)}
                          className="text-[10px] text-gray-400 hover:text-gray-700 ml-0.5"
                          title="Clear override, use formula"
                        >✕</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400">{formulaDiscount}%</span>
                        <button
                          onClick={() => edit(product.id, "discount_percent", formulaDiscount)}
                          className="text-[10px] text-blue-500 hover:text-blue-700"
                        >override</button>
                      </div>
                    )}
                  </div>
                )}

                {/* Sale — computed when retail is set, directly editable when not */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400 w-9 shrink-0">Sale</span>
                  {getVal(product, "retail_price") == null ? (
                    <>
                      <span className="text-[10px] text-gray-400">$</span>
                      <input
                        type="number"
                        value={getVal(product, "sale_price") ?? ""}
                        onChange={(e) => edit(product.id, "sale_price", e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-16 border-b border-transparent hover:border-gray-300 focus:border-gray-600 bg-transparent py-0.5 text-xs font-medium text-gray-800 focus:outline-none transition-colors"
                        placeholder="—"
                      />
                    </>
                  ) : (
                    <span className="text-xs font-medium text-gray-800">
                      {getVal(product, "sale_price") != null
                        ? `$${getVal(product, "sale_price")?.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                        : "—"}
                    </span>
                  )}
                </div>
              </div>

              {/* Condition */}
              <select
                value={getVal(product, "condition")}
                onChange={(e) => edit(product.id, "condition", e.target.value)}
                className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-gray-500"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {conditionLabel[c]}
                  </option>
                ))}
              </select>

              {/* Available By */}
              <input
                type="date"
                value={getVal(product, "available_by") ?? ""}
                onChange={(e) => edit(product.id, "available_by", e.target.value || null)}
                className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-gray-500 w-full"
              />

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

              {/* Delete */}
              <div className="flex justify-end">
                {confirmDelete === product.id ? (
                  <button
                    onClick={() => deleteProduct(product.id)}
                    disabled={deleting === product.id}
                    className="text-[10px] text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                  >
                    {deleting === product.id ? "…" : "Confirm"}
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(product.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors text-sm leading-none"
                    title="Delete item"
                  >
                    ✕
                  </button>
                )}
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
