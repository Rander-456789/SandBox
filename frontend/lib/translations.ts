// ── Lightweight MVP translations (RU / EN) ────────────────────
// No i18next, no locale routing, no server-side infra.
// Just a plain object + a tiny Zustand store with localStorage persistence.

export type Locale = "en" | "ru";

export interface TranslationDict {
  landing: {
    badge: string;
    title: string;
    subtitle: string;
    selectUser: string;
    existingUsers: string;
    noUsersFound: string;
    loadingUsers: string;
    continueAsGuest: string;
    connecting: string;
    language: string;
  };
  dashboard: {
    sessionTitle: string;
    sessionSubtitle: string;
    generatePlaylist: string;
    generating: string;
    emptyPlaylist: string;
    emptyHint: string;
    playlistFinished: string;
    finishedHint: string;
    trackCounter: (current: number, total: number) => string;
    loading: string;
  };
  player: {
    dislike: string;
    previousTrack: string;
    play: string;
    pause: string;
    nextTrack: string;
    like: string;
    emptyState: string;
    emptyHint: string;
    finished: string;
    loading: string;
  };
  model: {
    randomModel: string;
  };
}

export const translations: Record<Locale, TranslationDict> = {
  en: {
    landing: {
      badge: "MVP sandbox",
      title: "RecSys Music Sandbox",
      subtitle:
        "Explore recommendation flows with a guest session, playlist generation, and a player shell — tuned for quick experiments, not enterprise dashboards.",
      selectUser: "Select User",
      existingUsers: "Existing Users",
      noUsersFound: "No existing users found",
      loadingUsers: "Loading users…",
      continueAsGuest: "Continue as Guest",
      connecting: "Connecting…",
      language: "Language",
    },
    dashboard: {
      sessionTitle: "Session",
      sessionSubtitle:
        "Generate a playlist, then rate tracks with the player below.",
      generatePlaylist: "Generate Playlist",
      generating: "Generating…",
      emptyPlaylist: "Your playlist is empty",
      emptyHint:
        "Pick a model above, generate a playlist, then use the player to rate tracks.",
      playlistFinished: "Playlist finished",
      finishedHint: "Generate a new playlist to continue listening.",
      trackCounter: (current: number, total: number) =>
        `Track ${current} of ${total}`,
      loading: "Loading…",
    },
    player: {
      dislike: "Dislike",
      previousTrack: "Previous track",
      play: "Play",
      pause: "Pause",
      nextTrack: "Next track",
      like: "Like",
      emptyState: "Your playlist is empty",
      emptyHint: "Generate a playlist to start listening",
      finished: "Playlist finished",
      loading: "Loading…",
    },
    model: {
      randomModel: "Random Model",
    },
  },

  ru: {
    landing: {
      badge: "MVP песочница",
      title: "RecSys Music Sandbox",
      subtitle:
        "Исследуйте рекомендательные алгоритмы через гостевую сессию, генерацию плейлистов и плеер — заточено под быстрые эксперименты, а не enterprise-панели.",
      selectUser: "Выбрать пользователя",
      existingUsers: "Существующие пользователи",
      noUsersFound: "Пользователи не найдены",
      loadingUsers: "Загрузка пользователей…",
      continueAsGuest: "Продолжить как гость",
      connecting: "Подключение…",
      language: "Язык",
    },
    dashboard: {
      sessionTitle: "Сессия",
      sessionSubtitle:
        "Сгенерируйте плейлист и оценивайте треки с помощью плеера.",
      generatePlaylist: "Сгенерировать плейлист",
      generating: "Генерация…",
      emptyPlaylist: "Плейлист пуст",
      emptyHint:
        "Выберите модель выше, сгенерируйте плейлист и оценивайте треки через плеер.",
      playlistFinished: "Плейлист завершён",
      finishedHint:
        "Сгенерируйте новый плейлист, чтобы продолжить прослушивание.",
      trackCounter: (current: number, total: number) =>
        `Трек ${current} из ${total}`,
      loading: "Загрузка…",
    },
    player: {
      dislike: "Дизлайк",
      previousTrack: "Предыдущий трек",
      play: "Воспроизвести",
      pause: "Пауза",
      nextTrack: "Следующий трек",
      like: "Лайк",
      emptyState: "Плейлист пуст",
      emptyHint: "Сгенерируйте плейлист, чтобы начать прослушивание",
      finished: "Плейлист завершён",
      loading: "Загрузка…",
    },
    model: {
      randomModel: "Случайная модель",
    },
  },
};
