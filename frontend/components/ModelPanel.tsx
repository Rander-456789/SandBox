"use client";

import { useSessionStore } from "@/store/sessionStore";
import { useT } from "@/store/localeStore";

export function ModelPanel() {
  const t = useT();
  const activeModel = useSessionStore((s) => s.activeModel);

  // PRE-YT-3: ModelPanel reads activeModel from sessionStore
  const MODEL_REGISTRY: Record<string, string> = {
    random: t.model.randomModel,
  };

  const modelLabel = MODEL_REGISTRY[activeModel] ?? activeModel;

  return (
    <div className="shrink-0 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-inner shadow-black/20">
      <div className="mx-auto flex max-w-4xl items-end gap-1">
        <div
          role="tab"
          aria-selected="true"
          className="relative rounded-t-lg border border-b-0 border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] shadow-sm"
        >
          <span className="text-[var(--accent)]">●</span> {modelLabel}
        </div>
        <div className="flex-1 border-b border-[var(--border)] pb-2" />
      </div>
    </div>
  );
}
