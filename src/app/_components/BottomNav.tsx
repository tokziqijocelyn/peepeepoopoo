"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Shirt } from "lucide-react";
import { cn } from "~/lib/utils";

const tabs = [
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-6 py-1 transition-colors",
                isActive
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
