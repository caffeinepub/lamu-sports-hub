import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  LSH_USER_SETTINGS_KEY,
  type UserSettings,
  getDeletedTeamIds,
  getLocalPlayers,
  getLocalTeams,
  getOfficials,
  getPitches,
  getSeasonSettings,
  getTeamOverrides,
  getUserSettings,
  setLocalStore,
} from "@/utils/localStore";
import { applyTheme } from "@/utils/themeUtils";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CheckCircle,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Heart,
  HelpCircle,
  Info,
  Languages,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  Mic,
  Monitor,
  Moon,
  Phone,
  Radio,
  Settings,
  Share2,
  Shield,
  Star,
  Sun,
  Trash2,
  Trophy,
  User,
  UserX,
  Users,
  Volume2,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  label,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: accent ?? "oklch(0.25 0.06 252 / 0.5)" }}
      >
        <Icon className="w-3.5 h-3.5 text-foreground" />
      </div>
      <h2 className="font-display font-black text-xs text-foreground uppercase tracking-widest">
        {label}
      </h2>
    </div>
  );
}

// ─── Quick Link Row ────────────────────────────────────────────────────────────
function QuickLinkRow({
  icon: Icon,
  label,
  to,
  onNavigate,
}: {
  icon: React.ElementType;
  label: string;
  to: string;
  onNavigate: (path: string) => void;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-3 w-full py-2.5 px-1 rounded-lg hover:bg-muted/40 transition-colors text-left group"
      onClick={() => onNavigate(to)}
    >
      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <span className="flex-1 text-sm font-medium text-foreground">
        {label}
      </span>
      <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
    </button>
  );
}

