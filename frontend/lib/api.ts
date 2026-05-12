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

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) {
    throw new Error(`Empty response (${res.status})`);
  }
  return JSON.parse(text) as T;
}

export async function createGuestUser(): Promise<GuestAuthResponse> {
  const res = await fetch(`${getApiBaseUrl()}/auth/guest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Guest auth failed: ${res.status}`);
  }
  return parseJson<GuestAuthResponse>(res);
}

export async function generatePlaylist(
  userId: string,
  model: string,
  limit: number,
): Promise<PlaylistGenerateResponse> {
  const res = await fetch(`${getApiBaseUrl()}/playlist/generate`, {
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
}
