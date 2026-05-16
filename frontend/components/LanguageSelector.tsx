"use client";

import { useLocaleStore } from "@/store/localeStore";
import type { Locale } from "@/lib/translations";

export function LanguageSelector() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const locales: { code: Locale; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "ru", label: "RU" },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)]/80 p-0.5 backdrop-blur-sm">
      {locales.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            locale === code
              ? "bg-[var(--accent)] text-white shadow-sm shadow-black/30"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
