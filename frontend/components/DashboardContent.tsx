"use client";

import { useState } from "react";

import { generatePlaylist } from "@/lib/api";

import { ModelPanel } from "@/components/ModelPanel";
import { PlayerShell } from "@/components/PlayerShell";

type Props = {
  userId: string;
};

export function DashboardContent({ userId }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setStatus(null);
    setLoading(true);
    try {
      const data = await generatePlaylist(userId, "random", 10);
      setStatus(`Loaded ${data.tracks.length} tracks into session (playback coming soon).`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Playlist request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] pb-36 text-[var(--foreground)]">
      <ModelPanel />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Session</h1>
          <p className="mt-2 max-w-md text-sm text-[var(--foreground-muted)]">
            Pick a model above, generate a playlist, then use the player when playback lands.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-8 py-3 text-sm font-medium shadow-lg shadow-black/30 transition hover:border-[var(--accent-muted)] hover:text-[var(--accent)] disabled:opacity-60"
        >
          {loading ? "Generating…" : "Generate Playlist"}
        </button>

        {status ? (
          <p className="max-w-lg text-center text-sm text-[var(--foreground-muted)]">{status}</p>
        ) : null}
      </main>

      <PlayerShell />
    </div>
  );
}
