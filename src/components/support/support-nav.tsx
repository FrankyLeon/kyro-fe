import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  HelpCircle,
  Mail,
  RefreshCw,
  Shield,
  ChevronRight,
} from "lucide-react";

const links = [
  {
    href: "/support",
    label: "Help center",
    icon: HelpCircle,
    exact: true,
  },
  {
    href: "/support/contact",
    label: "Contact us",
    icon: Mail,
  },
  {
    href: "/support/refunds",
    label: "Refund policy",
    icon: RefreshCw,
  },
  {
    href: "/support/responsible-gaming",
    label: "Responsible gaming",
    icon: Shield,
  },
];

interface SupportNavProps {
  currentPath: string;
}

export function SupportNav({ currentPath }: SupportNavProps) {
  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const active =
          link.exact
            ? currentPath === link.href
            : currentPath.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-amber-500/10 text-amber-400"
                : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
            )}
          >
            <link.icon className="h-4 w-4 shrink-0" />
            {link.label}
            <ChevronRight
              className={cn(
                "ml-auto h-4 w-4 opacity-0",
                active && "opacity-50"
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}

export function SupportLayoutShell({
  currentPath,
  title,
  description,
  children,
}: {
  currentPath: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 px-3">
            Support
          </p>
          <SupportNav currentPath={currentPath} />
        </aside>
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {description ? (
            <p className="text-zinc-500 mt-2 mb-8">{description}</p>
          ) : (
            <div className="mb-8" />
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
