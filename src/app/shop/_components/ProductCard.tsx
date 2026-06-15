"use client";

import Image from "next/image";

interface Props {
  name: string;
  description: string;
  price: number;
  currency: string;
  store: string;
  imageUrl: string;
}

const storeBadgeColors: Record<string, string> = {
  SHEIN: "bg-black text-white",
  Zalora: "bg-purple-600 text-white",
  "H&M": "bg-red-600 text-white",
  UNIQLO: "bg-red-700 text-white",
  ZARA: "bg-neutral-800 text-white",
};

export function ProductCard({
  name,
  price,
  currency,
  store,
  imageUrl,
}: Props) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-all hover:border-[var(--color-accent)]/30">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--color-bg-elevated)]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 430px) 50vw, 200px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs text-[var(--color-text-secondary)]">
              No image
            </span>
          </div>
        )}
        <span
          className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-semibold ${storeBadgeColors[store] ?? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"}`}
        >
          {store}
        </span>
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="mt-1 text-sm font-semibold text-[var(--color-accent)]">
          {currency} {price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
