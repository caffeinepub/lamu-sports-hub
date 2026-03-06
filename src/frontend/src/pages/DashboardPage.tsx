import type { ExternalBlob } from "@/backend";
import { type T__1 as BackendTeam, Position, Role } from "@/backend";
import { MatchCard } from "@/components/shared/MatchCard";
import { OfficialAccessModal } from "@/components/shared/OfficialAccessModal";
import { AreaBadge, TeamBadge } from "@/components/shared/TeamBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  MOCK_MATCHES,
  MOCK_PLAYERS,
  MOCK_TEAMS,
  computeStandings,
} from "@/data/mockData";
import { useActor } from "@/hooks/useActor";
import {
  LSH_SYSTEM_STATUS_KEY,
  type NewsConfirmation,
  type SystemStatus,
  getLocalStore,
  getNewsConfirmations,
  getUserSettings,
} from "@/utils/localStore";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart2,
  Calendar,
  CheckCircle,
  ChevronRight,
  Compass,
  FilePlus,
  Loader2,
  Newspaper,
  RefreshCw,
  Shield,
  Star,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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

const positionMap: Record<string, Position> = {
  goalkeeper: Position.goalkeeper,
  defender: Position.defender,
  midfielder: Position.midfielder,
  forward: Position.forward,
};

const AREAS = [
  "Shela",
  "Hindi",
  "Mkunguni",
  "Langoni",
  "Mkomani",
  "Lamu Town",
] as const;

