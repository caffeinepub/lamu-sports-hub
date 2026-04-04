import type { T__5 as BackendMatch } from "@/backend";
import { Status } from "@/backend";
import { useActor } from "@/hooks/useActor";
import {
  type LocalFixture,
  addActivityEntry,
  getDeletedTeamIds,
  getLocalFixtures,
  getLocalStore,
  getLocalTeams,
  getMatchJoiners,
  getMatchPitches,
  getMatchReferees,
  getPitches,
  getReferees,
  getTeamOverrides,
  hasJoinedMatch,
  joinMatch,
  leaveMatch,
} from "@/utils/localStore";
import { getActiveSimpleSession } from "@/utils/simpleAuth";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, Shield, Star } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

type DateTab = "yesterday" | "today" | "tomorrow" | "all";

function getDateRange(tab: DateTab): { start: Date; end: Date } {
  if (tab === "all") {
    return { start: new Date(0), end: new Date(8_640_000_000_000_000) };
  }
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

function formatMatchDate(dateNs: bigint): string {
  const d = new Date(Number(dateNs / 1_000_000n));
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
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
  const [currentUser] = useState(() => getActiveSimpleSession());
  const [_joinerTick, setJoinerTick] = useState(0);
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

  // Store a ref to the raw local fixtures for reporter attribution
  const [localFixtureMap, setLocalFixtureMap] = useState<
    Record<string, LocalFixture>
  >(() => {
    const result: Record<string, LocalFixture> = {};
    for (const f of getLocalFixtures()) result[f.matchId] = f;
    return result;
  });

  const buildLocalMatches = () => {
    const localScores = getLocalStore<
      Record<string, { homeScore: number; awayScore: number; status: string }>
    >("lsh_local_match_scores", {});
    const fixtures = getLocalFixtures();
    const now = Date.now();
    // Rebuild fixture map for reporter attribution
    const newMap: Record<string, LocalFixture> = {};
    for (const f of fixtures) newMap[f.matchId] = f;
    setLocalFixtureMap(newMap);
    return fixtures.map((f) => {
      const ov = localScores[f.matchId];
      const kickoffMs = Math.floor(f.date / 1_000_000);
      const autoPlayed = now - kickoffMs > 95 * 60 * 1000;
      const statusStr = ov?.status ?? (autoPlayed ? "played" : f.status);
      return {
        matchId: f.matchId,
        homeTeam: f.homeTeam,
        awayTeam: f.awayTeam,
        date: BigInt(Math.floor(f.date)),
        homeScore: BigInt(ov?.homeScore ?? f.homeScore),
        awayScore: BigInt(ov?.awayScore ?? f.awayScore),
        status:
          statusStr === "played"
            ? { played: null }
            : statusStr === "live"
              ? { live: null }
              : { scheduled: null },
        referee: [],
        events: [],
      };
    });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: buildLocalMatches is a stable local function
  useEffect(() => {
    if (actorFetching) {
      const t = setTimeout(() => setLoading(false), 8000);
      return () => clearTimeout(t);
    }
    if (!actor) {
      setMatches(buildLocalMatches() as any);
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
            return { ...match, status: Status.played };
          }
          return match;
        });
        // Merge any local-only fixtures that aren't in the backend
        const backendIds = new Set(merged.map((m) => m.matchId));
        const localOnly = buildLocalMatches().filter(
          (lm) => !backendIds.has(lm.matchId),
        );
        setMatches([...merged, ...(localOnly as any)]);
      })
      .catch(() => setMatches(buildLocalMatches() as any))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor, actorFetching]);

  // Re-load local matches when officials update match data
  // biome-ignore lint/correctness/useExhaustiveDependencies: buildLocalMatches is a stable local function
  useEffect(() => {
    const reload = () => {
      if (!actor) {
        setMatches(buildLocalMatches() as any);
      }
    };
    window.addEventListener("lsh:matches-updated", reload);
    return () => window.removeEventListener("lsh:matches-updated", reload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor]);

  // Build merged team name map
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

  // Sort matches by date for the "All" tab
  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => Number(a.date) - Number(b.date)),
    [matches],
  );

  const filteredMatches = sortedMatches.filter((m) => {
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
    { id: "all", label: "All" },
  ];

  const getStatusStr = (status: BackendMatch["status"]): string => {
    if (typeof status === "object" && status !== null) {
      const keys = Object.keys(status);
      return keys[0] ?? "scheduled";
    }
    return String(status);
  };

  const renderMatchCard = (matchId: string, index: number) => {
    const match = sortedMatches.find((m) => m.matchId === matchId);
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
        transition={{ delay: Math.min(index * 0.04, 0.4) }}
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
                  {activeTab === "all"
                    ? formatMatchDate(match.date)
                    : formatKickoff(match.date)}
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
              {refName && <span>\u2022 Ref: {refName}</span>}
            </div>
          )}

          {/* Reporter attribution */}
          {(() => {
            const localFix = localFixtureMap[matchId];
            if (!localFix?.reporterName) return null;
            const lastUpdatedMs = localFix.lastUpdated ?? 0;
            const minutesAgo = lastUpdatedMs
              ? Math.floor((Date.now() - lastUpdatedMs) / 60000)
              : null;
            return (
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                {localFix.verified && (
                  <span
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "oklch(0.55 0.18 145 / 0.15)",
                      color: "oklch(0.65 0.18 145)",
                      border: "1px solid oklch(0.55 0.18 145 / 0.3)",
                    }}
                  >
                    ✓ Verified
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground/70">
                  📝 Reported by:{" "}
                  <span className="font-semibold text-muted-foreground">
                    {localFix.reporterName}
                  </span>
                  {minutesAgo !== null && minutesAgo < 180 && (
                    <span>
                      {" "}
                      · {minutesAgo < 1 ? "just now" : `${minutesAgo} min ago`}
                    </span>
                  )}
                </span>
              </div>
            );
          })()}

          {/* Join Match engagement button */}
          {(() => {
            const joiners = getMatchJoiners(matchId);
            const userId = currentUser?.id ?? "";
            const joined = userId ? hasJoinedMatch(matchId, userId) : false;
            const handleJoin = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (!currentUser) return;
              if (joined) {
                leaveMatch(matchId, currentUser.id);
              } else {
                joinMatch(matchId, {
                  userId: currentUser.id,
                  userName: currentUser.name,
                  role: currentUser.role,
                });
                addActivityEntry({
                  type: "join_match",
                  text: `${currentUser.name} is playing: ${homeName} vs ${awayName}`,
                  icon: "\u26BD",
                  userName: currentUser.name,
                });
              }
              setJoinerTick((t) => t + 1);
              window.dispatchEvent(new CustomEvent("lsh:activity-updated"));
            };
            const shownJoiners = joiners.slice(0, 3);
            return (
              <div className="mt-2.5 flex items-center gap-2 pt-2.5 border-t border-border/40">
                <button
                  type="button"
                  data-ocid={`matches.join_button.${index + 1}`}
                  onClick={handleJoin}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-black transition-all"
                  style={{
                    background: joined
                      ? "oklch(0.55 0.18 145 / 0.15)"
                      : "linear-gradient(135deg, oklch(0.6 0.22 24), oklch(0.55 0.2 30))",
                    color: joined ? "oklch(0.65 0.18 145)" : "white",
                    border: joined
                      ? "1px solid oklch(0.55 0.18 145 / 0.3)"
                      : "none",
                  }}
                >
                  {!currentUser
                    ? "Login to join"
                    : joined
                      ? "\u2713 I'm Playing"
                      : "Join Match"}
                </button>
                {shownJoiners.length > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {shownJoiners.map((j, ji) => (
                        <div
                          key={j.userId}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white border border-card"
                          style={{
                            background: `oklch(${0.5 + ji * 0.05} 0.18 ${
                              (ji * 80 + 24) % 360
                            })`,
                            marginLeft: ji > 0 ? "-4px" : undefined,
                            zIndex: 3 - ji,
                            position: "relative",
                          }}
                          title={j.userName}
                        >
                          {j.userName.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      \uD83D\uDC65 {joiners.length}
                    </span>
                  </div>
                )}
              </div>
            );
          })()}
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
            {/* Only show Following section on non-All tabs */}
            {activeTab !== "all" && (
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
            )}

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
                  No matches for this date
                </p>
                <p className="text-xs text-muted-foreground">
                  Tap "All" to see the full fixture list
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
