import { ShareButton } from "@/components/shared/ShareButton";
import { TeamBadge, getTeamColor } from "@/components/shared/TeamBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import type {
  T__5 as BackendMatch,
  T__2 as BackendPlayer,
  T__1 as BackendTeam,
} from "@/types/backend-compat";
import {
  LSH_MATCH_JOINERS_KEY,
  getLocalPlayers,
  getLocalStore,
  getMatchJoiners,
  getMatchPredictions,
} from "@/utils/localStore";
import { getActiveSimpleSession } from "@/utils/simpleAuth";
import { computeBackendStandings } from "@/utils/standingsUtils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Award,
  Brain,
  Loader2,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

function MedalBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-base">🥇</span>;
  if (rank === 2) return <span className="text-base">🥈</span>;
  if (rank === 3) return <span className="text-base">🥉</span>;
  return (
    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
      {rank}
    </span>
  );
}

function EmptyLeaderboard() {
  return (
    <div
      className="rounded-xl border border-border bg-card py-12 flex flex-col items-center gap-3 text-center"
      data-ocid="leaderboard.empty_state"
    >
      <Trophy className="w-10 h-10 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">
        No data yet. Stats will appear once players are registered and matches
        are played.
      </p>
    </div>
  );
}

export function LeaderboardPage() {
  const navigate = useNavigate();
  const { actor } = useActor();

  const [teams, setTeams] = useState<BackendTeam[]>([]);
  const [players, setPlayers] = useState<BackendPlayer[]>([]);
  const [matches, setMatches] = useState<BackendMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title =
      "Top Scorers & Leaderboard – Lamu Sports Hub | Lamu Football Stats";
  }, []);

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    Promise.all([
      actor.getAllPlayers(),
      actor.getAllTeams(),
      actor.getAllMatches(),
    ])
      .then(([p, t, m]) => {
        // Merge backend + local players (deduplicate by playerId)
        const local = getLocalPlayers();
        const backendIds = new Set(p.map((bp) => bp.playerId));
        const localAsBacked = local
          .filter((lp) => !backendIds.has(lp.playerId))
          .map(
            (lp) =>
              ({
                playerId: lp.playerId,
                userId: "",
                name: lp.name,
                nickname: lp.nickname,
                teamId: lp.teamId,
                position: lp.position as any,
                jerseyNumber: BigInt(lp.jerseyNumber),
                goals: BigInt(0),
                assists: BigInt(0),
                yellowCards: BigInt(0),
                redCards: BigInt(0),
                matchesPlayed: BigInt(0),
                isVerified: false,
                bio: "",
                photoUrl: "",
              }) as unknown as BackendPlayer,
          );
        setPlayers([...p, ...localAsBacked]);
        setTeams(t);
        setMatches(m);
      })
      .catch((err) => console.error("Failed to load leaderboard data:", err))
      .finally(() => setLoading(false));
  }, [actor]);

  const standings = computeBackendStandings(teams, matches);

  // Predictions leaderboard
  const predictionsLeaderboard = (() => {
    const all = getMatchPredictions();
    const byUser: Record<
      string,
      { total: number; correct: number; name: string }
    > = {};
    for (const p of all) {
      if (!byUser[p.userId])
        byUser[p.userId] = { total: 0, correct: 0, name: p.userId };
      byUser[p.userId].total++;
      if (p.correct === true) byUser[p.userId].correct++;
    }
    return Object.entries(byUser)
      .map(([userId, data]) => ({
        userId,
        name:
          data.name.length > 16 ? `${data.name.slice(0, 14)}...` : data.name,
        total: data.total,
        correct: data.correct,
        accuracy:
          data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.correct - a.correct || b.accuracy - a.accuracy)
      .slice(0, 20);
  })();

  // Sort helpers
  const topScorers = [...players]
    .sort((a, b) => Number(b.goals) - Number(a.goals))
    .slice(0, 15)
    .map((p, i) => ({
      rank: i + 1,
      player: p,
      team: teams.find((t) => t.teamId === p.teamId),
    }));

  const topAssists = [...players]
    .sort((a, b) => Number(b.assists) - Number(a.assists))
    .slice(0, 15)
    .map((p, i) => ({
      rank: i + 1,
      player: p,
      team: teams.find((t) => t.teamId === p.teamId),
    }));

  const cardPlayers = [...players]
    .sort(
      (a, b) =>
        Number(b.redCards) * 2 +
        Number(b.yellowCards) -
        (Number(a.redCards) * 2 + Number(a.yellowCards)),
    )
    .slice(0, 15)
    .map((p, i) => ({
      rank: i + 1,
      player: p,
      team: teams.find((t) => t.teamId === p.teamId),
    }));

  return (
    <div data-ocid="leaderboard.page" className="min-h-screen pb-24 pt-14">
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
            <Trophy className="w-6 h-6 text-yellow-400" />
            Leaderboards
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Season Rankings
          </p>
        </motion.div>
      </div>

      <Tabs defaultValue="scorers" className="px-4 pt-4">
        <TabsList
          className="w-full grid grid-cols-5 mb-4"
          data-ocid="leaderboard.tab"
        >
          <TabsTrigger value="scorers" className="text-[11px] px-1">
            <Target className="w-3 h-3 mr-1" />
            Scorers
          </TabsTrigger>
          <TabsTrigger value="assists" className="text-[11px] px-1">
            <Zap className="w-3 h-3 mr-1" />
            Assists
          </TabsTrigger>
          <TabsTrigger value="cards" className="text-[11px] px-1">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Cards
          </TabsTrigger>
          <TabsTrigger value="teams" className="text-[11px] px-1">
            <Trophy className="w-3 h-3 mr-1" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="predictions" className="text-[11px] px-1">
            <Brain className="w-3 h-3 mr-1" />
            Picks
          </TabsTrigger>
        </TabsList>

        {/* Top Scorers */}
        <TabsContent value="scorers">
          {loading ? (
            <div
              className="flex items-center justify-center py-12 gap-2 text-muted-foreground"
              data-ocid="leaderboard.loading_state"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : topScorers.length === 0 ||
            Number(topScorers[0]?.player.goals) === 0 ? (
            <EmptyLeaderboard />
          ) : (
            <div className="space-y-2" data-ocid="leaderboard.list">
              {topScorers.map((entry, i) => {
                const teamColor = entry.team
                  ? getTeamColor(entry.team.teamId)
                  : "oklch(0.4 0.06 255)";
                return (
                  <motion.div
                    key={entry.player.playerId}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    data-ocid={`leaderboard.item.${i + 1}`}
                  >
                    <button
                      type="button"
                      className="w-full rounded-xl border border-border bg-card hover:border-primary/40 transition-all p-3 flex items-center gap-3 text-left"
                      onClick={() =>
                        navigate({ to: `/players/${entry.player.playerId}` })
                      }
                      style={
                        i < 3
                          ? {
                              background:
                                i === 0
                                  ? "linear-gradient(135deg, oklch(0.82 0.15 85 / 0.12) 0%, oklch(0.16 0.04 255) 100%)"
                                  : i === 1
                                    ? "linear-gradient(135deg, oklch(0.75 0 0 / 0.12) 0%, oklch(0.16 0.04 255) 100%)"
                                    : "linear-gradient(135deg, oklch(0.65 0.12 45 / 0.12) 0%, oklch(0.16 0.04 255) 100%)",
                            }
                          : undefined
                      }
                    >
                      <MedalBadge rank={entry.rank} />
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black font-stats border-2 flex-shrink-0"
                        style={{
                          backgroundColor: teamColor,
                          color: "oklch(0.95 0.02 82)",
                          borderColor: "oklch(0.95 0.02 82 / 0.4)",
                        }}
                      >
                        {Number(entry.player.jerseyNumber)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-foreground truncate">
                            {entry.player.name}
                          </span>
                          {entry.player.isVerified && (
                            <span className="text-yellow-400 flex-shrink-0">
                              ⭐
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {entry.team && (
                            <>
                              <TeamBadge
                                team={{
                                  teamId: entry.team.teamId,
                                  name: entry.team.name,
                                  area: entry.team.area,
                                  color: teamColor,
                                }}
                                size="xs"
                              />
                              <span className="text-xs text-muted-foreground">
                                {entry.team.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-black font-stats text-2xl text-green-400">
                          {Number(entry.player.goals)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          goals
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Assists */}
        <TabsContent value="assists">
          {loading ? (
            <div
              className="flex items-center justify-center py-12 gap-2 text-muted-foreground"
              data-ocid="leaderboard.loading_state"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : topAssists.length === 0 ||
            Number(topAssists[0]?.player.assists) === 0 ? (
            <EmptyLeaderboard />
          ) : (
            <div className="space-y-2" data-ocid="leaderboard.list">
              {topAssists.map((entry, i) => {
                const teamColor = entry.team
                  ? getTeamColor(entry.team.teamId)
                  : "oklch(0.4 0.06 255)";
                return (
                  <motion.div
                    key={entry.player.playerId}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    data-ocid={`leaderboard.item.${i + 1}`}
                  >
                    <button
                      type="button"
                      className="w-full rounded-xl border border-border bg-card hover:border-primary/40 transition-all p-3 flex items-center gap-3 text-left"
                      onClick={() =>
                        navigate({ to: `/players/${entry.player.playerId}` })
                      }
                    >
                      <MedalBadge rank={entry.rank} />
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black font-stats border-2 flex-shrink-0"
                        style={{
                          backgroundColor: teamColor,
                          color: "oklch(0.95 0.02 82)",
                          borderColor: "oklch(0.95 0.02 82 / 0.4)",
                        }}
                      >
                        {Number(entry.player.jerseyNumber)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-foreground truncate">
                          {entry.player.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {entry.team && (
                            <>
                              <TeamBadge
                                team={{
                                  teamId: entry.team.teamId,
                                  name: entry.team.name,
                                  area: entry.team.area,
                                  color: teamColor,
                                }}
                                size="xs"
                              />
                              <span className="text-xs text-muted-foreground">
                                {entry.team.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-black font-stats text-2xl text-blue-400">
                          {Number(entry.player.assists)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          assists
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Cards */}
        <TabsContent value="cards">
          {loading ? (
            <div
              className="flex items-center justify-center py-12 gap-2 text-muted-foreground"
              data-ocid="leaderboard.loading_state"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : cardPlayers.length === 0 ? (
            <EmptyLeaderboard />
          ) : (
            <div className="space-y-2" data-ocid="leaderboard.list">
              {cardPlayers.map((entry, i) => {
                const teamColor = entry.team
                  ? getTeamColor(entry.team.teamId)
                  : "oklch(0.4 0.06 255)";
                return (
                  <motion.div
                    key={entry.player.playerId}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    data-ocid={`leaderboard.item.${i + 1}`}
                  >
                    <button
                      type="button"
                      className="w-full rounded-xl border border-border bg-card p-3 flex items-center gap-3 text-left"
                      onClick={() =>
                        navigate({ to: `/players/${entry.player.playerId}` })
                      }
                    >
                      <span className="text-sm font-bold text-muted-foreground w-6 text-center">
                        {entry.rank}
                      </span>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black font-stats border-2 flex-shrink-0"
                        style={{
                          backgroundColor: teamColor,
                          color: "oklch(0.95 0.02 82)",
                          borderColor: "oklch(0.95 0.02 82 / 0.4)",
                        }}
                      >
                        {Number(entry.player.jerseyNumber)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-foreground truncate">
                          {entry.player.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {entry.team && (
                            <>
                              <TeamBadge
                                team={{
                                  teamId: entry.team.teamId,
                                  name: entry.team.name,
                                  area: entry.team.area,
                                  color: teamColor,
                                }}
                                size="xs"
                              />
                              <span className="text-xs text-muted-foreground">
                                {entry.team.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex flex-col items-center">
                          <div className="font-black font-stats text-lg text-yellow-400">
                            {Number(entry.player.yellowCards)}
                          </div>
                          <div className="text-[9px] text-muted-foreground">
                            YC
                          </div>
                        </div>
                        {Number(entry.player.redCards) > 0 && (
                          <div className="flex flex-col items-center">
                            <div className="font-black font-stats text-lg text-red-500">
                              {Number(entry.player.redCards)}
                            </div>
                            <div className="text-[9px] text-muted-foreground">
                              RC
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Team Rankings */}
        <TabsContent value="teams">
          {loading ? (
            <div
              className="flex items-center justify-center py-12 gap-2 text-muted-foreground"
              data-ocid="leaderboard.loading_state"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : standings.length === 0 ? (
            <EmptyLeaderboard />
          ) : (
            <div className="space-y-2" data-ocid="leaderboard.list">
              {standings.map((entry, i) => (
                <motion.div
                  key={entry.team.teamId}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  data-ocid={`leaderboard.item.${i + 1}`}
                >
                  <button
                    type="button"
                    className="w-full rounded-xl border border-border bg-card hover:border-primary/40 transition-all p-3 flex items-center gap-3 text-left"
                    onClick={() =>
                      navigate({ to: `/teams/${entry.team.teamId}` })
                    }
                  >
                    <MedalBadge rank={entry.position} />
                    <TeamBadge team={entry.team} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-foreground">
                        {entry.team.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.wins}W · {entry.draws}D · {entry.losses}L
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-black font-stats text-2xl text-foreground">
                        {entry.points}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        points
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Predictions Leaderboard */}
        <TabsContent value="predictions">
          {predictionsLeaderboard.length === 0 ? (
            <div
              className="rounded-xl border border-dashed border-border bg-card py-12 flex flex-col items-center gap-3 text-center"
              data-ocid="leaderboard.predictions.empty_state"
            >
              <Brain className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm font-bold text-foreground">
                No predictions yet
              </p>
              <p className="text-xs text-muted-foreground px-6">
                Make your first prediction on any upcoming match to appear here!
              </p>
            </div>
          ) : (
            <div className="space-y-2" data-ocid="leaderboard.predictions.list">
              {predictionsLeaderboard.map((entry, i) => (
                <motion.div
                  key={entry.userId}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  data-ocid={`leaderboard.predictions.item.${i + 1}`}
                >
                  <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
                    <MedalBadge rank={i + 1} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-foreground truncate">
                        {entry.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.correct}/{entry.total} correct
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className="text-[11px] font-black px-2 py-0.5 rounded-full"
                        style={{
                          background:
                            entry.accuracy >= 60
                              ? "oklch(0.55 0.18 145 / 0.15)"
                              : entry.accuracy >= 40
                                ? "oklch(0.82 0.08 82 / 0.15)"
                                : "oklch(0.25 0.04 255 / 0.5)",
                          color:
                            entry.accuracy >= 60
                              ? "oklch(0.7 0.18 145)"
                              : entry.accuracy >= 40
                                ? "oklch(0.75 0.12 82)"
                                : "oklch(0.55 0.06 255)",
                          border:
                            entry.accuracy >= 60
                              ? "1px solid oklch(0.55 0.18 145 / 0.3)"
                              : "1px solid transparent",
                        }}
                      >
                        {entry.accuracy}%
                      </span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: Math.min(entry.total, 5) }).map(
                          (_, si) => (
                            <div
                              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length history dots
                              key={si}
                              className="w-2 h-2 rounded-full"
                              style={{
                                background:
                                  si < entry.correct
                                    ? "oklch(0.55 0.18 145)"
                                    : "oklch(0.35 0.04 255)",
                              }}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Badges Section */}
      {(() => {
        const session = getActiveSimpleSession();
        if (!session) return null;
        const userId = session.id;
        const appUrl = window.location.origin;

        const allPreds = getMatchPredictions().filter(
          (p) => p.userId === userId,
        );
        const allJoiners = getLocalStore<Record<string, { userId: string }[]>>(
          LSH_MATCH_JOINERS_KEY,
          {},
        );
        const joinedMatchCount = Object.values(allJoiners).filter((joiners) =>
          joiners.some((j) => j.userId === userId),
        ).length;
        const reporterSubmissions = (() => {
          try {
            return JSON.parse(
              localStorage.getItem("lsh_reporter_submissions") ?? "[]",
            );
          } catch {
            return [];
          }
        })();
        const hasReported = reporterSubmissions.some(
          (s: any) => s.userId === userId || s.reporterName === session.name,
        );
        const streak = (() => {
          try {
            const s = JSON.parse(
              localStorage.getItem("lsh_user_streak") ?? "{}",
            );
            return s.currentStreak ?? 0;
          } catch {
            return 0;
          }
        })();

        type Badge = {
          id: string;
          emoji: string;
          name: string;
          desc: string;
          earned: boolean;
        };
        const badges: Badge[] = [
          {
            id: "top_predictor",
            emoji: "🏆",
            name: "Top Predictor",
            desc: "Made 3+ predictions",
            earned: allPreds.length >= 3,
          },
          {
            id: "goal_reporter",
            emoji: "⚽",
            name: "Goal Reporter",
            desc: "Submitted a match result",
            earned: hasReported,
          },
          {
            id: "most_active",
            emoji: "🔥",
            name: "Most Active",
            desc: "Joined 2+ matches",
            earned: joinedMatchCount >= 2,
          },
          {
            id: "fan_of_month",
            emoji: "👑",
            name: "Fan of the Month",
            desc: "3+ day streak",
            earned: streak >= 3,
          },
        ];
        const earnedBadges = badges.filter((b) => b.earned);

        return (
          <div className="px-4 mt-6 pb-4">
            <h2 className="font-display font-black text-lg text-foreground mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Your Badges
            </h2>
            {earnedBadges.length === 0 ? (
              <div
                className="rounded-xl border border-dashed border-border bg-card p-6 text-center"
                data-ocid="leaderboard.badges.empty_state"
              >
                <p className="text-sm text-muted-foreground">
                  Complete actions to earn badges. Join a match, make a
                  prediction, or report a result!
                </p>
              </div>
            ) : (
              <div
                className="grid grid-cols-2 gap-3"
                data-ocid="leaderboard.badges.list"
              >
                {earnedBadges.map((badge, i) => (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    data-ocid={`leaderboard.badge.item.${i + 1}`}
                    className="rounded-xl p-4 flex flex-col items-center gap-2 text-center"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.82 0.15 85 / 0.12) 0%, oklch(0.16 0.04 255) 100%)",
                      border: "1px solid oklch(0.82 0.15 85 / 0.3)",
                    }}
                  >
                    <span className="text-3xl">{badge.emoji}</span>
                    <div>
                      <p className="font-bold text-sm text-foreground">
                        {badge.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {badge.desc}
                      </p>
                    </div>
                    <ShareButton
                      variant="text"
                      label="Share"
                      data-ocid={`leaderboard.badge_share.button.${i + 1}`}
                      text={`I just earned the '${badge.name}' badge on Lamu Sports Hub! ${badge.emoji} The home of football in Lamu County. ${appUrl}`}
                    />
                  </motion.div>
                ))}
              </div>
            )}
            {badges.filter((b) => !b.earned).length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {badges
                  .filter((b) => !b.earned)
                  .map((badge) => (
                    <div
                      key={badge.id}
                      className="rounded-xl p-3 flex items-center gap-2 opacity-40 border border-border"
                    >
                      <span className="text-xl">{badge.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-muted-foreground truncate">
                          {badge.name}
                        </p>
                        <p className="text-[9px] text-muted-foreground/70">
                          {badge.desc}
                        </p>
                      </div>
                      <span className="text-[10px] ml-auto">🔒</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
