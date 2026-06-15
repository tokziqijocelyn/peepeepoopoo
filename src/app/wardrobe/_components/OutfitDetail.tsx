"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Wand2, Bookmark, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { useTasks } from "~/app/_components/TaskContext";

interface Props {
  outfitId: string;
  onBack: () => void;
}

export function OutfitDetail({ outfitId, onBack }: Props) {
  const [tryOnUrl, setTryOnUrl] = useState<string | null>(null);
  const { addTask, removeTask } = useTasks();
  const outfitQuery = api.wardrobe.getOutfitDetail.useQuery({ id: outfitId });
  const tryOnMutation = api.wardrobe.generateTryOn.useMutation({
    onSuccess: (url) => {
      setTryOnUrl(url);
      removeTask("try-on");
    },
    onError: () => {
      removeTask("try-on");
    },
  });

  const outfit = outfitQuery.data;

  if (outfitQuery.isLoading || !outfit) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
      </div>
    );
  }

  const displayImage = tryOnUrl ?? outfit.imageUrl;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-card)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold">{outfit.title ?? "Outfit"}</h2>
      </div>

      {/* Main image */}
      <div className="relative mx-4 aspect-[3/4] overflow-hidden rounded-2xl bg-[var(--color-bg-card)]">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={outfit.title ?? "Outfit"}
            fill
            className="object-cover"
            sizes="(max-width: 430px) 100vw, 400px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-[var(--color-text-secondary)]">
              No preview available
            </span>
          </div>
        )}

        {tryOnMutation.isPending && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
            <span className="text-sm font-medium text-white">
              Generating try-on...
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="px-4 pt-4">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {outfit.description}
        </p>
      </div>

      {/* Clothing items used */}
      <div className="px-4 pt-4">
        <h3 className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
          Pieces in this outfit
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {outfit.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-shrink-0 flex-col items-center gap-1"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[var(--color-bg-card)]">
                <Image
                  src={item.clothingItem.imageUrl}
                  alt={item.clothingItem.description ?? ""}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <span className="text-[10px] capitalize text-[var(--color-text-secondary)]">
                {item.clothingItem.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => {
            addTask({ id: "try-on", label: "Generating try-on image...", type: "generate" });
            tryOnMutation.mutate({ outfitId });
          }}
          disabled={tryOnMutation.isPending}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        >
          <Wand2 className="h-4 w-4" />
          {tryOnMutation.isPending ? "Generating..." : "Try It On"}
        </button>
        <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-border)] transition-colors hover:bg-[var(--color-bg-card)]">
          <Bookmark className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
