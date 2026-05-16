"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { generatePlaylist, searchYoutubeVideo, sendInteraction } from "@/lib/api";
import { useSessionStore } from "@/store/sessionStore";
import {
  usePlayerStore,
  selectCurrentTrack,
  selectHasPlaylist,
  selectIsAtStart,
  selectIsAtEnd,
  selectIsPlaying,
  selectIsTrackLoading,
  selectHasStarted,
  selectIsPlaylistFinished,
} from "@/store/playerStore";
import {
  getCachedVideoId,
  setCachedVideoId,
  clearCache,
} from "@/lib/youtubeCache";
import {
  YouTubeRuntime,
  type YouTubeRuntimeHandle,
} from "@/components/player/YouTubeRuntime";
import { useT } from "@/store/localeStore";

import { ModelPanel } from "@/components/ModelPanel";
import { PlayerShell } from "@/components/PlayerShell";

// ── Runtime Interaction Memory (session-only, no persistence) ────
//
// Эти Set'ы живут только в runtime текущей сессии.
// Цель: предотвратить duplicate sends для listen / like / dislike.
//
// - listenedTrackIds:   track_id → listen УЖЕ отправлен
// - likedTrackIds:      track_id → like УЖЕ отправлен
// - dislikedTrackIds:   track_id → dislike УЖЕ отправлен
//
// skip не нуждается в dedup guard — handleNext всегда явный и однократный.

const listenedTrackIds = new Set<string>();
const likedTrackIds = new Set<string>();
const dislikedTrackIds = new Set<string>();

/** Полный сброс runtime memory — вызывается при генерации нового плейлиста. */
function resetInteractionMemory(): void {
  listenedTrackIds.clear();
  likedTrackIds.clear();
  dislikedTrackIds.clear();
}

type Props = {
  userId: string;
};

