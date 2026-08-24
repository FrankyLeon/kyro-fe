import { Coins, Shield, Zap } from "lucide-react";

const stats = [
  { icon: Zap, label: "Instant play", value: "No download" },
  { icon: Coins, label: "Real stakes", value: "Live balance" },
  { icon: Shield, label: "Secure wallet", value: "Protected" },
];

export function HeroStats() {
  return (
    <div className="mt-10 flex flex-wrap gap-3 sm:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-full border border-amber-500/20 bg-zinc-950/60 px-4 py-2 backdrop-blur-md"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15">
            <stat.icon className="h-4 w-4 text-amber-400" />
          </span>
          <div className="text-left">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500/80">
              {stat.label}
            </p>
            <p className="text-sm font-semibold text-zinc-100">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
