import { TeamBadge } from "@/components/shared/TeamBadge";
import {
  MOCK_MATCHES,
  MOCK_PLAYERS,
  MOCK_TEAMS,
  formatMatchDate,
  formatTime,
} from "@/data/mockData";
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
  ChevronLeft,
  Clock,
  Flag,
  Info,
  MapPin,
  Square,
  Target,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

type CommentaryType =
  | "goal"
  | "yellow_card"
  | "red_card"
  | "kickoff"
  | "halftime"
  | "fulltime"
  | "substitution"
  | "info";

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

export function MatchdayPage() {
  const { matchId } = useParams({ strict: false }) as { matchId: string };
  const navigate = useNavigate();

  const match =
    MOCK_MATCHES.find((m) => m.matchId === matchId) || MOCK_MATCHES[5]; // default to live
  const homeTeam = MOCK_TEAMS.find((t) => t.teamId === match.homeTeamId)!;
  const awayTeam = MOCK_TEAMS.find((t) => t.teamId === match.awayTeamId)!;
  const mvpPlayer = match.mvpPlayerId
    ? MOCK_PLAYERS.find((p) => p.playerId === match.mvpPlayerId)
    : null;
  const mvpTeam = mvpPlayer
    ? MOCK_TEAMS.find((t) => t.teamId === mvpPlayer.teamId)
    : null;

  const isLive = match.status === "live";
  const isPlayed = match.status === "played";

  // Referee lookup
  const matchRefereeMap = getMatchReferees();
  const allReferees = getReferees();
  const assignedRefereeId = matchRefereeMap[match.matchId];
  const assignedReferee = assignedRefereeId
    ? allReferees.find((r) => r.refereeId === assignedRefereeId)
    : null;

  // Pitch lookup
  const matchPitchMap = getMatchPitches();
  const allPitches = getPitches();
  const assignedPitchId = matchPitchMap[match.matchId];
  const assignedPitch = assignedPitchId
    ? allPitches.find((p) => p.pitchId === assignedPitchId)
    : null;

  const reversedCommentary = [...match.commentary].reverse();

  return (
    <div data-ocid="matchday.page" className="min-h-screen pb-24 pt-14">
      {/* Back */}
      <button
        type="button"
        className="fixed top-14 left-0 z-40 flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors bg-card/80 backdrop-blur-sm"
        onClick={() => navigate({ to: "/matches" })}
      >
        <ChevronLeft className="w-4 h-4" />
        Matches
      </button>

      {/* Score hero */}
      <div
        className="pt-8 pb-8 px-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${homeTeam.color}40 0%, oklch(0.1 0.04 252) 40%, ${awayTeam.color}40 100%)`,
        }}
        data-ocid="matchday.score.card"
      >
        {/* Status badge */}
        <div className="flex justify-center mb-4">
          {isLive && (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 border border-accent/40">
              <span className="live-indicator w-2 h-2 rounded-full bg-accent" />
              <span className="font-bold text-sm text-accent tracking-widest uppercase">
                Live
              </span>
              <span className="text-xs text-muted-foreground">
                {match.commentary.length > 0
                  ? `${match.commentary[match.commentary.length - 1].minute}'`
                  : ""}
              </span>
            </div>
          )}
          {isPlayed && (
            <div className="px-4 py-1.5 rounded-full bg-muted/40 border border-border">
              <span className="font-bold text-sm text-muted-foreground uppercase tracking-widest">
                Full Time
              </span>
            </div>
          )}
          {match.status === "scheduled" && (
            <div className="px-4 py-1.5 rounded-full bg-primary/20 border border-primary/40">
              <span className="font-bold text-sm text-primary uppercase tracking-widest">
                Upcoming
              </span>
            </div>
          )}
        </div>

        {/* Teams + Score */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center justify-between gap-2"
        >
          {/* Home */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamBadge team={homeTeam} size="xl" />
            <span className="font-display font-bold text-sm text-foreground text-center leading-tight">
              {homeTeam.name}
            </span>
            <span className="text-xs text-muted-foreground">HOME</span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center flex-shrink-0 px-4">
            {isLive || isPlayed ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <span className="font-black font-stats text-6xl text-foreground">
                  {match.homeScore}
                </span>
                <span className="text-3xl text-muted-foreground font-light">
                  —
                </span>
                <span className="font-black font-stats text-6xl text-foreground">
                  {match.awayScore}
                </span>
              </motion.div>
            ) : (
              <span className="font-black font-stats text-4xl text-muted-foreground">
                VS
              </span>
            )}
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamBadge team={awayTeam} size="xl" />
            <span className="font-display font-bold text-sm text-foreground text-center leading-tight">
              {awayTeam.name}
            </span>
            <span className="text-xs text-muted-foreground">AWAY</span>
          </div>
        </motion.div>

        {/* MVP */}
        {mvpPlayer && mvpTeam && (
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
              <TeamBadge team={mvpTeam} size="xs" />
            </div>
          </motion.div>
        )}

        {/* Match Meta: Date, Time, Referee */}
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
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>KO {formatTime(match.date)}</span>
          </div>
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

      {/* Matchday Stories Commentary */}
      {match.commentary.length > 0 && (
        <div className="px-4 mt-5">
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <span className="text-base">📲</span>
            Matchday Stories
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
                  className={`rounded-xl p-3 border flex items-start gap-3 ${CommentaryBg(entry.type as CommentaryType)}`}
                >
                  {/* Minute */}
                  <div className="flex-shrink-0 w-8 text-center">
                    <span className="font-black font-stats text-xs text-muted-foreground">
                      {entry.minute}'
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <CommentaryIcon type={entry.type as CommentaryType} />
                  </div>

                  {/* Text */}
                  <p
                    className={`text-sm flex-1 leading-relaxed ${
                      entry.type === "goal"
                        ? "font-bold text-foreground"
                        : entry.type === "fulltime" || entry.type === "halftime"
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

      {match.commentary.length === 0 && match.status === "scheduled" && (
        <div className="px-4 mt-8 text-center">
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
    </div>
  );
}
