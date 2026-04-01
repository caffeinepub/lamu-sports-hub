import { Button } from "@/components/ui/button";
import {
  type MatchJoiner,
  addActivityEntry,
  getActivityFeed,
  getMatchJoiners,
  hasJoinedMatch,
  joinMatch,
  leaveMatch,
} from "@/utils/localStore";
import type { SimpleUserProfile } from "@/utils/simpleAuth";
import { Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface TodayMatch {
  matchId: string;
  homeName: string;
  awayName: string;
  kickoffMs: number;
  isLive: boolean;
  isPlayed: boolean;
  venue?: string;
}

interface TodayMatchesSectionProps {
  todayMatches: TodayMatch[];
  currentUser?: SimpleUserProfile | null;
  onLoginRequired?: () => void;
}

const AVATAR_COLORS = [
  "oklch(0.55 0.18 252)",
  "oklch(0.6 0.22 24)",
  "oklch(0.55 0.18 145)",
  "oklch(0.65 0.15 82)",
  "oklch(0.55 0.16 300)",
];

function getAvatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function JoinerAvatars({ joiners }: { joiners: MatchJoiner[] }) {
  const shown = joiners.slice(0, 4);
  if (shown.length === 0) return null;
  return (
    <div className="flex items-center">
      {shown.map((j, i) => (
        <div
          key={j.userId}
          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white border border-card flex-shrink-0"
          style={{
            backgroundColor: getAvatarColor(j.userName),
            marginLeft: i > 0 ? "-6px" : undefined,
            zIndex: shown.length - i,
            position: "relative",
          }}
          title={j.userName}
        >
          {j.userName.charAt(0).toUpperCase()}
        </div>
      ))}
    </div>
  );
}

function MatchJoinCard({
  match,
  currentUser,
  onLoginRequired,
}: {
  match: TodayMatch;
  currentUser?: SimpleUserProfile | null;
  onLoginRequired?: () => void;
}) {
  const userId = currentUser?.id ?? "";
  const [joiners, setJoiners] = useState<MatchJoiner[]>(() =>
    getMatchJoiners(match.matchId),
  );
  const [joined, setJoined] = useState(() =>
    userId ? hasJoinedMatch(match.matchId, userId) : false,
  );

  const handleJoin = () => {
    if (!currentUser) {
      onLoginRequired?.();
      return;
    }
    if (joined) {
      leaveMatch(match.matchId, currentUser.id);
      setJoined(false);
      setJoiners(getMatchJoiners(match.matchId));
      window.dispatchEvent(new CustomEvent("lsh:activity-updated"));
    } else {
      joinMatch(match.matchId, {
        userId: currentUser.id,
        userName: currentUser.name,
        role: currentUser.role,
      });
      addActivityEntry({
        type: "join_match",
        text: `${currentUser.name} is playing: ${match.homeName} vs ${match.awayName}`,
        icon: "⚽",
        userName: currentUser.name,
      });
      setJoined(true);
      setJoiners(getMatchJoiners(match.matchId));
      window.dispatchEvent(new CustomEvent("lsh:activity-updated"));
    }
  };

  const kickoffTime = new Date(match.kickoffMs).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="rounded-xl border border-border bg-card overflow-hidden"
      style={{
        background: match.isLive
          ? "linear-gradient(135deg, oklch(0.6 0.22 24 / 0.12) 0%, oklch(0.14 0.04 255) 100%)"
          : "oklch(0.14 0.04 255)",
      }}
    >
      <div className="p-3">
        {/* Status pill */}
        <div className="flex items-center justify-between mb-2.5">
          {match.isLive ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/40 text-[10px] font-black text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              LIVE
            </span>
          ) : match.isPlayed ? (
            <span className="px-2 py-0.5 rounded-full bg-muted/40 border border-border text-[10px] font-bold text-muted-foreground">
              FT
            </span>
          ) : (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                background: "oklch(0.6 0.22 24 / 0.15)",
                color: "oklch(0.6 0.22 24)",
                border: "1px solid oklch(0.6 0.22 24 / 0.3)",
              }}
            >
              {kickoffTime}
            </span>
          )}
          {match.venue && (
            <span className="text-[10px] text-muted-foreground/70">
              📍 {match.venue}
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-xs font-bold text-foreground text-right flex-1 line-clamp-1">
            {match.homeName}
          </span>
          <span className="text-xs font-black text-muted-foreground flex-shrink-0">
            vs
          </span>
          <span className="text-xs font-bold text-foreground text-left flex-1 line-clamp-1">
            {match.awayName}
          </span>
        </div>

        {/* Join button + joiners */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="flex-1 h-8 text-xs font-black transition-all"
            style={{
              background: joined
                ? "oklch(0.55 0.18 145 / 0.2)"
                : "linear-gradient(135deg, oklch(0.6 0.22 24), oklch(0.55 0.2 30))",
              color: joined ? "oklch(0.65 0.18 145)" : "white",
              border: joined ? "1px solid oklch(0.55 0.18 145 / 0.4)" : "none",
            }}
            onClick={handleJoin}
            data-ocid="today_matches.join_button"
          >
            {joined ? "✓ I'm Playing" : "Join Match"}
          </Button>

          {joiners.length > 0 && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <JoinerAvatars joiners={joiners} />
              <span className="text-[10px] text-muted-foreground font-medium">
                <Users className="w-3 h-3 inline mr-0.5" />
                {joiners.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TodayMatchesSection({
  todayMatches,
  currentUser,
  onLoginRequired,
}: TodayMatchesSectionProps) {
  if (todayMatches.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.08 }}
      data-ocid="dashboard.today_matches.section"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">⚽</span>
        <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide">
          Today's Matches
        </h2>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: "oklch(0.6 0.22 24 / 0.15)",
            color: "oklch(0.6 0.22 24)",
            border: "1px solid oklch(0.6 0.22 24 / 0.3)",
          }}
        >
          {todayMatches.length}{" "}
          {todayMatches.length === 1 ? "match" : "matches"}
        </span>
      </div>
      <div className="space-y-2">
        {todayMatches.map((m) => (
          <MatchJoinCard
            key={m.matchId}
            match={m}
            currentUser={currentUser}
            onLoginRequired={onLoginRequired}
          />
        ))}
      </div>
    </motion.div>
  );
}

function timeFromNow(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export function ActivityFeedSection({
  currentUser: _currentUser,
}: { currentUser?: SimpleUserProfile | null }) {
  const [feed, setFeed] = useState(() => getActivityFeed().slice(0, 10));
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      const all = getActivityFeed();
      setFeed(all.slice(0, 10));
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      const uniqueUsers = new Set(
        all
          .filter((e) => e.timestamp > cutoff && e.userName)
          .map((e) => e.userName),
      );
      setActiveCount(uniqueUsers.size);
    };
    refresh();
    window.addEventListener("lsh:activity-updated", refresh);
    return () => window.removeEventListener("lsh:activity-updated", refresh);
  }, []);

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.12 }}
      data-ocid="dashboard.activity_feed.section"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide">
          What's Happening
        </h2>
        {activeCount > 0 && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: "oklch(0.55 0.18 145 / 0.15)",
              color: "oklch(0.65 0.18 145)",
              border: "1px solid oklch(0.55 0.18 145 / 0.3)",
            }}
          >
            ● {activeCount} active today
          </span>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {feed.length === 0 ? (
          <div
            className="py-8 text-center"
            data-ocid="dashboard.activity_feed.empty_state"
          >
            <p className="text-sm text-foreground font-semibold mb-1">
              Be the first to join a match today! ⚽
            </p>
            <p className="text-xs text-muted-foreground">
              Activity from all players will appear here
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {feed.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-3 px-3 py-2.5 border-b border-border/50 last:border-0"
                data-ocid={`dashboard.activity_feed.item.${i + 1}`}
              >
                <span className="text-base flex-shrink-0 mt-0.5">
                  {entry.icon}
                </span>
                <p className="text-xs text-foreground flex-1 leading-relaxed">
                  {entry.text}
                </p>
                <span className="text-[10px] text-muted-foreground/70 flex-shrink-0 mt-0.5 whitespace-nowrap">
                  {timeFromNow(entry.timestamp)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
