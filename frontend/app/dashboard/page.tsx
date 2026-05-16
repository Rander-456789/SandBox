"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DashboardContent } from "@/components/DashboardContent";
import { useSessionStore } from "@/store/sessionStore";
import { useT } from "@/store/localeStore";

export default function DashboardPage() {
  const router = useRouter();
  const t = useT();
  const userId = useSessionStore((s) => s.userId);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useSessionStore.persist.onFinishHydration(() => setHydrated(true));
    if (useSessionStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!userId) {
      router.replace("/");
    }
  }, [hydrated, userId, router]);

  if (!hydrated || !userId) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[var(--background)] text-[var(--foreground-muted)] overflow-hidden">
        {t.dashboard.loading}
      </div>
    );
  }

  return <DashboardContent userId={userId} />;
}
