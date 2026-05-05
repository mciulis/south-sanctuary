"use client";

import { useEffect, useState } from "react";

type Status = "pending" | "confirmed" | "cancelled" | "withdrawn";

interface ItemReservation {
  id: string;
  item_name: string;
  status: Status;
  message: string | null;
  created_at: string;
}

interface Buyer {
  email: string;
  name: string;
  phone: string | null;
  items: ItemReservation[];
  notes: string;
}

const statusStyle: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-200 text-gray-500",
  withdrawn: "bg-orange-100 text-orange-700",
};

export default function PeopleAdmin() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [savingContact, setSavingContact] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [reservationsRes, notesRes] = await Promise.all([
      fetch("/api/admin/reservations"),
      fetch("/api/admin/buyer-notes"),
    ]);

    const reservations = await reservationsRes.json();
    const notes = await notesRes.json();

    const notesMap = new Map<string, string>(
      (notes ?? []).map((n: any) => [n.buyer_email, n.notes])
    );

    const buyerMap = new Map<string, Buyer>();
    for (const r of reservations ?? []) {
      if (r.buyer_name?.toLowerCase().includes("test")) continue;
      const email = r.buyer_email;
      if (!buyerMap.has(email)) {
        buyerMap.set(email, {
          email,
          name: r.buyer_name,
          phone: r.buyer_phone ?? null,
          items: [],
          notes: notesMap.get(email) ?? "",
        });
      }
      buyerMap.get(email)!.items.push({
        id: r.id,
        item_name: r.product_name ?? "Unknown",
        status: r.status as Status,
        message: r.message,
        created_at: r.created_at,
      });
    }

    // Sort by most recent activity
    const sorted = Array.from(buyerMap.values()).sort((a, b) => {
      const aLatest = Math.max(...a.items.map(i => new Date(i.created_at).getTime()));
      const bLatest = Math.max(...b.items.map(i => new Date(i.created_at).getTime()));
      return bLatest - aLatest;
    });

    setBuyers(sorted);
    setLoading(false);
  }

  async function updateItemStatus(reservationId: string, status: Status) {
    setUpdatingItem(reservationId);
    await fetch(`/api/admin/reservations/${reservationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBuyers(prev =>
      prev.map(b => ({
        ...b,
        items: b.items.map(i => i.id === reservationId ? { ...i, status } : i),
      }))
    );
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
      prev.map(b =>
        b.email === oldEmail ? { ...b, name, email: newEmail, phone: phone || null } : b
      )
    );
    setEditingEmail(null);
    setSavingContact(false);
  }

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;
  if (buyers.length === 0) return <p className="text-sm text-gray-400">No requests yet.</p>;

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">
        {buyers.length} people
      </p>
      <div className="space-y-4">
        {buyers.map(buyer => (
          <div key={buyer.email} className="border border-gray-200 bg-white rounded p-5 space-y-4">

            {/* Contact info */}
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

            {/* Notes */}
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

            {/* Items */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Items</p>
              <div className="space-y-0">
                {buyer.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-4 py-2.5 border-t border-gray-100 first:border-t-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800">{item.item_name}</p>
                      {item.message && (
                        <p className="text-xs text-gray-400 italic mt-0.5 truncate">"{item.message}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] tracking-wide uppercase px-2 py-0.5 rounded ${statusStyle[item.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {item.status}
                      </span>
                      <div className="flex gap-1">
                        {item.status !== "confirmed" && item.status !== "withdrawn" && item.status !== "cancelled" && (
                          <button
                            onClick={() => updateItemStatus(item.id, "confirmed")}
                            disabled={updatingItem === item.id}
                            className="text-[10px] tracking-wide uppercase px-2 py-1 border border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-40 transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                        {item.status !== "withdrawn" && (
                          <button
                            onClick={() => updateItemStatus(item.id, "withdrawn")}
                            disabled={updatingItem === item.id}
                            className="text-[10px] tracking-wide uppercase px-2 py-1 border border-orange-400 text-orange-600 hover:bg-orange-50 disabled:opacity-40 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                        {item.status === "withdrawn" && (
                          <button
                            onClick={() => updateItemStatus(item.id, "pending")}
                            disabled={updatingItem === item.id}
                            className="text-[10px] tracking-wide uppercase px-2 py-1 border border-yellow-400 text-yellow-700 hover:bg-yellow-50 disabled:opacity-40 transition-colors"
                          >
                            Re-add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
