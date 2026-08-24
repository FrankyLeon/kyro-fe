"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/types/support";
import { cn } from "@/lib/utils";

interface FaqListProps {
  items: FaqItem[];
  search?: string;
}

export function FaqList({ items, search = "" }: FaqListProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  const q = search.trim().toLowerCase();

  const filtered = q
    ? items.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
      )
    : items;

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-zinc-500 py-8 text-center">
        No articles match your search.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {filtered.map((item) => {
        const open = openId === item.id;
        return (
          <li
            key={item.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left hover:bg-zinc-800/30 transition-colors"
            >
              <span className="font-medium text-zinc-200">{item.question}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-zinc-500 transition-transform",
                  open && "rotate-180"
                )}
              />
            </button>
            {open ? (
              <div className="px-4 pb-4 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/80 pt-3">
                {item.answer}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
