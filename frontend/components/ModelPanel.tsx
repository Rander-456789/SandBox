export function ModelPanel() {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-inner shadow-black/20">
      <div className="mx-auto flex max-w-4xl items-end gap-1">
        <div
          role="tab"
          aria-selected="true"
          className="relative rounded-t-lg border border-b-0 border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] shadow-sm"
        >
          <span className="text-[var(--accent)]">●</span> Random Model
        </div>
        <div className="flex-1 border-b border-[var(--border)] pb-2" />
      </div>
    </div>
  );
}
