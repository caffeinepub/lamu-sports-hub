import type { T__2 as BackendPlayer, T__1 as BackendTeam } from "@/backend";
import {
  AreaBadge,
  IslandPrideBadge,
  TeamBadge,
  getTeamColor,
} from "@/components/shared/TeamBadge";
import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import {
  getFollowerCount,
  getLocalPlayers,
  getLocalTeams,
  getPlayerPhotos,
  isFollowingPlayer,
  togglePlayerFollow,
} from "@/utils/localStore";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  Heart,
  Loader2,
  Square,
  Star,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

function getPositionLabel(pos: string): string {
  const map: Record<string, string> = {
    goalkeeper: "Goalkeeper",
    defender: "Defender",
    midfielder: "Midfielder",
    forward: "Forward",
  };
  return map[pos.toLowerCase()] || pos;
}

function getPositionColor(pos: string): string {
  const map: Record<string, string> = {
    goalkeeper: "oklch(0.55 0.18 252)",
    defender: "oklch(0.55 0.18 145)",
    midfielder: "oklch(0.6 0.22 24)",
    forward: "oklch(0.82 0.15 85)",
  };
  return map[pos.toLowerCase()] || "oklch(0.62 0 0)";
}

type RadarAttribute = { attribute: string; value: number };

function getRadarAttributes(
  pos: string,
  goals: number,
  assists: number,
): RadarAttribute[] {
  const posLower = pos.toLowerCase();
  if (posLower === "forward") {
    return [
      { attribute: "Pace", value: 85 + Math.min(goals * 2, 12) },
      { attribute: "Shooting", value: 80 + Math.min(goals * 3, 18) },
      { attribute: "Passing", value: 65 + Math.min(assists * 3, 15) },
      { attribute: "Dribbling", value: 78 },
      { attribute: "Defending", value: 35 },
      { attribute: "Physical", value: 72 },
    ];
  }
  if (posLower === "midfielder") {
    return [
      { attribute: "Pace", value: 75 },
      { attribute: "Shooting", value: 65 + Math.min(goals * 2, 15) },
      { attribute: "Passing", value: 82 + Math.min(assists * 2, 14) },
      { attribute: "Dribbling", value: 76 },
      { attribute: "Defending", value: 62 },
      { attribute: "Physical", value: 70 },
    ];
  }
  if (posLower === "defender") {
    return [
      { attribute: "Pace", value: 72 },
      { attribute: "Shooting", value: 45 },
      { attribute: "Passing", value: 68 },
      { attribute: "Dribbling", value: 55 },
      { attribute: "Defending", value: 85 },
      { attribute: "Physical", value: 80 },
    ];
  }
  // Goalkeeper
  return [
    { attribute: "Pace", value: 55 },
    { attribute: "Shooting", value: 30 },
    { attribute: "Passing", value: 65 },
    { attribute: "Dribbling", value: 40 },
    { attribute: "Defending", value: 82 },
    { attribute: "Physical", value: 75 },
  ];
}

function estimateMarketValue(
  goals: number,
  assists: number,
  apps: number,
): string {
  const base = 500_000;
  const value = base + goals * 300_000 + assists * 150_000 + apps * 20_000;
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  return `€${Math.round(value / 1_000)}K`;
}

