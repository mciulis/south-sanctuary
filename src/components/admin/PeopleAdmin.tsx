"use client";

import { useEffect, useState } from "react";
import type {
  ReservationStatus,
  PaymentState,
  PickupState,
} from "@/types/estate";

interface ReservationApiRow {
  id: string;
  product_id: number;
  product_name: string;
  product_brand: string | null;
  product_room: string | null;
  product_sale_price: number | string | null;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  message: string | null;
  status: ReservationStatus;
  created_at: string;
  units_requested: number | null;
  waitlist_position: number | null;
  payment_state: PaymentState | null;
  pickup_state: PickupState | null;
  offered_at: string | null;
  deposit_amount: number | string | null;
  deposit_received_at: string | null;
  total_amount_paid: number | string | null;
  paid_in_full_at: string | null;
  pickup_at: string | null;
  picked_up_at: string | null;
  pickup_location: string | null;
}

interface BuyerNoteRow {
  buyer_email: string;
  notes: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const AGING_RED_HOURS = 36;

type ViewMode = "summary" | "person" | "item";
type ItemGrouping = "none" | "brand" | "room";

interface ReservationRow {
  id: string;
  product_id: number;
  product_name: string;
  product_brand: string | null;
  product_room: string | null;
  product_sale_price: number | null;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  message: string | null;
  status: ReservationStatus;
  created_at: string;
  units_requested: number;
  waitlist_position: number | null;
  waitlistTotal: number;
  payment_state: PaymentState;
  pickup_state: PickupState;
  offered_at: string | null;
  deposit_amount: number | null;
  deposit_received_at: string | null;
  total_amount_paid: number | null;
  paid_in_full_at: string | null;
  pickup_at: string | null;
  picked_up_at: string | null;
  pickup_location: string | null;
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
  items: ReservationRow[];
  notes: string;
}

interface ProductGroup {
  product_id: number;
  product_name: string;
  product_brand: string | null;
  product_room: string | null;
  reservations: ReservationRow[];
}

type ModalState =
  | { type: "deposit"; reservation: ReservationRow }
  | { type: "paid_in_full"; reservation: ReservationRow }
  | { type: "schedule_pickup"; reservation: ReservationRow; siblings: ReservationRow[] }
  | { type: "offer_preview"; reservation: ReservationRow }
  | null;

const statusStyle: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-gray-200 text-gray-500",
  withdrawn: "bg-orange-100 text-orange-700",
};

const paymentStyle: Record<PaymentState, string> = {
  none: "bg-gray-100 text-gray-500",
  deposit_paid: "bg-blue-100 text-blue-800",
  paid_in_full: "bg-emerald-100 text-emerald-800",
};

const pickupStyle: Record<PickupState, string> = {
  not_scheduled: "bg-gray-100 text-gray-500",
  scheduled: "bg-indigo-100 text-indigo-800",
  picked_up: "bg-emerald-100 text-emerald-800",
};

const paymentLabel: Record<PaymentState, string> = {
  none: "no deposit",
  deposit_paid: "deposit paid",
  paid_in_full: "paid in full",
};

const pickupLabel: Record<PickupState, string> = {
  not_scheduled: "unscheduled",
  scheduled: "pickup scheduled",
  picked_up: "picked up",
};

function photoUrl(filename: string | null): string | null {
  if (!filename) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/products/${filename}`;
}

function fmt(price: string | number | null | undefined): string {
  if (price == null) return "—";
  const n = typeof price === "string" ? parseFloat(price) : price;
  return isNaN(n) ? "—" : `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Local-time ISO formatter for <input type="datetime-local">
function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

function StatePills({ r }: { r: ReservationRow }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className={`text-[10px] tracking-wide uppercase px-2 py-0.5 rounded ${statusStyle[r.status] ?? "bg-gray-100 text-gray-600"}`}>
        {r.status}
      </span>
      {r.status === "pending" && (
        <>
          <span className={`text-[10px] tracking-wide uppercase px-2 py-0.5 rounded ${paymentStyle[r.payment_state]}`}>
            {paymentLabel[r.payment_state]}
          </span>
          {r.payment_state !== "none" && (
            <span className={`text-[10px] tracking-wide uppercase px-2 py-0.5 rounded ${pickupStyle[r.pickup_state]}`}>
              {pickupLabel[r.pickup_state]}
            </span>
          )}
        </>
      )}
    </div>
  );
}

