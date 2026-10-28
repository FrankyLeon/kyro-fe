import type { Metadata } from "next";
import { getI18n } from "@/i18n/get-i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t("meta.games"),
    description: t("meta.gamesDescription"),
  };
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
