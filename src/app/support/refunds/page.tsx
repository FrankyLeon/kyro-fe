import Link from "next/link";
import { SupportLayoutShell } from "@/components/support/support-nav";
import { getI18n } from "@/i18n/get-i18n";

export default async function RefundPolicyPage() {
  const { t } = await getI18n();

  return (
    <SupportLayoutShell
      currentPath="/support/refunds"
      title={t("support.refunds.title")}
      description={t("support.refunds.body")}
    >
      <div className="prose prose-invert prose-sm max-w-none space-y-8 text-zinc-400">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold text-zinc-100 mt-0 mb-3">
            {t("support.refunds.walletTitle")}
          </h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              {t("support.refunds.unusedBefore")}{" "}
              <strong className="text-zinc-300">
                {t("support.refunds.fourteenDays")}
              </strong>{" "}
              {t("support.refunds.unusedAfter")}
            </li>
            <li>{t("support.refunds.partial")}</li>
            <li>{t("support.refunds.cryptoFinal")}</li>
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold text-zinc-100 mt-0 mb-3">
            {t("support.refunds.notRefundable")}
          </h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>{t("support.refunds.spent")}</li>
            <li>{t("support.refunds.bonus")}</li>
            <li>{t("support.refunds.chargebacks")}</li>
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold text-zinc-100 mt-0 mb-3">
            {t("support.refunds.how")}
          </h2>
          <ol className="space-y-2 list-decimal pl-5">
            <li>
              {t("support.refunds.step1Before")}{" "}
              <Link href="/wallet" className="text-amber-400 hover:underline">
                {t("support.refunds.recent")}
              </Link>
              {t("support.refunds.step1After")}
            </li>
            <li>
              {t("support.refunds.step2Before")}{" "}
              <Link href="/support/contact" className="text-amber-400 hover:underline">
                {t("support.contactUs")}
              </Link>{" "}
              {t("support.refunds.step2After")}{" "}
              <em>{t("support.categories.deposit")}</em>.
            </li>
            <li>{t("support.refunds.step3")}</li>
          </ol>
        </section>

        <p className="text-xs text-zinc-600">{t("support.refunds.disclaimer")}</p>
      </div>
    </SupportLayoutShell>
  );
}
