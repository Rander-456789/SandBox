"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { fetchUsers, type UserItem } from "@/lib/api";
import { useSessionStore } from "@/store/sessionStore";
import { useT } from "@/store/localeStore";

export function UserSelector() {
  const router = useRouter();
  const t = useT();
  const setUserId = useSessionStore((s) => s.setUserId);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submittingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchUsers()
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load users");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSelect(user: UserItem) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);

    try {
      setUserId(user.id);
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Navigation failed");
      submittingRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedId(e.target.value);
  }

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <p className="text-sm text-[var(--foreground-muted)]">
        {t.landing.loadingUsers}
      </p>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (error) {
    return (
      <p className="text-sm text-red-400/90">{error}</p>
    );
  }

  // ── Empty state ────────────────────────────────────────────────
  if (users.length === 0) {
    return (
      <p className="text-sm text-[var(--foreground-muted)]">
        {t.landing.noUsersFound}
      </p>
    );
  }

  // ── User list ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-3">
      <label
        htmlFor="user-select"
        className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--foreground-muted)]"
      >
        {t.landing.existingUsers}
      </label>

      <select
        id="user-select"
        value={selectedId}
        onChange={handleChange}
        disabled={submitting}
        className="w-64 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] 
                   outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]
                   disabled:cursor-not-allowed disabled:opacity-60
                   appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239d4edd' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.75rem center",
          paddingRight: "2.5rem",
        }}
      >
        <option value="" disabled>
          {t.landing.selectUser}
        </option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.username}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => {
          const user = users.find((u) => u.id === selectedId);
          if (user) handleSelect(user);
        }}
        disabled={!selectedId || submitting}
        className="rounded-full bg-[var(--accent)] px-8 py-2.5 text-sm font-medium text-white shadow-lg shadow-black/30 
                   transition hover:bg-[var(--accent-hover)] 
                   disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? t.landing.connecting : t.landing.selectUser}
      </button>
    </div>
  );
}
