"use client";

import { useState, useMemo } from "react";
import { Product } from "@/types/estate";
import ProductCard from "./ProductCard";

type SortKey = "brand" | "name" | "available_date";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "brand", label: "Brand" },
  { key: "name", label: "Name" },
  { key: "available_date", label: "Available date" },
];

export default function ProductGrid({ products }: { products: Product[] }) {
  const [sortBy, setSortBy] = useState<SortKey>("brand");
  const [availableNow, setAvailableNow] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const sorted = useMemo(() => {
    let list = availableNow
      ? products.filter((p) => {
          if (!p.available_by) return true;
          return new Date(p.available_by + "T00:00:00") <= today;
        })
      : [...products];

    list.sort((a, b) => {
      if (sortBy === "brand") {
        return (a.brand ?? "").localeCompare(b.brand ?? "");
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      // available_date: nulls last
      if (!a.available_by && !b.available_by) return 0;
      if (!a.available_by) return 1;
      if (!b.available_by) return -1;
      return a.available_by.localeCompare(b.available_by);
    });

    return list;
  }, [products, sortBy, availableNow, today]);

  return (
    <>
      {/* Sort / filter rows */}
      <div className="flex flex-col items-center gap-y-3 mb-12">
        {/* Sort row */}
        <div className="flex items-baseline gap-x-6">
          <span className="text-[9px] tracking-[0.3em] uppercase italic text-ss-taupe/40 w-14 text-right shrink-0">Sort</span>
          <div className="flex items-baseline gap-x-6">
            {SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`text-[10px] tracking-[0.22em] uppercase pb-0.5 transition-colors duration-200 ${
                  sortBy === key
                    ? "text-ss-ink border-b border-ss-ink"
                    : "text-ss-taupe hover:text-ss-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter row */}
        <div className="flex items-baseline gap-x-6">
          <span className="text-[9px] tracking-[0.3em] uppercase italic text-ss-taupe/40 w-14 text-right shrink-0">Filter</span>
          <div className="flex items-baseline gap-x-6">
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
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
        {sorted.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {sorted.length === 0 && (
        <p className="text-center text-sm text-ss-taupe py-20">
          No items available.
        </p>
      )}
    </>
  );
}
