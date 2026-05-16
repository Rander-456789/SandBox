import { create } from "zustand";
import { persist } from "zustand/middleware";
import { translations, type Locale, type TranslationDict } from "@/lib/translations";

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "recsys-locale" },
  ),
);

/** Хук: возвращает словарь переводов для текущей локали. */
export function useT(): TranslationDict {
  const locale = useLocaleStore((s) => s.locale);
  return translations[locale];
}
