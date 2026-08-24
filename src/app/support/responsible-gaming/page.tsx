import Link from "next/link";
import { SupportLayoutShell } from "@/components/support/support-nav";

const resources = [
  { name: "GamCare", url: "https://www.gamcare.org.uk/" },
  { name: "Gamblers Anonymous", url: "https://www.gamblersanonymous.org/" },
  { name: "National Council on Problem Gambling (US)", url: "https://www.ncpgambling.org/" },
];

export default function ResponsibleGamingPage() {
  return (
    <SupportLayoutShell
      currentPath="/support/responsible-gaming"
      title="Responsible gaming"
      description="Bet for entertainment. Set limits and know when to stop."
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
          <p className="text-sm text-amber-200/90 leading-relaxed">
            Kyro is intended for adults who can afford to lose what they
            deposit. If betting stops being fun, pause immediately and use the
            resources below.
          </p>
        </div>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100">Our commitments</h2>
          <ul className="space-y-2 text-sm text-zinc-400 list-disc pl-5">
            <li>18+ only — age verification required</li>
            <li>Clear display of wallet balance and transaction history</li>
            <li>Transparent fees with no hidden charges</li>
            <li>Support team trained to escalate problem-gaming requests</li>
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100">Player tools</h2>
          <p className="text-sm text-zinc-400">
            Contact support to request any of the following on your account:
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 text-sm">
            {[
              "Daily / weekly deposit limits",
              "Session time reminders",
              "Cool-off period (24h – 30 days)",
              "Self-exclusion (6 months – permanent)",
            ].map((item) => (
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
          <h2 className="text-lg font-semibold text-zinc-100">Get help</h2>
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
            Need account limits now?{" "}
            <Link href="/support/contact" className="text-amber-400 hover:underline">
              Contact support
            </Link>{" "}
            and select Account.
          </p>
        </section>
      </div>
    </SupportLayoutShell>
  );
}
