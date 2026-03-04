import { TeamBadge } from "@/components/shared/TeamBadge";
import { computeStandings } from "@/data/mockData";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";

type FormBadge = "W" | "D" | "L";

function FormBadgeComp({ result }: { result: FormBadge }) {
  const map = {
    W: "bg-green-500/80 text-white",
    D: "bg-yellow-500/80 text-white",
    L: "bg-red-500/80 text-white",
  };
  return (
    <span
      className={`w-4 h-4 rounded-sm text-[8px] font-black flex items-center justify-center ${map[result]}`}
    >
      {result}
    </span>
  );
}

export function StandingsPage() {
  const navigate = useNavigate();
  const standings = computeStandings();

  return (
    <div data-ocid="standings.page" className="min-h-screen pb-24 pt-14">
      {/* Header */}
      <div
        className="px-4 py-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.04 255) 0%, oklch(0.14 0.06 252) 100%)",
        }}
      >
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="font-display font-black text-2xl text-foreground">
            League Table
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Season 2025/26 — Lamu Football League
          </p>
        </motion.div>
      </div>

      {/* Zone legend */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-4 rounded-sm bg-primary" />
          <span className="text-[10px] text-muted-foreground">
            Champions Zone
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-4 rounded-sm bg-accent" />
          <span className="text-[10px] text-muted-foreground">
            Relegation Zone
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="px-4" data-ocid="standings.table">
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-card">
          {/* Header */}
          <div className="grid grid-cols-[28px_1fr_28px_28px_28px_28px_28px_28px_36px] gap-x-1 px-3 py-2.5 text-[10px] text-muted-foreground font-bold uppercase tracking-wider border-b border-border bg-muted/30">
            <span>#</span>
            <span>Club</span>
            <span className="text-center">P</span>
            <span className="text-center">W</span>
            <span className="text-center">D</span>
            <span className="text-center">L</span>
            <span className="text-center">GD</span>
            <span className="hidden sm:block text-center">GF</span>
            <span className="text-center font-black">Pts</span>
          </div>

          {standings.map((entry, i) => {
            const isChampions = i < 4;
            const isRelegation = i >= standings.length - 3;

            return (
              <motion.div
                key={entry.team.teamId}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                data-ocid={`standings.row.${i + 1}`}
                className={`grid grid-cols-[28px_1fr_28px_28px_28px_28px_28px_28px_36px] gap-x-1 px-3 py-3 items-center border-b border-border/40 last:border-0 hover:bg-muted/20 cursor-pointer transition-colors relative ${
                  isChampions
                    ? "zone-champions"
                    : isRelegation
                      ? "zone-relegation"
                      : ""
                }`}
                onClick={() => navigate({ to: `/teams/${entry.team.teamId}` })}
              >
                {/* Position */}
                <span
                  className={`text-sm font-black ${
                    i === 0
                      ? "text-yellow-400"
                      : i === 1
                        ? "text-gray-300"
                        : i === 2
                          ? "text-amber-600"
                          : "text-muted-foreground"
                  }`}
                >
                  {entry.position}
                </span>

                {/* Club */}
                <div className="flex items-center gap-2 min-w-0">
                  <TeamBadge team={entry.team} size="sm" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-foreground truncate block">
                      {entry.team.name}
                    </span>
                    <div className="hidden sm:flex gap-0.5 mt-0.5">
                      {entry.form.map((f, fi) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: form order is stable
                        <FormBadgeComp key={`form-${fi}`} result={f} />
                      ))}
                    </div>
                  </div>
                </div>

                <span className="text-xs text-center text-muted-foreground">
                  {entry.played}
                </span>
                <span className="text-xs text-center font-semibold text-green-400">
                  {entry.wins}
                </span>
                <span className="text-xs text-center text-yellow-400">
                  {entry.draws}
                </span>
                <span className="text-xs text-center text-red-400">
                  {entry.losses}
                </span>
                <span
                  className={`text-xs text-center font-bold ${
                    entry.goalDiff > 0
                      ? "text-green-400"
                      : entry.goalDiff < 0
                        ? "text-red-400"
                        : "text-muted-foreground"
                  }`}
                >
                  {entry.goalDiff > 0 ? "+" : ""}
                  {entry.goalDiff}
                </span>
                <span className="text-xs text-center text-muted-foreground hidden sm:block">
                  {entry.goalsFor}
                </span>
                <span className="text-sm text-center font-black text-foreground">
                  {entry.points}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stats footer */}
      <div className="px-4 mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "Most Goals", value: "Shela United", sub: "27 scored" },
          { label: "Top Points", value: "Shela United", sub: "26 pts" },
          { label: "Best Defence", value: "Shela United", sub: "12 conceded" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg p-3 bg-card border border-border text-center"
          >
            <div className="text-[10px] text-muted-foreground mb-1">
              {stat.label}
            </div>
            <div className="text-xs font-bold text-foreground leading-tight">
              {stat.value}
            </div>
            <div className="text-[10px] text-muted-foreground">{stat.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
