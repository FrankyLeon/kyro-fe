"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StoreFilterOption {
  value: string;
  label: string;
}

interface StoreFilterSelectProps {
  label: string;
  value: string;
  options: StoreFilterOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function StoreFilterSelect({
  label,
  value,
  options,
  onChange,
  className,
}: StoreFilterSelectProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("relative z-20 min-w-0", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-3 rounded-lg border border-zinc-700/80 bg-zinc-950/40 px-3",
          "text-left outline-none transition-colors",
          "hover:border-zinc-500 focus-visible:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500/20"
        )}
      >
        <span className="min-w-0">
          <span className="block text-[11px] leading-none text-zinc-500">
            {label}
          </span>
          <span className="mt-1 block truncate text-sm font-medium text-white">
            {selected?.label ?? "All"}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-zinc-500 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-64 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 py-1 shadow-2xl shadow-black/40"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full truncate px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "bg-amber-500/10 text-amber-200"
                      : "text-zinc-200 hover:bg-zinc-900"
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
