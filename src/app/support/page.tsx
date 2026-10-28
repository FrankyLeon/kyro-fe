"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Mail, Shield, RefreshCw } from "lucide-react";
import { SupportLayoutShell } from "@/components/support/support-nav";
import { FaqList } from "@/components/support/faq-list";
import { SUPPORT_EMAIL } from "@/lib/support-content";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/context/locale-context";
import type { FaqItem } from "@/types/support";

const faqItems = [
  { id: "faq-1", category: "general", q: "support.faq.playQ", a: "support.faq.playA" },
  { id: "faq-2", category: "deposit", q: "support.faq.depositQ", a: "support.faq.depositA" },
  { id: "faq-3", category: "deposit", q: "support.faq.methodsQ", a: "support.faq.methodsA" },
  { id: "faq-4", category: "account", q: "support.faq.passwordQ", a: "support.faq.passwordA" },
  { id: "faq-6", category: "games", q: "support.faq.downloadQ", a: "support.faq.downloadA" },
  { id: "faq-7", category: "technical", q: "support.faq.loadQ", a: "support.faq.loadA" },
  { id: "faq-8", category: "general", q: "support.faq.refundQ", a: "support.faq.refundA" },
] as const;

export default function SupportPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const quickLinks = [
    {
      href: "/support/contact",
      icon: Mail,
      title: t("support.contactSupport"),
      text: t("support.contactSupportBody"),
    },
    {
      href: "/support/refunds",
      icon: RefreshCw,
      title: t("support.refundPolicy"),
      text: t("support.refundPolicyBody"),
    },
    {
      href: "/support/responsible-gaming",
      icon: Shield,
      title: t("support.responsible"),
      text: t("support.responsibleBody"),
    },
  ];
  const faqs: FaqItem[] = faqItems.map((item) => ({
    id: item.id,
    category: item.category,
    question: t(item.q),
    answer: t(item.a),
  }));

  return (
    <SupportLayoutShell
      currentPath="/support"
      title={t("support.helpCenter")}
      description={t("support.helpBody")}
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
          placeholder={t("support.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <h2 className="text-lg font-semibold text-zinc-200 mb-4">
        {t("support.faqTitle")}
      </h2>
      <FaqList items={faqs} search={search} />

      <p className="text-sm text-zinc-500 mt-8">
        {t("support.stillNeed")}{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-amber-400 hover:underline">
          {SUPPORT_EMAIL}
        </a>{" "}
        {t("support.or")}{" "}
        <Link href="/support/contact" className="text-amber-400 hover:underline">
          {t("support.contactLink")}
        </Link>
        .
      </p>
    </SupportLayoutShell>
  );
}