export function DashboardContent({ userId }: Props) {
  const t = useT();

  // ── Session ───────────────────────────────────────────────
  const activeModel = useSessionStore((s) => s.activeModel);

  // ── Store selectors ─────────────────────────────────────────
  const setPlaylist = usePlayerStore((s) => s.setPlaylist);
  const setGenerating = usePlayerStore((s) => s.setGenerating);
  const setError = usePlayerStore((s) => s.setError);
  const nextTrack = usePlayerStore((s) => s.nextTrack);
  const prevTrack = usePlayerStore((s) => s.prevTrack);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const markTrackStarted = usePlayerStore((s) => s.markTrackStarted);
  const markPlaylistFinished = usePlayerStore((s) => s.markPlaylistFinished);
  const isGenerating = usePlayerStore((s) => s.isGenerating);
  const error = usePlayerStore((s) => s.error);
  const currentTrack = usePlayerStore(selectCurrentTrack);
  const playlist = usePlayerStore((s) => s.playlist);
  const currentTrackIndex = usePlayerStore((s) => s.currentTrackIndex);
  const hasPlaylist = usePlayerStore(selectHasPlaylist);
  const isAtStart = usePlayerStore(selectIsAtStart);
  const isAtEnd = usePlayerStore(selectIsAtEnd);
  const isPlaying = usePlayerStore(selectIsPlaying);
  const hasStarted = usePlayerStore(selectHasStarted);
  const isTrackLoading = usePlayerStore(selectIsTrackLoading);
  const isPlaylistFinished = usePlayerStore(selectIsPlaylistFinished);
  const setTrackLoading = usePlayerStore((s) => s.setTrackLoading);

  // ── YouTube runtime cache state ─────────────────────────────
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isSearchingYoutube, setIsSearchingYoutube] = useState(false);

  // ── Race condition guard: отслеживаем "актуальный" trackId для videoId resolution ─
  const activeTrackIdRef = useRef<string | null>(null);

  // ── YouTube runtime ref ─────────────────────────────────────
  const runtimeRef = useRef<YouTubeRuntimeHandle>(null);

  // ── YouTube videoId resolution (runtime cache) ──────────────
  useEffect(() => {
    if (!currentTrack) {
      setCurrentVideoId(null);
      activeTrackIdRef.current = null;
      return;
    }

    const trackId = currentTrack.id;
    activeTrackIdRef.current = trackId;

    // 1. Проверяем runtime cache
    const cached = getCachedVideoId(trackId);
    if (cached !== undefined) {
      // Guard: не применять если track уже сменился
      if (activeTrackIdRef.current !== trackId) return;
      setCurrentVideoId(cached);
      setIsSearchingYoutube(false);
      return;
    }

    // 2. Cache miss — идём в YouTube search API
    setIsSearchingYoutube(true);
    setCurrentVideoId(null);

    let cancelled = false;

    searchYoutubeVideo(currentTrack.artist_name, currentTrack.track_name)
      .then((videoId) => {
        if (cancelled) return;
        // Guard: не применять если track уже сменился
        if (activeTrackIdRef.current !== trackId) return;
        if (videoId) {
          setCachedVideoId(trackId, videoId);
        } else {
          console.warn(
            `[yt] Video not found: "${currentTrack.artist_name}" — "${currentTrack.track_name}"`,
          );
        }
        setCurrentVideoId(videoId);
        setIsSearchingYoutube(false);
      })
      .catch(() => {
        if (cancelled) return;
        if (activeTrackIdRef.current !== trackId) return;
        setCurrentVideoId(null);
        setIsSearchingYoutube(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentTrack]);

  // ── Video loading: loadAndPlay (unlocked) or cue (first Play pending) ─
  useEffect(() => {
    const trackId = currentTrack?.id ?? null;

    // Guard: нет трека или нет videoId — нечего загружать
    if (!runtimeRef.current || !currentVideoId || !trackId) return;

    // Guard: не загружать если track сменился пока мы ждали videoId
    if (activeTrackIdRef.current !== trackId) return;

    const unlocked = usePlayerStore.getState().hasStarted;
    if (unlocked) {
      runtimeRef.current.loadAndPlay(currentVideoId);
      setTrackLoading(true);
      setPlaying(true);
    } else {
      runtimeRef.current.cue(currentVideoId);
      setTrackLoading(true);
    }
  }, [currentVideoId, currentTrack, setTrackLoading, setPlaying]);

  // ── Double-click guard for Generate ─────────────────────────
  const isGeneratingRef = useRef(false);

  const handleGenerate = useCallback(async () => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    resetInteractionMemory(); // новый плейлист → сброс runtime memory
    clearCache();             // новый плейлист → сброс YouTube кеша
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

  const handlePrevious = useCallback(() => {
    if (!currentTrack) return;
    const unlocked = usePlayerStore.getState().hasStarted;
    prevTrack(unlocked);
  }, [currentTrack, prevTrack]);

  /** NEXT: логирует skip и переходит к следующему треку */
  const handleNext = useCallback(() => {
    if (!currentTrack) return;
    sendInteraction(userId, currentTrack.id, activeModel, "skip").catch(() => {
      /* silently ignore */
    });
    const unlocked = usePlayerStore.getState().hasStarted;
    nextTrack(unlocked);
  }, [userId, currentTrack, activeModel, nextTrack]);

  /** LIKE: логирует like (dedup: один раз на track), НЕ переключает трек */
  const handleLike = useCallback(() => {
    if (!currentTrack) return;
    if (likedTrackIds.has(currentTrack.id)) return;
    likedTrackIds.add(currentTrack.id);
    sendInteraction(userId, currentTrack.id, activeModel, "like").catch(() => {
      /* silently ignore */
    });
  }, [userId, currentTrack, activeModel]);

  /** DISLIKE: логирует dislike (dedup: один раз на track), НЕ переключает трек */
  const handleDislike = useCallback(() => {
    if (!currentTrack) return;
    if (dislikedTrackIds.has(currentTrack.id)) return;
    dislikedTrackIds.add(currentTrack.id);
    sendInteraction(
      userId,
      currentTrack.id,
      activeModel,
      "dislike",
    ).catch(() => {
      /* silently ignore */
    });
  }, [userId, currentTrack, activeModel]);

  /** PLAY/PAUSE: delegates to YouTube runtime; satisfies autoplay policy. */
  const handlePlayPause = useCallback(() => {
    if (!currentTrack || isPlaylistFinished) return;
    if (!isPlaying) {
      // User explicitly pressed Play — unlocks browser autoplay
      runtimeRef.current?.playVideo();
      setPlaying(true);
      markTrackStarted();
    } else {
      runtimeRef.current?.pauseVideo();
      setPlaying(false);
    }
  }, [currentTrack, isPlaying, isPlaylistFinished, setPlaying, markTrackStarted]);

  // ── YouTube Runtime callbacks ──────────────────────────────

  const handleRuntimeReady = useCallback(() => {
    // Video loading effect handles cueing/loading when videoId resolves
  }, []);

  const handleRuntimeStateChange = useCallback(
    (state: number) => {
      // YT.PlayerState: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued
      switch (state) {
        case -1: // UNSTARTED — video is loading metadata
          setTrackLoading(true);
          break;
        case 0: { // ENDED
          setPlaying(false);
          setTrackLoading(false);
          const store = usePlayerStore.getState();
          if (selectIsAtEnd(store)) {
            // Последний трек доиграл — стоп
            markPlaylistFinished();
          } else {
            // Auto-next (NO skip interaction — это organic playback)
            nextTrack(true);
          }
          break;
        }
        case 1: { // PLAYING — отправляем listen (один раз на track)
          setPlaying(true);
          setTrackLoading(false);
          // ── Listen Event Runtime ──────────────────────────
          // first PLAYING = listen. Dedup через listenedTrackIds.
          const store = usePlayerStore.getState();
          const track = selectCurrentTrack(store);
          if (track && !listenedTrackIds.has(track.id)) {
            listenedTrackIds.add(track.id);
            const model = useSessionStore.getState().activeModel;
            const uid = useSessionStore.getState().userId;
            if (uid) {
              sendInteraction(uid, track.id, model, "listen").catch(() => {
                /* silently ignore */
              });
            }
          }
          break;
        }
        case 2: // PAUSED
          setPlaying(false);
          setTrackLoading(false);
          break;
        case 3: // BUFFERING
          setTrackLoading(true);
          break;
        case 5: // CUED — ready to play, waiting for user interaction
          setPlaying(false);
          setTrackLoading(false);
          break;
      }
    },
    [setPlaying, setTrackLoading, nextTrack, markPlaylistFinished],
  );

  const handleRuntimeError = useCallback(
    (errorCode: number) => {
      console.warn(`[yt] Playback error: ${errorCode}`);
      setTrackLoading(false);
      setPlaying(false);
      // Auto-skip to next track on playback failure (only if not at end)
      const store = usePlayerStore.getState();
      if (selectIsAtEnd(store)) {
        markPlaylistFinished();
      } else {
        nextTrack(true);
      }
    },
    [setTrackLoading, setPlaying, nextTrack, markPlaylistFinished],
  );

  // ── Derived flags for PlayerShell ───────────────────────────
  const showEmpty = playlist.length === 0 && !isGenerating && !error;
  const isLoading = isSearchingYoutube || isTrackLoading;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <ModelPanel />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 overflow-y-auto px-6 py-8 min-h-0">
        <div className="text-center shrink-0">
          <h1 className="text-2xl font-semibold tracking-tight">{t.dashboard.sessionTitle}</h1>
          <p className="mt-2 max-w-md text-sm text-[var(--foreground-muted)]">
            {t.dashboard.sessionSubtitle}
          </p>
        </div>

        {/* Generate button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-8 py-3 text-sm font-medium shadow-lg shadow-black/30 transition hover:border-[var(--accent-muted)] hover:text-[var(--accent)] disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
          {isGenerating ? t.dashboard.generating : t.dashboard.generatePlaylist}
        </button>

        {/* Error state */}
        {error ? (
          <p className="max-w-lg text-center text-sm text-red-400 shrink-0">{error}</p>
        ) : null}

        {/* Empty state — playlist пуст, нет загрузки, нет ошибки */}
        {showEmpty ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] px-8 py-10 text-center shrink-0">
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
              {t.dashboard.emptyPlaylist}
            </p>
            <p className="max-w-xs text-xs text-[var(--foreground-muted)]/60">
              {t.dashboard.emptyHint}
            </p>
          </div>
        ) : null}

        {/* Track counter — показываем только когда есть треки */}
        {currentTrack && !isPlaylistFinished ? (
          <p className="text-xs text-[var(--foreground-muted)] shrink-0">
            {t.dashboard.trackCounter(currentTrackIndex + 1, playlist.length)}
          </p>
        ) : null}

        {/* Playlist finished — лёгкое сообщение */}
        {isPlaylistFinished ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--accent-muted)]/30 px-8 py-8 text-center shrink-0">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              className="text-[var(--accent)]/60"
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
              {t.dashboard.playlistFinished}
            </p>
            <p className="max-w-xs text-xs text-[var(--foreground-muted)]/60">
              {t.dashboard.finishedHint}
            </p>
          </div>
        ) : null}

        {/* Bottom spacer so content doesn't get hidden behind sticky player */}
        <div className="h-4 shrink-0" />
      </main>

      {/* Hidden YouTube Runtime — implementation detail, not UI */}
      <YouTubeRuntime
        ref={runtimeRef}
        onReady={handleRuntimeReady}
        onStateChange={handleRuntimeStateChange}
        onError={handleRuntimeError}
      />

      <PlayerShell
        currentTrack={currentTrack}
        isEmpty={!hasPlaylist}
        prevDisabled={isAtStart || !hasPlaylist}
        nextDisabled={isAtEnd || !hasPlaylist}
        isPlaying={isPlaying}
        isTrackLoading={isLoading}
        isPlaylistFinished={isPlaylistFinished}
        onDislike={handleDislike}
        onPrevious={handlePrevious}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onLike={handleLike}
      />
    </div>
  );
}
