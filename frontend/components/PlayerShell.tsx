"use client";

import type { PlaylistTrack } from "@/lib/api";

type Props = {
  currentTrack: PlaylistTrack | null;
  /** true когда плейлист пуст — все кнопки неактивны */
  isEmpty: boolean;
  /** true на первом треке — previous disabled */
  prevDisabled: boolean;
  /** true на последнем треке — next disabled */
  nextDisabled: boolean;
  /** playback активен */
  isPlaying: boolean;
  /** загрузка track runtime (YouTube buffering) */
  isTrackLoading: boolean;
  onDislike?: () => void;
  onPrevious?: () => void;
  onPlayPause?: () => void;
  onNext?: () => void;
  onLike?: () => void;
};

function IconBrokenHeart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s-6.5-4.35-6.5-10a4.5 4.5 0 0 1 8.36-2.25A4.5 4.5 0 0 1 18.5 11c0 5.65-6.5 10-6.5 10z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7 8l3 3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M11 8l-1 3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPrev() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 6l-6 6 6 6V6z" fill="currentColor" />
      <path d="M9 6H7v12h2V6z" fill="currentColor" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 7l10 5-10 5V7z" fill="currentColor" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="7" y="6" width="4" height="12" rx="1" fill="currentColor" />
      <rect x="13" y="6" width="4" height="12" rx="1" fill="currentColor" />
    </svg>
  );
}

function IconNext() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 6l6 6-6 6V6z" fill="currentColor" />
      <path d="M15 6h2v12h-2V6z" fill="currentColor" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s-6.5-4.35-6.5-10a4.5 4.5 0 0 1 8.36-2.25A4.5 4.5 0 0 1 18.5 11c0 5.65-6.5 10-6.5 10z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMusic() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden className="opacity-40">
      <path
        d="M9 18V5l12-2v13"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function PlayerShell({
  currentTrack,
  isEmpty,
  prevDisabled,
  nextDisabled,
  isPlaying,
  isTrackLoading,
  onDislike,
  onPrevious,
  onPlayPause,
  onNext,
  onLike,
}: Props) {
  const btn =
    "flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground-muted)] shadow-md shadow-black/25 transition hover:border-[var(--accent-muted)] hover:text-[var(--accent)] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[var(--border)] disabled:hover:text-[var(--foreground-muted)] disabled:active:scale-100";

  // YT-BLOCK-3: during buffering, block all navigation (not just play/pause)
  const navDisabled = isTrackLoading;

  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--surface)]/95 px-4 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        {/* Track info */}
        <div className="text-center">
          {currentTrack ? (
            <>
              <p className="text-base font-semibold leading-tight text-[var(--foreground)]">
                {currentTrack.track_name}
              </p>
              <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">
                {currentTrack.artist_name}
              </p>
            </>
          ) : isEmpty ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <IconMusic />
              <p className="text-sm text-[var(--foreground-muted)]">
                Your playlist is empty
              </p>
              <p className="text-xs text-[var(--foreground-muted)]/60">
                Generate a playlist to start listening
              </p>
            </div>
          ) : (
            <p className="text-sm text-[var(--foreground-muted)] italic">
              Loading…
            </p>
          )}
        </div>

        {/* N1: Progress bar — static placeholder with meaningful state */}
        <div className="h-1.5 rounded-full bg-[var(--surface-elevated)] shadow-inner shadow-black/40">
          <div
            className={
              "h-full rounded-full bg-gradient-to-r from-[var(--accent-muted)] to-[var(--accent)] opacity-70 transition-all duration-500" +
              (isEmpty ? " w-0" : isTrackLoading ? " w-1/5 animate-pulse" : " w-0")
            }
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          {/* Dislike */}
          <button
            type="button"
            className={btn}
            aria-label="Dislike"
            onClick={onDislike}
            disabled={!currentTrack || navDisabled}
          >
            <IconBrokenHeart />
          </button>

          {/* Previous */}
          <button
            type="button"
            className={btn}
            aria-label="Previous track"
            onClick={onPrevious}
            disabled={prevDisabled || navDisabled}
          >
            <IconPrev />
          </button>

          {/* Play/Pause */}
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg shadow-black/40 transition hover:bg-[var(--accent-hover)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[var(--accent)] disabled:active:scale-100"
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={onPlayPause}
            disabled={!currentTrack || isTrackLoading}
          >
            {isTrackLoading ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className="animate-spin"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeDasharray="42"
                  strokeLinecap="round"
                />
              </svg>
            ) : isPlaying ? (
              <IconPause />
            ) : (
              <IconPlay />
            )}
          </button>

          {/* Next */}
          <button
            type="button"
            className={btn}
            aria-label="Next track"
            onClick={onNext}
            disabled={nextDisabled || navDisabled}
          >
            <IconNext />
          </button>

          {/* Like */}
          <button
            type="button"
            className={btn}
            aria-label="Like"
            onClick={onLike}
            disabled={!currentTrack || navDisabled}
          >
            <IconHeart />
          </button>
        </div>
      </div>
    </div>
  );
}
