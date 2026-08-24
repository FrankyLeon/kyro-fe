"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { SITE_CTA } from "@/lib/site-copy";
import { Button } from "@/components/ui/button";

export function HomeHeroActions() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="mt-8">
        <Button size="lg" disabled>
          {SITE_CTA.browseGames}
        </Button>
      </div>
    );
  }

  if (user) {
    return (
      <div className="mt-8">
        <Link href="/store">
          <Button size="lg" className="btn-pulse">
            <Play className="h-5 w-5" />
            {SITE_CTA.playNow}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap gap-4">
      <Link href="/store">
        <Button size="lg" className="btn-pulse">
          {SITE_CTA.browseGames}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </Link>
      <Link href="/login">
        <Button variant="outline" size="lg">
          {SITE_CTA.signIn}
        </Button>
      </Link>
    </div>
  );
}
