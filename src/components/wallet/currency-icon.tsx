import { cn } from "@/lib/utils";

interface CurrencyIconProps {
  className?: string;
  size?: "sm" | "md";
}

export function CurrencyIcon({ className, size = "md" }: CurrencyIconProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-[#2f6bff] ring-2 ring-[#f5c542]/80",
        size === "sm" ? "h-5 w-5" : "h-8 w-8",
        className
      )}
      aria-hidden
    >
      <span
        className={cn(
          "font-bold leading-none text-[#f5c542]",
          size === "sm" ? "text-[10px]" : "text-sm"
        )}
      >
        T
      </span>
    </span>
  );
}
