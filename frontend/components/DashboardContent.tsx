"use client";

import { useCallback, useRef } from "react";

import { generatePlaylist, sendInteraction } from "@/lib/api";
import { useSessionStore } from "@/store/sessionStore";
import {
  usePlayerStore,
  selectCurrentTrack,
  selectHasPlaylist,
  selectIsAtStart,
  selectIsAtEnd,
  selectIsPlaying,
  selectIsTrackLoading,
} from "@/store/playerStore";

import { ModelPanel } from "@/components/ModelPanel";
import { PlayerShell } from "@/components/PlayerShell";

type Props = {
  userId: string;
};

export function DashboardContent({ userId }: Props) {
  // ── Session (PRE-YT-3 / M3) ───────────────────────────────
  const activeModel = useSessionStore((s) => s.activeModel);

  // ── Store selectors ─────────────────────────────────────────
  const setPlaylist = usePlayerStore((s) => s.setPlaylist);
  const setGenerating = usePlayerStore((s) => s.setGenerating);
  const setError = usePlayerStore((s) => s.setError);
  const nextTrack = usePlayerStore((s) => s.nextTrack);
  const prevTrack = usePlayerStore((s) => s.prevTrack);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const markTrackStarted = usePlayerStore((s) => s.markTrackStarted);
  const isGenerating = usePlayerStore((s) => s.isGenerating);
  const error = usePlayerStore((s) => s.error);
  const currentTrack = usePlayerStore(selectCurrentTrack);
  const playlist = usePlayerStore((s) => s.playlist);
  const currentTrackIndex = usePlayerStore((s) => s.currentTrackIndex);
  const hasPlaylist = usePlayerStore(selectHasPlaylist);
  const isAtStart = usePlayerStore(selectIsAtStart);
  const isAtEnd = usePlayerStore(selectIsAtEnd);
  const isPlaying = usePlayerStore(selectIsPlaying);
  const isTrackLoading = usePlayerStore(selectIsTrackLoading);

  // ── Double-click guard for Generate ─────────────────────────
  const isGeneratingRef = useRef(false);

  // C2: useCallback for handleGenerate
  const handleGenerate = useCallback(async () => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    setError(null);
    setGenerating(true);
    try {
      const data = await generatePlaylist(userId, activeModel, 10);
      setPlaylist(data.tracks);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Playlist request failed");
    } finally {
      setGenerating(false);
      isGeneratingRef.current = false;
    }
  }, [userId, activeModel, setError, setGenerating, setPlaylist]);

  // ── Navigation handlers ─────────────────────────────────────

  // PRE-YT-2: prev is navigational — not a skip signal
  const handlePrevious = useCallback(() => {
    if (!currentTrack) return;
    prevTrack();
  }, [currentTrack, prevTrack]);

  /** NEXT: логирует skip и переходит к следующему треку */
  const handleNext = useCallback(() => {
    if (!currentTrack) return;
    sendInteraction(userId, currentTrack.id, activeModel, "skip").catch(() => {
      /* silently ignore */
    });
    nextTrack();
  }, [userId, currentTrack, activeModel, nextTrack]);

  /** LIKE: логирует like и авто-переходит к следующему треку */
  // C6: на последнем треке — только лог, без навигации
  const handleLike = useCallback(() => {
    if (!currentTrack) return;
    sendInteraction(userId, currentTrack.id, activeModel, "like").catch(() => {
      /* silently ignore */
    });
    if (!isAtEnd) {
      nextTrack();
    }
  }, [userId, currentTrack, activeModel, isAtEnd, nextTrack]);

  /** DISLIKE: логирует dislike и авто-переходит к следующему треку */
  // C6: на последнем треке — только лог, без навигации
  const handleDislike = useCallback(() => {
    if (!currentTrack) return;
    sendInteraction(
      userId,
      currentTrack.id,
      activeModel,
      "dislike",
    ).catch(() => {
      /* silently ignore */
    });
    if (!isAtEnd) {
      nextTrack();
    }
  }, [userId, currentTrack, activeModel, isAtEnd, nextTrack]);

  /** PLAY/PAUSE: toggle isPlaying; markTrackStarted на первом play */
  const handlePlayPause = useCallback(() => {
    if (!currentTrack) return;
    const next = !isPlaying;
    setPlaying(next);
    if (next) {
      markTrackStarted();
    }
  }, [currentTrack, isPlaying, setPlaying, markTrackStarted]);

  // ── Derived flags for PlayerShell ───────────────────────────
  const showEmpty = playlist.length === 0 && !isGenerating && !error;

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

        {/* Generate button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-8 py-3 text-sm font-medium shadow-lg shadow-black/30 transition hover:border-[var(--accent-muted)] hover:text-[var(--accent)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGenerating ? "Generating…" : "Generate Playlist"}
        </button>

        {/* Error state */}
        {error ? (
          <p className="max-w-lg text-center text-sm text-red-400">{error}</p>
        ) : null}

        {/* Empty state — playlist пуст, нет загрузки, нет ошибки */}
        {showEmpty ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] px-8 py-10 text-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              className="text-[var(--foreground-muted)]/40"
            >
              <path
                d="M9 18V5l12-2v13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <p className="text-sm text-[var(--foreground-muted)]">
              Your playlist is empty
            </p>
            <p className="max-w-xs text-xs text-[var(--foreground-muted)]/60">
              Pick a model above, generate a playlist, then use the player to
              rate tracks.
            </p>
          </div>
        ) : null}

        {/* Track counter — показываем только когда есть треки */}
        {currentTrack ? (
          <p className="text-xs text-[var(--foreground-muted)]">
            Track {currentTrackIndex + 1} of {playlist.length}
          </p>
        ) : null}
      </main>

      <PlayerShell
        currentTrack={currentTrack}
        isEmpty={!hasPlaylist}
        prevDisabled={isAtStart || !hasPlaylist}
        nextDisabled={isAtEnd || !hasPlaylist}
        isPlaying={isPlaying}
        isTrackLoading={isTrackLoading}
        onDislike={handleDislike}
        onPrevious={handlePrevious}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onLike={handleLike}
      />
    </div>
  );
}
