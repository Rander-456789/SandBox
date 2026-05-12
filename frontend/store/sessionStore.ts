import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionState = {
  userId: string | null;
  setUserId: (id: string) => void;
  clear: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      userId: null,
      setUserId: (id) => set({ userId: id }),
      clear: () => set({ userId: null }),
    }),
    { name: "recsys-session" },
  ),
);
