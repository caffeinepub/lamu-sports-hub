import { PlayerCard } from "@/components/shared/PlayerCard";
import { AreaBadge, TeamBadge } from "@/components/shared/TeamBadge";
import { Button } from "@/components/ui/button";
import { MOCK_PLAYERS, MOCK_TEAMS, computeStandings } from "@/data/mockData";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, User } from "lucide-react";
import { motion } from "motion/react";

export function TeamProfilePage() {
  const { teamId } = useParams({ strict: false }) as { teamId: string };
  const navigate = useNavigate();

  const team = MOCK_TEAMS.find((t) => t.teamId === teamId) || MOCK_TEAMS[0];
  const players = MOCK_PLAYERS.filter((p) => p.teamId === team.teamId);
  const standings = computeStandings();
  const standing = standings.find((s) => s.team.teamId === team.teamId);

  return (
    <div data-ocid="team_profile.page" className="min-h-screen pb-24 pt-14">
      {/* Back button */}
      <button
        type="button"
        className="fixed top-14 left-0 z-40 flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors bg-card/80 backdrop-blur-sm"
        onClick={() => navigate({ to: "/teams" })}
      >
        <ChevronLeft className="w-4 h-4" />
        Teams
      </button>

      {/* Hero */}
      <div
        className="pt-8 pb-6 px-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${team.color}55 0%, oklch(0.12 0.04 252) 60%)`,
        }}
      >
        <div
          className="absolute top-0 right-0 text-9xl font-black font-stats opacity-5 leading-none pointer-events-none select-none"
          style={{ color: team.secondaryColor }}
        >
          {team.name.split(" ")[0].slice(0, 3).toUpperCase()}
        </div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-4"
        >
          <TeamBadge team={team} size="xl" />
          <div>
            <h1 className="font-display font-black text-2xl text-foreground">
              {team.name}
            </h1>
            <AreaBadge area={team.area} className="mt-1" />
            <div className="text-xs text-muted-foreground mt-1">
              Coach: {team.coachName}
            </div>
          </div>
        </motion.div>

        {/* Stats bar */}
        {standing && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-5 gap-2 mt-5"
          >
            {[
              { label: "Position", value: `#${standing.position}` },
              { label: "Points", value: standing.points },
              {
                label: "W/D/L",
                value: `${team.wins}/${team.draws}/${team.losses}`,
              },
              { label: "Goals", value: team.goalsFor },
              {
                label: "GD",
                value:
                  standing.goalDiff > 0
                    ? `+${standing.goalDiff}`
                    : standing.goalDiff,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg bg-card/50 border border-border/60 p-2 text-center backdrop-blur-sm"
              >
                <div className="font-black font-stats text-lg text-foreground leading-tight">
                  {stat.value}
                </div>
                <div className="text-[9px] text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Roster */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide flex items-center gap-1.5">
            <User className="w-4 h-4" />
            Squad ({players.length})
          </h2>
        </div>

        {players.length === 0 ? (
          <div
            className="rounded-xl p-8 border border-border text-center"
            data-ocid="team_profile.roster.empty_state"
          >
            <User className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No players registered
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            data-ocid="team_profile.roster.list"
          >
            {players.map((player, i) => (
              <motion.div
                key={player.playerId}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`team_profile.player.item.${i + 1}`}
              >
                <PlayerCard
                  player={player}
                  team={team}
                  onClick={() =>
                    navigate({ to: `/players/${player.playerId}` })
                  }
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
