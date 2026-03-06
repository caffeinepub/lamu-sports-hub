import type { T__1, T__2 } from "@/backend";
import {
  AreaBadge,
  IslandPrideBadge,
  TeamBadge,
} from "@/components/shared/TeamBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  LSH_PROFILE_PHOTO_KEY,
  LSH_USER_SETTINGS_KEY,
  getProfilePhoto,
  getUserSettings,
  setLocalStore,
} from "@/utils/localStore";
import {
  Calendar,
  Camera,
  Edit3,
  LogOut,
  Save,
  Target,
  User,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ProfilePageProps {
  role?: string;
  favoriteTeamId?: string;
  userName?: string;
}

const AREAS = [
  "Shela",
  "Hindi",
  "Mkunguni",
  "Langoni",
  "Mkomani",
  "Lamu Town",
  "Matondoni",
  "Kipungani",
];

export function ProfilePage({
  role = "fan",
  favoriteTeamId,
  userName,
}: ProfilePageProps) {
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const userSettings = getUserSettings();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(userSettings.displayName || userName || "");
  const [area, setArea] = useState("Shela");
  const [favTeam, setFavTeam] = useState(
    favoriteTeamId || userSettings.favoriteTeamId || "",
  );
  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    getProfilePhoto,
  );
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Real backend data
  const [teams, setTeams] = useState<T__1[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [myPlayer, setMyPlayer] = useState<T__2 | null>(null);
  const [playerTeam, setPlayerTeam] = useState<T__1 | null>(null);

  useEffect(() => {
    if (!actor || actorFetching) return;
    let cancelled = false;

    async function loadData() {
      try {
        const [allTeams, allPlayers] = await Promise.all([
          actor!.getAllTeams(),
          actor!.getAllPlayers(),
        ]);
        if (cancelled) return;

        setTeams(allTeams);

        // Find this user's player record by matching userId to principal
        const principal = identity?.getPrincipal().toString();
        if (principal) {
          const found = allPlayers.find((p) => p.userId === principal) ?? null;
          setMyPlayer(found);
          if (found) {
            const team =
              allTeams.find((t) => t.teamId === found.teamId) ?? null;
            setPlayerTeam(team);
          }
        }
      } catch {
        // silently fail — empty state will show
      } finally {
        if (!cancelled) setTeamsLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [actor, actorFetching, identity]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setProfilePhoto(dataUrl);
      setLocalStore(LSH_PROFILE_PHOTO_KEY, dataUrl);
      toast.success("Profile photo updated!");
    };
    reader.readAsDataURL(file);
  };

  // Favorite team from real backend teams
  const favoriteTeam = teams.find((t) => t.teamId === favTeam) ?? null;

  const handleSave = () => {
    setLocalStore(LSH_USER_SETTINGS_KEY, {
      ...getUserSettings(),
      displayName: name,
      favoriteTeamId: favTeam,
    });
    setEditing(false);
    toast.success("Profile updated successfully");
  };

  // Build a MockTeam-compatible object for TeamBadge from backend T__1
  function toTeamBadgeShape(t: T__1) {
    return {
      teamId: t.teamId,
      name: t.name,
      area: t.area,
      coachName: t.coachId,
      color: "oklch(0.55 0.18 252)",
      secondaryColor: "oklch(0.82 0.08 82)",
      wins: Number(t.wins),
      losses: Number(t.losses),
      draws: Number(t.draws),
      goalsFor: Number(t.goalsFor),
      goalsAgainst: Number(t.goalsAgainst),
      isApproved: t.isApproved,
    };
  }

  const displayName =
    name ||
    (identity
      ? `${identity.getPrincipal().toString().slice(0, 8)}...`
      : "Unknown User");

  return (
    <div data-ocid="profile.page" className="min-h-screen pb-24 pt-14">
      {/* Header */}
      <div
        className="px-4 pt-6 pb-8 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.04 255) 0%, oklch(0.14 0.06 252) 100%)",
        }}
      >
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-start gap-4"
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
                style={{ border: "3px solid oklch(0.55 0.18 252 / 0.4)" }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black font-stats"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.18 252), oklch(0.45 0.15 252))",
                  border: "3px solid oklch(0.55 0.18 252 / 0.4)",
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Camera overlay button */}
            <button
              type="button"
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.6 0.22 24)",
                border: "2px solid oklch(0.12 0.04 252)",
              }}
              onClick={() => photoInputRef.current?.click()}
              title="Upload profile photo"
              data-ocid="profile.upload_button"
            >
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-black text-xl text-foreground">
                {displayName}
              </h1>
              <IslandPrideBadge />
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge
                variant="outline"
                className="text-xs capitalize"
                style={{
                  borderColor: "oklch(0.6 0.22 24)",
                  color: "oklch(0.6 0.22 24)",
                }}
              >
                {role}
              </Badge>
              <AreaBadge area={area} />
            </div>
            {identity && (
              <p className="text-[10px] text-muted-foreground mt-1 font-mono truncate max-w-[200px]">
                {identity.getPrincipal().toString().slice(0, 16)}...
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setEditing(!editing)}
            data-ocid="profile.edit_button"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Player Stats (only if this user is a registered player) */}
        {myPlayer && playerTeam && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            data-ocid="profile.stats.card"
          >
            <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
              My Stats
            </h2>
            <div
              className="rounded-xl p-4 border border-border relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.22 0.08 252 / 0.4) 0%, oklch(0.16 0.04 255) 70%)",
              }}
            >
              <div
                className="absolute top-2 right-2 text-5xl font-black font-stats opacity-10"
                style={{ color: "oklch(0.82 0.08 82)" }}
              >
                {Number(myPlayer.jerseyNumber)}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <TeamBadge team={toTeamBadgeShape(playerTeam)} size="md" />
                <div>
                  <div className="font-bold text-sm text-foreground">
                    {playerTeam.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {myPlayer.position}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    label: "Apps",
                    value: Number(myPlayer.matchesPlayed),
                    icon: <Calendar className="w-3 h-3" />,
                  },
                  {
                    label: "Goals",
                    value: Number(myPlayer.goals),
                    icon: <Target className="w-3 h-3" />,
                  },
                  {
                    label: "Assists",
                    value: Number(myPlayer.assists),
                    icon: <Zap className="w-3 h-3" />,
                  },
                  {
                    label: "Cards",
                    value:
                      Number(myPlayer.yellowCards) + Number(myPlayer.redCards),
                    icon: null,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg bg-card/50 p-2 text-center border border-border/60"
                  >
                    <div className="font-black font-stats text-xl text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Favorite Team */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
            My Team
          </h2>
          {teamsLoading ? (
            <div
              className="rounded-xl p-4 border border-border bg-card flex items-center gap-3"
              data-ocid="profile.loading_state"
            >
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ) : favoriteTeam ? (
            <div className="rounded-xl p-4 border border-border bg-card flex items-center gap-3">
              <TeamBadge team={toTeamBadgeShape(favoriteTeam)} size="lg" />
              <div>
                <div className="font-bold text-foreground">
                  {favoriteTeam.name}
                </div>
                <AreaBadge area={favoriteTeam.area} />
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl p-4 border border-border bg-card flex items-center gap-3 text-muted-foreground text-sm"
              data-ocid="profile.empty_state"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "oklch(0.18 0.04 252)" }}
              >
                <User
                  className="w-5 h-5"
                  style={{ color: "oklch(0.5 0.08 252)" }}
                />
              </div>
              <span>
                No favourite team set — edit your profile to choose one.
              </span>
            </div>
          )}
        </motion.div>

        {/* Edit Profile Form */}
        {editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
              Edit Profile
            </h2>
            <div className="rounded-xl p-4 border border-border bg-card space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Full Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-9 text-sm"
                  data-ocid="profile.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Area
                </Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger
                    className="h-9 text-sm"
                    data-ocid="profile.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS.map((a) => (
                      <SelectItem key={a} value={a} className="text-sm">
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Favourite Team
                </Label>
                <Select
                  value={favTeam || "none"}
                  onValueChange={(v) => setFavTeam(v === "none" ? "" : v)}
                  disabled={teamsLoading}
                >
                  <SelectTrigger
                    className="h-9 text-sm"
                    data-ocid="profile.select"
                  >
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.length === 0 ? (
                      <SelectItem
                        value="none"
                        disabled
                        className="text-sm text-muted-foreground"
                      >
                        No teams registered yet
                      </SelectItem>
                    ) : (
                      teams.map((t) => (
                        <SelectItem
                          key={t.teamId}
                          value={t.teamId}
                          className="text-sm"
                        >
                          {t.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={handleSave}
                data-ocid="profile.save_button"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
                }}
              >
                <Save className="w-3 h-3 mr-2" />
                Save Changes
              </Button>
            </div>
          </motion.div>
        )}

        {/* Logout */}
        {identity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={clear}
              data-ocid="profile.delete_button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
