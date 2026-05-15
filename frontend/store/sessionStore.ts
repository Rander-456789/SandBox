import { create } from "zustand";
import { persist } from "zustand/middleware";

// PRE-YT-3 / M4: activeModel lives in sessionStore alongside userId
type SessionState = {
  userId: string | null;
  activeModel: string;
  setUserId: (id: string) => void;
  setActiveModel: (model: string) => void;
  clear: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      userId: null,
      activeModel: "random",
      setUserId: (id) => set({ userId: id }),
      setActiveModel: (model) => set({ activeModel: model }),
      clear: () => set({ userId: null, activeModel: "random" }),
    }),
    { name: "recsys-session" },
  ),
);
