"use client";

type Props = {
  onDislike?: () => void;
  onPrevious?: () => void;
  onPlayPause?: () => void;
  onNext?: () => void;
  onLike?: () => void;
};

function IconDislike() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 4h5l2 9H8V4zm8 0v9h5l-2.5 9H14v-9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function IconNext() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 6l6 6-6 6V6z" fill="currentColor" />
      <path d="M15 6h2v12h-2V6z" fill="currentColor" />
    </svg>
  );
}

function IconLike() {
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

export function PlayerShell({
  onDislike,
  onPrevious,
  onPlayPause,
  onNext,
  onLike,
}: Props) {
  const btn =
    "flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground-muted)] shadow-md shadow-black/25 transition hover:border-[var(--accent-muted)] hover:text-[var(--accent)] active:scale-95";

  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--surface)]/95 px-4 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        <div className="h-1.5 rounded-full bg-[var(--surface-elevated)] shadow-inner shadow-black/40">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[var(--accent-muted)] to-[var(--accent)] opacity-70" />
        </div>
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <button type="button" className={btn} aria-label="Dislike" onClick={onDislike}>
            <IconDislike />
          </button>
          <button type="button" className={btn} aria-label="Previous track" onClick={onPrevious}>
            <IconPrev />
          </button>
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg shadow-black/40 transition hover:bg-[var(--accent-hover)] active:scale-95"
            aria-label="Play or pause"
            onClick={onPlayPause}
          >
            <IconPlay />
          </button>
          <button type="button" className={btn} aria-label="Next track" onClick={onNext}>
            <IconNext />
          </button>
          <button type="button" className={btn} aria-label="Like" onClick={onLike}>
            <IconLike />
          </button>
        </div>
      </div>
    </div>
  );
}
