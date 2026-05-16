import { create } from "zustand";
import type { PlaylistTrack } from "@/lib/api";

type PlayerState = {
  // ── Playlist ────────────────────────────────────────────────
  playlist: PlaylistTrack[];
  currentTrackIndex: number;

  // ── Playlist generation ─────────────────────────────────────
  isGenerating: boolean;
  error: string | null;

  // ── Playback runtime ────────────────────────────────────────
  isPlaying: boolean;
  isLoading: boolean;        // track runtime loading (YouTube buffering)
  hasStarted: boolean;       // true после первого user Play — разблокирует autoplay
  isPlaylistFinished: boolean; // true когда последний трек доиграл до конца

  // ── Playlist actions ────────────────────────────────────────
  setPlaylist: (tracks: PlaylistTrack[]) => void;
  setGenerating: (loading: boolean) => void;
  setError: (error: string | null) => void;
  /** autoPlay default false — used explicitly. Auto-next via ENDED passes true. */
  nextTrack: (autoPlay?: boolean) => void;
  /** autoPlay default false — used explicitly. */
  prevTrack: (autoPlay?: boolean) => void;
  clearPlaylist: () => void;

  // ── Playback actions ────────────────────────────────────────
  setPlaying: (playing: boolean) => void;
  setTrackLoading: (loading: boolean) => void;
  /** Разблокирует autoplay после первого user gesture (Play button click). */
  markTrackStarted: () => void;
  /** Помечает плейлист как завершённый (последний трек доиграл). */
  markPlaylistFinished: () => void;
};

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  playlist: [],
  currentTrackIndex: 0,
  isGenerating: false,
  error: null,
  isPlaying: false,
  isLoading: false,
  hasStarted: false,
  isPlaylistFinished: false,

  // ── Playlist actions ────────────────────────────────────────

  setPlaylist: (tracks) =>
    set({
      playlist: tracks,
      currentTrackIndex: 0,
      error: null,
      isPlaying: false,
      isLoading: false,
      hasStarted: false,
      isPlaylistFinished: false,
    }),

  setGenerating: (v) => set({ isGenerating: v }),

  setError: (error) => set({ error }),

  // hasStarted is session-level — never reset on track navigation.
  // autoPlay=true when playback already unlocked (e.g. ENDED → auto-next).
  nextTrack: (autoPlay = false) => {
    const { playlist, currentTrackIndex } = get();
    if (currentTrackIndex < playlist.length - 1) {
      set({
        currentTrackIndex: currentTrackIndex + 1,
        isPlaying: autoPlay,
        isLoading: autoPlay,
        isPlaylistFinished: false,
      });
    }
  },

  prevTrack: (autoPlay = false) => {
    const { currentTrackIndex } = get();
    if (currentTrackIndex > 0) {
      set({
        currentTrackIndex: currentTrackIndex - 1,
        isPlaying: autoPlay,
        isLoading: autoPlay,
        isPlaylistFinished: false,
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
      isPlaylistFinished: false,
    }),

  // ── Playback actions ────────────────────────────────────────

  setPlaying: (playing) => set({ isPlaying: playing }),

  setTrackLoading: (loading) => set({ isLoading: loading }),

  /** Разблокирует autoplay — вызывается при первом user click на Play. */
  markTrackStarted: () => set({ hasStarted: true }),

  /** Помечает плейлист как завершённый — последний трек доиграл до конца. */
  markPlaylistFinished: () =>
    set({
      isPlaylistFinished: true,
      isPlaying: false,
      isLoading: false,
    }),
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

/** Autoplay разблокирован — был хотя бы один user gesture Play. */
export function selectHasStarted(state: PlayerState): boolean {
  return state.hasStarted;
}

/** Плейлист завершён — последний трек доиграл до конца. */
export function selectIsPlaylistFinished(state: PlayerState): boolean {
  return state.isPlaylistFinished;
}