function AgingBadge({ r, nowMs }: { r: ReservationRow; nowMs: number }) {
  if (r.status !== "pending") return null;
  if (r.payment_state !== "none") return null;
  if (!r.offered_at) return null;
  const hrs = (nowMs - new Date(r.offered_at).getTime()) / (1000 * 60 * 60);
  const red = hrs >= AGING_RED_HOURS;
  return (
    <span className={`text-[10px] tabular-nums px-1.5 py-0.5 rounded ${red ? "bg-red-100 text-red-700" : "text-gray-400"}`}>
      offered {Math.floor(hrs)}h ago
    </span>
  );
}

function NoShowBadge({ r, nowMs }: { r: ReservationRow; nowMs: number }) {
  if (r.pickup_state !== "scheduled") return null;
  if (!r.pickup_at) return null;
  if (new Date(r.pickup_at).getTime() >= nowMs) return null;
  return (
    <span className="text-[10px] tracking-wide uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">
      no-show
    </span>
  );
}

export default function PeopleAdmin() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("summary");
  const [grouping, setGrouping] = useState<ItemGrouping>("none");

  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [savingContact, setSavingContact] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [nowMs] = useState(() => Date.now());

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [reservationsRes, notesRes, productsRes] = await Promise.all([
      fetch("/api/admin/reservations"),
      fetch("/api/admin/buyer-notes"),
      fetch("/api/admin/products"),
    ]);

    const raw: ReservationApiRow[] = await reservationsRes.json();
    const notes: BuyerNoteRow[] = await notesRes.json();
    const allProducts: Product[] = await productsRes.json();

    const notesMap = new Map<string, string>(
      (notes ?? []).map((n) => [n.buyer_email, n.notes])
    );

    // Active = pending status. Used to compute waitlistTotal per product.
    const waitlistTotals = new Map<number, number>();
    for (const r of raw) {
      if (r.status === "pending") {
        waitlistTotals.set(r.product_id, (waitlistTotals.get(r.product_id) ?? 0) + 1);
      }
    }

    const enriched: ReservationRow[] = raw
      .filter(r => !r.buyer_name?.toLowerCase().includes("test"))
      .map(r => ({
        id: r.id,
        product_id: r.product_id,
        product_name: r.product_name,
        product_brand: r.product_brand,
        product_room: r.product_room,
        product_sale_price: r.product_sale_price != null ? parseFloat(String(r.product_sale_price)) : null,
        buyer_name: r.buyer_name,
        buyer_email: r.buyer_email,
        buyer_phone: r.buyer_phone ?? null,
        message: r.message,
        status: r.status,
        created_at: r.created_at,
        units_requested: r.units_requested ?? 1,
        waitlist_position: r.waitlist_position ?? null,
        waitlistTotal: waitlistTotals.get(r.product_id) ?? 0,
        payment_state: r.payment_state ?? "none",
        pickup_state: r.pickup_state ?? "not_scheduled",
        offered_at: r.offered_at ?? null,
        deposit_amount: r.deposit_amount != null ? parseFloat(String(r.deposit_amount)) : null,
        deposit_received_at: r.deposit_received_at ?? null,
        total_amount_paid: r.total_amount_paid != null ? parseFloat(String(r.total_amount_paid)) : null,
        paid_in_full_at: r.paid_in_full_at ?? null,
        pickup_at: r.pickup_at ?? null,
        picked_up_at: r.picked_up_at ?? null,
        pickup_location: r.pickup_location ?? null,
      }));

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

  async function patchReservation(id: string, body: Record<string, unknown>) {
    setUpdatingItem(id);
    await fetch(`/api/admin/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

  function buildProductGroups(): ProductGroup[] {
    const map = new Map<number, ProductGroup>();
    const activeReservations = reservations.filter(r => r.status === "pending");
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

  function buildSummary() {
    const activeByProduct = new Map<number, ReservationRow[]>();
    const active = reservations
      .filter(r => r.status === "pending")
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    for (const r of active) {
      if (!activeByProduct.has(r.product_id)) activeByProduct.set(r.product_id, []);
      activeByProduct.get(r.product_id)!.push(r);
    }

    const reserved: { product: Product; first: ReservationRow; otherCount: number }[] = [];
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

  // Buyer balance: sum of (sale_price * units) − sum of (total_amount_paid OR deposit_amount OR 0)
  // across the buyer's NON-cancelled/withdrawn reservations.
  function buyerBalance(buyer: Buyer): { owed: number; total: number; paid: number } {
    let total = 0;
    let paid = 0;
    for (const r of buyer.items) {
      if (r.status !== "pending") continue;
      const price = (r.product_sale_price ?? 0) * r.units_requested;
      total += price;
      if (r.payment_state === "paid_in_full") {
        paid += r.total_amount_paid ?? price;
      } else if (r.payment_state === "deposit_paid") {
        paid += r.deposit_amount ?? 0;
      }
    }
    return { owed: Math.max(0, total - paid), total, paid };
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
                    <div className="w-56 min-w-0 shrink-0">
                      <p className="text-sm text-gray-800 truncate">{first.buyer_name}</p>
                      <div className="mt-0.5">
                        <StatePills r={first} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 w-16 text-right shrink-0">
                      {otherCount > 0 ? `+${otherCount} more` : "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

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
                    <div className="w-56 shrink-0" />
                    <div className="w-16 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

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
          {buyers.map(buyer => {
            const balance = buyerBalance(buyer);
            return (
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
                      {balance.total > 0 && (
                        <p className="text-[11px] text-gray-500 mt-1.5 tabular-nums">
                          Total {fmt(balance.total)} · Paid <span className="text-emerald-700">{fmt(balance.paid)}</span> · Owes <span className={balance.owed > 0 ? "text-gray-800 font-medium" : "text-gray-400"}>{fmt(balance.owed)}</span>
                        </p>
                      )}
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
                      <div key={item.id} className="py-2.5 border-t border-gray-100 first:border-t-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-800">
                              {item.product_name}
                              {item.units_requested > 1 && (
                                <span className="text-xs text-gray-400 ml-1.5">×{item.units_requested}</span>
                              )}
                              {item.product_sale_price != null && (
                                <span className="text-[11px] text-gray-400 ml-2 tabular-nums">{fmt(item.product_sale_price * item.units_requested)}</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {item.waitlist_position !== null && (
                                <span className="text-[10px] text-gray-400 tabular-nums">
                                  #{item.waitlist_position}{item.waitlistTotal > 1 ? ` of ${item.waitlistTotal}` : ""}
                                </span>
                              )}
                              <StatePills r={item} />
                              <AgingBadge r={item} nowMs={nowMs} />
                              <NoShowBadge r={item} nowMs={nowMs} />
                            </div>
                            {item.pickup_at && (
                              <p className="text-[11px] text-gray-500 mt-1">
                                Pickup: {new Date(item.pickup_at).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                                {item.pickup_location && <span className="text-gray-400"> · {item.pickup_location}</span>}
                              </p>
                            )}
                            {item.message && (
                              <p className="text-xs text-gray-400 italic mt-0.5 truncate">&ldquo;{item.message}&rdquo;</p>
                            )}
                          </div>
                          <FulfillmentActions
                            r={item}
                            siblingsForPickup={buyer.items.filter(o => o.id !== item.id && o.status === "pending" && o.payment_state !== "none" && o.pickup_state !== "picked_up")}
                            updating={updatingItem}
                            onPatch={patchReservation}
                            onOpenModal={setModal}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
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
                        <div key={r.id} className="py-2.5 border-t border-gray-100 first:border-t-0">
                          <div className="flex items-start justify-between gap-4">
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
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <StatePills r={r} />
                                <AgingBadge r={r} nowMs={nowMs} />
                                <NoShowBadge r={r} nowMs={nowMs} />
                              </div>
                              {r.message && (
                                <p className="text-xs text-gray-400 italic mt-0.5">&ldquo;{r.message}&rdquo;</p>
                              )}
                            </div>
                            <FulfillmentActions
                              r={r}
                              siblingsForPickup={[]}
                              updating={updatingItem}
                              onPatch={patchReservation}
                              onOpenModal={setModal}
                            />
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

      {/* Modals */}
      {modal?.type === "deposit" && (
        <DepositModal
          reservation={modal.reservation}
          onClose={() => setModal(null)}
          onDone={async (amount, dateIso) => {
            await patchReservation(modal.reservation.id, {
              payment_state: "deposit_paid",
              deposit_amount: amount,
              deposit_received_at: dateIso,
            });
            setModal(null);
          }}
        />
      )}
      {modal?.type === "paid_in_full" && (
        <PaidInFullModal
          reservation={modal.reservation}
          onClose={() => setModal(null)}
          onDone={async (total, dateIso) => {
            await patchReservation(modal.reservation.id, {
              payment_state: "paid_in_full",
              total_amount_paid: total,
              paid_in_full_at: dateIso,
            });
            setModal(null);
          }}
        />
      )}
      {modal?.type === "schedule_pickup" && (
        <SchedulePickupModal
          reservation={modal.reservation}
          siblings={modal.siblings}
          onClose={() => setModal(null)}
          onDone={async () => {
            setModal(null);
            await loadData();
          }}
        />
      )}
      {modal?.type === "offer_preview" && (
        <OfferPreviewModal
          reservation={modal.reservation}
          onClose={() => setModal(null)}
          onDone={async () => {
            setModal(null);
            await loadData();
          }}
        />
      )}
    </div>
  );
}

function FulfillmentActions({
  r,
  siblingsForPickup,
  updating,
  onPatch,
  onOpenModal,
}: {
  r: ReservationRow;
  siblingsForPickup: ReservationRow[];
  updating: string | null;
  onPatch: (id: string, body: Record<string, unknown>) => Promise<void>;
  onOpenModal: (m: ModalState) => void;
}) {
  const disabled = updating === r.id;
  const btn = "text-[10px] tracking-wide uppercase px-2 py-1 border disabled:opacity-40 transition-colors";

  if (r.status !== "pending") {
    return (
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onPatch(r.id, { status: "pending" })}
          disabled={disabled}
          className={`${btn} border-yellow-400 text-yellow-700 hover:bg-yellow-50`}
        >
          Reopen
        </button>
      </div>
    );
  }

  const buttons: React.ReactNode[] = [];

  // Send offer email — when at #1 and not yet offered
  if (r.waitlist_position === 1 && !r.offered_at && r.payment_state === "none") {
    buttons.push(
      <button
        key="offer"
        onClick={() => onOpenModal({ type: "offer_preview", reservation: r })}
        disabled={disabled}
        className={`${btn} border-yellow-500 text-yellow-700 hover:bg-yellow-50`}
      >
        Send offer email
      </button>
    );
  }

  // Record deposit — when no payment yet
  if (r.payment_state === "none") {
    buttons.push(
      <button
        key="deposit"
        onClick={() => onOpenModal({ type: "deposit", reservation: r })}
        disabled={disabled}
        className={`${btn} border-blue-500 text-blue-700 hover:bg-blue-50`}
      >
        Record deposit
      </button>
    );
  }

  // Mark paid in full — when deposit paid but not yet paid in full
  if (r.payment_state === "deposit_paid") {
    buttons.push(
      <button
        key="paid"
        onClick={() => onOpenModal({ type: "paid_in_full", reservation: r })}
        disabled={disabled}
        className={`${btn} border-emerald-500 text-emerald-700 hover:bg-emerald-50`}
      >
        Mark paid in full
      </button>
    );
  }

  // Schedule pickup — when deposit paid (or paid in full) and not yet picked up
  if (r.payment_state !== "none" && r.pickup_state !== "picked_up") {
    buttons.push(
      <button
        key="schedule"
        onClick={() => onOpenModal({ type: "schedule_pickup", reservation: r, siblings: siblingsForPickup })}
        disabled={disabled}
        className={`${btn} border-indigo-500 text-indigo-700 hover:bg-indigo-50`}
      >
        {r.pickup_state === "scheduled" ? "Reschedule pickup" : "Schedule pickup"}
      </button>
    );
  }

  // Mark picked up — when paid in some form and scheduled
  if (r.payment_state !== "none" && r.pickup_state === "scheduled") {
    buttons.push(
      <button
        key="pickup"
        onClick={() => onPatch(r.id, { pickup_state: "picked_up" })}
        disabled={disabled}
        className={`${btn} border-emerald-500 text-emerald-700 hover:bg-emerald-50`}
      >
        Mark picked up
      </button>
    );
  }

  // Cancel / Withdraw (off-ramps)
  buttons.push(
    <button
      key="cancel"
      onClick={() => onPatch(r.id, { status: "cancelled" })}
      disabled={disabled}
      className={`${btn} border-gray-300 text-gray-500 hover:bg-gray-50`}
    >
      Cancel
    </button>
  );
  buttons.push(
    <button
      key="withdraw"
      onClick={() => onPatch(r.id, { status: "withdrawn" })}
      disabled={disabled}
      className={`${btn} border-orange-300 text-orange-600 hover:bg-orange-50`}
    >
      Withdraw
    </button>
  );

  return <div className="flex gap-1 flex-wrap justify-end shrink-0 max-w-xs">{buttons}</div>;
}

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-800">{title}</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg leading-none">×</button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function DepositModal({
  reservation,
  onClose,
  onDone,
}: {
  reservation: ReservationRow;
  onClose: () => void;
  onDone: (amount: number, dateIso: string) => Promise<void>;
}) {
  const suggested = reservation.product_sale_price ? Math.max(10, Math.round((reservation.product_sale_price * 0.25) / 10) * 10) : 0;
  const [amount, setAmount] = useState(suggested.toString());
  const [date, setDate] = useState(() => toDatetimeLocal(new Date()));
  const [saving, setSaving] = useState(false);

  async function submit() {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;
    setSaving(true);
    await onDone(num, new Date(date).toISOString());
  }

  return (
    <ModalShell title={`Record deposit — ${reservation.buyer_name}`} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-xs text-gray-500">{reservation.product_name} · {fmt(reservation.product_sale_price)}</p>
        <div>
          <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Deposit amount</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm rounded focus:outline-none focus:border-gray-600"
            min={0}
            step={1}
          />
          <p className="text-[10px] text-gray-400 mt-1">Suggested: ${suggested} (25% of sale price, rounded to nearest $10)</p>
        </div>
        <div>
          <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Received at</label>
          <input
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm rounded focus:outline-none focus:border-gray-600"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} disabled={saving} className="text-[11px] tracking-wide uppercase px-3 py-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={submit} disabled={saving} className="text-[11px] tracking-wide uppercase px-3 py-1.5 bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40">
            {saving ? "Saving…" : "Record deposit"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function PaidInFullModal({
  reservation,
  onClose,
  onDone,
}: {
  reservation: ReservationRow;
  onClose: () => void;
  onDone: (total: number, dateIso: string) => Promise<void>;
}) {
  const expectedTotal = (reservation.product_sale_price ?? 0) * reservation.units_requested;
  const [total, setTotal] = useState(expectedTotal.toString());
  const [date, setDate] = useState(() => toDatetimeLocal(new Date()));
  const [saving, setSaving] = useState(false);

  async function submit() {
    const num = parseFloat(total);
    if (isNaN(num) || num < 0) return;
    setSaving(true);
    await onDone(num, new Date(date).toISOString());
  }

  return (
    <ModalShell title={`Mark paid in full — ${reservation.buyer_name}`} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-xs text-gray-500">{reservation.product_name} · expected total {fmt(expectedTotal)}</p>
        {reservation.deposit_amount && (
          <p className="text-xs text-gray-500">Deposit already received: {fmt(reservation.deposit_amount)}</p>
        )}
        <div>
          <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Total amount paid (incl. deposit)</label>
          <input
            type="number"
            value={total}
            onChange={e => setTotal(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm rounded focus:outline-none focus:border-gray-600"
            min={0}
            step={1}
          />
        </div>
        <div>
          <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Paid at</label>
          <input
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm rounded focus:outline-none focus:border-gray-600"
          />
        </div>
        <p className="text-[11px] text-gray-500">Marking paid in full will flip the item to <strong>sold</strong> on the public site if all units are accounted for.</p>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} disabled={saving} className="text-[11px] tracking-wide uppercase px-3 py-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={submit} disabled={saving} className="text-[11px] tracking-wide uppercase px-3 py-1.5 bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40">
            {saving ? "Saving…" : "Mark paid in full"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function SchedulePickupModal({
  reservation,
  siblings,
  onClose,
  onDone,
}: {
  reservation: ReservationRow;
  siblings: ReservationRow[];
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [date, setDate] = useState(() =>
    reservation.pickup_at
      ? toDatetimeLocal(new Date(reservation.pickup_at))
      : toDatetimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000))
  );
  const [locationOverride, setLocationOverride] = useState(reservation.pickup_location ?? "");
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = { [reservation.id]: true };
    for (const s of siblings) map[s.id] = true;
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setSaving(true);
    setErr("");
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    const res = await fetch("/api/admin/reservations/schedule-pickup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reservationIds: ids,
        pickupAt: new Date(date).toISOString(),
        pickupLocation: locationOverride.trim() || undefined,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErr(body.error ?? "Failed to schedule pickup");
      setSaving(false);
      return;
    }
    await onDone();
  }

  return (
    <ModalShell title={`Schedule pickup — ${reservation.buyer_name}`} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Pickup date & time</label>
          <input
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm rounded focus:outline-none focus:border-gray-600"
          />
        </div>
        <div>
          <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Items in this pickup</label>
          <div className="border border-gray-200 rounded divide-y divide-gray-100">
            <label className="flex items-center gap-2 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={selected[reservation.id] ?? false}
                onChange={e => setSelected(s => ({ ...s, [reservation.id]: e.target.checked }))}
              />
              <span className="flex-1">{reservation.product_name}</span>
              <span className="text-xs text-gray-400">{fmt(reservation.product_sale_price)}</span>
            </label>
            {siblings.map(s => (
              <label key={s.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected[s.id] ?? false}
                  onChange={e => setSelected(state => ({ ...state, [s.id]: e.target.checked }))}
                />
                <span className="flex-1">{s.product_name}</span>
                <span className="text-xs text-gray-400">{fmt(s.product_sale_price)}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] tracking-widest uppercase text-gray-400 block mb-1">Pickup location (optional override)</label>
          <input
            type="text"
            value={locationOverride}
            onChange={e => setLocationOverride(e.target.value)}
            placeholder="Leave blank to use the default from Site Settings"
            className="w-full border border-gray-300 px-3 py-2 text-sm rounded focus:outline-none focus:border-gray-600"
          />
        </div>
        <p className="text-[11px] text-gray-500">Sends a pickup-confirmation email to {reservation.buyer_email} (BCC&apos;d to you) with a Google Calendar link.</p>
        {err && <p className="text-xs text-red-600">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} disabled={saving} className="text-[11px] tracking-wide uppercase px-3 py-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={submit} disabled={saving} className="text-[11px] tracking-wide uppercase px-3 py-1.5 bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40">
            {saving ? "Sending…" : "Schedule & send email"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function OfferPreviewModal({
  reservation,
  onClose,
  onDone,
}: {
  reservation: ReservationRow;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [preview, setPreview] = useState<{ subject: string; html: string; recipientEmail: string; recipientName: string } | null>(null);
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/reservations/${reservation.id}/send-offer/preview`)
      .then(async r => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error ?? "Preview failed");
        }
        return r.json();
      })
      .then(setPreview)
      .catch(e => setErr(e.message));
  }, [reservation.id]);

  async function send() {
    setSending(true);
    setErr("");
    const res = await fetch(`/api/admin/reservations/${reservation.id}/send-offer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErr(body.error ?? "Failed to send");
      setSending(false);
      return;
    }
    await onDone();
  }

  return (
    <ModalShell title={`Send offer email — ${reservation.buyer_name}`} onClose={onClose}>
      <div className="space-y-3">
        {err && <p className="text-xs text-red-600">{err}</p>}
        {!preview && !err && <p className="text-xs text-gray-400">Loading preview…</p>}
        {preview && (
          <>
            <div className="text-xs text-gray-500 space-y-0.5">
              <p><span className="text-gray-400">To:</span> {preview.recipientName} &lt;{preview.recipientEmail}&gt;</p>
              <p><span className="text-gray-400">Subject:</span> {preview.subject}</p>
            </div>
            <div className="border border-gray-200 rounded p-4 bg-gray-50 text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: preview.html }} />
            <p className="text-[11px] text-gray-500">Clicking Send will email the buyer and stamp them as offered (starts the 48h deposit clock).</p>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={onClose} disabled={sending} className="text-[11px] tracking-wide uppercase px-3 py-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={send} disabled={sending} className="text-[11px] tracking-wide uppercase px-3 py-1.5 bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40">
                {sending ? "Sending…" : "Send email"}
              </button>
            </div>
          </>
        )}
      </div>
    </ModalShell>
  );
}
