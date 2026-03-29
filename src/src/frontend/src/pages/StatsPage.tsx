import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLocalPlayers, getLocalTeams } from "@/utils/localStore";
import {
  BarChart2,
  Footprints,
  Goal,
  Medal,
  Shield,
  Shirt,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

type MatchEvent = {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  played: boolean;
};

function getLocalMatches(): MatchEvent[] {
  try {
    const raw = localStorage.getItem("lsh_local_matches");
    if (!raw) return [];
    return JSON.parse(raw) as MatchEvent[];
  } catch {
    return [];
  }
}

type FormResult = "W" | "D" | "L";

function FormDot({ result }: { result: FormResult }) {
  const colors: Record<FormResult, string> = {
    W: "oklch(0.6 0.2 145)",
    D: "oklch(0.7 0.18 80)",
    L: "oklch(0.55 0.22 20)",
  };
  return (
    <span
      className="inline-block w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold"
      style={{ background: colors[result] }}
    >
      {result}
    </span>
  );
}

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <Medal className="w-4 h-4" style={{ color: "oklch(0.75 0.22 60)" }} />
    );
  if (rank === 2)
    return (
      <Medal className="w-4 h-4" style={{ color: "oklch(0.7 0.04 250)" }} />
    );
  if (rank === 3)
    return (
      <Medal className="w-4 h-4" style={{ color: "oklch(0.58 0.12 40)" }} />
    );
  return (
    <span className="w-4 h-4 text-xs text-muted-foreground font-bold text-center inline-block">
      {rank}
    </span>
  );
}

