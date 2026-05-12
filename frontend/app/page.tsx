import { GuestContinueButton } from "@/components/GuestContinueButton";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(157, 78, 221, 0.22), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(123, 79, 163, 0.12), transparent 50%)",
        }}
      />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-24">
        <div className="max-w-xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[var(--foreground-muted)]">
            MVP sandbox
          </p>
          <h1 className="bg-gradient-to-br from-[var(--foreground)] to-[var(--foreground-muted)] bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
            RecSys Music Sandbox
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[var(--foreground-muted)]">
            Explore recommendation flows with a guest session, playlist generation, and a player
            shell — tuned for quick experiments, not enterprise dashboards.
          </p>
        </div>

        <div className="mt-14">
          <GuestContinueButton />
        </div>
      </main>
    </div>
  );
}