export function PlayerProfilePage() {
  const { playerId } = useParams({ strict: false }) as { playerId: string };
  const navigate = useNavigate();
  const { actor } = useActor();
  const [userId] = useState<string>(() => {
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
      guestId = Math.random().toString(36).slice(2);
      localStorage.setItem("guestId", guestId);
    }
    return `guest-${guestId}`;
  });
  const [isFollowing, setIsFollowing] = useState(() =>
    isFollowingPlayer(playerId ?? "", userId),
  );
  const [followerCount, setFollowerCount] = useState(() =>
    getFollowerCount(playerId ?? ""),
  );

  function handleFollow() {
    const nowFollowing = togglePlayerFollow(playerId ?? "", userId);
    setIsFollowing(nowFollowing);
    setFollowerCount(getFollowerCount(playerId ?? ""));
  }

  const [player, setPlayer] = useState<BackendPlayer | null>(null);
  const [team, setTeam] = useState<BackendTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const playerPhotos = getPlayerPhotos();

  useEffect(() => {
    if (!playerId) return;
    if (!actor) {
      const localPlayers = getLocalPlayers();
      const found = localPlayers.find((p) => p.playerId === playerId);
      if (found) {
        setPlayer({
          playerId: found.playerId,
          name: found.name,
          nickname: found.nickname ?? "",
          teamId: found.teamId ?? "",
          position: found.position ?? "",
          jerseyNumber: BigInt(found.jerseyNumber ?? 0),
          goals: BigInt(0),
          assists: BigInt(0),
          yellowCards: BigInt(0),
          redCards: BigInt(0),
          appearances: BigInt(0),
          matchesPlayed: BigInt(0),
          userId: "",
          isVerified: false,
          isApproved: false,
          isActive: true,
        } as unknown as BackendPlayer);
        if (found.teamId) {
          const localTeams = getLocalTeams();
          const t = localTeams.find((lt) => lt.teamId === found.teamId);
          if (t) {
            setTeam({
              teamId: t.teamId,
              name: t.name,
              area: t.area,
              coachId: t.coachName ?? "",
              logoUrl: "",
              wins: BigInt(0),
              losses: BigInt(0),
              draws: BigInt(0),
              goalsFor: BigInt(0),
              goalsAgainst: BigInt(0),
              isApproved: false,
            } as BackendTeam);
          }
        }
      }
      setLoading(false);
      return;
    }
    setLoading(true);
    actor
      .getPlayer(playerId)
      .then(async (p) => {
        setPlayer(p);
        if (p?.teamId) {
          try {
            const t = await actor.getTeam(p.teamId);
            setTeam(t);
          } catch {
            // team fetch failed silently
          }
        }
      })
      .catch((err) => console.error("Failed to load player:", err))
      .finally(() => setLoading(false));
  }, [actor, playerId]);

  if (loading) {
    return (
      <div className="min-h-screen pb-24 pt-14 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen pb-24 pt-14 flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-muted-foreground">Player not found.</p>
        <Button variant="outline" onClick={() => navigate({ to: "/players" })}>
          Back to Players
        </Button>
      </div>
    );
  }

  const teamColor = team ? getTeamColor(team.teamId) : "oklch(0.4 0.06 255)";
  const posStr = String(player.position);
  const posColor = getPositionColor(posStr);
  const posLabel = getPositionLabel(posStr);
  const playerPhoto = playerPhotos[player.playerId];

  const goals = Number(player.goals);
  const assists = Number(player.assists);
  const matchesPlayed = Number(player.matchesPlayed);
  const yellowCards = Number(player.yellowCards);
  const redCards = Number(player.redCards);
  const jerseyNumber = Number(player.jerseyNumber);

  const radarData = getRadarAttributes(posStr, goals, assists);
  const marketValue = estimateMarketValue(goals, assists, matchesPlayed);
  const avgRating =
    matchesPlayed > 0
      ? Math.min(10, 6.5 + goals * 0.1 + assists * 0.07).toFixed(2)
      : "—";

  return (
    <div data-ocid="player_profile.page" className="min-h-screen pb-24 pt-14">
      {/* Back */}
      <button
        type="button"
        className="fixed top-14 left-0 z-40 flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors bg-card/80 backdrop-blur-sm"
        onClick={() =>
          team
            ? navigate({ to: `/teams/${team.teamId}` })
            : navigate({ to: "/players" })
        }
        data-ocid="player_profile.back.button"
      >
        <X className="w-4 h-4" />
        {team ? team.name : "Players"}
      </button>

      {/* Hero */}
      <div
        className="pt-8 pb-8 px-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${teamColor}55 0%, oklch(0.12 0.04 252) 70%)`,
        }}
      >
        <div
          className="absolute -bottom-4 -right-2 text-[120px] font-black font-stats opacity-8 leading-none pointer-events-none select-none"
          style={{ color: teamColor }}
        >
          {jerseyNumber}
        </div>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-start gap-4">
            {playerPhoto ? (
              <div
                className="w-20 h-20 rounded-full border-4 flex-shrink-0 overflow-hidden"
                style={{ borderColor: `${teamColor}66` }}
              >
                <img
                  src={playerPhoto}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black font-stats border-4 flex-shrink-0"
                style={{
                  backgroundColor: teamColor,
                  color: "oklch(0.95 0.02 82)",
                  borderColor: `${teamColor}66`,
                }}
              >
                {jerseyNumber}
              </div>
            )}
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${posColor}33`,
                    color: posColor,
                    border: `1px solid ${posColor}55`,
                  }}
                >
                  {posLabel}
                </span>
                {player.isVerified && <IslandPrideBadge />}
              </div>
              <h1 className="font-display font-black text-2xl text-foreground mt-1 leading-tight">
                {player.name}
              </h1>
              {player.nickname && (
                <p className="text-muted-foreground text-sm">
                  "{player.nickname}"
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleFollow}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full transition-all ${
                    isFollowing
                      ? "bg-pink-500/20 text-pink-400 border border-pink-500/40"
                      : "bg-muted/30 text-muted-foreground border border-border hover:border-pink-400/50"
                  }`}
                  data-ocid="player_profile.follow.toggle"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${isFollowing ? "fill-pink-400" : ""}`}
                  />
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <span className="text-xs text-muted-foreground">
                  {followerCount}{" "}
                  {followerCount === 1 ? "follower" : "followers"}
                </span>
              </div>
              {team && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <TeamBadge
                    team={{
                      teamId: team.teamId,
                      name: team.name,
                      area: team.area,
                      color: teamColor,
                    }}
                    size="sm"
                    showName
                  />
                  <AreaBadge area={team.area} />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-4 mt-5 space-y-4">
        {/* Biometrics row */}
        <div
          className="flex flex-wrap gap-2"
          data-ocid="player_profile.biometrics.card"
        >
          {[
            { label: "Height", value: "—" },
            { label: "Age", value: "—" },
            { label: "Country", value: "🇰🇪 Kenya" },
            { label: "Foot", value: "Right" },
          ].map((b) => (
            <div
              key={b.label}
              className="rounded-full px-3 py-1 border border-border bg-card text-xs flex items-center gap-1"
            >
              <span className="text-muted-foreground">{b.label}:</span>
              <span className="font-bold text-foreground">{b.value}</span>
            </div>
          ))}
        </div>

        {/* Market Value */}
        <div
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3"
          data-ocid="player_profile.market_value.card"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70">
              Market Value
            </p>
            <p className="font-black font-stats text-2xl text-amber-400">
              {marketValue}
            </p>
          </div>
        </div>

        {/* Season Stats card */}
        <div
          className="rounded-xl border border-border bg-card p-4"
          data-ocid="player_profile.season_stats.card"
        >
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
            2024/2025 Season Stats
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Matches", value: matchesPlayed },
              { label: "Goals", value: goals },
              { label: "Assists", value: assists },
              { label: "Rating", value: avgRating },
            ].map((s) => (
              <div
                key={s.label}
                className="text-center rounded-lg bg-muted/30 py-2"
              >
                <p className="font-black font-stats text-xl text-foreground">
                  {s.value}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div data-ocid="player_profile.stats.card">
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
            Season Stats
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <StatCard
              icon={<Target className="w-5 h-5" />}
              value={goals}
              label="Goals"
              color="#22C55E"
            />
            <StatCard
              icon={<Zap className="w-5 h-5" />}
              value={assists}
              label="Assists"
              color="#3B82F6"
            />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <StatCard
              icon={<Trophy className="w-4 h-4" />}
              value={matchesPlayed}
              label="Apps"
              color="oklch(0.82 0.08 82)"
              small
            />
            <StatCard
              icon={<AlertTriangle className="w-4 h-4" />}
              value={yellowCards}
              label="Yellow"
              color="#EAB308"
              small
            />
            <StatCard
              icon={<Square className="w-4 h-4" />}
              value={redCards}
              label="Red"
              color="#EF4444"
              small
            />
          </div>
          <div className="rounded-xl border border-border bg-card p-4 mt-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
              Per Game
            </h3>
            <div className="space-y-3">
              {[
                {
                  label: "Goals per game",
                  value:
                    matchesPlayed > 0
                      ? (goals / matchesPlayed).toFixed(2)
                      : "0.00",
                  color: "#22C55E",
                },
                {
                  label: "Assists per game",
                  value:
                    matchesPlayed > 0
                      ? (assists / matchesPlayed).toFixed(2)
                      : "0.00",
                  color: "#3B82F6",
                },
                {
                  label: "Goal contributions",
                  value: goals + assists,
                  color: "oklch(0.82 0.08 82)",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-muted-foreground">
                    {row.label}
                  </span>
                  <span
                    className="font-black font-stats text-lg"
                    style={{ color: row.color }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div
          className="rounded-xl border border-border bg-card p-4"
          data-ocid="player_profile.radar.card"
        >
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-1">
            Player Traits
          </h2>
          <p className="text-[10px] text-muted-foreground mb-3">
            Skill comparison vs. position peers
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis
                dataKey="attribute"
                tick={{ fontSize: 10, fill: "#888" }}
              />
              <Radar
                name={player.name}
                dataKey="value"
                stroke={teamColor}
                fill={teamColor}
                fillOpacity={0.4}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
  small = false,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  small?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4 border text-center"
      style={{
        backgroundColor: `color-mix(in oklch, ${color} 8%, oklch(0.16 0.04 255))`,
        borderColor: `color-mix(in oklch, ${color} 30%, transparent)`,
      }}
    >
      <div className="flex justify-center mb-1.5" style={{ color }}>
        {icon}
      </div>
      <div
        className={`font-black font-stats leading-none ${small ? "text-2xl" : "text-4xl"}`}
        style={{ color }}
      >
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
