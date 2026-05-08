"use client";

import { useEffect, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

type Status = "pending" | "confirmed" | "cancelled" | "withdrawn";
type ViewMode = "summary" | "person" | "item";
type ItemGrouping = "none" | "brand" | "room";

interface Reservation {
  id: string;
  product_id: number;
  product_name: string;
  product_brand: string | null;
  product_room: string | null;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  message: string | null;
  status: Status;
  created_at: string;
  units_requested: number;
  waitlistPosition: number | null;
  waitlistTotal: number;
}

interface Product {
  id: number;
  name: string;
  sale_price: string | null;
  main_photo_filename: string | null;
  brand: string | null;
  room: string | null;
  status: string;
}

interface Buyer {
  email: string;
  name: string;
  phone: string | null;
  items: Reservation[];
  notes: string;
}

interface ProductGroup {
  product_id: number;
  product_name: string;
  product_brand: string | null;
  product_room: string | null;
  reservations: Reservation[];
}

const statusStyle: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-200 text-gray-500",
  withdrawn: "bg-orange-100 text-orange-700",
};

function photoUrl(filename: string | null): string | null {
  if (!filename) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/products/${filename}`;
}

function fmt(price: string | number | null): string {
  if (price == null) return "—";
  const n = typeof price === "string" ? parseFloat(price) : price;
  return isNaN(n) ? "—" : `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded">
      {(["summary", "person", "item"] as ViewMode[]).map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-3 py-1 text-xs tracking-wide rounded transition-colors ${
            view === v ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {v === "summary" ? "Summary" : v === "person" ? "By Person" : "By Item"}
        </button>
      ))}
    </div>
  );
}