export function StatsPage() {
  const players = getLocalPlayers();
  const teams = getLocalTeams();
  const matches = getLocalMatches();

  const playedMatches = matches.filter((m) => m.played);
  const totalGoals = playedMatches.reduce(
    (sum, m) => sum + m.homeScore + m.awayScore,
    0,
  );

  // Derived leaderboards from player data
  const topScorers = useMemo(
    () =>
      [...players]
        .sort((a, b) => {
          // use a goals field if present
          const ag = (a as any).goals ?? 0;
          const bg = (b as any).goals ?? 0;
          return bg - ag;
        })
        .slice(0, 10),
    [players],
  );

  const topAssisters = useMemo(
    () =>
      [...players]
        .sort((a, b) => {
          const aa = (a as any).assists ?? 0;
          const ba = (b as any).assists ?? 0;
          return ba - aa;
        })
        .slice(0, 10),
    [players],
  );

  const mostAppearances = useMemo(
    () =>
      [...players]
        .sort((a, b) => {
          const aa = (a as any).appearances ?? 0;
          const ba = (b as any).appearances ?? 0;
          return ba - aa;
        })
        .slice(0, 10),
    [players],
  );

  const mostCards = useMemo(
    () =>
      [...players]
        .sort((a, b) => {
          const ac = ((a as any).yellowCards ?? 0) + ((a as any).redCards ?? 0);
          const bc = ((b as any).yellowCards ?? 0) + ((b as any).redCards ?? 0);
          return bc - ac;
        })
        .slice(0, 10),
    [players],
  );

  // Team form: last 5 results
  const teamForm = useMemo(() => {
    return teams.map((team) => {
      const teamMatches = playedMatches
        .filter(
          (m) => m.homeTeamId === team.teamId || m.awayTeamId === team.teamId,
        )
        .slice(-5);
      const form: FormResult[] = teamMatches.map((m) => {
        const isHome = m.homeTeamId === team.teamId;
        const teamScore = isHome ? m.homeScore : m.awayScore;
        const oppScore = isHome ? m.awayScore : m.homeScore;
        if (teamScore > oppScore) return "W";
        if (teamScore === oppScore) return "D";
        return "L";
      });
      return { team, form };
    });
  }, [teams, playedMatches]);

  // Head-to-head
  const [h2hTeamA, setH2hTeamA] = useState("");
  const [h2hTeamB, setH2hTeamB] = useState("");

  const h2hRecord = useMemo(() => {
    if (!h2hTeamA || !h2hTeamB) return null;
    const h2hMatches = playedMatches.filter(
      (m) =>
        (m.homeTeamId === h2hTeamA && m.awayTeamId === h2hTeamB) ||
        (m.homeTeamId === h2hTeamB && m.awayTeamId === h2hTeamA),
    );
    let winsA = 0;
    let winsB = 0;
    let draws = 0;
    let goalsA = 0;
    let goalsB = 0;
    for (const m of h2hMatches) {
      const aIsHome = m.homeTeamId === h2hTeamA;
      const aScore = aIsHome ? m.homeScore : m.awayScore;
      const bScore = aIsHome ? m.awayScore : m.homeScore;
      goalsA += aScore;
      goalsB += bScore;
      if (aScore > bScore) winsA++;
      else if (bScore > aScore) winsB++;
      else draws++;
    }
    const teamAName =
      teams.find((t) => t.teamId === h2hTeamA)?.name ?? h2hTeamA;
    const teamBName =
      teams.find((t) => t.teamId === h2hTeamB)?.name ?? h2hTeamB;
    return {
      winsA,
      winsB,
      draws,
      goalsA,
      goalsB,
      teamAName,
      teamBName,
      total: h2hMatches.length,
    };
  }, [h2hTeamA, h2hTeamB, playedMatches, teams]);

  const isEmpty = players.length === 0 && matches.length === 0;

  return (
    <div data-ocid="stats.page" className="min-h-screen pb-24 pt-14">
      {/* Header */}
      <div
        className="px-4 py-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.04 255) 0%, oklch(0.15 0.07 252) 100%)",
        }}
      >
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.55 0.25 60)" }}
          >
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-foreground">
              Deep Stats
            </h1>
            <p className="text-xs text-muted-foreground">
              Season analytics &amp; player data
            </p>
          </div>
        </motion.div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card py-14 flex flex-col items-center gap-3 text-center"
            data-ocid="stats.empty_state"
          >
            <BarChart2 className="w-12 h-12 text-muted-foreground/30" />
            <p className="font-semibold text-foreground">No stats yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Stats will appear here as matches are recorded by officials.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Season Overview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Season Overview
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Total Goals",
                    value: totalGoals,
                    icon: <Goal className="w-5 h-5" />,
                  },
                  {
                    label: "Matches Played",
                    value: playedMatches.length,
                    icon: <Shield className="w-5 h-5" />,
                  },
                  {
                    label: "Players",
                    value: players.length,
                    icon: <Users className="w-5 h-5" />,
                  },
                  {
                    label: "Teams",
                    value: teams.length,
                    icon: <Shirt className="w-5 h-5" />,
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="border-border bg-card">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{
                            background: "oklch(0.55 0.25 60 / 0.2)",
                            color: "oklch(0.75 0.22 60)",
                          }}
                        >
                          {stat.icon}
                        </div>
                        <div>
                          <p className="text-2xl font-black text-foreground">
                            {stat.value}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stat.label}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Top Scorers */}
            <PlayerLeaderboard
              title="Top Scorers"
              players={topScorers}
              teams={teams}
              statKey="goals"
              statLabel="goals"
              icon={<Target className="w-4 h-4" />}
              ocidScope="stats.scorers"
            />

            {/* Top Assisters */}
            <PlayerLeaderboard
              title="Top Assisters"
              players={topAssisters}
              teams={teams}
              statKey="assists"
              statLabel="assists"
              icon={<Footprints className="w-4 h-4" />}
              ocidScope="stats.assisters"
            />

            {/* Most Appearances */}
            <PlayerLeaderboard
              title="Most Appearances"
              players={mostAppearances}
              teams={teams}
              statKey="appearances"
              statLabel="apps"
              icon={<Shirt className="w-4 h-4" />}
              ocidScope="stats.appearances"
            />

            {/* Most Cards */}
            <PlayerLeaderboard
              title="Most Cards"
              players={mostCards}
              teams={teams}
              statKey="cards"
              statLabel="cards"
              icon={<Badge className="w-4 h-4" />}
              ocidScope="stats.cards"
            />

            {/* Team Form */}
            {teamForm.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Team Form (Last 5)
                </h2>
                <Card className="border-border bg-card">
                  <CardContent className="p-0 divide-y divide-border">
                    {teamForm.map(({ team, form }, i) => (
                      <div
                        key={team.teamId}
                        className="flex items-center justify-between px-4 py-3"
                        data-ocid={`stats.form.item.${i + 1}`}
                      >
                        <span className="text-sm font-semibold text-foreground truncate flex-1 mr-2">
                          {team.name}
                        </span>
                        <div className="flex gap-1">
                          {form.length === 0 ? (
                            <span className="text-xs text-muted-foreground">
                              No data
                            </span>
                          ) : (
                            form.map((r, j) => (
                              <FormDot key={String(j)} result={r} />
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Head-to-Head */}
            {teams.length >= 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Head-to-Head
                </h2>
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3 pt-4 px-4">
                    <div className="flex gap-2 flex-col sm:flex-row">
                      <Select value={h2hTeamA} onValueChange={setH2hTeamA}>
                        <SelectTrigger
                          className="flex-1"
                          data-ocid="stats.h2h.select"
                        >
                          <SelectValue placeholder="Select Team A" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams
                            .filter((t) => t.teamId !== h2hTeamB)
                            .map((t) => (
                              <SelectItem key={t.teamId} value={t.teamId}>
                                {t.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <span className="text-muted-foreground self-center text-sm font-bold">
                        vs
                      </span>
                      <Select value={h2hTeamB} onValueChange={setH2hTeamB}>
                        <SelectTrigger
                          className="flex-1"
                          data-ocid="stats.h2h.select"
                        >
                          <SelectValue placeholder="Select Team B" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams
                            .filter((t) => t.teamId !== h2hTeamA)
                            .map((t) => (
                              <SelectItem key={t.teamId} value={t.teamId}>
                                {t.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  {h2hRecord && (
                    <CardContent className="px-4 pb-4">
                      <p className="text-xs text-muted-foreground mb-3 text-center">
                        {h2hRecord.total} matches played
                      </p>
                      <div className="grid grid-cols-3 text-center gap-2">
                        <div
                          className="rounded-lg p-3"
                          style={{ background: "oklch(0.2 0.07 255 / 0.4)" }}
                        >
                          <p className="text-2xl font-black text-foreground">
                            {h2hRecord.winsA}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {h2hRecord.teamAName}
                          </p>
                        </div>
                        <div className="rounded-lg p-3 bg-muted/30">
                          <p className="text-2xl font-black text-muted-foreground">
                            {h2hRecord.draws}
                          </p>
                          <p className="text-xs text-muted-foreground">Draws</p>
                        </div>
                        <div
                          className="rounded-lg p-3"
                          style={{ background: "oklch(0.2 0.07 255 / 0.4)" }}
                        >
                          <p className="text-2xl font-black text-foreground">
                            {h2hRecord.winsB}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {h2hRecord.teamBName}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-center text-muted-foreground mt-3">
                        Goals: {h2hRecord.teamAName} {h2hRecord.goalsA} —{" "}
                        {h2hRecord.goalsB} {h2hRecord.teamBName}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PlayerLeaderboard({
  title,
  players,
  teams,
  statKey,
  statLabel,
  icon,
  ocidScope,
}: {
  title: string;
  players: any[];
  teams: any[];
  statKey: string;
  statLabel: string;
  icon: React.ReactNode;
  ocidScope: string;
}) {
  const hasData = players.some((p) => (p[statKey] ?? 0) > 0);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
    >
      <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        {icon} {title}
      </h2>
      {!hasData ? (
        <Card className="border-border bg-card">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No data yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="p-0 divide-y divide-border">
            {players.map((player, i) => {
              const teamName =
                teams.find((t: any) => t.teamId === player.teamId)?.name ??
                "Unknown";
              const statVal =
                statKey === "cards"
                  ? (player.yellowCards ?? 0) + (player.redCards ?? 0)
                  : (player[statKey] ?? 0);
              return (
                <div
                  key={player.playerId}
                  className="flex items-center gap-3 px-4 py-3"
                  data-ocid={`${ocidScope}.item.${i + 1}`}
                >
                  <RankMedal rank={i + 1} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {player.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {teamName}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    style={
                      i === 0
                        ? {
                            background: "oklch(0.75 0.22 60 / 0.2)",
                            color: "oklch(0.75 0.22 60)",
                          }
                        : {}
                    }
                  >
                    {statVal} {statLabel}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
