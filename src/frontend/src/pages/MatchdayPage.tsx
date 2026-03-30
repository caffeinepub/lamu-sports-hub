import type {
  T__5 as BackendMatch,
  T__2 as BackendPlayer,
  T__1 as BackendTeam,
} from "@/backend";
import { TeamBadge } from "@/components/shared/TeamBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import {
  getMatchPitches,
  getMatchReferees,
  getPitches,
  getReferees,
} from "@/utils/localStore";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Flag,
  Info,
  Loader2,
  MapPin,
  Square,
  Target,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type CommentaryType =
  | "goal"
  | "yellow_card"
  | "red_card"
  | "kickoff"
  | "halftime"
  | "fulltime"
  | "substitution"
  | "info";

function parseCommentaryType(line: string): CommentaryType {
  const lower = line.toLowerCase();
  if (lower.includes("goal") || lower.includes("⚽")) return "goal";
  if (lower.includes("yellow") || lower.includes("🟨")) return "yellow_card";
  if (lower.includes("red card") || lower.includes("🟥")) return "red_card";
  if (
    lower.includes("kick off") ||
    lower.includes("kickoff") ||
    lower.includes("🏁")
  )
    return "kickoff";
  if (
    lower.includes("half time") ||
    lower.includes("halftime") ||
    lower.includes("half-time")
  )
    return "halftime";
  if (
    lower.includes("full time") ||
    lower.includes("fulltime") ||
    lower.includes("full-time") ||
    lower.includes("final")
  )
    return "fulltime";
  if (lower.includes("sub") || lower.includes("substitut"))
    return "substitution";
  return "info";
}

