export function MysteryPerkGraphic() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-navy via-navy-dark to-navy">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange/20 blur-2xl" />
      <div className="absolute -left-8 -bottom-12 h-40 w-40 rounded-full bg-yellow/20 blur-2xl" />

      <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-white">
        <svg
          viewBox="0 0 64 64"
          className="h-16 w-16 text-orange"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="14" y="28" width="36" height="26" rx="5" />
          <path d="M22 28v-6a10 10 0 0 1 20 0v6" />
          <circle cx="32" cy="41" r="3.5" fill="currentColor" stroke="none" />
          <path d="M32 44v5" />
        </svg>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          Mystery perk
        </p>
        <p className="text-sm text-white/50">Locked until reveal</p>
      </div>
    </div>
  );
}
