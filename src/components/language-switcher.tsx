"use client";

import { useI18n } from "@/context/locale-context";
import type { Locale } from "@/i18n/locale";
import { cn } from "@/lib/utils";

const OPTIONS: { id: Locale; short: string; name: "language.english" | "language.mongolian" }[] =
  [
    { id: "en", short: "EN", name: "language.english" },
    { id: "mn", short: "МН", name: "language.mongolian" },
  ];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className={cn(
        "inline-flex h-9 items-center rounded-full border border-white/10 bg-zinc-950/70 p-0.5",
        className
      )}
    >
      {OPTIONS.map((option) => {
        const active = locale === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            aria-label={t(option.name)}
            title={t(option.name)}
            onClick={() => setLocale(option.id)}
            className={cn(
              "h-8 rounded-full px-2.5 text-[11px] font-semibold tracking-wide transition-colors",
              active
                ? "bg-amber-500/15 text-amber-300"
                : "text-zinc-500 hover:text-zinc-200"
            )}
          >
            {option.short}
          </button>
        );
      })}
    </div>
  );
}
