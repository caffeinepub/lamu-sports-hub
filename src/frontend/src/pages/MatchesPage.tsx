import type { T__5 as BackendMatch } from "@/backend";
import { Status } from "@/backend";
import { useActor } from "@/hooks/useActor";
import {
  getDeletedTeamIds,
  getLocalStore,
  getLocalTeams,
  getMatchPitches,
  getMatchReferees,
  getPitches,
  getReferees,
  getTeamOverrides,
} from "@/utils/localStore";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, Shield, Star } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

type DateTab = "yesterday" | "today" | "tomorrow";

function getDateRange(tab: DateTab): { start: Date; end: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const offset = tab === "yesterday" ? -1 : tab === "tomorrow" ? 1 : 0;
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return { start: d, end };
}

function getMatchMinuteLive(dateNs: bigint): number {
  const kickoff = new Date(Number(dateNs / 1_000_000n));
  const now = new Date();
  const diff = Math.floor((now.getTime() - kickoff.getTime()) / 60000);
  return Math.min(Math.max(diff, 1), 90);
}

function formatKickoff(dateNs: bigint): string {
  const d = new Date(Number(dateNs / 1_000_000n));
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function TeamInitial({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

const TEAM_COLORS = [
  "#0B2E6F",
  "#8B1A1A",
  "#1A6B3A",
  "#6B1A6B",
  "#2E6B6B",
  "#6B4A1A",
  "#1A3A6B",
  "#3A1A1A",
];

function getTeamColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (h * 31 + name.charCodeAt(i)) % TEAM_COLORS.length;
  return TEAM_COLORS[Math.abs(h) % TEAM_COLORS.length];
}

export function MatchesPage() {
  const navigate = useNavigate();
  const { actor, isFetching: actorFetching } = useActor();
  const [activeTab, setActiveTab] = useState<DateTab>("today");
  const [matches, setMatches] = useState<BackendMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [followedMatches, setFollowedMatches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("followedMatches") ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    document.title = "Matches \u2013 Lamu Sports Hub";
  }, []);

  useEffect(() => {
    if (actorFetching) {
      const t = setTimeout(() => setLoading(false), 8000);
      return () => clearTimeout(t);
    }
    if (!actor) {
      setLoading(false);
      return;
    }
    setLoading(true);
    actor
      .getAllMatches()
      .then((m) => {
        const localScores = getLocalStore<
          Record<
            string,
            { homeScore: number; awayScore: number; status: string }
          >
        >("lsh_local_match_scores", {});
        const now = Date.now();
        const merged = m.map((match) => {
          const ov = localScores[match.matchId];
          const kickoffMs = Number(match.date) / 1_000_000;
          const statusStr = getStatusStr(match.status);
          const autoPlayed =
            (statusStr === "scheduled" || statusStr === "live") &&
            now - kickoffMs > 95 * 60 * 1000;
          if (ov) {
            return {
              ...match,
              homeScore: BigInt(ov.homeScore),
              awayScore: BigInt(ov.awayScore),
              status:
                ov.status === "played" || autoPlayed
                  ? Status.played
                  : ov.status === "live"
                    ? Status.live
                    : match.status,
            };
          }
          if (autoPlayed) {
            return {
              ...match,
              status: Status.played,
            };
          }
          return match;
        });
        setMatches(merged);
      })
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, [actor, actorFetching]);

  // Build merged team name map: teamId -> name
  const teamNameMap = useMemo(() => {
    const overrides = getTeamOverrides();
    const deleted = new Set(getDeletedTeamIds());
    const map: Record<string, string> = {};
    for (const lt of getLocalTeams()) {
      if (!deleted.has(lt.teamId)) {
        map[lt.teamId] = overrides[lt.teamId]?.name ?? lt.name;
      }
    }
    return map;
  }, []);

  const allReferees = getReferees();
  const matchRefereeMap = getMatchReferees();
  const allPitches = getPitches();
  const matchPitchMap = getMatchPitches();

  const getRefereeName = (matchId: string) => {
    const refId = matchRefereeMap[matchId];
    return refId
      ? allReferees.find((r) => r.refereeId === refId)?.name
      : undefined;
  };

  const getPitchName = (matchId: string) => {
    const pitchId = matchPitchMap[matchId];
    return pitchId
      ? allPitches.find((p) => p.pitchId === pitchId)?.name
      : undefined;
  };

  const toggleFollow = (matchId: string) => {
    setFollowedMatches((prev) => {
      const next = prev.includes(matchId)
        ? prev.filter((id) => id !== matchId)
        : [...prev, matchId];
      localStorage.setItem("followedMatches", JSON.stringify(next));
      return next;
    });
  };

  const { start, end } = getDateRange(activeTab);

  const filteredMatches = matches.filter((m) => {
    const d = new Date(Number(m.date / 1_000_000n));
    return d >= start && d <= end;
  });

  const followedInTab = filteredMatches.filter((m) =>
    followedMatches.includes(m.matchId),
  );
  const unfollowedInTab = filteredMatches.filter(
    (m) => !followedMatches.includes(m.matchId),
  );

  const leagueGroups: { leagueName: string; matchIds: string[] }[] = [
    {
      leagueName: "FKF Lamu County League \u2014 Zone A Pool A",
      matchIds: unfollowedInTab.map((m) => m.matchId),
    },
  ];

  const tabs: { id: DateTab; label: string }[] = [
    { id: "yesterday", label: "Yesterday" },
    { id: "today", label: "Today" },
    { id: "tomorrow", label: "Tomorrow" },
  ];

  const getStatusStr = (status: BackendMatch["status"]): string => {
    if (typeof status === "object" && status !== null) {
      const keys = Object.keys(status);
      return keys[0] ?? "scheduled";
    }
    return String(status);
  };

  const renderMatchCard = (matchId: string, index: number) => {
    const match = matches.find((m) => m.matchId === matchId);
    if (!match) return null;

    const homeName = teamNameMap[match.homeTeam] ?? match.homeTeam;
    const awayName = teamNameMap[match.awayTeam] ?? match.awayTeam;
    const statusStr = getStatusStr(match.status);
    const isLive = statusStr === "live";
    const isPlayed = statusStr === "played";
    const minute = isLive ? getMatchMinuteLive(match.date) : 0;
    const isFollowed = followedMatches.includes(matchId);
    const refName = getRefereeName(matchId);
    const pitchName = getPitchName(matchId);

    return (
      <motion.div
        key={matchId}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: index * 0.04 }}
        data-ocid={`matches.item.${index + 1}`}
        className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all cursor-pointer"
        onClick={() =>
          isLive || isPlayed
            ? navigate({ to: `/matchday/${matchId}` })
            : undefined
        }
      >
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              {isLive && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/40 text-[10px] font-black text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                  {minute}'
                </span>
              )}
              {isPlayed && (
                <span className="px-2 py-0.5 rounded-full bg-muted/40 border border-border text-[10px] font-bold text-muted-foreground">
                  FT
                </span>
              )}
              {!isLive && !isPlayed && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-bold text-primary">
                  {formatKickoff(match.date)}
                </span>
              )}
            </div>
            <button
              type="button"
              data-ocid={`matches.star.toggle.${index + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFollow(matchId);
              }}
              className="p-1 rounded-full hover:bg-muted/40 transition-colors"
              aria-label={isFollowed ? "Unfollow match" : "Follow match"}
            >
              <Star
                className={`w-4 h-4 transition-colors ${
                  isFollowed
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <TeamInitial name={homeName} color={getTeamColor(homeName)} />
              <span className="text-xs font-bold text-foreground text-center leading-tight line-clamp-2">
                {homeName}
              </span>
            </div>

            <div className="flex flex-col items-center flex-shrink-0 px-2">
              {isLive || isPlayed ? (
                <span className="font-black font-stats text-2xl text-foreground tracking-tight">
                  {Number(match.homeScore)} \u2014 {Number(match.awayScore)}
                </span>
              ) : (
                <span className="font-bold text-sm text-muted-foreground">
                  VS
                </span>
              )}
            </div>

            <div className="flex flex-col items-center gap-1.5 flex-1">
              <TeamInitial name={awayName} color={getTeamColor(awayName)} />
              <span className="text-xs font-bold text-foreground text-center leading-tight line-clamp-2">
                {awayName}
              </span>
            </div>
          </div>

          {(pitchName || refName) && (
            <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground/70">
              {pitchName && <span>\uD83D\uDCCD {pitchName}</span>}
              {refName && <span>• Ref: {refName}</span>}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div data-ocid="matches.page" className="min-h-screen pb-24 pt-14">
      <div
        className="px-4 py-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.04 255) 0%, oklch(0.14 0.06 252) 100%)",
        }}
      >
        <h1 className="font-display font-black text-xl text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Matches
        </h1>
      </div>

      <div
        className="flex border-b border-border bg-card sticky top-14 z-10"
        data-ocid="matches.date.tab"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-ocid={`matches.${tab.id}.tab`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-xs font-bold transition-all relative ${
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="dateTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div data-ocid="matches.following.section">
              <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-yellow-400" />
                Following
              </h2>
              {followedInTab.length === 0 ? (
                <div
                  className="rounded-xl border border-dashed border-border p-4 text-center"
                  data-ocid="matches.following.empty_state"
                >
                  <p className="text-xs text-muted-foreground">
                    No followed matches. Star a match to follow it.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {followedInTab.map((m, i) => renderMatchCard(m.matchId, i))}
                </div>
              )}
            </div>

            {leagueGroups
              .filter((g) => g.matchIds.length > 0)
              .map((group) => (
                <div key={group.leagueName} data-ocid="matches.league.section">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                      {group.leagueName}
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {group.matchIds.map((id, i) => renderMatchCard(id, i))}
                  </div>
                </div>
              ))}

            {filteredMatches.length === 0 && (
              <div
                className="rounded-xl border border-dashed border-border p-8 text-center"
                data-ocid="matches.empty_state"
              >
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold text-foreground mb-1">
                  No matches scheduled
                </p>
                <p className="text-xs text-muted-foreground">
                  Check other dates for upcoming fixtures
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