export function DashboardPage({
  favoriteTeamId,
  userName,
  role,
}: DashboardPageProps) {
  const navigate = useNavigate();
  const { actor } = useActor();
  const standings = computeStandings();
  const isAdmin = role === "admin";

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

  // System status banner
  const systemStatus = getLocalStore<SystemStatus>(LSH_SYSTEM_STATUS_KEY, {
    isActive: false,
    message: "",
  });
  const [showBanner, setShowBanner] = useState(
    systemStatus.isActive && !!systemStatus.message,
  );

  // Admin quick-action dialog state
  const [showAdminAddTeam, setShowAdminAddTeam] = useState(false);
  const [showAdminAddPlayer, setShowAdminAddPlayer] = useState(false);
  const [showAdminAddNews, setShowAdminAddNews] = useState(false);

  // News state
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [newsConfirmations, _setNewsConfirmations] =
    useState<Record<string, NewsConfirmation>>(getNewsConfirmations);

  // Keep a stable ref to actor for use inside interval callback
  const actorRef = useRef(actor);
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);

  const fetchNews = useCallback(() => {
    const currentActor = actorRef.current;
    if (!currentActor) return;
    setNewsLoading(true);
    currentActor
      .getAllNews()
      .then((items) => {
        // Backend already filters published, just take latest 3
        setNewsList((items as NewsItem[]).slice(0, 3));
        setNewsError(null);
      })
      .catch((err) => {
        console.error("Failed to load news:", err);
        setNewsError("Could not load news. Tap Refresh to try again.");
      })
      .finally(() => {
        setNewsLoading(false);
      });
  }, []);

  // Watch actor directly — triggers as soon as actor becomes available
  useEffect(() => {
    if (!actor) return;
    setNewsLoading(true);
    actor
      .getAllNews()
      .then((items) => {
        setNewsList((items as NewsItem[]).slice(0, 3));
        setNewsError(null);
      })
      .catch((err) => {
        console.error("Failed to load news on mount:", err);
        setNewsError("Could not load news. Tap Refresh to try again.");
      })
      .finally(() => {
        setNewsLoading(false);
      });
  }, [actor]);

  // Poll every 15 seconds so news posted by admin appears automatically
  useEffect(() => {
    if (!actor) return;
    const intervalId = setInterval(() => {
      const currentActor = actorRef.current;
      if (!currentActor) return;
      currentActor
        .getAllNews()
        .then((items) => {
          setNewsList((items as NewsItem[]).slice(0, 3));
          setNewsError(null);
        })
        .catch((err) => {
          console.error("News polling error:", err);
        });
    }, 15000);
    return () => clearInterval(intervalId);
  }, [actor]);

  return (
    <div data-ocid="dashboard.page" className="min-h-screen pb-24 pt-14">
      {/* System Status Banner */}
      <AnimatePresence>
        {showBanner && systemStatus.isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            data-ocid="dashboard.status_banner.panel"
          >
            <div
              className="flex items-center gap-3 px-4 py-2.5"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.45 0.14 50) 0%, oklch(0.4 0.16 48) 100%)",
              }}
            >
              <AlertTriangle className="w-4 h-4 text-yellow-300 flex-shrink-0" />
              <p className="text-xs text-yellow-100 flex-1 font-medium">
                {systemStatus.message}
              </p>
              <button
                type="button"
                onClick={() => setShowBanner(false)}
                className="text-yellow-200 hover:text-white transition-colors flex-shrink-0"
                data-ocid="dashboard.status_banner.close_button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Official Controls Quick-Launch — admin only */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-4 pt-3"
          data-ocid="dashboard.official_controls.panel"
        >
          <div
            className="rounded-xl p-3 border flex flex-wrap items-center gap-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.18 0.06 252 / 0.8) 0%, oklch(0.14 0.05 252 / 0.8) 100%)",
              borderColor: "oklch(0.38 0.1 252 / 0.5)",
            }}
          >
            <div className="flex items-center gap-2 mr-1">
              <Shield
                className="w-4 h-4"
                style={{ color: "oklch(0.65 0.12 252)" }}
              />
              <span className="text-xs font-bold text-foreground">
                Official Controls
              </span>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
              style={{
                background: "oklch(0.3 0.1 252 / 0.5)",
                color: "oklch(0.8 0.08 252)",
                border: "1px solid oklch(0.4 0.1 252 / 0.4)",
              }}
              onClick={() => setShowAdminAddTeam(true)}
              data-ocid="dashboard.official.add_team.button"
            >
              <Users className="w-3.5 h-3.5" />
              Add Team
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
              style={{
                background: "oklch(0.28 0.1 155 / 0.4)",
                color: "oklch(0.65 0.15 155)",
                border: "1px solid oklch(0.4 0.12 155 / 0.4)",
              }}
              onClick={() => setShowAdminAddPlayer(true)}
              data-ocid="dashboard.official.add_player.button"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Player
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
              style={{
                background: "oklch(0.3 0.1 24 / 0.3)",
                color: "oklch(0.65 0.2 24)",
                border: "1px solid oklch(0.4 0.12 24 / 0.4)",
              }}
              onClick={() => setShowAdminAddNews(true)}
              data-ocid="dashboard.official.add_news.button"
            >
              <FilePlus className="w-3.5 h-3.5" />
              Post News
            </button>
          </div>
        </motion.div>
      )}

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

      {/* Quick Links Bar */}
      <div className="overflow-x-auto scrollbar-hide mt-3 mb-1">
        <div className="flex gap-2 px-4 pb-1 min-w-max">
          {[
            {
              label: "Standings",
              icon: <BarChart2 className="w-4 h-4" />,
              to: "/standings",
            },
            {
              label: "Matches",
              icon: <Calendar className="w-4 h-4" />,
              to: "/matches",
            },
            {
              label: "Leaderboard",
              icon: <Trophy className="w-4 h-4" />,
              to: "/leaderboard",
            },
            {
              label: "Awards",
              icon: <Award className="w-4 h-4" />,
              to: "/awards",
            },
            {
              label: "Explore",
              icon: <Compass className="w-4 h-4" />,
              to: "/explore",
            },
            {
              label: "Officials",
              icon: <Shield className="w-4 h-4" />,
              to: "/officials",
            },
          ].map((item) => (
            <button
              key={item.to}
              type="button"
              onClick={() => navigate({ to: item.to })}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all whitespace-nowrap flex-shrink-0"
              data-ocid={"dashboard.quicklink.button"}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
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

        {/* Favourite Player */}
        {(() => {
          const settings = getUserSettings();
          const favPlayer = settings.favoritePlayerId
            ? MOCK_PLAYERS.find((p) => p.playerId === settings.favoritePlayerId)
            : null;
          const favPlayerTeam = favPlayer
            ? MOCK_TEAMS.find((t) => t.teamId === favPlayer.teamId)
            : null;
          if (!favPlayer || !favPlayerTeam) return null;
          return (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.18 }}
              data-ocid="dashboard.fav_player.card"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400" />
                  Favourite Player
                </h2>
                <button
                  type="button"
                  className="text-xs text-primary font-medium flex items-center gap-1"
                  onClick={() =>
                    navigate({ to: `/players/${favPlayer.playerId}` })
                  }
                  data-ocid="dashboard.fav_player.link"
                >
                  Profile <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <button
                type="button"
                className="w-full rounded-xl p-4 border border-border bg-card hover:border-primary/40 transition-all text-left"
                style={{
                  background: `linear-gradient(135deg, ${favPlayerTeam.color}22 0%, oklch(0.16 0.04 255) 70%)`,
                }}
                onClick={() =>
                  navigate({ to: `/players/${favPlayer.playerId}` })
                }
                data-ocid="dashboard.fav_player.button"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black font-stats flex-shrink-0"
                    style={{
                      backgroundColor: favPlayerTeam.color,
                      color: favPlayerTeam.secondaryColor,
                    }}
                  >
                    {favPlayer.jerseyNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-foreground">
                      {favPlayer.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      "{favPlayer.nickname}"
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <TeamBadge team={favPlayerTeam} size="xs" />
                      <span className="text-xs text-muted-foreground capitalize">
                        {favPlayer.position}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 text-right flex-shrink-0">
                    <div>
                      <div
                        className="font-black font-stats text-xl"
                        style={{ color: "oklch(0.6 0.22 24)" }}
                      >
                        {favPlayer.goals}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Goals
                      </div>
                    </div>
                    <div>
                      <div className="font-black font-stats text-xl text-primary">
                        {favPlayer.assists}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Assists
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })()}

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
            <button
              type="button"
              onClick={fetchNews}
              disabled={newsLoading}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              data-ocid="dashboard.news.refresh_button"
              title="Refresh news"
            >
              <RefreshCw
                className={`w-3 h-3 ${newsLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>

          {newsError && !newsLoading && (
            <div
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 flex items-center gap-2 mb-2"
              data-ocid="dashboard.news.error_state"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-300 flex-1">{newsError}</p>
              <button
                type="button"
                onClick={fetchNews}
                className="text-xs text-red-300 hover:text-red-200 font-semibold underline flex-shrink-0"
                data-ocid="dashboard.news.retry_button"
              >
                Retry
              </button>
            </div>
          )}
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
          ) : newsList.length === 0 && !newsError ? (
            <div
              className="rounded-xl border border-border bg-card py-8 flex flex-col items-center gap-2 text-center"
              data-ocid="dashboard.news.empty_state"
            >
              <Newspaper className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">
                No published news yet. Check back soon.
              </p>
            </div>
          ) : newsList.length > 0 ? (
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
                    <div className="flex items-start gap-1.5">
                      <p className="font-semibold text-xs text-foreground line-clamp-2 leading-tight flex-1">
                        {item.title}
                      </p>
                      {newsConfirmations[item.newsId] && (
                        <span
                          className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                          style={{
                            backgroundColor: "oklch(0.55 0.18 145 / 0.15)",
                            color: "oklch(0.65 0.18 145)",
                            border: "1px solid oklch(0.55 0.18 145 / 0.4)",
                          }}
                          title={`Confirmed by ${newsConfirmations[item.newsId].confirmedBy}`}
                        >
                          <CheckCircle className="w-2.5 h-2.5" />
                          Official
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                      {item.body.length > 80
                        ? `${item.body.slice(0, 80)}...`
                        : item.body}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <p
                        className="text-[10px] font-medium"
                        style={{ color: "oklch(0.6 0.22 24)" }}
                      >
                        {timeAgo(item.timestamp)}
                      </p>
                      {newsConfirmations[item.newsId] && (
                        <p className="text-[10px] text-muted-foreground/60">
                          · by {newsConfirmations[item.newsId].confirmedBy}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
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
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <p
                  className="text-xs font-medium"
                  style={{ color: "oklch(0.6 0.22 24)" }}
                >
                  {timeAgo(selectedNews.timestamp)}
                </p>
                {newsConfirmations[selectedNews.newsId] && (
                  <span
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: "oklch(0.55 0.18 145 / 0.15)",
                      color: "oklch(0.65 0.18 145)",
                      border: "1px solid oklch(0.55 0.18 145 / 0.4)",
                    }}
                  >
                    <CheckCircle className="w-3 h-3" />
                    Officially Confirmed by{" "}
                    {newsConfirmations[selectedNews.newsId].confirmedBy}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {selectedNews.body}
              </p>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Admin Quick-Action: Add Team */}
      {isAdmin && (
        <DashboardAddTeamDialog
          open={showAdminAddTeam}
          onOpenChange={setShowAdminAddTeam}
        />
      )}
      {/* Admin Quick-Action: Add Player */}
      {isAdmin && (
        <DashboardAddPlayerDialog
          open={showAdminAddPlayer}
          onOpenChange={setShowAdminAddPlayer}
        />
      )}
      {/* Admin Quick-Action: Post News */}
      {isAdmin && (
        <DashboardAddNewsDialog
          open={showAdminAddNews}
          onOpenChange={setShowAdminAddNews}
        />
      )}
    </div>
  );
}

// ── Dashboard Admin Quick-Action Dialogs ──────────────────────────────────────

function DashboardAddTeamDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setName("");
    setArea("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !area) {
      toast.error("Team name and area are required.");
      return;
    }
    setLoading(true);
    try {
      await actor?.createTeam(name.trim(), area);
      toast.success(`${name} registered!`);
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to add team. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) {
          if (!v) reset();
          onOpenChange(v);
        }
      }}
    >
      <DialogContent
        className="max-w-sm mx-auto rounded-2xl"
        data-ocid="dashboard.add_team.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <Users className="w-5 h-5 text-primary" />
            Add Team
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <Label htmlFor="dt-name">Team Name *</Label>
            <Input
              id="dt-name"
              placeholder="e.g. Shela United FC"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="dashboard.add_team.input"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dt-area">Area *</Label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger id="dt-area" data-ocid="dashboard.add_team.select">
                <SelectValue placeholder="Select area…" />
              </SelectTrigger>
              <SelectContent>
                {AREAS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={loading}
              data-ocid="dashboard.add_team.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
              data-ocid="dashboard.add_team.submit_button"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add Team"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DashboardAddPlayerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [position, setPosition] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<BackendTeam[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  useEffect(() => {
    if (!open || !actor) return;
    setTeamsLoading(true);
    actor
      .getAllTeams()
      .then((t) => setTeams(t))
      .catch(() => setTeams([]))
      .finally(() => setTeamsLoading(false));
  }, [open, actor]);

  function reset() {
    setName("");
    setTeamId("");
    setPosition("");
    setJerseyNumber("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !teamId || !position) {
      toast.error("Name, team, and position are required.");
      return;
    }
    const posEnum = positionMap[position];
    if (!posEnum) {
      toast.error("Invalid position.");
      return;
    }
    setLoading(true);
    try {
      await actor?.adminAddPlayer(
        teamId,
        "",
        name.trim(),
        posEnum,
        BigInt(jerseyNumber || 0),
      );
      toast.success("Player registered!");
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to register player.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) {
          if (!v) reset();
          onOpenChange(v);
        }
      }}
    >
      <DialogContent
        className="max-w-sm mx-auto rounded-2xl"
        data-ocid="dashboard.add_player.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <UserPlus className="w-5 h-5 text-primary" />
            Register Player
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <Label htmlFor="dp-name">Full Name *</Label>
            <Input
              id="dp-name"
              placeholder="e.g. Hassan Mwende"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="dashboard.add_player.input"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Team *</Label>
            {teamsLoading ? (
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input text-sm text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading…
              </div>
            ) : teams.length === 0 ? (
              <div className="flex items-center h-10 px-3 rounded-md border border-destructive/40 bg-destructive/5 text-xs text-destructive">
                No teams found. Add a team first.
              </div>
            ) : (
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger data-ocid="dashboard.add_player.select">
                  <SelectValue placeholder="Select team…" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.teamId} value={t.teamId}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Position *</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger data-ocid="dashboard.add_player.select">
                <SelectValue placeholder="Select position…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                <SelectItem value="defender">Defender</SelectItem>
                <SelectItem value="midfielder">Midfielder</SelectItem>
                <SelectItem value="forward">Forward</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dp-jersey">Jersey Number</Label>
            <Input
              id="dp-jersey"
              type="number"
              min={1}
              max={99}
              placeholder="10"
              value={jerseyNumber}
              onChange={(e) => setJerseyNumber(e.target.value)}
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={loading}
              data-ocid="dashboard.add_player.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
              data-ocid="dashboard.add_player.submit_button"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Register"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DashboardAddNewsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { actor } = useActor();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(false);

  function reset() {
    setTitle("");
    setBody("");
    setIsPublished(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required.");
      return;
    }
    setLoading(true);
    try {
      await actor?.createNews(title.trim(), body.trim(), isPublished);
      toast.success(isPublished ? "News published!" : "Saved as draft.");
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to publish. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) {
          if (!v) reset();
          onOpenChange(v);
        }
      }}
    >
      <DialogContent
        className="max-w-sm mx-auto rounded-2xl"
        data-ocid="dashboard.add_news.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <FilePlus className="w-5 h-5 text-primary" />
            Post News
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <Label htmlFor="dn-title">Title *</Label>
            <Input
              id="dn-title"
              placeholder="e.g. Shela United Win Derby 3-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-ocid="dashboard.add_news.input"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dn-body">Story *</Label>
            <Textarea
              id="dn-body"
              placeholder="Write the full story…"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              data-ocid="dashboard.add_news.textarea"
              required
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Publish immediately</p>
              <p className="text-xs text-muted-foreground">
                Off = save as draft
              </p>
            </div>
            <Switch
              checked={isPublished}
              onCheckedChange={setIsPublished}
              data-ocid="dashboard.add_news.switch"
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={loading}
              data-ocid="dashboard.add_news.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
              data-ocid="dashboard.add_news.submit_button"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPublished ? (
                "Publish"
              ) : (
                "Save Draft"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
