"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const profileQuery = api.style.getProfile.useQuery();

  useEffect(() => {
    if (!profileQuery.isLoading && !profileQuery.data) {
      router.replace("/onboarding");
    }
  }, [profileQuery.isLoading, profileQuery.data, router]);

  if (profileQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  if (!profileQuery.data) {
    return null;
  }

  return <>{children}</>;
}
