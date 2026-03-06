import { AreaBadge, TeamBadge } from "@/components/shared/TeamBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOCK_TEAMS } from "@/data/mockData";
import { useNavigate } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function TeamsPage() {
  const navigate = useNavigate();
  const [areaFilter, setAreaFilter] = useState<string>("all");

  useEffect(() => {
    document.title = "Teams – Lamu Sports Hub | Lamu Football Clubs";
  }, []);

  const areas = ["all", ...Array.from(new Set(MOCK_TEAMS.map((t) => t.area)))];
  const filtered =
    areaFilter === "all"
      ? MOCK_TEAMS
      : MOCK_TEAMS.filter((t) => t.area === areaFilter);

  return (
    <div data-ocid="teams.page" className="min-h-screen pb-24 pt-14">
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
          <h1 className="font-display font-black text-2xl text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Teams
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {MOCK_TEAMS.length} clubs competing this season
          </p>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <Select value={areaFilter} onValueChange={setAreaFilter}>
          <SelectTrigger
            className="w-40 h-8 text-xs"
            data-ocid="teams.area.select"
          >
            <SelectValue placeholder="Filter by area" />
          </SelectTrigger>
          <SelectContent>
            {areas.map((a) => (
              <SelectItem key={a} value={a} className="text-xs">
                {a === "all" ? "All Areas" : a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {filtered.length} teams
        </span>
      </div>

      {/* Grid */}
      <div
        className="px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
        data-ocid="teams.list"
      >
        {filtered.map((team, i) => (
          <motion.div
            key={team.teamId}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            data-ocid={`teams.item.${i + 1}`}
          >
            <button
              type="button"
              className="w-full rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-card transition-all text-left overflow-hidden"
              onClick={() => navigate({ to: `/teams/${team.teamId}` })}
            >
              {/* Color top bar */}
              <div className="h-1" style={{ backgroundColor: team.color }} />

              <div className="p-3 flex flex-col items-center gap-2">
                <TeamBadge team={team} size="lg" />
                <div className="text-center">
                  <div className="font-bold text-xs text-foreground leading-tight">
                    {team.name}
                  </div>
                  <AreaBadge area={team.area} className="mt-1.5" />
                </div>
                {/* Record */}
                <div className="flex gap-1 text-xs w-full justify-center">
                  <span className="flex-1 text-center py-1 rounded bg-green-500/10 text-green-400 font-bold">
                    {team.wins}W
                  </span>
                  <span className="flex-1 text-center py-1 rounded bg-yellow-500/10 text-yellow-400 font-bold">
                    {team.draws}D
                  </span>
                  <span className="flex-1 text-center py-1 rounded bg-red-500/10 text-red-400 font-bold">
                    {team.losses}L
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {team.wins * 3 + team.draws} pts
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
