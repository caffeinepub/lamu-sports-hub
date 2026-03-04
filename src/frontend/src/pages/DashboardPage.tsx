import type { ExternalBlob } from "@/backend";
import { MatchCard } from "@/components/shared/MatchCard";
import { AreaBadge, TeamBadge } from "@/components/shared/TeamBadge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  MOCK_MATCHES,
  MOCK_PLAYERS,
  MOCK_TEAMS,
  computeStandings,
} from "@/data/mockData";
import { useActor } from "@/hooks/useActor";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  Newspaper,
  Star,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface DashboardPageProps {
  favoriteTeamId?: string;
  role?: string;
  userName?: string;
}

type NewsItem = {
  newsId: string;
  title: string;
  body: string;
  isPublished: boolean;
  timestamp: bigint;
  photo?: ExternalBlob;
  authorId: string;
};

function timeAgo(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const date = new Date(ms);
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Gradient placeholders for news cards without photos
const NEWS_GRADIENTS = [
  "linear-gradient(135deg, oklch(0.25 0.08 252) 0%, oklch(0.15 0.04 255) 100%)",
  "linear-gradient(135deg, oklch(0.22 0.06 24) 0%, oklch(0.16 0.04 255) 100%)",
  "linear-gradient(135deg, oklch(0.2 0.05 82) 0%, oklch(0.14 0.04 255) 100%)",
];

export function DashboardPage({
  favoriteTeamId,
  userName,
}: DashboardPageProps) {
  const navigate = useNavigate();
  const { actor, isFetching: actorFetching } = useActor();
  const standings = computeStandings();

  const favoriteTeam = favoriteTeamId
    ? MOCK_TEAMS.find((t) => t.teamId === favoriteTeamId)
    : MOCK_TEAMS[0];
  const liveMatches = MOCK_MATCHES.filter((m) => m.status === "live");
  const upcomingMatches = MOCK_MATCHES.filter(
    (m) => m.status === "scheduled",
  ).slice(0, 3);
  const topScorer = [...MOCK_PLAYERS].sort((a, b) => b.goals - a.goals)[0];
  const topScorerTeam = MOCK_TEAMS.find((t) => t.teamId === topScorer.teamId)!;

  const matchOfWeek = MOCK_MATCHES.find((m) => m.matchId === "m-001")!;
  const motmHome = MOCK_TEAMS.find((t) => t.teamId === matchOfWeek.homeTeamId)!;
  const motmAway = MOCK_TEAMS.find((t) => t.teamId === matchOfWeek.awayTeamId)!;

  const favStanding = standings.find(
    (s) => s.team.teamId === favoriteTeam?.teamId,
  );

  // News state
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    if (!actor || actorFetching) return;
    let cancelled = false;
    actor
      .getAllNews()
      .then((items) => {
        if (!cancelled) setNewsList((items as NewsItem[]).slice(0, 3));
      })
      .catch(() => {
        // Silently fail -- news is optional
      })
      .finally(() => {
        if (!cancelled) setNewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [actor, actorFetching]);

  return (
    <div data-ocid="dashboard.page" className="min-h-screen pb-24 pt-14">
      {/* Hero banner */}
      <div
        className="px-4 py-6"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.04 255) 0%, oklch(0.14 0.06 252) 60%, oklch(0.12 0.05 248) 100%)",
        }}
      >
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="text-xs text-muted-foreground font-medium mb-0.5">
            {userName ? `Welcome back, ${userName}` : "Welcome to"}
          </p>
          <h1 className="font-display font-black text-2xl text-foreground">
            Lamu{" "}
            <span style={{ color: "oklch(0.82 0.08 82)" }}>Sports Hub</span>
          </h1>
          <p
            className="text-xs mt-1 font-medium"
            style={{ color: "oklch(0.6 0.22 24)" }}
          >
            🏝️ Island Pride. Island Football.
          </p>
        </motion.div>
      </div>

      <div className="px-4 space-y-6 mt-4">
        {/* LIVE banner */}
        {liveMatches.length > 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {liveMatches.map((match) => {
              const home = MOCK_TEAMS.find(
                (t) => t.teamId === match.homeTeamId,
              )!;
              const away = MOCK_TEAMS.find(
                (t) => t.teamId === match.awayTeamId,
              )!;
              return (
                <button
                  type="button"
                  key={match.matchId}
                  className="w-full rounded-xl p-4 border border-accent/60 text-left hover:border-accent transition-all"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.6 0.22 24 / 0.15) 0%, oklch(0.16 0.04 255) 100%)",
                  }}
                  onClick={() => navigate({ to: `/matchday/${match.matchId}` })}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="live-indicator w-2 h-2 rounded-full bg-accent" />
                      <span className="text-xs font-bold text-accent uppercase tracking-widest">
                        Live Now
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Tap for commentary →
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <TeamBadge team={home} size="sm" />
                      <span className="font-bold text-sm text-foreground">
                        {home.name}
                      </span>
                    </div>
                    <div className="px-4">
                      <span className="font-black font-stats text-2xl text-foreground">
                        {match.homeScore} — {match.awayScore}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="font-bold text-sm text-foreground">
                        {away.name}
                      </span>
                      <TeamBadge team={away} size="sm" />
                    </div>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Favorite team card */}
        {favoriteTeam && favStanding && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            data-ocid="dashboard.next_match.card"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide">
                Your Team
              </h2>
              <button
                type="button"
                className="text-xs text-primary font-medium flex items-center gap-1"
                onClick={() =>
                  navigate({ to: `/teams/${favoriteTeam.teamId}` })
                }
              >
                View <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div
              className="rounded-xl p-4 border border-border overflow-hidden relative"
              style={{
                background: `linear-gradient(135deg, ${favoriteTeam.color}33 0%, oklch(0.16 0.04 255) 70%)`,
              }}
            >
              <div className="flex items-center gap-4">
                <TeamBadge team={favoriteTeam} size="xl" />
                <div className="flex-1">
                  <div className="font-display font-black text-lg text-foreground">
                    {favoriteTeam.name}
                  </div>
                  <AreaBadge area={favoriteTeam.area} className="mt-1" />
                  <div className="flex items-center gap-3 mt-2">
                    <div className="text-center">
                      <div className="font-black font-stats text-lg text-foreground">
                        {favStanding.position}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Position
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-black font-stats text-lg text-foreground">
                        {favStanding.points}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Points
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-black font-stats text-lg text-foreground">
                        {favStanding.goalDiff > 0 ? "+" : ""}
                        {favStanding.goalDiff}
                      </div>
                      <div className="text-xs text-muted-foreground">GD</div>
                    </div>
                    <div className="text-center">
                      <div className="font-black font-stats text-lg text-foreground">
                        {favoriteTeam.wins}
                      </div>
                      <div className="text-xs text-muted-foreground">Wins</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Top 5 standings snippet */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          data-ocid="dashboard.standings.card"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" />
              League Table
            </h2>
            <button
              type="button"
              className="text-xs text-primary font-medium flex items-center gap-1"
              onClick={() => navigate({ to: "/standings" })}
            >
              Full table <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="grid grid-cols-[24px_1fr_24px_24px_24px_32px] gap-x-2 px-3 py-2 text-[10px] text-muted-foreground font-semibold border-b border-border">
              <span>#</span>
              <span>Club</span>
              <span className="text-center">P</span>
              <span className="text-center">W</span>
              <span className="text-center">GD</span>
              <span className="text-center">Pts</span>
            </div>
            {standings.slice(0, 5).map((entry, i) => (
              <button
                type="button"
                key={entry.team.teamId}
                className={`w-full grid grid-cols-[24px_1fr_24px_24px_24px_32px] gap-x-2 px-3 py-2.5 items-center border-b border-border/50 last:border-0 hover:bg-muted/20 cursor-pointer transition-colors text-left ${
                  i < 2 ? "zone-champions" : ""
                }`}
                onClick={() => navigate({ to: `/teams/${entry.team.teamId}` })}
              >
                <span className="text-xs font-bold text-muted-foreground">
                  {entry.position}
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <TeamBadge team={entry.team} size="xs" />
                  <span className="text-xs font-semibold text-foreground truncate">
                    {entry.team.name}
                  </span>
                </div>
                <span className="text-xs text-center text-muted-foreground">
                  {entry.played}
                </span>
                <span className="text-xs text-center font-semibold text-green-400">
                  {entry.wins}
                </span>
                <span
                  className={`text-xs text-center font-semibold ${entry.goalDiff >= 0 ? "text-foreground" : "text-red-400"}`}
                >
                  {entry.goalDiff > 0 ? "+" : ""}
                  {entry.goalDiff}
                </span>
                <span className="text-xs font-black text-center text-foreground">
                  {entry.points}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Player of the Week */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-400" />
              Top Scorer
            </h2>
          </div>
          <div
            className="rounded-xl p-4 border border-border relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${topScorerTeam.color}25 0%, oklch(0.16 0.04 255) 70%)`,
            }}
          >
            <div
              className="absolute top-2 right-2 text-5xl font-black font-stats opacity-10"
              style={{ color: topScorerTeam.secondaryColor }}
            >
              {topScorer.jerseyNumber}
            </div>
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black font-stats border-2"
                style={{
                  backgroundColor: topScorerTeam.color,
                  color: topScorerTeam.secondaryColor,
                  borderColor: `${topScorerTeam.secondaryColor}66`,
                }}
              >
                {topScorer.jerseyNumber}
              </div>
              <div className="flex-1">
                <div className="font-bold text-foreground">
                  {topScorer.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  "{topScorer.nickname}"
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <TeamBadge team={topScorerTeam} size="xs" />
                  <span className="text-xs text-muted-foreground">
                    {topScorerTeam.name}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div
                  className="font-black font-stats text-4xl"
                  style={{ color: "oklch(0.6 0.22 24)" }}
                >
                  {topScorer.goals}
                </div>
                <div className="text-xs text-muted-foreground">goals</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Match of the Week */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-accent" />
              Match of the Week
            </h2>
          </div>
          <MatchCard
            match={matchOfWeek}
            homeTeam={motmHome}
            awayTeam={motmAway}
            onClick={() => navigate({ to: `/matchday/${matchOfWeek.matchId}` })}
          />
        </motion.div>

        {/* Latest News */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Newspaper
                className="w-4 h-4"
                style={{ color: "oklch(0.6 0.22 24)" }}
              />
              Latest News
            </h2>
          </div>

          {newsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card h-20 animate-pulse"
                  data-ocid="dashboard.news.loading_state"
                />
              ))}
            </div>
          ) : newsList.length === 0 ? (
            <div
              className="rounded-xl border border-border bg-card py-8 flex flex-col items-center gap-2 text-center"
              data-ocid="dashboard.news.empty_state"
            >
              <Newspaper className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">
                No news yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="space-y-2" data-ocid="dashboard.news.list">
              {newsList.map((item, i) => (
                <button
                  type="button"
                  key={item.newsId}
                  className="w-full rounded-xl border border-border bg-card overflow-hidden flex items-stretch text-left hover:border-primary/40 transition-all active:scale-[0.99]"
                  data-ocid={`dashboard.news.item.${i + 1}`}
                  onClick={() => setSelectedNews(item)}
                >
                  {/* Photo or gradient placeholder */}
                  <div
                    className="w-20 flex-shrink-0 relative"
                    style={{
                      background: item.photo
                        ? undefined
                        : NEWS_GRADIENTS[i % NEWS_GRADIENTS.length],
                    }}
                  >
                    {item.photo ? (
                      <img
                        src={item.photo.getDirectURL()}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Newspaper className="w-6 h-6 text-white/20" />
                      </div>
                    )}
                  </div>
                  {/* Text content */}
                  <div className="flex-1 px-3 py-2.5 min-w-0">
                    <p className="font-semibold text-xs text-foreground line-clamp-2 leading-tight">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                      {item.body.length > 80
                        ? `${item.body.slice(0, 80)}...`
                        : item.body}
                    </p>
                    <p
                      className="text-[10px] mt-1.5 font-medium"
                      style={{ color: "oklch(0.6 0.22 24)" }}
                    >
                      {timeAgo(item.timestamp)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            data-ocid="dashboard.upcoming.list"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide">
                Upcoming
              </h2>
              <button
                type="button"
                className="text-xs text-primary font-medium flex items-center gap-1"
                onClick={() => navigate({ to: "/matches" })}
              >
                All fixtures <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {upcomingMatches.map((match) => {
                const home = MOCK_TEAMS.find(
                  (t) => t.teamId === match.homeTeamId,
                )!;
                const away = MOCK_TEAMS.find(
                  (t) => t.teamId === match.awayTeamId,
                )!;
                return (
                  <MatchCard
                    key={match.matchId}
                    match={match}
                    homeTeam={home}
                    awayTeam={away}
                    compact
                    onClick={() => navigate({ to: "/matches" })}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* News detail Sheet */}
      <Sheet
        open={!!selectedNews}
        onOpenChange={(open) => {
          if (!open) setSelectedNews(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="max-h-[85vh] overflow-y-auto rounded-t-2xl"
          data-ocid="dashboard.news.sheet"
        >
          {selectedNews && (
            <>
              {selectedNews.photo && (
                <div className="w-full h-48 rounded-xl overflow-hidden mb-4 -mt-2">
                  <img
                    src={selectedNews.photo.getDirectURL()}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {!selectedNews.photo && (
                <div
                  className="w-full h-32 rounded-xl mb-4 -mt-2 flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.25 0.08 252) 0%, oklch(0.15 0.04 255) 100%)",
                  }}
                >
                  <Newspaper className="w-10 h-10 text-white/20" />
                </div>
              )}
              <SheetHeader className="mb-3">
                <SheetTitle className="font-display text-left text-lg leading-tight">
                  {selectedNews.title}
                </SheetTitle>
              </SheetHeader>
              <p
                className="text-xs font-medium mb-3"
                style={{ color: "oklch(0.6 0.22 24)" }}
              >
                {timeAgo(selectedNews.timestamp)}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {selectedNews.body}
              </p>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
