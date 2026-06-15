"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        {error.message || "An unexpected error occurred"}
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