// ─── Channel Row ──────────────────────────────────────────────────────────────
function ChannelRow({
  icon: Icon,
  iconColor,
  platform,
  handle,
  url,
}: {
  icon: React.ElementType;
  iconColor: string;
  platform: string;
  handle: string;
  url: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-muted/40 transition-colors group"
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: `${iconColor}22` }}
      >
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{platform}</p>
        <p className="text-xs text-muted-foreground truncate">{handle}</p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
    </a>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(getUserSettings);
  const [saving, setSaving] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [notifSound, setNotifSound] = useState<boolean>(() => {
    try {
      return JSON.parse(localStorage.getItem("notifSound") ?? "true");
    } catch {
      return true;
    }
  });
  const [matchStartAlert, setMatchStartAlert] = useState<boolean>(() => {
    try {
      return JSON.parse(localStorage.getItem("matchStartAlert") ?? "true");
    } catch {
      return true;
    }
  });
  const [goalAlertSound, setGoalAlertSound] = useState<boolean>(() => {
    try {
      return JSON.parse(localStorage.getItem("goalAlertSound") ?? "true");
    } catch {
      return true;
    }
  });
  const [newsAlertSound, setNewsAlertSound] = useState<boolean>(() => {
    try {
      return JSON.parse(localStorage.getItem("newsAlertSound") ?? "false");
    } catch {
      return false;
    }
  });
  const [appRating, setAppRating] = useState<number>(() => {
    try {
      return Number.parseInt(localStorage.getItem("appRating") ?? "0", 10);
    } catch {
      return 0;
    }
  });
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(() => {
    return !!localStorage.getItem("appRating");
  });
  const [hoverRating, setHoverRating] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const seasonSettings = getSeasonSettings();
  const pitches = getPitches();
  const officials = getOfficials();

  // Real teams from local store (with overrides applied, deleted filtered out)
  const overrides = getTeamOverrides();
  const deletedIds = new Set(getDeletedTeamIds());
  const realTeams = getLocalTeams()
    .filter((t) => !deletedIds.has(t.teamId))
    .map((t) => ({
      teamId: t.teamId,
      name: overrides[t.teamId]?.name ?? t.name,
      area: overrides[t.teamId]?.area ?? t.area,
    }));

  // Real players from local store
  const realPlayers = getLocalPlayers();

  const update = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      setLocalStore(LSH_USER_SETTINGS_KEY, next);
      return next;
    });
    toast.success("Preference saved", { duration: 1200 });
  };

  const toggleInterest = (interest: string) => {
    setSettings((prev) => {
      const current = prev.interests;
      const next = current.includes(interest)
        ? current.filter((i) => i !== interest)
        : [...current, interest];
      const newSettings = { ...prev, interests: next };
      setLocalStore(LSH_USER_SETTINGS_KEY, newSettings);
      return newSettings;
    });
    toast.success("Interest updated", { duration: 1200 });
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setLocalStore(LSH_USER_SETTINGS_KEY, settings);
    // Apply theme immediately so the user sees the change without reload
    applyTheme(settings.theme);
    setSaving(false);
    toast.success("Settings saved!");
  };

  const handleClearData = () => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("lsh_"));
    for (const k of keys) {
      localStorage.removeItem(k);
    }
    toast.success("App data cleared. Reloading…");
    setTimeout(() => window.location.reload(), 800);
  };

  const handleShare = async () => {
    const shareData = {
      title: "Lamu Sports Hub",
      text: "Track live Lamu football — scores, tables, news & more!",
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled — do nothing
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("App link copied to clipboard!");
      } catch {
        toast.error("Could not copy link. Please copy manually.");
      }
    }
  };

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        toast.success("App installed! Find it on your home screen.");
        setInstallPrompt(null);
      }
    } else {
      toast.info('In Chrome: tap ⋮ menu → "Add to Home screen" to install');
    }
  };

  const goTo = (path: string) => {
    navigate({ to: path as "/" });
  };

  const playBeep = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      /* audio not available */
    }
  };

  const handleNotifToggle = (
    key: string,
    setter: (v: boolean) => void,
    value: boolean,
  ) => {
    setter(value);
    localStorage.setItem(key, JSON.stringify(value));
    if (value && notifSound) playBeep();
  };

  const handleRatingSubmit = () => {
    if (appRating === 0) return;
    localStorage.setItem("appRating", String(appRating));
    setRatingSubmitted(true);
    toast.success("Thanks for your rating! ⭐");
  };

  const sectionClass = "rounded-2xl border border-border bg-card p-4 space-y-1";

  const INTEREST_OPTIONS = [
    { id: "news", label: "News & Updates", icon: FileText },
    { id: "leaderboard", label: "Leaderboards", icon: Trophy },
    { id: "matchday", label: "Matchday Live", icon: Zap },
    { id: "mvp", label: "MVP Votes", icon: Star },
    { id: "explore", label: "Explore / Tactics", icon: Eye },
  ];

  return (
    <div data-ocid="settings.page" className="min-h-screen pb-28 pt-14">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="px-4 py-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.04 255) 0%, oklch(0.15 0.07 252) 100%)",
        }}
      >
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="font-display font-black text-2xl text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            My LSH Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Personalise your Lamu Sports Hub experience
          </p>
        </motion.div>
      </div>

      <div className="px-4 mt-5 space-y-4">
        {/* ── Personal Details & Account Security ────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.03 }}
          className={sectionClass}
          data-ocid="settings.account_security.section"
        >
          <SectionHeader
            icon={Lock}
            label="Personal Details & Account Security"
            accent="oklch(0.3 0.16 252 / 0.5)"
          />

          {/* Security status */}
          <div className="flex items-center gap-3 rounded-xl bg-muted/20 border border-border/40 px-3 py-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-foreground">
                  Internet Identity
                </p>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0 h-4 flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5" />
                  Secured
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                Your Internet Identity is secured by your device (fingerprint,
                Face ID, or security key)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href="https://identity.ic0.app"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="settings.manage_identity.button"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors px-3 py-2.5 text-xs font-bold text-primary"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Manage Identity
            </a>
            <button
              type="button"
              data-ocid="settings.account_recovery.button"
              onClick={() => goTo("/recovery")}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors px-3 py-2.5 text-xs font-bold text-foreground"
            >
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              Account Recovery
            </button>
          </div>
        </motion.section>

        {/* ── Profile ──────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className={sectionClass}
          data-ocid="settings.profile.section"
        >
          <SectionHeader
            icon={User}
            label="Profile"
            accent="oklch(0.3 0.12 230 / 0.5)"
          />
          <div>
            <Label className="text-xs mb-1.5 block text-muted-foreground">
              Display Name
            </Label>
            <Input
              value={settings.displayName}
              onChange={(e) => update("displayName", e.target.value)}
              className="h-9 text-sm"
              placeholder="Enter your display name…"
              data-ocid="settings.display_name.input"
            />
          </div>
        </motion.section>

        {/* ── Manage Account ────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.07 }}
          className={sectionClass}
          data-ocid="settings.manage_account.section"
        >
          <SectionHeader
            icon={UserX}
            label="Manage Account"
            accent="oklch(0.35 0.2 24 / 0.4)"
          />
          <p className="text-[11px] text-muted-foreground leading-relaxed pb-1">
            Manage your account data and profile settings.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 gap-1.5"
                  data-ocid="settings.clear_data.button"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear App Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all app data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset all your local settings, saved preferences,
                    and cached data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="outline"
              size="sm"
              className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
              data-ocid="settings.delete_account.button"
              onClick={() => goTo("/suggestions")}
            >
              <UserX className="w-3.5 h-3.5" />
              Delete Account
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/50 pt-1">
            Account deletion requires contacting an official via the Suggestions
            page.
          </p>
        </motion.section>

        {/* ── Favourite Team ────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={sectionClass}
          data-ocid="settings.favorite.section"
        >
          <SectionHeader
            icon={Star}
            label="Favourite Team"
            accent="oklch(0.65 0.18 75 / 0.35)"
          />
          <p className="text-[11px] text-muted-foreground pb-1">
            Personalises your home screen with your team's news, previews, and
            highlights.
          </p>
          <div>
            <Label className="text-xs mb-1.5 block text-muted-foreground">
              Select your team
            </Label>
            <Select
              value={settings.favoriteTeamId}
              onValueChange={(v) => update("favoriteTeamId", v)}
            >
              <SelectTrigger
                className="h-9 text-sm"
                data-ocid="settings.favorite_team.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {realTeams.length === 0 ? (
                  <SelectItem
                    value="__no_teams__"
                    disabled
                    className="text-sm text-muted-foreground"
                  >
                    No teams registered yet
                  </SelectItem>
                ) : (
                  realTeams.map((team) => (
                    <SelectItem
                      key={team.teamId}
                      value={team.teamId}
                      className="text-sm"
                    >
                      {team.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </motion.section>

        {/* ── Favourite Player ──────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className={sectionClass}
          data-ocid="settings.favorite_player.section"
        >
          <SectionHeader
            icon={Users}
            label="Favourite Player"
            accent="oklch(0.45 0.15 252 / 0.4)"
          />
          <div>
            <Label className="text-xs mb-1.5 block text-muted-foreground">
              Select your player
            </Label>
            <Select
              value={settings.favoritePlayerId ?? "__none__"}
              onValueChange={(v) =>
                update("favoritePlayerId", v === "__none__" ? undefined : v)
              }
            >
              <SelectTrigger
                className="h-9 text-sm"
                data-ocid="settings.favorite_player.select"
              >
                <SelectValue placeholder="Choose a player…" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                <SelectItem
                  value="__none__"
                  className="text-sm text-muted-foreground"
                >
                  — No favourite player —
                </SelectItem>
                {realPlayers.map((player) => {
                  const team = realTeams.find(
                    (t) => t.teamId === player.teamId,
                  );
                  return (
                    <SelectItem
                      key={player.playerId}
                      value={player.playerId}
                      className="text-sm"
                    >
                      {player.name}
                      {team ? ` (${team.name})` : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </motion.section>

        {/* ── Smart Alerts (Notifications) ──────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`${sectionClass} !space-y-0`}
          data-ocid="settings.notifications.section"
        >
          <SectionHeader
            icon={Bell}
            label="Smart Alerts"
            accent="oklch(0.55 0.2 24 / 0.35)"
          />
          <p className="text-[11px] text-muted-foreground pb-2">
            Configure which alerts you receive for matches and updates.
          </p>
          <div className="space-y-0 divide-y divide-border/40">
            {[
              {
                key: "matchAlerts" as const,
                label: "Match Alerts",
                desc: "Upcoming match reminders and live score notifications",
                ocid: "settings.match_alerts.switch",
                icon: Bell,
              },
              {
                key: "lineupAlerts" as const,
                label: "Lineup Alerts",
                desc: "Get notified when team lineups are confirmed",
                ocid: "settings.lineup_alerts.switch",
                icon: Users,
              },
              {
                key: "goalAlerts" as const,
                label: "Goal Alerts",
                desc: "Instant alerts when a goal is scored",
                ocid: "settings.goal_alerts.switch",
                icon: Zap,
              },
              {
                key: "newsAlerts" as const,
                label: "News Updates",
                desc: "Latest news and announcements from LSH officials",
                ocid: "settings.news_alerts.switch",
                icon: FileText,
              },
              {
                key: "mvpReminders" as const,
                label: "MVP Vote Reminders",
                desc: "Reminders to vote for the weekly Match MVP",
                ocid: "settings.mvp_reminders.switch",
                icon: Trophy,
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-start justify-between gap-3 py-3 first:pt-0"
              >
                <div className="flex items-start gap-2.5 flex-1">
                  <item.icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings[item.key]}
                  onCheckedChange={(v) => update(item.key, v)}
                  data-ocid={item.ocid}
                />
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Notification Sounds ───────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.21 }}
          className={`${sectionClass} !space-y-0`}
          data-ocid="settings.notif_sounds.section"
        >
          <SectionHeader
            icon={Volume2}
            label="Notification Sounds"
            accent="oklch(0.35 0.18 200 / 0.4)"
          />
          <p className="text-[11px] text-muted-foreground pb-2">
            Configure sound alerts for match events.
          </p>
          <div className="space-y-0 divide-y divide-border/40">
            {[
              {
                label: "Sound Alerts",
                desc: "Enable all notification sounds",
                key: "notifSound",
                value: notifSound,
                setter: (v: boolean) =>
                  handleNotifToggle("notifSound", setNotifSound, v),
                ocid: "settings.sound_alerts.switch",
              },
              {
                label: "Match Start Alert",
                desc: "Play sound when a match kicks off",
                key: "matchStartAlert",
                value: matchStartAlert,
                setter: (v: boolean) =>
                  handleNotifToggle("matchStartAlert", setMatchStartAlert, v),
                ocid: "settings.match_start.switch",
              },
              {
                label: "Goal Alerts",
                desc: "Sound when a goal is scored",
                key: "goalAlertSound",
                value: goalAlertSound,
                setter: (v: boolean) =>
                  handleNotifToggle("goalAlertSound", setGoalAlertSound, v),
                ocid: "settings.goal_sound.switch",
              },
              {
                label: "News Alerts",
                desc: "Sound for new official announcements",
                key: "newsAlertSound",
                value: newsAlertSound,
                setter: (v: boolean) =>
                  handleNotifToggle("newsAlertSound", setNewsAlertSound, v),
                ocid: "settings.news_sound.switch",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-start justify-between gap-3 py-3 first:pt-0"
              >
                <div className="flex items-start gap-2.5 flex-1">
                  <Volume2 className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={item.value}
                  onCheckedChange={item.setter}
                  data-ocid={item.ocid}
                />
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Save Button ───────────────────────────────────────────────────── */}
        <Button
          className="w-full text-sm font-bold"
          onClick={handleSave}
          disabled={saving}
          data-ocid="settings.save_button"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
          }}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving…
            </>
          ) : (
            "Save Settings"
          )}
        </Button>

        {/* ── Appearance & Interests ────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.22 }}
          className={sectionClass}
          data-ocid="settings.appearance.section"
        >
          <SectionHeader
            icon={Monitor}
            label="Appearance & Interests"
            accent="oklch(0.3 0.15 280 / 0.5)"
          />

          {/* Theme */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Theme
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  {
                    value: "dark",
                    label: "Dark",
                    icon: Moon,
                    ocid: "settings.theme_dark.toggle",
                  },
                  {
                    value: "light",
                    label: "Light",
                    icon: Sun,
                    ocid: "settings.theme_light.toggle",
                  },
                  {
                    value: "system",
                    label: "System",
                    icon: Monitor,
                    ocid: "settings.theme_system.toggle",
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  data-ocid={opt.ocid}
                  onClick={() => {
                    update("theme", opt.value);
                    applyTheme(opt.value as "dark" | "light" | "system");
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${
                    settings.theme === opt.value
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-muted/20 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <opt.icon className="w-4 h-4" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Separator className="my-3" />

          {/* Content Interests */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Content Interests
            </p>
            <div className="space-y-2">
              {INTEREST_OPTIONS.map((opt, idx) => (
                <div
                  key={opt.id}
                  className="flex items-center gap-3 py-1.5 px-1 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <Checkbox
                    id={`interest-${opt.id}`}
                    checked={settings.interests.includes(opt.id)}
                    onCheckedChange={() => toggleInterest(opt.id)}
                    data-ocid={`settings.interests.checkbox.${idx + 1}`}
                  />
                  <Label
                    htmlFor={`interest-${opt.id}`}
                    className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1"
                  >
                    <opt.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Language / Regional Settings ──────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.24 }}
          className={sectionClass}
          data-ocid="settings.language.section"
        >
          <SectionHeader
            icon={Languages}
            label="Language & Regional Settings"
            accent="oklch(0.3 0.12 145 / 0.4)"
          />
          <div>
            <Label className="text-xs mb-1.5 block text-muted-foreground">
              Language
            </Label>
            <Select
              value={settings.language}
              onValueChange={(v) => {
                update("language", v as UserSettings["language"]);
                toast.success(
                  v === "sw" ? "Lugha imebadilishwa!" : "Language changed!",
                );
              }}
            >
              <SelectTrigger
                className="h-9 text-sm"
                data-ocid="settings.language.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en" className="text-sm">
                  🇬🇧 English
                </SelectItem>
                <SelectItem value="sw" className="text-sm">
                  🇰🇪 Kiswahili
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-start gap-2 mt-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
            <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-300 leading-relaxed">
              Some content (including radio) may be subject to territory
              restrictions and may not be available in all regions.
            </p>
          </div>
        </motion.section>

        {/* ── Share & Download ──────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.23 }}
          className={sectionClass}
          data-ocid="settings.share_download.section"
        >
          <SectionHeader
            icon={Share2}
            label="Share & Download"
            accent="oklch(0.35 0.18 252 / 0.4)"
          />
          <p className="text-[11px] text-muted-foreground pb-1">
            Share the app with friends or install it on your home screen.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              data-ocid="settings.share_app.button"
              onClick={handleShare}
              className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors px-3 py-2.5 text-xs font-bold text-primary"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share App
            </button>
            <button
              type="button"
              data-ocid="settings.install_app.button"
              onClick={handleInstall}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors px-3 py-2.5 text-xs font-bold text-foreground"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              {installPrompt ? "Install App" : "Open in Browser"}
            </button>
          </div>
          <div className="mt-3 p-3 rounded-xl bg-muted/30 border border-border/40">
            <p className="text-xs font-bold text-foreground mb-1">
              📱 Add to Home Screen (Android)
            </p>
            <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal list-inside">
              <li>Tap "Install App" above, OR open Chrome menu (⋮)</li>
              <li>Tap "Add to Home screen"</li>
              <li>
                Tap "Add" to confirm — the app icon appears on your home screen
              </li>
              <li>
                Open from your home screen for a full-screen app experience
              </li>
            </ol>
          </div>
        </motion.section>

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 py-1">
          <Separator className="flex-1" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            App Information
          </span>
          <Separator className="flex-1" />
        </div>

        {/* ── App Info ──────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className={sectionClass}
          data-ocid="settings.app_info.section"
        >
          <SectionHeader
            icon={Info}
            label="App Info"
            accent="oklch(0.3 0.1 220 / 0.5)"
          />
          <div className="grid grid-cols-2 gap-2 mt-1">
            {[
              { label: "App", value: "Lamu Sports Hub" },
              { label: "Version", value: "1.0.0 (Phase 1 MVP)" },
              {
                label: "Season",
                value: seasonSettings.seasonName,
              },
              {
                label: "Tournament",
                value: seasonSettings.tournamentName,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl bg-muted/30 border border-border/50 px-3 py-2.5"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                  {label}
                </p>
                <p className="text-sm font-semibold text-foreground leading-snug">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-primary/70 font-semibold pt-2 pb-1">
            🏝️ Island Pride. Island Football.
          </p>
        </motion.section>

        {/* ── Pitches ───────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={sectionClass}
          data-ocid="settings.pitches.section"
        >
          <SectionHeader
            icon={MapPin}
            label="Pitches & Grounds"
            accent="oklch(0.3 0.12 145 / 0.4)"
          />
          <div className="space-y-2 mt-1">
            {pitches.map((pitch, i) => (
              <div
                key={pitch.pitchId}
                className="flex items-start gap-3 rounded-xl bg-muted/20 border border-border/40 px-3 py-2.5"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-black bg-primary/10 text-primary mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    {pitch.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {pitch.location}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4"
                    >
                      {pitch.surface}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground/60">
                      Cap: {pitch.capacity.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── LSH Channels ─────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className={sectionClass}
          data-ocid="settings.channels.section"
        >
          <SectionHeader
            icon={Globe}
            label="LSH Channels"
            accent="oklch(0.35 0.15 160 / 0.4)"
          />
          <div className="divide-y divide-border/30">
            <ChannelRow
              icon={MessageCircle}
              iconColor="oklch(0.65 0.2 145)"
              platform="WhatsApp"
              handle="+254 705 434 375"
              url="https://wa.me/254705434375"
            />
            <ChannelRow
              icon={Globe}
              iconColor="oklch(0.55 0.22 0)"
              platform="Instagram"
              handle="@lamusportshub"
              url="https://instagram.com/lamusportshub"
            />
            <ChannelRow
              icon={Globe}
              iconColor="oklch(0.5 0.2 252)"
              platform="Facebook"
              handle="Lamu Sports Hub"
              url="https://facebook.com/lamusportshub"
            />
            <ChannelRow
              icon={Globe}
              iconColor="oklch(0.7 0.02 220)"
              platform="X (Twitter)"
              handle="@LamuSportsHub"
              url="https://x.com/LamuSportsHub"
            />
          </div>
        </motion.section>

        {/* ── Radio Lamu FM ─────────────────────────────────────────────────── */}
        <motion.section
          id="radio-lamu-fm"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.37 }}
          className="rounded-2xl border border-border overflow-hidden"
          data-ocid="settings.radio_lamu.section"
        >
          {/* Gradient header */}
          <div
            className="px-4 pt-4 pb-3"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.2 0.12 230) 0%, oklch(0.25 0.14 250) 50%, oklch(0.22 0.16 20) 100%)",
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-black text-lg text-white">
                    Radio Lamu FM
                  </h3>
                  <Badge className="bg-white/20 text-white border-white/30 text-[10px] px-1.5 py-0 h-4">
                    91.1 MHz
                  </Badge>
                </div>
                <p className="text-xs font-bold text-white/70 tracking-widest uppercase mt-0.5">
                  IDHAA YA JAMII
                </p>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Inspiring Lamu's youth with 24/7 community stories
                </p>
              </div>
            </div>

            {/* Live pulse indicator */}
            <div className="flex items-center gap-2 mt-3">
              <div className="relative flex items-center justify-center w-5 h-5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </div>
              <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider">
                Broadcasting 24 / 7
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="bg-card px-4 py-3 space-y-3">
            <a
              href="https://www.google.com/search?q=Radio+Lamu+FM+live+stream"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="settings.radio_listen.button"
              className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.2 230) 0%, oklch(0.55 0.22 250) 100%)",
              }}
            >
              <Mic className="w-4 h-4" />
              Listen Live
            </a>

            <div className="space-y-2">
              <a
                href="mailto:info@lamuyouthalliance.org"
                className="flex items-center gap-3 py-2 rounded-lg hover:bg-muted/40 transition-colors group"
              >
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  info@lamuyouthalliance.org
                </span>
              </a>

              <a
                href="tel:+254726613166"
                className="flex items-center gap-3 py-2 rounded-lg hover:bg-muted/40 transition-colors group"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-sm text-foreground group-hover:text-emerald-400 transition-colors">
                  +254 726 613166
                </span>
              </a>

              <div className="flex items-center gap-3 py-2">
                <div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Lamu, Kenya
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Officials Contacts ────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={sectionClass}
          data-ocid="settings.officials.section"
        >
          <SectionHeader
            icon={Shield}
            label="Officials Contacts"
            accent="oklch(0.35 0.16 50 / 0.4)"
          />
          <div className="space-y-2 mt-1">
            {officials
              .slice()
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((official) => (
                <div
                  key={official.officialId}
                  className="flex items-center gap-3 rounded-xl bg-muted/20 border border-border/40 px-3 py-2.5"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-primary uppercase">
                      {official.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {official.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {official.title}
                    </p>
                  </div>
                  <a
                    href={`tel:${official.contact.replace(/\s/g, "")}`}
                    className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center shrink-0 transition-colors"
                    title={`Call ${official.name}`}
                    aria-label={`Call ${official.name}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-primary" />
                  </a>
                </div>
              ))}
          </div>
          <p className="text-[10px] text-muted-foreground/60 text-center pt-1">
            Tap the phone icon to call an official directly
          </p>
        </motion.section>

        {/* ── Help & Support ────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.42 }}
          className={sectionClass}
          data-ocid="settings.help.section"
        >
          <SectionHeader
            icon={HelpCircle}
            label="Help & Support"
            accent="oklch(0.3 0.14 180 / 0.4)"
          />
          <Accordion type="single" collapsible className="w-full">
            {[
              {
                q: "How do I register a player?",
                a: "Go to More > Add Player or Admin Panel > Players tab. Fill in the player details and tap Submit.",
              },
              {
                q: "How do I post news?",
                a: "Go to Admin Panel > News tab. Write your story, upload a photo, toggle Publish immediately ON, then tap Add News.",
              },
              {
                q: "How do I vote for MVP?",
                a: "After a match, go to More > MVP Vote or the match card. Select the player who performed best and confirm your vote.",
              },
              {
                q: "How do I report a problem?",
                a: "Go to More > Suggestions or tap Submit Feedback in Quick Links. Describe the issue and officials will respond.",
              },
              {
                q: "What is Internet Identity?",
                a: "It is a secure, passwordless login using your device (fingerprint, Face ID, or security key). No password needed — your device IS your key.",
              },
              {
                q: "Is my data safe?",
                a: "Yes. All data is stored on the Internet Computer blockchain, which cannot be modified without admin access.",
              },
            ].map((item, idx) => (
              <AccordionItem
                key={item.q}
                value={`faq-${idx}`}
                data-ocid={`settings.help.panel.${idx + 1}`}
              >
                <AccordionTrigger className="text-sm font-semibold text-foreground text-left hover:no-underline py-3">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[13px] text-muted-foreground leading-relaxed pb-3">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.section>

        {/* ── Quick Links ───────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className={sectionClass}
          data-ocid="settings.quick_links.section"
        >
          <SectionHeader
            icon={ChevronRight}
            label="Quick Links"
            accent="oklch(0.3 0.08 270 / 0.4)"
          />
          <div className="divide-y divide-border/30">
            <button
              type="button"
              className="flex items-center gap-3 w-full py-2.5 px-1 rounded-lg hover:bg-muted/40 transition-colors text-left group"
              onClick={() => setShowTerms(true)}
              data-ocid="settings.terms.button"
            >
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="flex-1 text-sm font-medium text-foreground">
                Terms &amp; Conditions
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            </button>
            <button
              type="button"
              className="flex items-center gap-3 w-full py-2.5 px-1 rounded-lg hover:bg-muted/40 transition-colors text-left group"
              onClick={() => setShowPrivacy(true)}
              data-ocid="settings.privacy.button"
            >
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Shield className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="flex-1 text-sm font-medium text-foreground">
                Privacy Policy
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            </button>
            <QuickLinkRow
              icon={Info}
              label="About the App"
              to="/about"
              onNavigate={goTo}
            />
            <QuickLinkRow
              icon={Clock}
              label="LSH History"
              to="/history"
              onNavigate={goTo}
            />
            <QuickLinkRow
              icon={MessageCircle}
              label="Submit Feedback"
              to="/suggestions"
              onNavigate={goTo}
            />
            <QuickLinkRow
              icon={Trophy}
              label="Awards"
              to="/awards"
              onNavigate={goTo}
            />
            <button
              type="button"
              className="flex items-center gap-3 w-full py-2.5 px-1 rounded-lg hover:bg-muted/40 transition-colors text-left group"
              onClick={() => {
                setTimeout(() => {
                  document
                    .getElementById("radio-lamu-fm")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Radio className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="flex-1 text-sm font-medium text-foreground">
                Radio Lamu FM
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            </button>
          </div>
        </motion.section>

        {/* ── Rate the App ──────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.48 }}
          className={sectionClass}
          data-ocid="settings.rate_app.section"
        >
          <SectionHeader
            icon={Star}
            label="Rate Lamu Sports Hub"
            accent="oklch(0.55 0.22 85 / 0.4)"
          />
          {ratingSubmitted ? (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-6 h-6 ${s <= appRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <p className="text-sm font-bold text-foreground">
                You rated us {appRating}/5 stars. Thank you!
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    data-ocid={`settings.rating_star.${s}`}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setAppRating(s)}
                    className="p-1 rounded transition-transform hover:scale-110"
                    aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${s <= (hoverRating || appRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Tell us what you think... (optional)"
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                className="text-xs resize-none h-20"
                data-ocid="settings.rating_comment.textarea"
              />
              <Button
                onClick={handleRatingSubmit}
                disabled={appRating === 0}
                className="w-full text-sm font-bold"
                data-ocid="settings.rating_submit.button"
                style={{
                  background:
                    appRating > 0
                      ? "linear-gradient(135deg, oklch(0.6 0.22 85) 0%, oklch(0.55 0.22 70) 100%)"
                      : undefined,
                }}
              >
                Submit Rating
              </Button>
            </div>
          )}
        </motion.section>

        {/* ── FAQ ────────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={sectionClass}
          data-ocid="settings.faq.section"
        >
          <SectionHeader
            icon={HelpCircle}
            label="Frequently Asked Questions"
            accent="oklch(0.3 0.14 180 / 0.4)"
          />
          <Accordion type="single" collapsible className="w-full">
            {[
              {
                q: "How do I add my team?",
                a: "Enter Official mode using code LSH2026, then go to Admin Panel → Teams → Add Team.",
              },
              {
                q: "Who can edit match scores?",
                a: "Only officials in Official mode can edit live scores and match events.",
              },
              {
                q: "How do I follow a match?",
                a: "On the Matches page, tap the star icon next to any match to follow it.",
              },
              {
                q: "Is the app free?",
                a: "Yes, Lamu Sports Hub is completely free to use for all fans, players, and officials.",
              },
              {
                q: "How do I install the app on my phone?",
                a: "Open the app in Chrome on Android, tap the menu (3 dots), and select 'Add to Home Screen'.",
              },
              {
                q: "Why is my data not saving?",
                a: "Data is only permanently saved in Official mode. Simple PIN login saves data locally on your device only.",
              },
              {
                q: "How do I contact support?",
                a: "WhatsApp us at 0705434375 or visit the About page for all contact options.",
              },
            ].map((item, idx) => (
              <AccordionItem
                key={item.q}
                value={`faq-main-${idx}`}
                data-ocid={`settings.faq.panel.${idx + 1}`}
              >
                <AccordionTrigger className="text-sm font-semibold text-foreground text-left hover:no-underline py-3">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[13px] text-muted-foreground leading-relaxed pb-3">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.section>

        {/* ── App Version Footer ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-center py-6 space-y-1"
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <Heart className="w-2.5 h-2.5 text-primary" />
            </div>
            <p className="text-xs font-black text-foreground/80 tracking-wide">
              Lamu Sports Hub v1.0.0
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Built with Island Pride by{" "}
            <span className="font-semibold text-foreground/70">
              Said Joseph
            </span>
          </p>
          <p className="text-[10px] text-muted-foreground/50">
            Phase 1 MVP · Internet Computer · {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>

      {/* ── Terms & Conditions Sheet ──────────────────────────────────────── */}
      <Sheet open={showTerms} onOpenChange={setShowTerms}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh]">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-lg font-black">
              Terms &amp; Conditions
            </SheetTitle>
          </SheetHeader>
          <div className="max-h-[70vh] overflow-y-auto px-4 pb-6 space-y-4 text-sm">
            <p className="text-[11px] text-muted-foreground">
              Last updated: March 2026
            </p>
            <div>
              <h3 className="font-bold text-foreground mb-1">1. Acceptance</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                By using Lamu Sports Hub, you agree to these terms.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">
                2. Use of Service
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                LSH is for informational and community use for the FKF Lamu
                County League. Users must not misuse the platform.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">
                3. Official Content
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Only verified officials (access code LSH2026) may add, edit, or
                delete league data. Unauthorized data modification is
                prohibited.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">
                4. User Accounts
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Simple login (PIN) data is stored locally on your device.
                Internet Identity accounts are secured by the Internet Computer
                blockchain.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">
                5. Intellectual Property
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                All content on LSH is owned by Lamu Sports Hub or licensed by
                it.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">
                6. Limitation of Liability
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                LSH is provided as-is. We are not responsible for data loss or
                service interruptions.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">7. Contact</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Contact us via WhatsApp:{" "}
                <span className="text-primary font-semibold">0705434375</span>{" "}
                for any concerns.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Privacy Policy Sheet ──────────────────────────────────────────── */}
      <Sheet open={showPrivacy} onOpenChange={setShowPrivacy}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh]">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-lg font-black">
              Privacy Policy
            </SheetTitle>
          </SheetHeader>
          <div className="max-h-[70vh] overflow-y-auto px-4 pb-6 space-y-4 text-sm">
            <p className="text-[11px] text-muted-foreground">
              Last updated: March 2026
            </p>
            <div>
              <h3 className="font-bold text-foreground mb-1">
                1. Data We Collect
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Name, role, PIN, email (optional), and preferred team.
                Officials' actions are recorded against their Internet Identity.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">
                2. How We Store It
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Data is stored on-chain via the Internet Computer blockchain
                (for officials) or locally in your device's browser storage (for
                PIN-login users). No external servers.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">
                3. Third Parties
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                We do not sell or share your data with third parties. We use
                TheSportsDB API for EPL data (anonymous requests only).
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">4. Your Rights</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                You can clear your local data from Settings &gt; Manage Account
                &gt; Clear App Data. To request deletion of on-chain data,
                contact an official.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">5. Cookies</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                This app does not use cookies.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">6. Contact</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                WhatsApp:{" "}
                <span className="text-primary font-semibold">0705434375</span>{" "}
                or{" "}
                <span className="text-primary font-semibold">
                  info@lamuyouthalliance.org
                </span>
                .
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
