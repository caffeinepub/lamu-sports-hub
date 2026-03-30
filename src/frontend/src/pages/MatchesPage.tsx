import { MOCK_MATCHES, MOCK_TEAMS } from "@/data/mockData";
import {
  getMatchPitches,
  getMatchReferees,
  getPitches,
  getReferees,
} from "@/utils/localStore";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, Shield, Star } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

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

function getMatchMinute(match: { date: string; status: string }): number {
  if (match.status !== "live") return 0;
  const kickoff = new Date(match.date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - kickoff.getTime()) / 60000);
  return Math.min(Math.max(diff, 1), 90);
}

function formatKickoff(dateStr: string): string {
  const d = new Date(dateStr);
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

export function MatchesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DateTab>("today");
  const [followedMatches, setFollowedMatches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("followedMatches") ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    document.title = "Matches – Lamu Sports Hub";
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

  const filteredMatches = MOCK_MATCHES.filter((m) => {
    const d = new Date(m.date);
    return d >= start && d <= end;
  });

  const followedInTab = filteredMatches.filter((m) =>
    followedMatches.includes(m.matchId),
  );
  const unfollowedInTab = filteredMatches.filter(
    (m) => !followedMatches.includes(m.matchId),
  );

  // Group by league (all FKF for now)
  const leagueGroups: { leagueName: string; matchIds: string[] }[] = [
    {
      leagueName: "FKF Lamu County League — Zone A Pool A",
      matchIds: unfollowedInTab.map((m) => m.matchId),
    },
  ];

  const tabs: { id: DateTab; label: string }[] = [
    { id: "yesterday", label: "Yesterday" },
    { id: "today", label: "Today" },
    { id: "tomorrow", label: "Tomorrow" },
  ];

  const renderMatchCard = (matchId: string, index: number) => {
    const match = MOCK_MATCHES.find((m) => m.matchId === matchId);
    if (!match) return null;
    const home = MOCK_TEAMS.find((t) => t.teamId === match.homeTeamId);
    const away = MOCK_TEAMS.find((t) => t.teamId === match.awayTeamId);
    if (!home || !away) return null;

    const isLive = match.status === "live";
    const isPlayed = match.status === "played";
    const minute = getMatchMinute(match);
    const isFollowed = followedMatches.includes(matchId);
    const refName = getRefereeName(matchId);
    const pitchName = getPitchName(matchId) ?? match.ground;

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
          {/* Header row: competition badge + status + star */}
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

          {/* Teams + score */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <TeamInitial name={home.name} color={home.color} />
              <span className="text-xs font-bold text-foreground text-center leading-tight line-clamp-2">
                {home.name}
              </span>
            </div>

            <div className="flex flex-col items-center flex-shrink-0 px-2">
              {isLive || isPlayed ? (
                <span className="font-black font-stats text-2xl text-foreground tracking-tight">
                  {match.homeScore} — {match.awayScore}
                </span>
              ) : (
                <span className="font-bold text-sm text-muted-foreground">
                  VS
                </span>
              )}
            </div>

            <div className="flex flex-col items-center gap-1.5 flex-1">
              <TeamInitial name={away.name} color={away.color} />
              <span className="text-xs font-bold text-foreground text-center leading-tight line-clamp-2">
                {away.name}
              </span>
            </div>
          </div>

          {/* Venue/ref row */}
          {(pitchName || refName) && (
            <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground/70">
              {pitchName && <span>📍 {pitchName}</span>}
              {refName && <span>• Ref: {refName}</span>}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div data-ocid="matches.page" className="min-h-screen pb-24 pt-14">
      {/* Header */}
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

      {/* Date tabs */}
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
        {/* Following section */}
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

        {/* League groups */}
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
              {group.matchIds.length === 0 ? (
                <div
                  className="rounded-xl border border-dashed border-border p-4 text-center"
                  data-ocid="matches.empty_state"
                >
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs text-muted-foreground">
                    No matches scheduled for this day
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {group.matchIds.map((id, i) => renderMatchCard(id, i))}
                </div>
              )}
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
      </div>
    </div>
  );
}
