"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  productId: number;
  productName: string;
  quantity: number;
  unitsAvailable: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReserveForm({
  productId,
  productName,
  quantity,
  unitsAvailable,
  onSuccess,
  onCancel,
}: Props) {
  const [form, setForm] = useState({
    buyer_name: "",
    buyer_email: "",
    buyer_phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.buyer_name || !form.buyer_email) return;
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from("reservations").insert({
      product_id: productId,
      buyer_name: form.buyer_name,
      buyer_email: form.buyer_email,
      buyer_phone: form.buyer_phone || null,
      message: form.message || null,
      units_requested: quantity,
      status: "pending",
    });

    if (error) {
      setSubmitting(false);
      setError("Something went wrong. Please try again.");
      return;
    }

    await fetch("/api/notify-reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        productName,
        unitsRequested: quantity,
        buyerName: form.buyer_name,
        buyerEmail: form.buyer_email,
        buyerPhone: form.buyer_phone || null,
        message: form.message || null,
      }),
    });

    setSubmitting(false);
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ss-ink/60"
        onClick={onCancel}
      />

      {/* Panel */}
      <div className="relative w-full md:max-w-lg bg-ss-cream p-8 md:p-10 md:mx-4">
        <p className="text-[10px] tracking-[0.28em] text-ss-taupe uppercase mb-6">
          Notify Me
        </p>
        <p className="text-sm text-ss-ink-soft leading-relaxed mb-8">
          Leave your contact info and we&apos;ll reach out as soon as this piece is available after closing. No commitment required.
        </p>
        <p className="text-xs text-ss-taupe italic">
          {productName}{quantity > 1 ? ` — ${quantity} units` : ""}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-ss-taupe uppercase mb-1.5">
              Name <span className="text-ss-ink">*</span>
            </label>
            <input
              type="text"
              required
              value={form.buyer_name}
              onChange={(e) => set("buyer_name", e.target.value)}
              className="w-full border-b border-ss-border bg-transparent py-2 text-sm text-ss-ink placeholder:text-ss-taupe/40 focus:outline-none focus:border-ss-ink transition-colors"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.2em] text-ss-taupe uppercase mb-1.5">
              Email <span className="text-ss-ink">*</span>
            </label>
            <input
              type="email"
              required
              value={form.buyer_email}
              onChange={(e) => set("buyer_email", e.target.value)}
              className="w-full border-b border-ss-border bg-transparent py-2 text-sm text-ss-ink placeholder:text-ss-taupe/40 focus:outline-none focus:border-ss-ink transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.2em] text-ss-taupe uppercase mb-1.5">
              Phone <span className="text-ss-taupe/50">(optional)</span>
            </label>
            <input
              type="tel"
              value={form.buyer_phone}
              onChange={(e) => set("buyer_phone", e.target.value)}
              className="w-full border-b border-ss-border bg-transparent py-2 text-sm text-ss-ink placeholder:text-ss-taupe/40 focus:outline-none focus:border-ss-ink transition-colors"
              placeholder="(503) 555-0100"
            />
            <p className="text-[10px] text-ss-taupe/60 mt-1.5">
              We&apos;ll text you when it&apos;s available.
            </p>
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.2em] text-ss-taupe uppercase mb-1.5">
              Message <span className="text-ss-taupe/50">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              className="w-full border-b border-ss-border bg-transparent py-2 text-sm text-ss-ink placeholder:text-ss-taupe/40 focus:outline-none focus:border-ss-ink transition-colors resize-none"
              placeholder="Any questions or pickup preferences..."
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 border border-ss-ink text-ss-ink text-[11px] tracking-[0.22em] uppercase py-3.5 hover:bg-ss-ink hover:text-white transition-colors duration-300 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Notify Me"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 text-[11px] tracking-[0.22em] uppercase text-ss-taupe hover:text-ss-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
