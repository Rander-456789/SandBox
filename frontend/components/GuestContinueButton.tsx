"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { createGuest } from "@/lib/api";
import { useSessionStore } from "@/store/sessionStore";
import { useT } from "@/store/localeStore";

export function GuestContinueButton() {
  const router = useRouter();
  const t = useT();
  const setUserId = useSessionStore((s) => s.setUserId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // C1: ref-guard against double-click during navigation
  const submittingRef = useRef(false);

  async function handleClick() {
    if (submittingRef.current) return;
    submittingRef.current = true;

    setError(null);
    setLoading(true);
    try {
      const data = await createGuest();
      setUserId(data.user_id);
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      submittingRef.current = false;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-full bg-[var(--accent)] px-10 py-3 text-sm font-medium text-white shadow-lg shadow-black/30 transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? t.landing.connecting : t.landing.continueAsGuest}
      </button>
      {error ? (
        <p className="max-w-md text-center text-sm text-red-400/90">{error}</p>
      ) : null}
    </div>
  );
}
