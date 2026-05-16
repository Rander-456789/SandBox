import { create } from "zustand";
import type { PlaylistTrack } from "@/lib/api";

type PlayerState = {
  // ── Playlist ────────────────────────────────────────────────
  playlist: PlaylistTrack[];
  currentTrackIndex: number;

  // ── Playlist generation ─────────────────────────────────────
  isGenerating: boolean;
  error: string | null;

  // ── Playback runtime (ready for YouTube integration) ────────
  isPlaying: boolean;
  isLoading: boolean;      // track runtime loading (YouTube buffering)
  hasStarted: boolean;     // true после первого play — для listen event trigger
  listenThresholdReached: boolean; // YT-BLOCK-2: true когда 30s/50% прослушано

  // ── Playlist actions ────────────────────────────────────────
  setPlaylist: (tracks: PlaylistTrack[]) => void;
  setGenerating: (loading: boolean) => void;
  setError: (error: string | null) => void;
  /** YT-BLOCK-1: autoPlay default true — YouTube auto-continues */
  nextTrack: (autoPlay?: boolean) => void;
  /** YT-BLOCK-1: autoPlay default true */
  prevTrack: (autoPlay?: boolean) => void;
  clearPlaylist: () => void;

  // ── Playback actions ────────────────────────────────────────
  setPlaying: (playing: boolean) => void;
  setTrackLoading: (loading: boolean) => void;
  markTrackStarted: () => void;
  markListenThresholdReached: () => void; // YT-BLOCK-2
};

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  playlist: [],
  currentTrackIndex: 0,
  isGenerating: false,
  error: null,
  isPlaying: false,
  isLoading: false,
  hasStarted: false,
  listenThresholdReached: false,

  // ── Playlist actions ────────────────────────────────────────

  setPlaylist: (tracks) =>
    set({
      playlist: tracks,
      currentTrackIndex: 0,
      error: null,
      isPlaying: false,
      isLoading: false,
      hasStarted: false,
      listenThresholdReached: false,
    }),

  setGenerating: (v) => set({ isGenerating: v }),

  setError: (error) => set({ error }),

  // YT-BLOCK-1: autoPlay=false по умолчанию — загрузка только после явного Play
  nextTrack: (autoPlay = false) => {
    const { playlist, currentTrackIndex } = get();
    if (currentTrackIndex < playlist.length - 1) {
      set({
        currentTrackIndex: currentTrackIndex + 1,
        isPlaying: autoPlay,          // будет true только при YouTube auto-next
        isLoading: autoPlay,           // буферинг только при autoPlay
        hasStarted: false,
        listenThresholdReached: false,
      });
    }
  },

  // YT-BLOCK-1: prev — тоже без авто-загрузки
  prevTrack: (autoPlay = false) => {
    const { currentTrackIndex } = get();
    if (currentTrackIndex > 0) {
      set({
        currentTrackIndex: currentTrackIndex - 1,
        isPlaying: autoPlay,
        isLoading: autoPlay,
        hasStarted: false,
        listenThresholdReached: false,
      });
    }
  },

  clearPlaylist: () =>
    set({
      playlist: [],
      currentTrackIndex: 0,
      error: null,
      isPlaying: false,
      isLoading: false,
      hasStarted: false,
      listenThresholdReached: false,
    }),

  // ── Playback actions ────────────────────────────────────────

  setPlaying: (playing) => set({ isPlaying: playing }),

  setTrackLoading: (loading) => set({ isLoading: loading }),

  markTrackStarted: () => set({ hasStarted: true }),

  // YT-BLOCK-2: YouTube onStateChange срабатывает при пороге прослушивания
  markListenThresholdReached: () => set({ listenThresholdReached: true }),
}));

// ── Derived selectors ────────────────────────────────────────────

/** Текущий трек или null, если плейлист пуст */
export function selectCurrentTrack(
  state: PlayerState,
): PlaylistTrack | null {
  if (state.playlist.length === 0) return null;
  return state.playlist[state.currentTrackIndex] ?? null;
}

/** Плейлист не пуст */
export function selectHasPlaylist(state: PlayerState): boolean {
  return state.playlist.length > 0;
}

/** Стоим на первом треке (или плейлист пуст) */
export function selectIsAtStart(state: PlayerState): boolean {
  return state.currentTrackIndex === 0;
}

/** Стоим на последнем треке (или плейлист пуст) */
export function selectIsAtEnd(state: PlayerState): boolean {
  return (
    state.playlist.length === 0 ||
    state.currentTrackIndex >= state.playlist.length - 1
  );
}

/** Playback активен */
export function selectIsPlaying(state: PlayerState): boolean {
  return state.isPlaying;
}

/** Трек загружается (YouTube buffering) */
export function selectIsTrackLoading(state: PlayerState): boolean {
  return state.isLoading;
}

/** Трек был запущен хотя бы раз */
export function selectHasStarted(state: PlayerState): boolean {
  return state.hasStarted;
}

/** Порог прослушивания достигнут — можно слать listen event */
export function selectListenThresholdReached(state: PlayerState): boolean {
  return state.listenThresholdReached;
}