function parseMinute(line: string): string {
  const match = line.match(/^(\d+)['\u2032\s]/);
  return match ? match[1] : "–";
}

function stripMinutePrefix(line: string): string {
  return line.replace(/^\d+['\u2032\s]+/, "").trim();
}

function CommentaryIcon({ type }: { type: CommentaryType }) {
  const map: Record<CommentaryType, React.ReactNode> = {
    goal: <Target className="w-4 h-4 text-green-400" />,
    yellow_card: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
    red_card: <Square className="w-4 h-4 text-red-500" />,
    kickoff: <Flag className="w-4 h-4 text-primary" />,
    halftime: <Clock className="w-4 h-4 text-orange-400" />,
    fulltime: <Clock className="w-4 h-4 text-foreground" />,
    substitution: <Info className="w-4 h-4 text-blue-400" />,
    info: <Info className="w-4 h-4 text-muted-foreground" />,
  };
  return <>{map[type] || <Info className="w-4 h-4 text-muted-foreground" />}</>;
}

function CommentaryBg(type: CommentaryType): string {
  const map: Record<CommentaryType, string> = {
    goal: "bg-green-500/10 border-green-500/30",
    yellow_card: "bg-yellow-500/10 border-yellow-500/30",
    red_card: "bg-red-500/10 border-red-500/30",
    kickoff: "bg-primary/10 border-primary/30",
    halftime: "bg-orange-500/10 border-orange-500/30",
    fulltime: "bg-muted/20 border-border",
    substitution: "bg-blue-500/10 border-blue-500/30",
    info: "bg-card border-border/50",
  };
  return map[type] || "bg-card border-border/50";
}

function formatMatchDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTeamColor(teamId: string): string {
  const colors = [
    "oklch(0.55 0.18 252)",
    "oklch(0.55 0.18 145)",
    "oklch(0.6 0.22 24)",
    "oklch(0.55 0.15 82)",
    "oklch(0.55 0.18 300)",
    "oklch(0.55 0.18 200)",
  ];
  const idx =
    Math.abs(
      (teamId.charCodeAt(0) ?? 0) + (teamId.charCodeAt(teamId.length - 1) ?? 0),
    ) % colors.length;
  return colors[idx];
}

// ── Mock Lineup Data ────────────────────────────────────────────────────────
type LineupPlayer = {
  number: number;
  name: string;
  position: string;
  rating: number;
  events: ("goal" | "yellow" | "red" | "sub")[];
};

function generateLineup(
  _teamName: string,
  side: "home" | "away",
): LineupPlayer[] {
  const names =
    side === "home"
      ? [
          "Ali Hassan",
          "Farid Omar",
          "Juma Said",
          "Khalid Mwana",
          "Rashid Bwana",
          "Salim Kikoi",
          "Omar Bahari",
          "Hamid Pwani",
          "Yusuf Kiunga",
          "Ahmed Mzee",
          "Bakari Lamu",
        ]
      : [
          "Musa Konde",
          "Suleiman Rao",
          "Ibrahim Tana",
          "Harun Pate",
          "Nassir Shela",
          "Kasim Matondoni",
          "Talib Hindi",
          "Feisal Siyu",
          "Abubakar Amu",
          "Hassan Witu",
          "Yahya Manda",
        ];
  const positions = [
    "GK",
    "RB",
    "CB",
    "CB",
    "LB",
    "CDM",
    "CDM",
    "CAM",
    "RW",
    "CF",
    "LW",
  ];
  const ratings = [6.8, 7.1, 6.9, 7.3, 6.7, 7.5, 7.2, 8.1, 7.8, 9.0, 7.6];
  // Give the striker some events for demo
  return names.map((name, i) => ({
    number: i + 1,
    name,
    position: positions[i],
    rating: ratings[i] + (Math.random() * 0.4 - 0.2),
    events:
      i === 9 && side === "home"
        ? ["goal"]
        : i === 7 && side === "away"
          ? ["yellow"]
          : [],
  }));
}

function ratingColor(r: number): string {
  if (r >= 9) return "bg-green-500 text-white";
  if (r >= 7) return "bg-amber-400 text-white";
  if (r >= 5) return "bg-orange-500 text-white";
  return "bg-red-600 text-white";
}

// ── Mock Momentum Data ──────────────────────────────────────────────────────
function generateMomentum() {
  return Array.from({ length: 91 }, (_, minute) => {
    const base = Math.sin(minute * 0.12) * 0.5 + Math.sin(minute * 0.07) * 0.3;
    const noise = (Math.random() - 0.5) * 0.3;
    const value = Math.max(-1, Math.min(1, base + noise));
    return {
      minute,
      home: value > 0 ? value : 0,
      away: value < 0 ? -value : 0,
    };
  });
}

// ── Mock Shot Data ──────────────────────────────────────────────────────────
type ShotData = {
  id: string;
  team: "home" | "away";
  x: number; // 0-100 of pitch width
  y: number; // 0-100 of pitch height (0 = own half, 100 = attacking goal)
  xG: number;
  xGOT: number;
  foot: "Left" | "Right";
  situation: "Regular play" | "Set piece" | "Counter attack";
  result: "Goal" | "Saved" | "Off target";
  minute: number;
};

const MOCK_SHOTS: ShotData[] = [
  {
    id: "s1",
    team: "home",
    x: 48,
    y: 85,
    xG: 0.99,
    xGOT: 1.0,
    foot: "Left",
    situation: "Regular play",
    result: "Goal",
    minute: 32,
  },
  {
    id: "s2",
    team: "home",
    x: 55,
    y: 78,
    xG: 0.31,
    xGOT: 0.55,
    foot: "Right",
    situation: "Regular play",
    result: "Saved",
    minute: 44,
  },
  {
    id: "s3",
    team: "home",
    x: 35,
    y: 72,
    xG: 0.12,
    xGOT: 0.0,
    foot: "Right",
    situation: "Regular play",
    result: "Off target",
    minute: 61,
  },
  {
    id: "s4",
    team: "home",
    x: 62,
    y: 80,
    xG: 0.45,
    xGOT: 0.7,
    foot: "Right",
    situation: "Set piece",
    result: "Saved",
    minute: 74,
  },
  {
    id: "s5",
    team: "home",
    x: 50,
    y: 90,
    xG: 0.22,
    xGOT: 0.3,
    foot: "Left",
    situation: "Regular play",
    result: "Saved",
    minute: 82,
  },
  {
    id: "s6",
    team: "home",
    x: 40,
    y: 65,
    xG: 0.08,
    xGOT: 0.0,
    foot: "Right",
    situation: "Regular play",
    result: "Off target",
    minute: 88,
  },
  {
    id: "s7",
    team: "away",
    x: 52,
    y: 20,
    xG: 0.18,
    xGOT: 0.25,
    foot: "Right",
    situation: "Counter attack",
    result: "Saved",
    minute: 18,
  },
  {
    id: "s8",
    team: "away",
    x: 45,
    y: 18,
    xG: 0.09,
    xGOT: 0.0,
    foot: "Left",
    situation: "Regular play",
    result: "Off target",
    minute: 55,
  },
  {
    id: "s9",
    team: "away",
    x: 58,
    y: 22,
    xG: 0.15,
    xGOT: 0.2,
    foot: "Right",
    situation: "Set piece",
    result: "Saved",
    minute: 67,
  },
];

// ── Pitch SVG ───────────────────────────────────────────────────────────────
function PitchSVG({
  shots,
  selectedShot,
  onSelectShot,
}: {
  shots: ShotData[];
  selectedShot: ShotData | null;
  onSelectShot: (shot: ShotData | null) => void;
}) {
  const W = 300;
  const H = 440;

  const toSVG = (x: number, y: number) => ({
    cx: (x / 100) * W,
    cy: H - (y / 100) * H,
  });

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="mx-auto rounded-xl overflow-hidden"
      role="img"
      aria-label="Shot map pitch view"
    >
      <title>Shot map pitch view</title>
      {/* Pitch background */}
      <rect width={W} height={H} fill="#2d5a27" rx={8} />
      {/* Center circle */}
      <circle
        cx={W / 2}
        cy={H / 2}
        r={40}
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1.5}
      />
      {/* Halfway line */}
      <line
        x1={0}
        y1={H / 2}
        x2={W}
        y2={H / 2}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1.5}
      />
      {/* Top penalty area */}
      <rect
        x={W * 0.2}
        y={0}
        width={W * 0.6}
        height={H * 0.18}
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1.5}
      />
      {/* Bottom penalty area */}
      <rect
        x={W * 0.2}
        y={H - H * 0.18}
        width={W * 0.6}
        height={H * 0.18}
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1.5}
      />
      {/* Top goal */}
      <rect
        x={W * 0.35}
        y={0}
        width={W * 0.3}
        height={H * 0.035}
        fill="rgba(255,255,255,0.15)"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth={1.5}
      />
      {/* Bottom goal */}
      <rect
        x={W * 0.35}
        y={H - H * 0.035}
        width={W * 0.3}
        height={H * 0.035}
        fill="rgba(255,255,255,0.15)"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth={1.5}
      />
      {/* Outer border */}
      <rect
        x={1}
        y={1}
        width={W - 2}
        height={H - 2}
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={1.5}
        rx={8}
      />

      {/* Shots */}
      {shots.map((shot) => {
        const { cx, cy } = toSVG(shot.x, shot.y);
        const isSelected = selectedShot?.id === shot.id;
        const isGoal = shot.result === "Goal";
        const color = shot.team === "home" ? "#ef4444" : "#9ca3af";
        return (
          <g
            key={shot.id}
            onClick={() => onSelectShot(isSelected ? null : shot)}
            onKeyDown={(e) =>
              e.key === "Enter" && onSelectShot(isSelected ? null : shot)
            }
            style={{ cursor: "pointer" }}
            tabIndex={0}
          >
            {isGoal && (
              <circle
                cx={cx}
                cy={cy}
                r={12}
                fill="none"
                stroke="#ef4444"
                strokeWidth={2}
                opacity={0.8}
              />
            )}
            <circle
              cx={cx}
              cy={cy}
              r={isSelected ? 8 : 6}
              fill={color}
              stroke={isSelected ? "white" : "rgba(255,255,255,0.4)"}
              strokeWidth={isSelected ? 2 : 1}
              opacity={0.9}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export function MatchdayPage() {
  const { matchId } = useParams({ strict: false }) as { matchId: string };
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();

  const [match, setMatch] = useState<BackendMatch | null>(null);
  const [homeTeam, setHomeTeam] = useState<BackendTeam | null>(null);
  const [awayTeam, setAwayTeam] = useState<BackendTeam | null>(null);
  const [mvpPlayer, setMvpPlayer] = useState<BackendPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShot, setSelectedShot] = useState<ShotData | null>(null);

  const momentumData = generateMomentum();
  const homeLineup = match
    ? generateLineup(homeTeam?.name ?? "Home", "home")
    : [];
  const awayLineup = match
    ? generateLineup(awayTeam?.name ?? "Away", "away")
    : [];

  useEffect(() => {
    if (!matchId) return;
    if (isFetching) {
      const t = setTimeout(() => setLoading(false), 8000);
      return () => clearTimeout(t);
    }
    if (!actor) {
      setLoading(false);
      setError("Match data unavailable offline.");
      return;
    }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const m = await actor.getMatch(matchId);
        if (!m) {
          setError("Match not found.");
          return;
        }
        setMatch(m);
        const [home, away] = await Promise.all([
          actor.getTeam(m.homeTeam),
          actor.getTeam(m.awayTeam),
        ]);
        setHomeTeam(home ?? null);
        setAwayTeam(away ?? null);
        if (m.mvpPlayerId) {
          const mvp = await actor.getPlayer(m.mvpPlayerId);
          setMvpPlayer(mvp ?? null);
        }
      } catch (err) {
        console.error("Failed to load matchday data:", err);
        setError("Failed to load match. Please go back and try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [actor, isFetching, matchId]);

  const matchRefereeMap = getMatchReferees();
  const allReferees = getReferees();
  const assignedRefereeId = matchId ? matchRefereeMap[matchId] : undefined;
  const assignedReferee = assignedRefereeId
    ? allReferees.find((r) => r.refereeId === assignedRefereeId)
    : null;
  const matchPitchMap = getMatchPitches();
  const allPitches = getPitches();
  const assignedPitchId = matchId ? matchPitchMap[matchId] : undefined;
  const assignedPitch = assignedPitchId
    ? allPitches.find((p) => p.pitchId === assignedPitchId)
    : null;

  if (loading || isFetching) {
    return (
      <div
        className="min-h-screen pb-24 pt-14 flex flex-col items-center justify-center gap-4"
        data-ocid="matchday.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading match...</p>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div
        className="min-h-screen pb-24 pt-14 flex flex-col items-center justify-center gap-4 px-6 text-center"
        data-ocid="matchday.error_state"
      >
        <span className="text-4xl">⚽</span>
        <p className="font-bold text-foreground">
          {error ?? "Match not found."}
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/matches" })}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: "oklch(0.55 0.18 252)" }}
          data-ocid="matchday.go_back.button"
        >
          ← Back to Matches
        </button>
      </div>
    );
  }

  const statusStr = String(match.status);
  const isLive = statusStr.includes("live");
  const isPlayed = statusStr.includes("played");
  const homeColor = getTeamColor(match.homeTeam);
  const awayColor = getTeamColor(match.awayTeam);

  const homeTeamForBadge = homeTeam
    ? { teamId: homeTeam.teamId, name: homeTeam.name, area: homeTeam.area }
    : { teamId: match.homeTeam, name: match.homeTeam.slice(0, 6), area: "" };
  const awayTeamForBadge = awayTeam
    ? { teamId: awayTeam.teamId, name: awayTeam.name, area: awayTeam.area }
    : { teamId: match.awayTeam, name: match.awayTeam.slice(0, 6), area: "" };

  const commentary = (match.commentary ?? []).map((line) => ({
    type: parseCommentaryType(line),
    minute: parseMinute(line),
    text: stripMinutePrefix(line) || line,
  }));
  const reversedCommentary = [...commentary].reverse();

  return (
    <div data-ocid="matchday.page" className="min-h-screen pb-24 pt-14">
      {/* Back */}
      <button
        type="button"
        className="fixed top-14 left-0 z-40 flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors bg-card/80 backdrop-blur-sm"
        onClick={() => navigate({ to: "/matches" })}
        data-ocid="matchday.back.button"
      >
        <X className="w-4 h-4" />
        Matches
      </button>

      {/* Score hero */}
      <div
        className="pt-8 pb-8 px-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${homeColor}40 0%, oklch(0.1 0.04 252) 40%, ${awayColor}40 100%)`,
        }}
        data-ocid="matchday.score.card"
      >
        <div className="flex justify-center mb-4">
          {isLive && (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 border border-accent/40">
              <span className="live-indicator w-2 h-2 rounded-full bg-accent" />
              <span className="font-bold text-sm text-accent tracking-widest uppercase">
                Live
              </span>
              {commentary.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {commentary[commentary.length - 1].minute}'
                </span>
              )}
            </div>
          )}
          {isPlayed && (
            <div className="px-4 py-1.5 rounded-full bg-muted/40 border border-border">
              <span className="font-bold text-sm text-muted-foreground uppercase tracking-widest">
                Full Time
              </span>
            </div>
          )}
          {!isLive && !isPlayed && (
            <div className="px-4 py-1.5 rounded-full bg-primary/20 border border-primary/40">
              <span className="font-bold text-sm text-primary uppercase tracking-widest">
                Upcoming
              </span>
            </div>
          )}
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center justify-between gap-2"
        >
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamBadge team={homeTeamForBadge} size="xl" />
            <span className="font-display font-bold text-sm text-foreground text-center leading-tight">
              {homeTeam?.name ?? match.homeTeam}
            </span>
            <span className="text-xs text-muted-foreground">HOME</span>
          </div>
          <div className="flex flex-col items-center flex-shrink-0 px-4">
            {isLive || isPlayed ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <span className="font-black font-stats text-6xl text-foreground">
                  {Number(match.homeScore)}
                </span>
                <span className="text-3xl text-muted-foreground font-light">
                  —
                </span>
                <span className="font-black font-stats text-6xl text-foreground">
                  {Number(match.awayScore)}
                </span>
              </motion.div>
            ) : (
              <span className="font-black font-stats text-4xl text-muted-foreground">
                VS
              </span>
            )}
          </div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamBadge team={awayTeamForBadge} size="xl" />
            <span className="font-display font-bold text-sm text-foreground text-center leading-tight">
              {awayTeam?.name ?? match.awayTeam}
            </span>
            <span className="text-xs text-muted-foreground">AWAY</span>
          </div>
        </motion.div>

        {mvpPlayer && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-5 flex items-center justify-center gap-2"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30">
              <span className="text-yellow-400">⭐</span>
              <span className="text-xs text-yellow-400 font-bold">
                MVP: {mvpPlayer.name}
              </span>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-3"
        >
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatMatchDate(match.date)}</span>
          </div>
          {match.kickoffTime && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>KO {match.kickoffTime}</span>
            </div>
          )}
          {assignedReferee && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="w-3.5 h-3.5" />
              <span>
                Referee:{" "}
                <span className="font-medium text-foreground">
                  {assignedReferee.name}
                </span>
              </span>
            </div>
          )}
          {assignedPitch && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground">
                {assignedPitch.name}
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="live" className="px-4 pt-4">
        <TabsList
          className="w-full grid grid-cols-4 mb-4"
          data-ocid="matchday.tab"
        >
          <TabsTrigger value="live" className="text-xs">
            Live
          </TabsTrigger>
          <TabsTrigger value="lineups" className="text-xs">
            Lineups
          </TabsTrigger>
          <TabsTrigger value="momentum" className="text-xs">
            Momentum
          </TabsTrigger>
          <TabsTrigger value="shots" className="text-xs">
            Shots
          </TabsTrigger>
        </TabsList>

        {/* Live tab */}
        <TabsContent value="live">
          {commentary.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <span className="text-base">📲</span> Matchday Stories
              </h2>
              <div className="space-y-2" data-ocid="matchday.commentary.list">
                <AnimatePresence>
                  {reversedCommentary.map((entry, i) => (
                    <motion.div
                      // biome-ignore lint/suspicious/noArrayIndexKey: commentary order is stable
                      key={`commentary-${i}`}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      data-ocid={`matchday.story.item.${i + 1}`}
                      className={`rounded-xl p-3 border flex items-start gap-3 ${CommentaryBg(entry.type)}`}
                    >
                      <div className="flex-shrink-0 w-8 text-center">
                        <span className="font-black font-stats text-xs text-muted-foreground">
                          {entry.minute}'
                        </span>
                      </div>
                      <div className="flex-shrink-0 mt-0.5">
                        <CommentaryIcon type={entry.type} />
                      </div>
                      <p
                        className={`text-sm flex-1 leading-relaxed ${
                          entry.type === "goal"
                            ? "font-bold text-foreground"
                            : entry.type === "fulltime" ||
                                entry.type === "halftime"
                              ? "font-semibold text-foreground"
                              : "text-muted-foreground"
                        }`}
                      >
                        {entry.text}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
          {commentary.length === 0 && !isLive && !isPlayed && (
            <div className="text-center py-8">
              <div className="rounded-xl p-8 border border-border bg-card/50">
                <span className="text-4xl mb-3 block">⏰</span>
                <p className="font-bold text-foreground mb-1">
                  Match not started yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Live commentary will appear here once the match begins.
                </p>
              </div>
            </div>
          )}
          {commentary.length === 0 && isPlayed && (
            <div className="text-center py-8">
              <div className="rounded-xl p-8 border border-border bg-card/50">
                <span className="text-4xl mb-3 block">🏁</span>
                <p className="font-bold text-foreground mb-1">Match finished</p>
                <p className="text-sm text-muted-foreground">
                  No commentary was recorded for this match.
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Lineups tab */}
        <TabsContent value="lineups" data-ocid="matchday.lineups.panel">
          <div className="grid grid-cols-2 gap-3">
            {/* Home */}
            <div>
              <div className="text-center mb-2">
                <p className="font-bold text-xs text-foreground">
                  {homeTeam?.name ?? "Home"}
                </p>
                <p className="text-[10px] text-muted-foreground">4-2-3-1</p>
              </div>
              <div className="space-y-1.5">
                {homeLineup.map((p) => (
                  <div
                    key={p.number}
                    className="flex items-center gap-1.5 rounded-lg bg-card border border-border p-1.5"
                  >
                    <span className="text-[10px] font-black text-muted-foreground w-4 text-center">
                      {p.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-foreground truncate">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-muted-foreground">
                          {p.position}
                        </span>
                        {p.events.includes("goal") && (
                          <span className="text-[9px]">⚽</span>
                        )}
                        {p.events.includes("yellow") && (
                          <span className="text-[9px]">🟨</span>
                        )}
                        {p.events.includes("red") && (
                          <span className="text-[9px]">🟥</span>
                        )}
                        {p.events.includes("sub") && (
                          <span className="text-[9px]">↕</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-black px-1 py-0.5 rounded ${ratingColor(p.rating)}`}
                    >
                      {p.rating.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Away */}
            <div>
              <div className="text-center mb-2">
                <p className="font-bold text-xs text-foreground">
                  {awayTeam?.name ?? "Away"}
                </p>
                <p className="text-[10px] text-muted-foreground">4-3-3</p>
              </div>
              <div className="space-y-1.5">
                {awayLineup.map((p) => (
                  <div
                    key={p.number}
                    className="flex items-center gap-1.5 rounded-lg bg-card border border-border p-1.5"
                  >
                    <span className="text-[10px] font-black text-muted-foreground w-4 text-center">
                      {p.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-foreground truncate">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-muted-foreground">
                          {p.position}
                        </span>
                        {p.events.includes("goal") && (
                          <span className="text-[9px]">⚽</span>
                        )}
                        {p.events.includes("yellow") && (
                          <span className="text-[9px]">🟨</span>
                        )}
                        {p.events.includes("red") && (
                          <span className="text-[9px]">🟥</span>
                        )}
                        {p.events.includes("sub") && (
                          <span className="text-[9px]">↕</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-black px-1 py-0.5 rounded ${ratingColor(p.rating)}`}
                    >
                      {p.rating.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Momentum tab */}
        <TabsContent value="momentum" data-ocid="matchday.momentum.panel">
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                Match Momentum
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart
                  data={momentumData}
                  margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="minute"
                    tick={{ fontSize: 9, fill: "#888" }}
                    tickCount={10}
                  />
                  <YAxis domain={[0, 1]} tick={{ fontSize: 9, fill: "#888" }} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.16 0.04 255)",
                      border: "1px solid oklch(0.25 0.04 255)",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                    labelFormatter={(v) => `${v}'`}
                  />
                  <Area
                    type="monotone"
                    dataKey="home"
                    stroke="oklch(0.55 0.18 252)"
                    fill="oklch(0.55 0.18 252)"
                    fillOpacity={0.4}
                    strokeWidth={1.5}
                    name={homeTeam?.name ?? "Home"}
                  />
                  <Area
                    type="monotone"
                    dataKey="away"
                    stroke="oklch(0.6 0.22 24)"
                    fill="oklch(0.6 0.22 24)"
                    fillOpacity={0.4}
                    strokeWidth={1.5}
                    name={awayTeam?.name ?? "Away"}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-4 mt-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: "oklch(0.55 0.18 252)" }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {homeTeam?.name ?? "Home"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: "oklch(0.6 0.22 24)" }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {awayTeam?.name ?? "Away"}
                  </span>
                </div>
              </div>
            </div>

            {/* Match stats */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Match Stats
              </h3>
              {[
                { label: "Possession", home: "64%", away: "36%", homePct: 64 },
                { label: "xG", home: "3.68", away: "2.00", homePct: 65 },
                { label: "Total Shots", home: "20", away: "5", homePct: 80 },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">
                      {stat.home}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {stat.label}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {stat.away}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden flex">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${stat.homePct}%`,
                        background: "oklch(0.55 0.18 252)",
                      }}
                    />
                    <div
                      className="h-full rounded-full flex-1"
                      style={{ background: "oklch(0.6 0.22 24)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Shots tab */}
        <TabsContent value="shots" data-ocid="matchday.shots.panel">
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                Shot Map
              </h3>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-[10px] text-muted-foreground">
                    {homeTeam?.name ?? "Home"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-[10px] text-muted-foreground">
                    {awayTeam?.name ?? "Away"}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  Tap a shot for details
                </span>
              </div>
              <PitchSVG
                shots={MOCK_SHOTS}
                selectedShot={selectedShot}
                onSelectShot={setSelectedShot}
              />
            </div>

            {selectedShot ? (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="rounded-xl border border-border bg-card p-4"
                data-ocid="matchday.shot_detail.card"
              >
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wide mb-3">
                  Shot at {selectedShot.minute}'
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "xG", value: selectedShot.xG.toFixed(2) },
                    { label: "xGOT", value: selectedShot.xGOT.toFixed(2) },
                    { label: "Foot", value: selectedShot.foot },
                    { label: "Situation", value: selectedShot.situation },
                    { label: "Result", value: selectedShot.result },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg bg-muted/30 border border-border/50 px-3 py-2"
                    >
                      <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </p>
                      <p
                        className={`text-sm font-bold mt-0.5 ${
                          item.label === "Result" &&
                          selectedShot.result === "Goal"
                            ? "text-green-400"
                            : item.label === "Result"
                              ? "text-foreground"
                              : "text-foreground"
                        }`}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Tap a shot dot on the pitch to see details
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
