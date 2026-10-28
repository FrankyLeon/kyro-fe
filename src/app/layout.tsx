import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getI18n } from "@/i18n/get-i18n";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: {
      default: t("meta.defaultTitle"),
      template: t("meta.titleTemplate"),
    },
    description: t("meta.defaultDescription"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, messages } = await getI18n();

  return (
    <html lang={locale} className={`h-full ${inter.variable} ${outfit.variable}`}>
      <body className="min-h-full flex flex-col antialiased ambient-bg text-zinc-100">
        <Providers locale={locale} messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
