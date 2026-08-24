"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Check, ChevronDown, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { CurrencyIcon } from "./currency-icon";

export function WalletField({
  label,
  children,
  icon,
  trailing,
  className,
  active = false,
  onClick,
}: {
  label?: string;
  children: ReactNode;
  icon?: ReactNode;
  trailing?: ReactNode;
  className?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span className="min-w-0 flex-1">
        {label ? (
          <span className="block text-[11px] leading-tight text-zinc-500">
            {label}
          </span>
        ) : null}
        <span className="block text-sm font-semibold text-white">{children}</span>
      </span>
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
    </>
  );

  const fieldClass = cn(
    "flex w-full items-center gap-3 rounded-xl border bg-[#1c1e28] px-3 py-2.5 text-left transition-colors",
    active ? "border-violet-400/80" : "border-white/8",
    onClick && "hover:border-white/20",
    className
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={fieldClass}>
        {content}
      </button>
    );
  }

  return <div className={fieldClass}>{content}</div>;
}

export function WalletBalanceField({
  amountLabel,
}: {
  amountLabel: string;
}) {
  return (
    <WalletField label="Balance" icon={<CurrencyIcon />}>
      {amountLabel}
    </WalletField>
  );
}

export function WalletCopyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <WalletField
      label={label}
      trailing={
        <button
          type="button"
          onClick={copy}
          className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label={`Copy ${label.toLowerCase()}`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      }
    >
      <span className="block truncate font-medium tracking-wide">{value}</span>
    </WalletField>
  );
}

export interface WalletSelectOption<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

export function WalletSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  icon,
}: {
  label: string;
  value: T;
  options: WalletSelectOption<T>[];
  onChange: (id: T) => void;
  icon?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.id === value);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <WalletField
        label={label}
        icon={icon ?? selected?.icon}
        active={open}
        trailing={
          <ChevronDown
            className={cn(
              "h-4 w-4 text-zinc-400 transition-transform",
              open && "rotate-180"
            )}
          />
        }
        onClick={() => setOpen((current) => !current)}
      >
        {selected?.label ?? "Select"}
      </WalletField>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-white/8 bg-[#22242e] py-1 shadow-xl shadow-black/40"
        >
          {options.map((option) => {
            const isSelected = option.id === value;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                    isSelected
                      ? "bg-white/8 text-violet-400"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {option.icon ? (
                    <span className="shrink-0">{option.icon}</span>
                  ) : null}
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

export function WalletAmountInput({
  id,
  label,
  value,
  onChange,
  trailing,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  trailing?: ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-[#1c1e28] px-3 py-2.5"
    >
      <CurrencyIcon />
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] leading-tight text-zinc-500">
          {label}
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-600"
        />
      </span>
      {trailing}
    </label>
  );
}

export function WalletInlineInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  id: string;
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="block rounded-xl border border-white/8 bg-[#1c1e28] px-3 py-2.5"
    >
      <span className="block text-[11px] leading-tight text-zinc-500">
        {label}
      </span>
      <input
        id={id}
        type="text"
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className="mt-0.5 w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-600 read-only:cursor-default"
      />
    </label>
  );
}

export function WalletMetaRow({
  label,
  value,
  icon,
}: {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-1 text-sm">
      <span className="flex items-center gap-1.5 text-zinc-400">{label}</span>
      <span className="flex items-center gap-1.5 font-medium text-white">
        {value}
        {icon}
      </span>
    </div>
  );
}

export function WalletActionButton({
  children,
  isLoading,
  className,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={cn(
        "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6b4eea] to-[#4e8bea] text-base font-semibold text-white shadow-lg shadow-indigo-500/20 transition-opacity hover:opacity-95 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...rest}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}

export function MethodGlyph({
  kind,
}: {
  kind: "bank" | "crypto" | "card" | "paypal";
}) {
  if (kind === "bank") {
    return (
      <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-emerald-600 text-[10px] font-bold text-white">
        KB
      </span>
    );
  }
  if (kind === "crypto") {
    return (
      <span className="relative flex h-8 w-8 items-center justify-center rounded-md bg-teal-500">
        <span className="h-4 w-4 rotate-45 rounded-sm bg-teal-200/90" />
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#2f6bff] text-[7px] font-bold text-[#f5c542] ring-1 ring-[#1c1e28]">
          T
        </span>
      </span>
    );
  }
  if (kind === "paypal") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-600 text-[10px] font-bold text-white">
        PP
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-600 text-[10px] font-bold text-white">
      CARD
    </span>
  );
}

export function QrCodeImage({ value, size = 196 }: { value: string; size?: number }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    value
  )}&color=7c3aed&bgcolor=ffffff&qzone=2`;

  return (
    <div className="mx-auto w-fit rounded-lg bg-white p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Deposit address QR code"
        width={size}
        height={size}
        className="block"
      />
    </div>
  );
}
