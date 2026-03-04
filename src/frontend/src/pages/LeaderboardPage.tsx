import { TeamBadge } from "@/components/shared/TeamBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MOCK_PLAYERS,
  MOCK_TEAMS,
  computeStandings,
  getTopAssists,
  getTopScorers,
} from "@/data/mockData";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Target, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";

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

export function LeaderboardPage() {
  const navigate = useNavigate();
  const topScorers = getTopScorers();
  const topAssists = getTopAssists();
  const standings = computeStandings();

  const cardPlayers = [...MOCK_PLAYERS]
    .sort(
      (a, b) =>
        b.yellowCards + b.redCards * 3 - (a.yellowCards + a.redCards * 3),
    )
    .slice(0, 10)
    .map((p, i) => ({
      rank: i + 1,
      player: p,
      team: MOCK_TEAMS.find((t) => t.teamId === p.teamId)!,
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
            Season 2025/26 Rankings
          </p>
        </motion.div>
      </div>

      <Tabs defaultValue="scorers" className="px-4 pt-4">
        <TabsList
          className="w-full grid grid-cols-4 mb-4"
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
        </TabsList>

        {/* Top Scorers */}
        <TabsContent value="scorers">
          <div className="space-y-2" data-ocid="leaderboard.list">
            {topScorers.map((entry, i) => (
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
                      backgroundColor: entry.team.color,
                      color: entry.team.secondaryColor,
                      borderColor: `${entry.team.secondaryColor}66`,
                    }}
                  >
                    {entry.player.jerseyNumber}
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
                      <TeamBadge team={entry.team} size="xs" />
                      <span className="text-xs text-muted-foreground">
                        {entry.team.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-black font-stats text-2xl text-green-400">
                      {entry.player.goals}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      goals
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Assists */}
        <TabsContent value="assists">
          <div className="space-y-2" data-ocid="leaderboard.list">
            {topAssists.map((entry, i) => (
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
                      backgroundColor: entry.team.color,
                      color: entry.team.secondaryColor,
                      borderColor: `${entry.team.secondaryColor}66`,
                    }}
                  >
                    {entry.player.jerseyNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-foreground truncate">
                      {entry.player.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <TeamBadge team={entry.team} size="xs" />
                      <span className="text-xs text-muted-foreground">
                        {entry.team.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-black font-stats text-2xl text-blue-400">
                      {entry.player.assists}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      assists
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Cards */}
        <TabsContent value="cards">
          <div className="space-y-2" data-ocid="leaderboard.list">
            {cardPlayers.map((entry, i) => (
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
                      backgroundColor: entry.team.color,
                      color: entry.team.secondaryColor,
                      borderColor: `${entry.team.secondaryColor}66`,
                    }}
                  >
                    {entry.player.jerseyNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-foreground truncate">
                      {entry.player.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <TeamBadge team={entry.team} size="xs" />
                      <span className="text-xs text-muted-foreground">
                        {entry.team.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex flex-col items-center">
                      <div className="font-black font-stats text-lg text-yellow-400">
                        {entry.player.yellowCards}
                      </div>
                      <div className="text-[9px] text-muted-foreground">YC</div>
                    </div>
                    {entry.player.redCards > 0 && (
                      <div className="flex flex-col items-center">
                        <div className="font-black font-stats text-lg text-red-500">
                          {entry.player.redCards}
                        </div>
                        <div className="text-[9px] text-muted-foreground">
                          RC
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Team Rankings */}
        <TabsContent value="teams">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
