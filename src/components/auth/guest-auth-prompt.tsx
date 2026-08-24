import Link from "next/link";
import { SITE_CTA } from "@/lib/site-copy";
import { Button } from "@/components/ui/button";

interface GuestAuthPromptProps {
  redirect?: string;
  title?: string;
  description?: string;
}

export function GuestAuthPrompt({
  redirect = "/store",
  title = "Sign in required",
  description = "Browse games anytime. Sign in to fund your wallet and start betting.",
}: GuestAuthPromptProps) {
  const loginHref = redirect.startsWith("/login")
    ? redirect
    : `/login?redirect=${encodeURIComponent(redirect)}`;

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="text-zinc-500 mt-2 mb-8">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/store">
          <Button variant="secondary" className="w-full sm:w-auto">
            {SITE_CTA.browseGames}
          </Button>
        </Link>
        <Link href={loginHref}>
          <Button className="w-full sm:w-auto">{SITE_CTA.signIn}</Button>
        </Link>
      </div>
    </div>
  );
}
