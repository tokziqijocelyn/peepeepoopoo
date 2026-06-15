"use client";

import { useEffect } from "react";
import { api } from "~/trpc/react";
import { ProductGrid } from "./_components/ProductGrid";
import { useTasks } from "~/app/_components/TaskContext";
import { OnboardingGuard } from "~/app/_components/OnboardingGuard";

export default function ShopPage() {
  return (
    <OnboardingGuard>
      <ShopContent />
    </OnboardingGuard>
  );
}

function ShopContent() {
  const { addTask, removeTask } = useTasks();
  const listingsQuery = api.shop.getListings.useQuery();

  useEffect(() => {
    if (listingsQuery.isFetching) {
      addTask({ id: "shop-listings", label: "Generating shop listings...", type: "generate" });
    } else {
      removeTask("shop-listings");
    }
  }, [listingsQuery.isFetching, addTask, removeTask]);

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 px-4 py-3 backdrop-blur-md">
        <h1 className="text-lg font-semibold">Shop</h1>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Curated picks for your style
        </p>
      </header>

      <ProductGrid
        listings={listingsQuery.data ?? []}
        isLoading={listingsQuery.isLoading}
        onRefresh={() => void listingsQuery.refetch()}
      />
    </div>
  );
}
