"use client";

import { useCallback } from "react";

import { generatePlaylist, logInteraction } from "@/lib/api";
import { usePlayerStore, selectCurrentTrack } from "@/store/playerStore";

import { ModelPanel } from "@/components/ModelPanel";
import { PlayerShell } from "@/components/PlayerShell";

type Props = {
  userId: string;
};

const ACTIVE_MODEL = "random";

export function DashboardContent({ userId }: Props) {
  const setPlaylist = usePlayerStore((s) => s.setPlaylist);
  const setLoading = usePlayerStore((s) => s.setLoading);
  const setError = usePlayerStore((s) => s.setError);
  const nextTrack = usePlayerStore((s) => s.nextTrack);
  const prevTrack = usePlayerStore((s) => s.prevTrack);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const error = usePlayerStore((s) => s.error);
  const currentTrack = usePlayerStore(selectCurrentTrack);
  const playlist = usePlayerStore((s) => s.playlist);
  const currentTrackIndex = usePlayerStore((s) => s.currentTrackIndex);

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      const data = await generatePlaylist(userId, ACTIVE_MODEL, 10);
      setPlaylist(data.tracks);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Playlist request failed");
    } finally {
      setLoading(false);
    }
  }

  /** Логирует skip-взаимодействие и переходит к следующему треку (NEXT) */
  const handleNext = useCallback(() => {
    if (!currentTrack) return;
    logInteraction(userId, currentTrack.id, ACTIVE_MODEL, "skip").catch(() => {
      /* silently ignore */
    });
    nextTrack();
  }, [userId, currentTrack, nextTrack]);

  /** Логирует like-взаимодействие, трек остаётся текущим */
  const handleLike = useCallback(() => {
    if (!currentTrack) return;
    logInteraction(userId, currentTrack.id, ACTIVE_MODEL, "like").catch(() => {
      /* silently ignore */
    });
  }, [userId, currentTrack]);

  /** Логирует dislike-взаимодействие, трек остаётся текущим */
  const handleDislike = useCallback(() => {
    if (!currentTrack) return;
    logInteraction(
      userId,
      currentTrack.id,
      ACTIVE_MODEL,
      "dislike",
    ).catch(() => {
      /* silently ignore */
    });
  }, [userId, currentTrack]);
  const handlePrevious = useCallback(() => prevTrack(), [prevTrack]);
  const handlePlayPause = useCallback(() => {
    // Placeholder — playback не реализован
  }, []);

  const showPlaceholder = playlist.length === 0 && !isLoading && !error;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] pb-36 text-[var(--foreground)]">
      <ModelPanel />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Session</h1>
          <p className="mt-2 max-w-md text-sm text-[var(--foreground-muted)]">
            Generate a playlist, then rate tracks with the player below.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-8 py-3 text-sm font-medium shadow-lg shadow-black/30 transition hover:border-[var(--accent-muted)] hover:text-[var(--accent)] disabled:opacity-60"
        >
          {isLoading ? "Generating…" : "Generate Playlist"}
        </button>

        {showPlaceholder ? (
          <p className="max-w-lg text-center text-sm text-[var(--foreground-muted)]">
            Pick a model above, generate a playlist, then use the player.
          </p>
        ) : null}

        {error ? (
          <p className="max-w-lg text-center text-sm text-red-400">{error}</p>
        ) : null}

        {/* Track counter */}
        {currentTrack ? (
          <p className="text-xs text-[var(--foreground-muted)]">
            Track {currentTrackIndex + 1} of {playlist.length}
          </p>
        ) : null}
      </main>

      <PlayerShell
        currentTrack={currentTrack}
        onDislike={handleDislike}
        onPrevious={handlePrevious}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onLike={handleLike}
      />
    </div>
  );
}
