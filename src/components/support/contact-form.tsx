"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { submitContactTicket } from "@/lib/api/support";
import type { SupportCategory } from "@/types/support";
import { SUPPORT_EMAIL } from "@/lib/support-content";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/locale-context";
import type { TFunction } from "@/i18n/translate";

const categoryValues: SupportCategory[] = [
  "account",
  "deposit",
  "games",
  "technical",
  "other",
];

function categoryLabel(t: TFunction, value: SupportCategory) {
  if (value === "account") return t("support.categories.account");
  if (value === "deposit") return t("support.categories.deposit");
  if (value === "games") return t("support.categories.games");
  if (value === "technical") return t("support.categories.technical");
  return t("support.categories.other");
}

export function ContactForm() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [category, setCategory] = useState<SupportCategory>("other");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ ticketId: string; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await submitContactTicket({
        name,
        email,
        category,
        subject: subject || categoryLabel(t, category) || t("support.fallbackSubject"),
        message,
        userId: user?.id,
      });
      setSuccess({ ticketId: result.ticketId, message: result.message });
      setMessage("");
      setSubject("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("support.sendFailed"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">{t("support.sent")}</h2>
        <p className="text-zinc-400 mt-2 text-sm">{success.message}</p>
        <p className="text-xs text-zinc-500 mt-4 font-mono">
          {t("support.ticket", { id: success.ticketId })}
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => setSuccess(null)}
        >
          {t("support.sendAnother")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-start gap-3 text-sm text-zinc-400">
        <Mail className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <p>
          {t("support.emailBefore")}{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-amber-400 hover:underline">
            {SUPPORT_EMAIL}
          </a>{" "}
          {t("support.emailAfter")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="support-name"
            label={t("support.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="support-email"
            label={t("support.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="support-category" className="block text-sm font-medium text-zinc-300 mb-1.5">
            {t("support.category")}
          </label>
          <select
            id="support-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as SupportCategory)}
            className="w-full h-11 px-4 rounded-lg bg-zinc-900/80 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            {categoryValues.map((value) => (
              <option key={value} value={value}>
                {categoryLabel(t, value)}
              </option>
            ))}
          </select>
        </div>

        <Input
          id="support-subject"
          label={t("support.subject")}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={t("support.subjectPlaceholder")}
        />

        <div>
          <label htmlFor="support-message" className="block text-sm font-medium text-zinc-300 mb-1.5">
            {t("support.message")}
          </label>
          <textarea
            id="support-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={6}
            placeholder={t("support.messagePlaceholder")}
            className="w-full px-4 py-3 rounded-lg bg-zinc-900/80 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-y min-h-[140px]"
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <Button type="submit" size="lg" isLoading={loading}>
          {t("support.submitTicket")}
        </Button>
      </form>

      <p className="text-xs text-zinc-600">
        {t("support.depositHelp")}{" "}
        <Link href="/support/refunds" className="text-amber-400/80 hover:underline">
          {t("support.readRefunds")}
        </Link>
        {" · "}
        <Link href="/support/responsible-gaming" className="text-amber-400/80 hover:underline">
          {t("support.responsible")}
        </Link>
      </p>
    </div>
  );
}
