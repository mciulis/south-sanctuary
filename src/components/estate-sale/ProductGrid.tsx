"use client";

import { useState, useMemo } from "react";
import { Product } from "@/types/estate";
import ProductCard from "./ProductCard";

const ROOM_ORDER = [
  "Family Room",
  "Kitchen",
  "Lounge",
  "Drinks Room",
  "Master Bedroom",
  "Guest Bedroom",
  "Entry",
  "Deck",
  "Emi's Room",
  "Lucia's Room",
  "Garage",
];

export default function ProductGrid({ products }: { products: Product[] }) {
  const [activeRoom, setActiveRoom] = useState<string>("All");
  const [availableNow, setAvailableNow] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const rooms = useMemo(() => {
    const present = new Set(products.map((p) => p.room).filter(Boolean) as string[]);
    return ROOM_ORDER.filter((r) => present.has(r));
  }, [products]);

  const filtered = useMemo(() => {
    let list = activeRoom === "All" ? products : products.filter((p) => p.room === activeRoom);
    if (availableNow) {
      list = list.filter((p) => {
        if (!p.available_by) return true; // no date = assume available
        return new Date(p.available_by + "T00:00:00") <= today;
      });
    }
    return list;
  }, [products, activeRoom, availableNow, today]);

  return (
    <>
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 justify-center mb-12">
        {["All", ...rooms].map((room) => (
          <button
            key={room}
            onClick={() => setActiveRoom(room)}
            className={`text-[10px] tracking-[0.22em] uppercase pb-0.5 transition-colors duration-200 ${
              activeRoom === room
                ? "text-ss-ink border-b border-ss-ink"
                : "text-ss-taupe hover:text-ss-ink"
            }`}
          >
            {room}
          </button>
        ))}
        <span className="text-ss-taupe/30 text-[10px]">|</span>
        <button
          onClick={() => setAvailableNow((v) => !v)}
          className={`text-[10px] tracking-[0.22em] uppercase pb-0.5 transition-colors duration-200 ${
            availableNow
              ? "text-ss-ink border-b border-ss-ink"
              : "text-ss-taupe hover:text-ss-ink"
          }`}
        >
          Available now
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-ss-taupe py-20">
          Nothing in this room yet.
        </p>
      )}
    </>
  );
}
