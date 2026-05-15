import { getApiBaseUrl } from "@/lib/env";

export type GuestAuthResponse = {
  user_id: string;
};

export type PlaylistTrack = {
  id: string;
  artist_name: string;
  track_name: string;
};

export type PlaylistGenerateResponse = {
  tracks: PlaylistTrack[];
};

export type InteractionType = "like" | "dislike" | "skip" | "listen";

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) {
    throw new Error(`Empty response (${res.status})`);
  }
  return JSON.parse(text) as T;
}

// ── API prefix ──────────────────────────────────────────────────
// M6: Backend now uses /api prefix on router
const API = getApiBaseUrl();

// ── Auth ────────────────────────────────────────────────────────

export async function createGuest(): Promise<GuestAuthResponse> {
  try {
    const res = await fetch(`${API}/api/auth/guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Guest auth failed: ${res.status}`);
    }
    return parseJson<GuestAuthResponse>(res);
  } catch (e) {
    console.error("[api] createGuest failed:", e);
    throw e;
  }
}

// ── Playlist ────────────────────────────────────────────────────

export async function generatePlaylist(
  userId: string,
  model: string,
  limit: number,
): Promise<PlaylistGenerateResponse> {
  try {
    const res = await fetch(`${API}/api/playlist/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        model,
        limit,
      }),
    });
    if (!res.ok) {
      throw new Error(`Playlist generate failed: ${res.status}`);
    }
    return parseJson<PlaylistGenerateResponse>(res);
  } catch (e) {
    console.error("[api] generatePlaylist failed:", e);
    throw e;
  }
}

// ── Interactions ────────────────────────────────────────────────

export async function sendInteraction(
  userId: string,
  trackId: string,
  modelUsed: string,
  interactionType: InteractionType,
): Promise<void> {
  try {
    const res = await fetch(`${API}/api/interactions/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        track_id: trackId,
        model_used: modelUsed,
        interaction_type: interactionType,
      }),
    });
    if (!res.ok) {
      throw new Error(`Interaction log failed: ${res.status}`);
    }
  } catch (e) {
    console.error("[api] sendInteraction failed:", e);
    throw e;
  }
}
