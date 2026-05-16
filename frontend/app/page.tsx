import { LanguageSelector } from "@/components/LanguageSelector";
import { LandingContent } from "@/components/LandingContent";

export default function Home() {
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(157, 78, 221, 0.22), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(123, 79, 163, 0.12), transparent 50%)",
        }}
      />

      {/* Language selector — top-right, minimal */}
      <div className="relative z-10 flex justify-end px-6 pt-5">
        <LanguageSelector />
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
        <LandingContent />
      </main>
    </div>
  );
}
