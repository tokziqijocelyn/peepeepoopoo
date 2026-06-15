"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "~/lib/supabase/client";

export function AutoAuth({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function ensureSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setReady(true);
        return;
      }

      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error("Anonymous sign-in failed:", error.message);
        setAuthError(error.message);
        return;
      }
      // Reload so the auth cookie is available server-side on the next request
      window.location.reload();
    }

    void ensureSession();
  }, []);

  if (authError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold">Authentication Error</p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {authError}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Enable anonymous sign-ins in Supabase Dashboard → Authentication →
          Settings
        </p>
        <button
          onClick={() => {
            setAuthError(null);
            window.location.reload();
          }}
          className="mt-2 rounded-full bg-[var(--color-accent)] px-6 py-2 text-sm font-medium text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
