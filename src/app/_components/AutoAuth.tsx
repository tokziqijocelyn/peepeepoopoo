"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "~/lib/supabase/client";

export function AutoAuth({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function ensureSession() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("Anonymous sign-in failed:", error.message);
          setReady(true);
          return;
        }
        // Reload so the auth cookie is available server-side on the next request
        window.location.reload();
        return;
      }

      setReady(true);
    }

    void ensureSession();
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
