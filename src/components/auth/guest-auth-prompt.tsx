"use client";

import Link from "next/link";
import { useI18n } from "@/context/locale-context";
import { Button } from "@/components/ui/button";

interface GuestAuthPromptProps {
  redirect?: string;
  title?: string;
  description?: string;
}

export function GuestAuthPrompt({
  redirect = "/store",
  title,
  description,
}: GuestAuthPromptProps) {
  const { t } = useI18n();
  const loginHref = redirect.startsWith("/login")
    ? redirect
    : `/login?redirect=${encodeURIComponent(redirect)}`;

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-white">
        {title ?? t("auth.signInRequired")}
      </h1>
      <p className="text-zinc-500 mt-2 mb-8">
        {description ?? t("auth.guestBody")}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/store">
          <Button variant="secondary" className="w-full sm:w-auto">
            {t("cta.browseGames")}
          </Button>
        </Link>
        <Link href={loginHref}>
          <Button className="w-full sm:w-auto">{t("cta.signIn")}</Button>
        </Link>
      </div>
    </div>
  );
}
