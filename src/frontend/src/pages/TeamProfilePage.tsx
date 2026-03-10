import type {
  T__5 as BackendMatch,
  T__2 as BackendPlayer,
  T__1 as BackendTeam,
} from "@/backend";
import {
  AreaBadge,
  TeamBadge,
  getTeamColor,
} from "@/components/shared/TeamBadge";
import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { getPlayerPhotos } from "@/utils/localStore";
import { computeBackendStandings } from "@/utils/standingsUtils";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Loader2, User, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function TeamProfilePage() {
  const { teamId } = useParams({ strict: false }) as { teamId: string };
  const navigate = useNavigate();
  const { actor } = useActor();

  const [team, setTeam] = useState<BackendTeam | null>(null);
  const [players, setPlayers] = useState<BackendPlayer[]>([]);
  const [allTeams, setAllTeams] = useState<BackendTeam[]>([]);
  const [allMatches, setAllMatches] = useState<BackendMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const playerPhotos = getPlayerPhotos();

  useEffect(() => {
    if (!actor || !teamId) return;
    setLoading(true);
    Promise.all([
      actor.getTeam(teamId),
      actor.getPlayersByTeam(teamId),
      actor.getAllTeams(),
      actor.getAllMatches(),
    ])
      .then(([t, p, at, am]) => {
        setTeam(t);
        setPlayers(p);
        setAllTeams(at);
        setAllMatches(am);
      })
      .catch((err) => console.error("Failed to load team profile:", err))
      .finally(() => setLoading(false));
  }, [actor, teamId]);

  const standings = computeBackendStandings(allTeams, allMatches);
  const standing = team
    ? standings.find((s) => s.team.teamId === team.teamId)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen pb-24 pt-14 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen pb-24 pt-14 flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-muted-foreground">Team not found.</p>
        <Button variant="outline" onClick={() => navigate({ to: "/teams" })}>
          Back to Teams
        </Button>
      </div>
    );
  }

  const teamColor = getTeamColor(team.teamId);

  return (
    <div data-ocid="team_profile.page" className="min-h-screen pb-24 pt-14">
      {/* Back button */}
      <button
        type="button"
        className="fixed top-14 left-0 z-40 flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors bg-card/80 backdrop-blur-sm"
        onClick={() => navigate({ to: "/teams" })}
        data-ocid="team_profile.back.button"
      >
        <X className="w-4 h-4" />
        Teams
      </button>

      {/* Hero */}
      <div
        className="pt-8 pb-6 px-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${teamColor}55 0%, oklch(0.12 0.04 252) 60%)`,
        }}
      >
        <div
          className="absolute top-0 right-0 text-9xl font-black font-stats opacity-5 leading-none pointer-events-none select-none"
          style={{ color: teamColor }}
        >
          {team.name.split(" ")[0].slice(0, 3).toUpperCase()}
        </div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-4"
        >
          <TeamBadge
            team={{
              teamId: team.teamId,
              name: team.name,
              area: team.area,
              color: teamColor,
            }}
            size="xl"
          />
          <div>
            <h1 className="font-display font-black text-2xl text-foreground">
              {team.name}
            </h1>
            <AreaBadge area={team.area} className="mt-1" />
            {team.coachId && (
              <div className="text-xs text-muted-foreground mt-1">
                Coach ID: {team.coachId.slice(0, 8)}...
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-5 gap-2 mt-5"
        >
          {[
            {
              label: "Position",
              value: standing ? `#${standing.position}` : "—",
            },
            { label: "Points", value: standing?.points ?? 0 },
            {
              label: "W/D/L",
              value: `${Number(team.wins)}/${Number(team.draws)}/${Number(team.losses)}`,
            },
            { label: "Goals", value: Number(team.goalsFor) },
            {
              label: "GD",
              value: standing
                ? standing.goalDiff > 0
                  ? `+${standing.goalDiff}`
                  : standing.goalDiff
                : "—",
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
              No players registered yet.
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            data-ocid="team_profile.roster.list"
          >
            {players.map((player, i) => {
              const photo = playerPhotos[player.playerId];
              return (
                <motion.div
                  key={player.playerId}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  data-ocid={`team_profile.player.item.${i + 1}`}
                >
                  <button
                    type="button"
                    className="w-full rounded-xl border border-border bg-card hover:border-primary/40 transition-all p-3 flex items-center gap-3 text-left"
                    onClick={() =>
                      navigate({ to: `/players/${player.playerId}` })
                    }
                  >
                    {photo ? (
                      <img
                        src={photo}
                        alt={player.name}
                        className="w-12 h-12 rounded-full object-cover border-2 flex-shrink-0"
                        style={{ borderColor: `${teamColor}66` }}
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black font-stats border-2 flex-shrink-0"
                        style={{
                          backgroundColor: teamColor,
                          color: "oklch(0.95 0.02 82)",
                          borderColor: `${teamColor}66`,
                        }}
                      >
                        {Number(player.jerseyNumber)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-foreground truncate">
                        {player.name}
                      </div>
                      {player.nickname && (
                        <div className="text-xs text-muted-foreground">
                          "{player.nickname}"
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground capitalize">
                        {String(player.position)} · #
                        {Number(player.jerseyNumber)}
                      </div>
                    </div>
                    <div className="flex gap-3 text-right flex-shrink-0">
                      <div>
                        <div
                          className="font-black font-stats text-lg"
                          style={{ color: "oklch(0.6 0.22 24)" }}
                        >
                          {Number(player.goals)}
                        </div>
                        <div className="text-[9px] text-muted-foreground">
                          G
                        </div>
                      </div>
                      <div>
                        <div className="font-black font-stats text-lg text-primary">
                          {Number(player.assists)}
                        </div>
                        <div className="text-[9px] text-muted-foreground">
                          A
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
