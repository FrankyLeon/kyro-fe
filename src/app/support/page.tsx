"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Mail, Shield, RefreshCw } from "lucide-react";
import { SupportLayoutShell } from "@/components/support/support-nav";
import { FaqList } from "@/components/support/faq-list";
import { SUPPORT_FAQ, SUPPORT_EMAIL } from "@/lib/support-content";
import { Input } from "@/components/ui/input";

const quickLinks = [
  {
    href: "/support/contact",
    icon: Mail,
    title: "Contact support",
    text: "Submit a request and our team will get back to you",
  },
  {
    href: "/support/refunds",
    icon: RefreshCw,
    title: "Refund policy",
    text: "Deposit eligibility and how to request a refund",
  },
  {
    href: "/support/responsible-gaming",
    icon: Shield,
    title: "Responsible gaming",
    text: "Limits, self-exclusion, and help resources",
  },
];

export default function SupportPage() {
  const [search, setSearch] = useState("");

  return (
    <SupportLayoutShell
      currentPath="/support"
      title="Help center"
      description="Find answers about games, deposits, and your account."
    >
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-amber-500/30 transition-colors group"
          >
            <item.icon className="h-8 w-8 text-amber-400 mb-3" />
            <h2 className="font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors">
              {item.title}
            </h2>
            <p className="text-sm text-zinc-500 mt-1">{item.text}</p>
          </Link>
        ))}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          id="faq-search"
          placeholder="Search help articles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <h2 className="text-lg font-semibold text-zinc-200 mb-4">
        Frequently asked questions
      </h2>
      <FaqList items={SUPPORT_FAQ} search={search} />

      <p className="text-sm text-zinc-500 mt-8">
        Still need help?{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-amber-400 hover:underline">
          {SUPPORT_EMAIL}
        </a>{" "}
        or{" "}
        <Link href="/support/contact" className="text-amber-400 hover:underline">
          contact support
        </Link>
        .
      </p>
    </SupportLayoutShell>
  );
}
