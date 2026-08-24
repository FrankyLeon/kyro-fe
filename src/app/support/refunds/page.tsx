import Link from "next/link";
import { SupportLayoutShell } from "@/components/support/support-nav";

export default function RefundPolicyPage() {
  return (
    <SupportLayoutShell
      currentPath="/support/refunds"
      title="Refund policy"
      description="Deposit refund eligibility and how to submit a request on Kyro."
    >
      <div className="prose prose-invert prose-sm max-w-none space-y-8 text-zinc-400">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold text-zinc-100 mt-0 mb-3">
            Wallet deposits
          </h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              Unused deposits may be reviewed for refund within{" "}
              <strong className="text-zinc-300">14 days</strong> of purchase if
              no wagers were placed with those funds.
            </li>
            <li>
              Partially used deposits are not eligible for a full refund;
              remaining balance may be credited at our discretion.
            </li>
            <li>
              Crypto deposits are final once confirmed on-chain unless required
              by law.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold text-zinc-100 mt-0 mb-3">
            Not refundable
          </h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>Funds spent on bets inside any game (spins, buy-ins)</li>
            <li>Bonus or promotional balance</li>
            <li>Chargebacks filed without contacting support first</li>
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold text-zinc-100 mt-0 mb-3">
            How to request a refund
          </h2>
          <ol className="space-y-2 list-decimal pl-5">
            <li>
              Sign in and note your deposit reference from{" "}
              <Link href="/wallet" className="text-amber-400 hover:underline">
                Recent transactions
              </Link>
              .
            </li>
            <li>
              Open a ticket via{" "}
              <Link href="/support/contact" className="text-amber-400 hover:underline">
                Contact us
              </Link>{" "}
              with category <em>Deposit & payments</em>.
            </li>
            <li>Allow up to 5 business days for review and response.</li>
          </ol>
        </section>

        <p className="text-xs text-zinc-600">
          Policy subject to change. Contact support if you have questions about
          your eligibility.
        </p>
      </div>
    </SupportLayoutShell>
  );
}
