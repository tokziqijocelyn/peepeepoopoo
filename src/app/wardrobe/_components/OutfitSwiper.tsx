"use client";

import { useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { Loader2, Sparkles, X, Heart, Camera } from "lucide-react";
import Image from "next/image";
import { api } from "~/trpc/react";
import { OutfitDetail } from "./OutfitDetail";
import { useTasks } from "~/app/_components/TaskContext";
import { BodyPhotoUpload } from "~/app/shop/_components/BodyPhotoUpload";

interface OutfitData {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  items: { clothingItem: { category: string; description: string | null } }[];
}

export function OutfitSwiper() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomedOutfit, setZoomedOutfit] = useState<string | null>(null);

  const { addTask, removeTask } = useTasks();

  const bodyPhotoQuery = api.style.getBodyPhoto.useQuery();
  const queueQuery = api.wardrobe.getOutfitQueue.useQuery();
  const generateMutation = api.wardrobe.generateOutfits.useMutation({
    onSuccess: () => {
      removeTask("generate-outfits");
      void queueQuery.refetch();
    },
    onError: () => {
      removeTask("generate-outfits");
    },
  });
  const swipeMutation = api.wardrobe.swipe.useMutation();

  const outfits = (queueQuery.data ?? []) as OutfitData[];
  const currentOutfit = outfits[currentIndex];

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (!currentOutfit) return;

      swipeMutation.mutate({
        outfitId: currentOutfit.id,
        direction,
      });

      if (direction === "right") {
        setZoomedOutfit(currentOutfit.id);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    },
    [currentOutfit, swipeMutation],
  );

  if (zoomedOutfit) {
    return (
      <OutfitDetail
        outfitId={zoomedOutfit}
        onBack={() => {
          setZoomedOutfit(null);
          setCurrentIndex((i) => i + 1);
        }}
      />
    );
  }

  if (bodyPhotoQuery.isLoading || queueQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
        <p className="text-sm text-[var(--color-text-secondary)]">
          Loading...
        </p>
      </div>
    );
  }

  if (!bodyPhotoQuery.data) {
    return (
      <BodyPhotoUpload
        onComplete={() => void bodyPhotoQuery.refetch()}
        onSkip={() => void bodyPhotoQuery.refetch()}
      />
    );
  }

  if (outfits.length === 0 || currentIndex >= outfits.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-20">
        <Sparkles className="h-12 w-12 text-[var(--color-accent)]" />
        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          {outfits.length === 0
            ? "Add clothes to your closet first, then generate outfit ideas"
            : "You've seen all outfits! Generate more?"}
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            addTask({ id: "generate-outfits", label: "Generating outfit ideas...", type: "generate" });
            generateMutation.mutate();
          }}
          disabled={generateMutation.isPending}
          className="flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Outfits
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 pt-4">
      <div className="relative h-[480px] w-full">
        {currentOutfit && (
          <SwipeCard
            key={currentOutfit.id}
            outfit={currentOutfit}
            onSwipe={handleSwipe}
          />
        )}
      </div>

      <div className="mt-4 flex items-center gap-8">
        <button
          onClick={() => handleSwipe("left")}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-400/50 text-red-400 transition-colors hover:bg-red-400/10"
        >
          <X className="h-6 w-6" />
        </button>
        <button
          onClick={() => handleSwipe("right")}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-green-400/50 text-green-400 transition-colors hover:bg-green-400/10"
        >
          <Heart className="h-6 w-6" />
        </button>
      </div>

      <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
        Swipe right to try it on, left to skip
      </p>
    </div>
  );
}

function SwipeCard({
  outfit,
  onSwipe,
}: {
  outfit: OutfitData;
  onSwipe: (direction: "left" | "right") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0.5, 1, 1, 1, 0.5],
  );
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe("right");
    } else if (info.offset.x < -100) {
      onSwipe("left");
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-xl active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="relative h-[360px] w-full bg-[var(--color-bg-elevated)]">
        {outfit.imageUrl ? (
          <Image
            src={outfit.imageUrl}
            alt={outfit.title ?? "Outfit"}
            fill
            className="object-cover"
            sizes="(max-width: 430px) 100vw, 400px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-[var(--color-text-secondary)]">
              Outfit preview
            </span>
          </div>
        )}

        <motion.div
          className="absolute left-4 top-4 rounded-lg border-2 border-green-400 px-3 py-1"
          style={{ opacity: likeOpacity }}
        >
          <span className="text-lg font-bold text-green-400">LIKE</span>
        </motion.div>
        <motion.div
          className="absolute right-4 top-4 rounded-lg border-2 border-red-400 px-3 py-1"
          style={{ opacity: nopeOpacity }}
        >
          <span className="text-lg font-bold text-red-400">NOPE</span>
        </motion.div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold">{outfit.title ?? "Outfit"}</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {outfit.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {outfit.items.map((item, i: number) => (
            <span
              key={i}
              className="rounded-full bg-[var(--color-bg-elevated)] px-2 py-0.5 text-[10px] capitalize text-[var(--color-text-secondary)]"
            >
              {item.clothingItem.category}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
