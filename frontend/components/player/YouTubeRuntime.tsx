"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

// ── YouTube IFrame API global types ──────────────────────────────

declare global {
  interface Window {
    YT: {
      Player: new (
        container: HTMLElement | string,
        options: YouTubePlayerOptions,
      ) => YouTubePlayerInstance;
      PlayerState: Record<string, number>;
    };
    onYouTubeIframeAPIReady: (() => void) | null;
  }
}

type YouTubePlayerOptions = {
  width?: string | number;
  height?: string | number;
  videoId?: string;
  playerVars?: Record<string, number>;
  events?: {
    onReady?: (event: { target: YouTubePlayerInstance }) => void;
    onStateChange?: (event: { data: number }) => void;
    onError?: (event: { data: number }) => void;
  };
};

type YouTubePlayerInstance = {
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  destroy: () => void;
  getPlayerState: () => number;
};

// ── Public imperative handle ─────────────────────────────────────

export type YouTubeRuntimeHandle = {
  /** Load and immediately start playback (use after hasStarted unlock). */
  loadAndPlay: (videoId: string) => void;
  /** Cue a video without starting playback (safe for autoplay policy). */
  cue: (videoId: string) => void;
  /** Start/resume playback — only after user interaction. */
  playVideo: () => void;
  /** Pause current playback. */
  pauseVideo: () => void;
  /** Whether the YT Player instance is ready. */
  isReady: () => boolean;
};

// ── Props ────────────────────────────────────────────────────────

type Props = {
  /** Fired when YT Player finishes loading and is ready for commands. */
  onReady?: () => void;
  /**
   * Fired on every YT player state change.
   * Values: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued.
   */
  onStateChange?: (state: number) => void;
  /** Fired on YT player error (2=invalid param, 5=HTML5 error, 100/101/150=embed). */
  onError?: (error: number) => void;
};

// ── YouTubeRuntime Component ─────────────────────────────────────

export const YouTubeRuntime = forwardRef<YouTubeRuntimeHandle, Props>(
  function YouTubeRuntime({ onReady, onStateChange, onError }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YouTubePlayerInstance | null>(null);
    const readyRef = useRef(false);
    const pendingVideoIdRef = useRef<string | null>(null);
    const pendingModeRef = useRef<"cue" | "load">("cue");
    const scriptLoadingRef = useRef(false);

    // ── Create YT Player ─────────────────────────────────────────

    const createPlayer = useCallback(() => {
      if (!containerRef.current || playerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        width: "0",
        height: "0",
        playerVars: {
          autoplay: 0,         // NEVER autoplay
          controls: 0,         // no video controls
          disablekb: 1,        // disable keyboard
          fs: 0,               // no fullscreen
          modestbranding: 1,   // minimal YouTube branding
          playsinline: 1,      // stay inline (not fullscreen on mobile)
          rel: 0,              // no related videos at end
          showinfo: 0,         // no video info overlay
          iv_load_policy: 3,   // no annotations
        },
        events: {
          onReady: () => {
            readyRef.current = true;
            // Apply pending video with the correct mode
            if (pendingVideoIdRef.current && playerRef.current) {
              if (pendingModeRef.current === "load") {
                playerRef.current.loadVideoById(pendingVideoIdRef.current);
              } else {
                playerRef.current.cueVideoById(pendingVideoIdRef.current);
              }
              pendingVideoIdRef.current = null;
            }
            onReady?.();
          },
          onStateChange: (event: { data: number }) => {
            onStateChange?.(event.data);
          },
          onError: (event: { data: number }) => {
            onError?.(event.data);
          },
        },
      });
    }, [onReady, onStateChange, onError]);

    // ── Load YT IFrame API script ────────────────────────────────

    useEffect(() => {
      // Prevent double-load in React StrictMode / HMR
      if (scriptLoadingRef.current) return;
      if (document.getElementById("yt-iframe-api")) {
        // Script already in DOM — create player directly if API is ready
        if (window.YT?.Player) {
          createPlayer();
        } else {
          // Script tag exists but YT not loaded yet — wait for callback
          const orig = window.onYouTubeIframeAPIReady;
          window.onYouTubeIframeAPIReady = () => {
            orig?.();
            createPlayer();
          };
        }
        return;
      }

      scriptLoadingRef.current = true;

      // Register global callback BEFORE script loads
      const origReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        origReady?.();
        createPlayer();
      };

      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScript = document.getElementsByTagName("script")[0];
      firstScript?.parentNode?.insertBefore(tag, firstScript);
    }, [createPlayer]);

    // ── Cleanup ──────────────────────────────────────────────────

    useEffect(() => {
      return () => {
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch {
            // player already destroyed
          }
          playerRef.current = null;
        }
        readyRef.current = false;
        pendingVideoIdRef.current = null;
      };
    }, []);

    // ── Imperative API methods ───────────────────────────────────

    const loadAndPlay = useCallback((videoId: string) => {
      if (!videoId) return;
      if (readyRef.current && playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        pendingVideoIdRef.current = null;
      } else {
        pendingVideoIdRef.current = videoId;
        pendingModeRef.current = "load";
      }
    }, []);

    const cue = useCallback((videoId: string) => {
      if (!videoId) return;
      if (readyRef.current && playerRef.current) {
        playerRef.current.cueVideoById(videoId);
        pendingVideoIdRef.current = null;
      } else {
        pendingVideoIdRef.current = videoId;
        pendingModeRef.current = "cue";
      }
    }, []);

    const playVideo = useCallback(() => {
      if (readyRef.current && playerRef.current) {
        playerRef.current.playVideo();
      }
    }, []);

    const pauseVideo = useCallback(() => {
      if (readyRef.current && playerRef.current) {
        playerRef.current.pauseVideo();
      }
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        loadAndPlay,
        cue,
        playVideo,
        pauseVideo,
        isReady: () => readyRef.current,
      }),
      [loadAndPlay, cue, playVideo, pauseVideo],
    );

    // ── Hidden container — NOT part of UI ─────────────────────────

    return (
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          width: 0,
          height: 0,
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
        aria-hidden="true"
      />
    );
  },
);
