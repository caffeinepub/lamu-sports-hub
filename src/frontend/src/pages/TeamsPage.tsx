import type { T__1 as BackendTeam } from "@/backend";
import { AreaBadge } from "@/components/shared/TeamBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import {
  addLocalTeam,
  approveTeamRegistration,
  deleteTeamRegistration,
  getDeletedTeamIds,
  getLocalTeams,
  getTeamOverrides,
  getTeamRegistrations,
  isOfficialSessionVerified,
} from "@/utils/localStore";
import { useNavigate } from "@tanstack/react-router";
import { Star, Users } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Deterministic color palette for teams
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

function getTeamColor(index: number) {
  return TEAM_COLORS[index % TEAM_COLORS.length];
}

function TeamRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-3 w-24 rounded" />
      </div>
      <Skeleton className="w-5 h-5 rounded" />
    </div>
  );
}

export function TeamsPage() {
  const navigate = useNavigate();
  const { actor, isFetching: actorFetching } = useActor();
  const [teams, setTeams] = useState<BackendTeam[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const isOfficial = isOfficialSessionVerified();
  const [pendingRegs, setPendingRegs] = useState(() =>
    getTeamRegistrations().filter((r) => !r.approved),
  );
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("favoriteTeams") ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    document.title = "Teams – Lamu Sports Hub | Lamu Football Clubs";
  }, []);

  const loadTeams = useCallback(() => {
    if (actorFetching) return;
    const localTeams = getLocalTeams();
    const overrides = getTeamOverrides();
    const deletedIds = new Set(getDeletedTeamIds());

    const applyOverride = (t: BackendTeam): BackendTeam => {
      const ov = overrides[t.teamId];
      if (!ov) return t;
      return { ...t, name: ov.name, area: ov.area };
    };

    if (!actor) {
      const merged = localTeams
        .filter((lt) => !deletedIds.has(lt.teamId))
        .map(
          (lt) =>
            ({
              teamId: lt.teamId,
              name: overrides[lt.teamId]?.name ?? lt.name,
              area: overrides[lt.teamId]?.area ?? lt.area,
              coachId: lt.coachName,
              logoUrl: "",
              wins: BigInt(0),
              losses: BigInt(0),
              draws: BigInt(0),
              goalsFor: BigInt(0),
              goalsAgainst: BigInt(0),
              isApproved: false,
            }) as BackendTeam,
        );
      setTeams(merged);
      setLoadingData(false);
      return;
    }
    setLoadingData(true);
    actor
      .getAllTeams()
      .then((rawTeams) => {
        const backendIds = new Set(rawTeams.map((t) => t.teamId));
        const processedBackend = rawTeams
          .filter((t) => !deletedIds.has(t.teamId))
          .map(applyOverride);
        const extraLocal = localTeams
          .filter(
            (lt) => !backendIds.has(lt.teamId) && !deletedIds.has(lt.teamId),
          )
          .map(
            (lt) =>
              ({
                teamId: lt.teamId,
                name: overrides[lt.teamId]?.name ?? lt.name,
                area: overrides[lt.teamId]?.area ?? lt.area,
                coachId: lt.coachName,
                logoUrl: "",
                wins: BigInt(0),
                losses: BigInt(0),
                draws: BigInt(0),
                goalsFor: BigInt(0),
                goalsAgainst: BigInt(0),
                isApproved: false,
              }) as BackendTeam,
          );
        setTeams([...processedBackend, ...extraLocal]);
      })
      .catch(() => {
        const merged = localTeams
          .filter((lt) => !deletedIds.has(lt.teamId))
          .map(
            (lt) =>
              ({
                teamId: lt.teamId,
                name: overrides[lt.teamId]?.name ?? lt.name,
                area: overrides[lt.teamId]?.area ?? lt.area,
                coachId: lt.coachName,
                logoUrl: "",
                wins: BigInt(0),
                losses: BigInt(0),
                draws: BigInt(0),
                goalsFor: BigInt(0),
                goalsAgainst: BigInt(0),
                isApproved: false,
              }) as BackendTeam,
          );
        setTeams(merged);
      })
      .finally(() => setLoadingData(false));
  }, [actor, actorFetching]);

  useEffect(() => {
    if (actorFetching) {
      const t = setTimeout(() => setLoadingData(false), 8000);
      return () => clearTimeout(t);
    }
    loadTeams();
  }, [loadTeams, actorFetching]);

  useEffect(() => {
    const reload = () => loadTeams();
    window.addEventListener("focus", reload);
    window.addEventListener("storage", reload);
    window.addEventListener("lsh:teams-updated", reload);
    return () => {
      window.removeEventListener("focus", reload);
      window.removeEventListener("storage", reload);
      window.removeEventListener("lsh:teams-updated", reload);
    };
  }, [loadTeams]);

  const handleApproveReg = (
    reg: ReturnType<typeof getTeamRegistrations>[0],
  ) => {
    const newTeam = {
      teamId: `reg-team-${reg.id}`,
      name: reg.teamName,
      area: reg.area,
      coachName: reg.coachName,
      createdAt: Date.now(),
    };
    addLocalTeam(newTeam);
    approveTeamRegistration(reg.id);
    setPendingRegs((prev) => prev.filter((r) => r.id !== reg.id));
    loadTeams();
    window.dispatchEvent(
      new StorageEvent("storage", { key: "lsh_local_teams" }),
    );
    window.dispatchEvent(new Event("lsh:teams-updated"));
    toast.success(`${reg.teamName} approved and added to teams!`);
  };

  const handleRejectReg = (id: string) => {
    deleteTeamRegistration(id);
    setPendingRegs((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleFavorite = (teamId: string) => {
    setFavoriteTeams((prev) => {
      const next = prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId];
      localStorage.setItem("favoriteTeams", JSON.stringify(next));
      return next;
    });
  };

  const isLoading = actorFetching || loadingData;

  // Sort: favorited teams float to top
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      const aFav = favoriteTeams.includes(a.teamId) ? 0 : 1;
      const bFav = favoriteTeams.includes(b.teamId) ? 0 : 1;
      return aFav - bFav;
    });
  }, [teams, favoriteTeams]);

  return (
    <div data-ocid="teams.page" className="min-h-screen pb-24 pt-14">
      {/* Header */}
      <div
        className="px-4 py-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.04 255) 0%, oklch(0.14 0.06 252) 100%)",
        }}
      >
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-3">
            {/* TEAMS tab indicator */}
            <div className="flex items-center">
              <h1 className="font-display font-black text-xl text-foreground">
                TEAMS
              </h1>
              <div
                className="h-0.5 w-full mt-0.5"
                style={{ background: "oklch(0.55 0.22 24)" }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLoading
              ? "Loading teams…"
              : `${teams.length} club${teams.length !== 1 ? "s" : ""} competing this season`}
          </p>
        </motion.div>
      </div>

      {/* Pending Team Registrations — Officials only */}
      {isOfficial && pendingRegs.length > 0 && (
        <div
          className="mx-4 mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 overflow-hidden"
          data-ocid="teams.pending_regs.panel"
        >
          <div className="px-4 py-2.5 border-b border-yellow-500/20 flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-yellow-400">
              Pending Registrations
            </span>
            <span className="ml-auto inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold">
              {pendingRegs.length}
            </span>
          </div>
          <div className="divide-y divide-border/30">
            {pendingRegs.map((reg, i) => (
              <div
                key={reg.id}
                className="px-4 py-3 flex items-start gap-3"
                data-ocid={`teams.pending_reg.item.${i + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground">
                    {reg.teamName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Coach: {reg.coachName}
                  </p>
                  {reg.area && (
                    <p className="text-xs text-muted-foreground">{reg.area}</p>
                  )}
                  {reg.contactPhone && (
                    <p className="text-xs text-muted-foreground">
                      {reg.contactPhone}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    data-ocid={`teams.pending_reg.approve_button.${i + 1}`}
                    onClick={() => handleApproveReg(reg)}
                    className="w-8 h-8 rounded-full bg-green-500/20 hover:bg-green-500/40 flex items-center justify-center transition-colors"
                    aria-label="Approve registration"
                  >
                    <span className="text-green-400 text-sm font-bold">✓</span>
                  </button>
                  <button
                    type="button"
                    data-ocid={`teams.pending_reg.delete_button.${i + 1}`}
                    onClick={() => handleRejectReg(reg.id)}
                    className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-colors"
                    aria-label="Reject registration"
                  >
                    <span className="text-red-400 text-sm font-bold">✗</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <span className="text-base">⚽</span>
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          FOOTBALL
        </h2>
        <div className="flex-1 h-px bg-border/50" />
        {!isLoading && (
          <span className="text-[10px] text-muted-foreground">
            {sortedTeams.length} teams
          </span>
        )}
      </div>

      {/* Vertical list */}
      <div className="divide-y divide-border/30" data-ocid="teams.list">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
            <TeamRowSkeleton key={`team-skeleton-${i}`} />
          ))
        ) : sortedTeams.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center px-6"
            data-ocid="teams.empty_state"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "oklch(0.18 0.04 255)" }}
            >
              <Users className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-base text-foreground mb-1">
              No teams registered yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-52">
              Officials can add teams via the Admin Panel.
            </p>
          </div>
        ) : (
          sortedTeams.map((team, i) => {
            const color = getTeamColor(i);
            const isFav = favoriteTeams.includes(team.teamId);

            return (
              <motion.div
                key={team.teamId}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                data-ocid={`teams.item.${i + 1}`}
              >
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                  {/* Team crest / initial circle */}
                  <button
                    type="button"
                    className="flex items-center gap-3 flex-1 min-w-0"
                    onClick={() => navigate({ to: `/teams/${team.teamId}` })}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0 border-2"
                      style={{
                        backgroundColor: `${color}33`,
                        borderColor: `${color}66`,
                        color,
                      }}
                    >
                      {team.name.slice(0, 2).toUpperCase()}
                    </div>
                    {/* Team info */}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-bold text-sm text-foreground truncate">
                        {team.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        FKF Lamu County League
                      </p>
                      {team.area && (
                        <AreaBadge area={team.area} className="mt-0.5" />
                      )}
                    </div>
                  </button>

                  {/* Star favorite */}
                  <button
                    type="button"
                    data-ocid={`teams.star.toggle.${i + 1}`}
                    onClick={() => toggleFavorite(team.teamId)}
                    className="p-2 rounded-full hover:bg-muted/40 transition-colors flex-shrink-0"
                    aria-label={
                      isFav ? "Remove from favorites" : "Add to favorites"
                    }
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        isFav
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
