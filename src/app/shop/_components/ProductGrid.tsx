"use client";

import { RefreshCw } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { ShopListing } from "~/server/api/routers/shop";

interface Props {
  listings: ShopListing[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ProductGrid({ listings, isLoading, onRefresh }: Props) {
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i: number) => (
            <div
              key={i}
              className="animate-shimmer rounded-2xl"
              style={{ height: 280 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-20">
        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          Generating your personalized picks...
        </p>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm transition-colors hover:bg-[var(--color-bg-card)]"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-secondary)]">
          {listings.length} items
        </span>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1 text-xs text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {listings.map((listing, i: number) => (
          <ProductCard key={i} {...listing} />
        ))}
      </div>
    </div>
  );
}
