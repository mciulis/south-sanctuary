"use client";

import { useState, useMemo } from "react";
import { Product } from "@/types/estate";
import ProductCard from "./ProductCard";

type SortKey = "brand" | "name" | "room";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "brand", label: "Brand" },
  { key: "name", label: "Name" },
  { key: "room", label: "Room" },
];

export default function ProductGrid({ products }: { products: Product[] }) {
  const [sortBy, setSortBy] = useState<SortKey>("brand");

  const sorted = useMemo(() => {
    const list = [...products];

    list.sort((a, b) => {
      if (sortBy === "brand") {
        return (a.brand ?? "").localeCompare(b.brand ?? "");
      }
      if (sortBy === "room") {
        return (a.room ?? "￿").localeCompare(b.room ?? "￿");
      }
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [products, sortBy]);

  return (
    <>
      {/* Availability context */}
      <p className="text-center text-[11px] tracking-[0.16em] text-ss-taupe/70 uppercase mb-8">
        Items become available after closing
      </p>

      {/* Sort row */}
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
