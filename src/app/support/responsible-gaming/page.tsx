import Link from "next/link";
import { SupportLayoutShell } from "@/components/support/support-nav";
import { getI18n } from "@/i18n/get-i18n";

const resources = [
  { name: "GamCare", url: "https://www.gamcare.org.uk/" },
  { name: "Gamblers Anonymous", url: "https://www.gamblersanonymous.org/" },
  {
    name: "National Council on Problem Gambling (US)",
    url: "https://www.ncpgambling.org/",
  },
];

export default async function ResponsibleGamingPage() {
  const { t } = await getI18n();
  const tools = [
    t("support.responsiblePage.daily"),
    t("support.responsiblePage.session"),
    t("support.responsiblePage.coolOff"),
    t("support.responsiblePage.exclusion"),
  ];

  return (
    <SupportLayoutShell
      currentPath="/support/responsible-gaming"
      title={t("support.responsiblePage.title")}
      description={t("support.responsiblePage.body")}
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
          <p className="text-sm text-amber-200/90 leading-relaxed">
            {t("support.responsiblePage.intro")}
          </p>
        </div>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100">
            {t("support.responsiblePage.commitments")}
          </h2>
          <ul className="space-y-2 text-sm text-zinc-400 list-disc pl-5">
            <li>{t("support.responsiblePage.age")}</li>
            <li>{t("support.responsiblePage.clearBalance")}</li>
            <li>{t("support.responsiblePage.fees")}</li>
            <li>{t("support.responsiblePage.trained")}</li>
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100">
            {t("support.responsiblePage.tools")}
          </h2>
          <p className="text-sm text-zinc-400">
            {t("support.responsiblePage.toolsBody")}
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 text-sm">
            {tools.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-zinc-800 px-4 py-3 text-zinc-300"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100">
            {t("support.responsiblePage.getHelp")}
          </h2>
          <ul className="space-y-2">
            {resources.map((r) => (
              <li key={r.url}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-amber-400 hover:underline"
                >
                  {r.name} ↗
                </a>
              </li>
            ))}
          </ul>
          <p className="text-sm text-zinc-500 pt-2">
            {t("support.responsiblePage.limitsNow")}{" "}
            <Link href="/support/contact" className="text-amber-400 hover:underline">
              {t("support.contactSupport")}
            </Link>{" "}
            {t("support.responsiblePage.selectAccount")}
          </p>
        </section>
      </div>
    </SupportLayoutShell>
  );
}