function GroupingToggle({ grouping, onChange }: { grouping: ItemGrouping; onChange: (g: ItemGrouping) => void }) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded">
      {(["none", "brand", "room"] as ItemGrouping[]).map(g => (
        <button
          key={g}
          onClick={() => onChange(g)}
          className={`px-3 py-1 text-xs tracking-wide rounded transition-colors ${
            grouping === g ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {g === "none" ? "All" : g === "brand" ? "By Brand" : "By Room"}
        </button>
      ))}
    </div>
  );
}

export default function PeopleAdmin() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("summary");
  const [grouping, setGrouping] = useState<ItemGrouping>("none");

  // Person view state
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [savingContact, setSavingContact] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [reservationsRes, notesRes, productsRes] = await Promise.all([
      fetch("/api/admin/reservations"),
      fetch("/api/admin/buyer-notes"),
      fetch("/api/admin/products"),
    ]);

    const raw: any[] = await reservationsRes.json();
    const notes = await notesRes.json();
    const allProducts: Product[] = await productsRes.json();

    const notesMap = new Map<string, string>(
      (notes ?? []).map((n: any) => [n.buyer_email, n.notes])
    );

    const activeStatuses = new Set(["pending", "confirmed"]);
    const waitlistTotals = new Map<number, number>();
    for (const r of raw) {
      if (activeStatuses.has(r.status)) {
        waitlistTotals.set(r.product_id, (waitlistTotals.get(r.product_id) ?? 0) + 1);
      }
    }

    const enriched: Reservation[] = raw
      .filter(r => !r.buyer_name?.toLowerCase().includes("test"))
      .map(r => {
        return {
          id: r.id,
          product_id: r.product_id,
          product_name: r.product_name,
          product_brand: r.product_brand,
          product_room: r.product_room,
          buyer_name: r.buyer_name,
          buyer_email: r.buyer_email,
          buyer_phone: r.buyer_phone ?? null,
          message: r.message,
          status: r.status as Status,
          created_at: r.created_at,
          units_requested: r.units_requested ?? 1,
          waitlistPosition: r.waitlist_position ?? null,
          waitlistTotal: waitlistTotals.get(r.product_id) ?? 0,
        };
      });

    setReservations(enriched);
    setProducts(allProducts);

    const buyerMap = new Map<string, Buyer>();
    for (const r of enriched) {
      if (!buyerMap.has(r.buyer_email)) {
        buyerMap.set(r.buyer_email, {
          email: r.buyer_email,
          name: r.buyer_name,
          phone: r.buyer_phone,
          items: [],
          notes: notesMap.get(r.buyer_email) ?? "",
        });
      }
      buyerMap.get(r.buyer_email)!.items.push(r);
    }
    const sorted = Array.from(buyerMap.values()).sort((a, b) => {
      const aLatest = Math.max(...a.items.map(i => new Date(i.created_at).getTime()));
      const bLatest = Math.max(...b.items.map(i => new Date(i.created_at).getTime()));
      return bLatest - aLatest;
    });
    setBuyers(sorted);
    setLoading(false);
  }

  async function updateStatus(reservationId: string, status: Status) {
    setUpdatingItem(reservationId);
    await fetch(`/api/admin/reservations/${reservationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadData();
    setUpdatingItem(null);
  }

  async function saveNotes(email: string, notes: string) {
    await fetch("/api/admin/buyer-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyer_email: email, notes }),
    });
  }

  async function saveContact(oldEmail: string) {
    setSavingContact(true);
    const { name, email: newEmail, phone } = editForm;
    await fetch("/api/admin/buyers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldEmail, name, email: newEmail, phone }),
    });
    setBuyers(prev =>
      prev.map(b => b.email === oldEmail ? { ...b, name, email: newEmail, phone: phone || null } : b)
    );
    setEditingEmail(null);
    setSavingContact(false);
  }

  // Build product groups for item view
  function buildProductGroups(): ProductGroup[] {
    const map = new Map<number, ProductGroup>();
    const activeReservations = reservations.filter(r => r.status === "pending" || r.status === "confirmed");
    const byCreated = [...activeReservations].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    for (const r of byCreated) {
      if (!map.has(r.product_id)) {
        map.set(r.product_id, {
          product_id: r.product_id,
          product_name: r.product_name,
          product_brand: r.product_brand,
          product_room: r.product_room,
          reservations: [],
        });
      }
      map.get(r.product_id)!.reservations.push(r);
    }
    return Array.from(map.values()).sort((a, b) => a.product_name.localeCompare(b.product_name));
  }

  function groupProducts(groups: ProductGroup[]): { label: string; items: ProductGroup[] }[] {
    if (grouping === "none") return [{ label: "", items: groups }];
    const buckets = new Map<string, ProductGroup[]>();
    for (const g of groups) {
      const key = (grouping === "brand" ? g.product_brand : g.product_room) ?? "—";
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(g);
    }
    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, items]) => ({ label, items }));
  }

  // Build summary data
  function buildSummary() {
    const activeByProduct = new Map<number, Reservation[]>();
    const active = reservations
      .filter(r => r.status === "pending" || r.status === "confirmed")
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    for (const r of active) {
      if (!activeByProduct.has(r.product_id)) activeByProduct.set(r.product_id, []);
      activeByProduct.get(r.product_id)!.push(r);
    }

    const reserved: { product: Product; first: Reservation; otherCount: number }[] = [];
    const unreserved: Product[] = [];

    for (const p of products) {
      const queue = activeByProduct.get(p.id) ?? [];
      if (queue.length > 0) {
        reserved.push({ product: p, first: queue[0], otherCount: queue.length - 1 });
      } else {
        unreserved.push(p);
      }
    }

    reserved.sort((a, b) => a.product.name.localeCompare(b.product.name));
    unreserved.sort((a, b) => a.name.localeCompare(b.name));

    const reservedTotal = reserved.reduce((sum, { product }) => sum + (parseFloat(product.sale_price ?? "0") || 0), 0);
    const unreservedTotal = unreserved.reduce((sum, p) => sum + (parseFloat(p.sale_price ?? "0") || 0), 0);

    return { reserved, unreserved, reservedTotal, unreservedTotal };
  }

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;
  if (reservations.length === 0 && products.length === 0) return <p className="text-sm text-gray-400">No requests yet.</p>;

  const productGroups = buildProductGroups();
  const groupedProducts = groupProducts(productGroups);
  const { reserved, unreserved, reservedTotal, unreservedTotal } = buildSummary();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <ViewToggle view={view} onChange={setView} />
        {view === "item" && <GroupingToggle grouping={grouping} onChange={setGrouping} />}
        <p className="text-xs text-gray-400 ml-auto">
          {view === "summary"
            ? `${products.length} items total`
            : view === "person"
            ? `${buyers.length} people`
            : `${productGroups.length} items with requests`}
        </p>
      </div>

      {/* Summary view */}
      {view === "summary" && (
        <div className="space-y-10">
          {/* Reserved section */}
          <div>
            <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-gray-200">
              <p className="text-[10px] uppercase tracking-widest text-gray-400">
                Reserved · {reserved.length} item{reserved.length !== 1 ? "s" : ""}
              </p>
              <p className="text-sm font-medium text-gray-800">{fmt(reservedTotal)}</p>
            </div>
            {reserved.length === 0 ? (
              <p className="text-sm text-gray-400">No reserved items.</p>
            ) : (
              <div className="border border-gray-200 bg-white rounded divide-y divide-gray-100">
                {reserved.map(({ product, first, otherCount }) => (
                  <div key={product.id} className="flex items-center gap-4 px-4 py-3">
                    <div className="w-11 h-11 shrink-0 bg-gray-100 rounded overflow-hidden">
                      {photoUrl(product.main_photo_filename) ? (
                        <img
                          src={photoUrl(product.main_photo_filename)!}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{product.name}</p>
                      {(product.brand || product.room) && (
                        <p className="text-[11px] text-gray-400 truncate">
                          {[product.brand, product.room].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 tabular-nums w-16 text-right shrink-0">
                      {fmt(product.sale_price)}
                    </p>
                    <div className="w-44 min-w-0 shrink-0">
                      <p className="text-sm text-gray-800 truncate">{first.buyer_name}</p>
                      <p className="text-[11px] text-gray-400 truncate">
                        <a href={`mailto:${first.buyer_email}`} className="hover:underline">
                          {first.buyer_email}
                        </a>
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 w-16 text-right shrink-0">
                      {otherCount > 0 ? `+${otherCount} more` : "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unreserved section */}
          <div>
            <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-gray-200">
              <p className="text-[10px] uppercase tracking-widest text-gray-400">
                Unreserved · {unreserved.length} item{unreserved.length !== 1 ? "s" : ""}
              </p>
              <p className="text-sm font-medium text-gray-400">{fmt(unreservedTotal)}</p>
            </div>
            {unreserved.length === 0 ? (
              <p className="text-sm text-gray-400">All items are reserved.</p>
            ) : (
              <div className="border border-gray-200 bg-white rounded divide-y divide-gray-100">
                {unreserved.map(product => (
                  <div key={product.id} className="flex items-center gap-4 px-4 py-3">
                    <div className="w-11 h-11 shrink-0 bg-gray-100 rounded overflow-hidden">
                      {photoUrl(product.main_photo_filename) ? (
                        <img
                          src={photoUrl(product.main_photo_filename)!}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{product.name}</p>
                      {(product.brand || product.room) && (
                        <p className="text-[11px] text-gray-400 truncate">
                          {[product.brand, product.room].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 tabular-nums w-16 text-right shrink-0">
                      {fmt(product.sale_price)}
                    </p>
                    <div className="w-44 shrink-0" />
                    <div className="w-16 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grand total */}
          <div className="flex justify-end border-t border-gray-200 pt-4">
            <div className="text-right space-y-1">
              <p className="text-xs text-gray-400">
                Reserved <span className="font-medium text-gray-700">{fmt(reservedTotal)}</span>
                <span className="mx-2 text-gray-300">+</span>
                Unreserved <span className="font-medium text-gray-400">{fmt(unreservedTotal)}</span>
              </p>
              <p className="text-sm font-semibold text-gray-800">
                Total {fmt(reservedTotal + unreservedTotal)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* By Person view */}
      {view === "person" && (
        <div className="space-y-4">
          {buyers.map(buyer => (
            <div key={buyer.email} className="border border-gray-200 bg-white rounded p-5 space-y-4">
              {editingEmail === buyer.email ? (
                <div className="space-y-2">
                  <input
                    className="w-full border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-gray-600"
                    value={editForm.name}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Name"
                  />
                  <input
                    className="w-full border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-gray-600"
                    value={editForm.email}
                    onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Email"
                  />
                  <input
                    className="w-full border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-gray-600"
                    value={editForm.phone}
                    onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="Phone (optional)"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => saveContact(buyer.email)}
                      disabled={savingContact}
                      className="text-[11px] tracking-wide uppercase px-3 py-1.5 bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingEmail(null)}
                      className="text-[11px] tracking-wide uppercase px-3 py-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{buyer.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <a href={`mailto:${buyer.email}`} className="hover:underline">{buyer.email}</a>
                      {buyer.phone && (
                        <span> · <a href={`tel:${buyer.phone}`} className="hover:underline">{buyer.phone}</a></span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditForm({ name: buyer.name, email: buyer.email, phone: buyer.phone ?? "" });
                      setEditingEmail(buyer.email);
                    }}
                    className="text-[11px] tracking-wide uppercase text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                  >
                    Edit
                  </button>
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Notes</p>
                <textarea
                  className="w-full border border-gray-200 text-sm px-3 py-2 text-gray-700 placeholder-gray-300 focus:outline-none focus:border-gray-400 resize-none transition-colors"
                  rows={2}
                  defaultValue={buyer.notes}
                  placeholder="Add notes..."
                  onBlur={e => {
                    const val = e.target.value;
                    setBuyers(prev => prev.map(b => b.email === buyer.email ? { ...b, notes: val } : b));
                    saveNotes(buyer.email, val);
                  }}
                />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Items</p>
                <div>
                  {buyer.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-4 py-2.5 border-t border-gray-100 first:border-t-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-800">
                          {item.product_name}
                          {item.units_requested > 1 && (
                            <span className="text-xs text-gray-400 ml-1.5">×{item.units_requested}</span>
                          )}
                        </p>
                        {item.message && (
                          <p className="text-xs text-gray-400 italic mt-0.5 truncate">"{item.message}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.waitlistPosition !== null && (
                          <span className="text-[10px] text-gray-400 tabular-nums">
                            #{item.waitlistPosition}{item.waitlistTotal > 1 ? ` of ${item.waitlistTotal}` : ""}
                          </span>
                        )}
                        <span className={`text-[10px] tracking-wide uppercase px-2 py-0.5 rounded ${statusStyle[item.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {item.status}
                        </span>
                        <StatusButtons id={item.id} status={item.status} updating={updatingItem} onUpdate={updateStatus} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* By Item view */}
      {view === "item" && (
        <div className="space-y-6">
          {groupedProducts.map(({ label, items }) => (
            <div key={label}>
              {label && (
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 pb-2 border-b border-gray-200">
                  {label}
                </p>
              )}
              <div className="space-y-3">
                {items.map(group => (
                  <div key={group.product_id} className="border border-gray-200 bg-white rounded p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{group.product_name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 space-x-2">
                          {group.product_brand && <span>{group.product_brand}</span>}
                          {group.product_brand && group.product_room && <span>·</span>}
                          {group.product_room && <span>{group.product_room}</span>}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {group.reservations.length} request{group.reservations.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div>
                      {group.reservations.map((r, idx) => (
                        <div key={r.id} className="flex items-center justify-between gap-4 py-2.5 border-t border-gray-100 first:border-t-0">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-800">
                              <span className="text-[10px] text-gray-400 mr-1.5">#{idx + 1}</span>
                              {r.buyer_name}
                              {r.units_requested > 1 && (
                                <span className="text-xs text-gray-400 ml-1.5">×{r.units_requested}</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              <a href={`mailto:${r.buyer_email}`} className="hover:underline">{r.buyer_email}</a>
                              {r.buyer_phone && <span> · {r.buyer_phone}</span>}
                            </p>
                            {r.message && (
                              <p className="text-xs text-gray-400 italic mt-0.5">"{r.message}"</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] tracking-wide uppercase px-2 py-0.5 rounded ${statusStyle[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                              {r.status}
                            </span>
                            <StatusButtons id={r.id} status={r.status} updating={updatingItem} onUpdate={updateStatus} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusButtons({
  id, status, updating, onUpdate,
}: {
  id: string;
  status: Status;
  updating: string | null;
  onUpdate: (id: string, status: Status) => void;
}) {
  const disabled = updating === id;
  return (
    <div className="flex gap-1">
      {status !== "confirmed" && status !== "withdrawn" && status !== "cancelled" && (
        <button
          onClick={() => onUpdate(id, "confirmed")}
          disabled={disabled}
          className="text-[10px] tracking-wide uppercase px-2 py-1 border border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-40 transition-colors"
        >
          Confirm
        </button>
      )}
      {status !== "cancelled" && status !== "withdrawn" && (
        <button
          onClick={() => onUpdate(id, "cancelled")}
          disabled={disabled}
          className="text-[10px] tracking-wide uppercase px-2 py-1 border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          Cancel
        </button>
      )}
      {status === "cancelled" && (
        <button
          onClick={() => onUpdate(id, "pending")}
          disabled={disabled}
          className="text-[10px] tracking-wide uppercase px-2 py-1 border border-yellow-400 text-yellow-700 hover:bg-yellow-50 disabled:opacity-40 transition-colors"
        >
          Reopen
        </button>
      )}
    </div>
  );
}
