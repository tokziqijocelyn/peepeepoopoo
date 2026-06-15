"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { ClosetGrid } from "./_components/ClosetGrid";
import { OutfitSwiper } from "./_components/OutfitSwiper";
import { OnboardingGuard } from "~/app/_components/OnboardingGuard";
import { BodyPhotoUpload } from "~/app/shop/_components/BodyPhotoUpload";

type Tab = "closet" | "outfits";

export default function WardrobePage() {
  return (
    <OnboardingGuard>
      <WardrobeContent />
    </OnboardingGuard>
  );
}

function WardrobeContent() {
  const [tab, setTab] = useState<Tab>("closet");
  const [skippedUpload, setSkippedUpload] = useState(false);
  const bodyPhotoQuery = api.style.getBodyPhoto.useQuery();

  if (bodyPhotoQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  if (!bodyPhotoQuery.data && !skippedUpload) {
    return (
      <BodyPhotoUpload
        onComplete={() => void bodyPhotoQuery.refetch()}
        onSkip={() => setSkippedUpload(true)}
      />
    );
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 px-4 pt-3 backdrop-blur-md">
        <h1 className="text-lg font-semibold">Wardrobe</h1>

        {/* Segmented control */}
        <div className="mt-3 flex rounded-lg bg-[var(--color-bg-card)] p-1">
          {(["closet", "outfits"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-sm font-medium capitalize transition-all",
                tab === t
                  ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-secondary)]",
              )}
            >
              {t === "closet" ? "My Closet" : "Outfits"}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1">
        {tab === "closet" ? <ClosetGrid /> : <OutfitSwiper />}
      </div>
    </div>
  );
}
