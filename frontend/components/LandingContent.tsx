"use client";

import { GuestContinueButton } from "@/components/GuestContinueButton";
import { UserSelector } from "@/components/UserSelector";
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

      {/* ── Existing User Selection ──────────────────────────── */}
      <div className="mt-12">
        <UserSelector />
      </div>

      {/* ── Divider ──────────────────────────────────────────── */}
      <div className="mt-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--foreground-muted)]">
          or
        </span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      {/* ── Guest Continue ───────────────────────────────────── */}
      <div className="mt-8">
        <GuestContinueButton />
      </div>
    </div>
  );
}
