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
import { Switch } from "@/components/ui/switch";
import { MOCK_TEAMS } from "@/data/mockData";
import {
  LSH_USER_SETTINGS_KEY,
  type UserSettings,
  getUserSettings,
  setLocalStore,
} from "@/utils/localStore";
import { Bell, Loader2, Settings, Star, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(getUserSettings);
  const [saving, setSaving] = useState(false);

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

  return (
    <div data-ocid="settings.page" className="min-h-screen pb-24 pt-14">
      {/* Header */}
      <div
        className="px-4 py-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.04 255) 0%, oklch(0.14 0.06 252) 100%)",
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
        {/* Profile */}
        <motion.section
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-4 space-y-3"
          data-ocid="settings.profile.section"
        >
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide">
              Profile
            </h2>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Display Name</Label>
            <Input
              value={settings.displayName}
              onChange={(e) => update("displayName", e.target.value)}
              className="h-9 text-sm"
              data-ocid="settings.display_name.input"
            />
          </div>
        </motion.section>

        {/* Favorite Team */}
        <motion.section
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-4 space-y-3"
          data-ocid="settings.favorite.section"
        >
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide">
              Favourite Team
            </h2>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Select your team</Label>
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

        {/* Notifications */}
        <motion.section
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-4 space-y-4"
          data-ocid="settings.notifications.section"
        >
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide">
              Notifications
            </h2>
          </div>

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
              desc: "Reminders to vote for the match MVP",
              ocid: "settings.mvp_reminders.switch",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-start justify-between gap-3"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {item.label}
                </p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={settings[item.key]}
                onCheckedChange={(v) => update(item.key, v)}
                data-ocid={item.ocid}
              />
            </div>
          ))}
        </motion.section>

        {/* Save Button */}
        <Button
          className="w-full text-sm"
          onClick={handleSave}
          disabled={saving}
          data-ocid="settings.save_button"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
          }}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  );
}
