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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { MOCK_PLAYERS, MOCK_TEAMS } from "@/data/mockData";
import {
  LSH_USER_SETTINGS_KEY,
  type UserSettings,
  getOfficials,
  getPitches,
  getSeasonSettings,
  getUserSettings,
  setLocalStore,
} from "@/utils/localStore";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Heart,
  Info,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Settings,
  Shield,
  Star,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

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
  const navigate = useNavigate();

  const seasonSettings = getSeasonSettings();
  const pitches = getPitches();
  const officials = getOfficials();

  const update = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setLocalStore(LSH_USER_SETTINGS_KEY, settings);
    setSaving(false);
    toast.success("Settings saved!");
  };

  const goTo = (path: string) => {
    navigate({ to: path as "/" });
  };

  const sectionClass = "rounded-2xl border border-border bg-card p-4 space-y-1";

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
              <SelectContent>
                {MOCK_TEAMS.map((team) => (
                  <SelectItem
                    key={team.teamId}
                    value={team.teamId}
                    className="text-sm"
                  >
                    {team.name}
                  </SelectItem>
                ))}
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
              value={settings.favoritePlayerId ?? ""}
              onValueChange={(v) => update("favoritePlayerId", v)}
            >
              <SelectTrigger
                className="h-9 text-sm"
                data-ocid="settings.favorite_player.select"
              >
                <SelectValue placeholder="Choose a player…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="" className="text-sm text-muted-foreground">
                  — No favourite player —
                </SelectItem>
                {MOCK_PLAYERS.map((player) => {
                  const team = MOCK_TEAMS.find(
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

        {/* ── Notifications ─────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`${sectionClass} !space-y-0`}
          data-ocid="settings.notifications.section"
        >
          <SectionHeader
            icon={Bell}
            label="Notifications"
            accent="oklch(0.55 0.2 24 / 0.35)"
          />
          <div className="space-y-0 divide-y divide-border/40">
            {[
              {
                key: "matchAlerts" as const,
                label: "Match Alerts",
                desc: "Upcoming match reminders and live score notifications",
                ocid: "settings.match_alerts.switch",
              },
              {
                key: "newsAlerts" as const,
                label: "News Updates",
                desc: "Latest news and announcements from LSH officials",
                ocid: "settings.news_alerts.switch",
              },
              {
                key: "mvpReminders" as const,
                label: "MVP Vote Reminders",
                desc: "Reminders to vote for the weekly Match MVP",
                ocid: "settings.mvp_reminders.switch",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-start justify-between gap-3 py-3 first:pt-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
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
              handle="Join our WhatsApp group"
              url="https://wa.me/254700000001"
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
            <QuickLinkRow
              icon={FileText}
              label="Terms & Conditions"
              to="/about"
              onNavigate={goTo}
            />
            <QuickLinkRow
              icon={Shield}
              label="Privacy Policy"
              to="/about"
              onNavigate={goTo}
            />
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
          </div>
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
    </div>
  );
}
