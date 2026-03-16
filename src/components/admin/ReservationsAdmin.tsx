"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Reservation {
  id: string;
  product_id: number;
  product_name: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-200 text-gray-500",
};

export default function ReservationsAdmin() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("reservations")
      .select("*, products(name)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const rows = (data ?? []).map((r: any) => ({
          ...r,
          product_name: r.products?.name ?? "Unknown",
        }));
        setReservations(rows);
        setLoading(false);
      });
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    await supabase.from("reservations").update({ status }).eq("id", id);
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    setUpdating(null);
  }

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;

  if (reservations.length === 0) {
    return (
      <p className="text-sm text-gray-400">No reservation requests yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">
        {reservations.length} reservation{reservations.length !== 1 ? "s" : ""}
      </p>
      <div className="space-y-3">
        {reservations.map((r) => (
          <div
            key={r.id}
            className="border border-gray-200 bg-white p-5 rounded"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {r.product_name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(r.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span
                className={`shrink-0 text-[10px] tracking-wide uppercase px-2 py-0.5 rounded ${statusColor[r.status] ?? "bg-gray-100 text-gray-600"}`}
              >
                {r.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
              <div>
                <span className="text-gray-400 text-xs uppercase tracking-wide">Name </span>
                <span className="text-gray-800">{r.buyer_name}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs uppercase tracking-wide">Email </span>
                <a href={`mailto:${r.buyer_email}`} className="text-blue-600 hover:underline">
                  {r.buyer_email}
                </a>
              </div>
              {r.buyer_phone && (
                <div>
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Phone </span>
                  <a href={`tel:${r.buyer_phone}`} className="text-gray-800 hover:underline">
                    {r.buyer_phone}
                  </a>
                </div>
              )}
              {r.message && (
                <div className="sm:col-span-2">
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Message </span>
                  <span className="text-gray-700 italic">{r.message}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              {r.status !== "confirmed" && (
                <button
                  onClick={() => updateStatus(r.id, "confirmed")}
                  disabled={updating === r.id}
                  className="text-[11px] tracking-wide uppercase px-3 py-1.5 border border-green-600 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-40"
                >
                  Confirm
                </button>
              )}
              {r.status !== "cancelled" && (
                <button
                  onClick={() => updateStatus(r.id, "cancelled")}
                  disabled={updating === r.id}
                  className="text-[11px] tracking-wide uppercase px-3 py-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
              )}
              {r.status !== "pending" && (
                <button
                  onClick={() => updateStatus(r.id, "pending")}
                  disabled={updating === r.id}
                  className="text-[11px] tracking-wide uppercase px-3 py-1.5 border border-yellow-400 text-yellow-700 hover:bg-yellow-50 transition-colors disabled:opacity-40"
                >
                  Reset to Pending
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
