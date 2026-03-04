import {
  AreaBadge,
  IslandPrideBadge,
  TeamBadge,
} from "@/components/shared/TeamBadge";
import {
  MOCK_PLAYERS,
  MOCK_TEAMS,
  getPositionColor,
  getPositionLabel,
} from "@/data/mockData";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronLeft,
  Square,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

export function PlayerProfilePage() {
  const { playerId } = useParams({ strict: false }) as { playerId: string };
  const navigate = useNavigate();

  const player =
    MOCK_PLAYERS.find((p) => p.playerId === playerId) || MOCK_PLAYERS[0];
  const team = MOCK_TEAMS.find((t) => t.teamId === player.teamId)!;
  const posColor = getPositionColor(player.position);
  const posLabel = getPositionLabel(player.position);

  return (
    <div data-ocid="player_profile.page" className="min-h-screen pb-24 pt-14">
      {/* Back */}
      <button
        type="button"
        className="fixed top-14 left-0 z-40 flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors bg-card/80 backdrop-blur-sm"
        onClick={() => navigate({ to: `/teams/${team.teamId}` })}
      >
        <ChevronLeft className="w-4 h-4" />
        {team.name}
      </button>

      {/* Hero */}
      <div
        className="pt-8 pb-8 px-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${team.color}55 0%, oklch(0.12 0.04 252) 70%)`,
        }}
      >
        {/* Big jersey number watermark */}
        <div
          className="absolute -bottom-4 -right-2 text-[120px] font-black font-stats opacity-8 leading-none pointer-events-none select-none"
          style={{ color: team.secondaryColor }}
        >
          {player.jerseyNumber}
        </div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black font-stats border-4 flex-shrink-0"
              style={{
                backgroundColor: team.color,
                color: team.secondaryColor,
                borderColor: `${team.secondaryColor}66`,
              }}
            >
              {player.jerseyNumber}
            </div>

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
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <TeamBadge team={team} size="sm" showName />
                <AreaBadge area={team.area} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="px-4 mt-5" data-ocid="player_profile.stats.card">
        <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
          Season Stats
        </h2>

        {/* Main stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <StatCard
            icon={<Target className="w-5 h-5" />}
            value={player.goals}
            label="Goals"
            color="#22C55E"
          />
          <StatCard
            icon={<Zap className="w-5 h-5" />}
            value={player.assists}
            label="Assists"
            color="#3B82F6"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <StatCard
            icon={<Trophy className="w-4 h-4" />}
            value={player.matchesPlayed}
            label="Apps"
            color="oklch(0.82 0.08 82)"
            small
          />
          <StatCard
            icon={<AlertTriangle className="w-4 h-4" />}
            value={player.yellowCards}
            label="Yellow"
            color="#EAB308"
            small
          />
          <StatCard
            icon={<Square className="w-4 h-4" />}
            value={player.redCards}
            label="Red"
            color="#EF4444"
            small
          />
        </div>

        {/* Per game stats */}
        <div className="rounded-xl border border-border bg-card p-4 mt-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
            Per Game
          </h3>
          <div className="space-y-3">
            {[
              {
                label: "Goals per game",
                value:
                  player.matchesPlayed > 0
                    ? (player.goals / player.matchesPlayed).toFixed(2)
                    : "0.00",
                color: "#22C55E",
              },
              {
                label: "Assists per game",
                value:
                  player.matchesPlayed > 0
                    ? (player.assists / player.matchesPlayed).toFixed(2)
                    : "0.00",
                color: "#3B82F6",
              },
              {
                label: "Goal contributions",
                value: player.goals + player.assists,
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
