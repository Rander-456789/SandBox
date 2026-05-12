"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createGuestUser } from "@/lib/api";
import { useSessionStore } from "@/store/sessionStore";

export function GuestContinueButton() {
  const router = useRouter();
  const setUserId = useSessionStore((s) => s.setUserId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      const data = await createGuestUser();
      setUserId(data.user_id);
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
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
        {loading ? "Connecting…" : "Continue as Guest"}
      </button>
      {error ? (
        <p className="max-w-md text-center text-sm text-red-400/90">{error}</p>
      ) : null}
    </div>
  );
}
