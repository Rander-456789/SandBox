"use client";

import { GuestContinueButton } from "@/components/GuestContinueButton";
import { useT } from "@/store/localeStore";

export function LandingContent() {
  const t = useT();

  return (
    <div className="max-w-xl text-center">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[var(--foreground-muted)]">
        {t.landing.badge}
      </p>
      <h1 className="bg-gradient-to-br from-[var(--foreground)] to-[var(--foreground-muted)] bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
        {t.landing.title}
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-[var(--foreground-muted)]">
        {t.landing.subtitle}
      </p>

      <div className="mt-14">
        <GuestContinueButton />
      </div>
    </div>
  );
}
