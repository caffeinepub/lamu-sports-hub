import { PlayerCard } from "@/components/shared/PlayerCard";
import { AreaBadge, TeamBadge } from "@/components/shared/TeamBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOCK_MATCHES, MOCK_PLAYERS, MOCK_TEAMS } from "@/data/mockData";
import { BarChart2, Loader2, Plus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const POSITIONS = ["goalkeeper", "defender", "midfielder", "forward"];

export function CoachDashboardPage() {
  // Assume coach manages team-001 (Shela United)
  const team = MOCK_TEAMS[0];
  const players = MOCK_PLAYERS.filter((p) => p.teamId === team.teamId);
  const teamMatches = MOCK_MATCHES.filter(
    (m) => m.homeTeamId === team.teamId || m.awayTeamId === team.teamId,
  );

  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showMatchStats, setShowMatchStats] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nickname, setNickname] = useState("");
  const [position, setPosition] = useState("forward");
  const [jerseyNumber, setJerseyNumber] = useState("");

  const [selectedMatch, setSelectedMatch] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");

  const handleAddPlayer = async () => {
    if (!nickname || !jerseyNumber) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setShowAddPlayer(false);
    setNickname("");
    setJerseyNumber("");
    toast.success("Player added to squad!");
  };

  const handleSubmitStats = async () => {
    if (!selectedMatch || !homeScore || !awayScore) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setShowMatchStats(false);
    toast.success("Match stats submitted!");
  };

  return (
    <div data-ocid="coach.page" className="min-h-screen pb-24 pt-14">
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
          <h1 className="font-display font-black text-2xl text-foreground">
            Coach Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your squad and match stats
          </p>
        </motion.div>
      </div>

      <div className="px-4 mt-4 space-y-5">
        {/* My Team Card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          data-ocid="coach.team.card"
        >
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            My Team
          </h2>
          <div
            className="rounded-xl p-4 border border-border relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${team.color}33 0%, oklch(0.16 0.04 255) 70%)`,
            }}
          >
            <div className="flex items-center gap-4">
              <TeamBadge team={team} size="xl" />
              <div className="flex-1">
                <h3 className="font-display font-black text-lg text-foreground">
                  {team.name}
                </h3>
                <AreaBadge area={team.area} />
                <div className="flex gap-3 mt-2">
                  <div className="text-center">
                    <div className="font-black font-stats text-xl text-green-400">
                      {team.wins}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Wins
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-black font-stats text-xl text-yellow-400">
                      {team.draws}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Draws
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-black font-stats text-xl text-red-400">
                      {team.losses}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Losses
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-black font-stats text-xl text-foreground">
                      {players.length}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Players
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-14 flex-col gap-1 text-xs border-primary/40 hover:border-primary text-primary"
            onClick={() => setShowAddPlayer(true)}
            data-ocid="coach.add_player.button"
          >
            <Plus className="w-5 h-5" />
            Add Player
          </Button>
          <Button
            variant="outline"
            className="h-14 flex-col gap-1 text-xs border-accent/40 hover:border-accent text-accent"
            onClick={() => setShowMatchStats(true)}
            data-ocid="coach.match_stats.button"
          >
            <BarChart2 className="w-5 h-5" />
            Enter Match Stats
          </Button>
        </div>

        {/* Squad */}
        <div>
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
            Squad
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {players.map((player, i) => (
              <motion.div
                key={player.playerId}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`coach.player.item.${i + 1}`}
              >
                <PlayerCard player={player} team={team} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Player Dialog */}
      <Dialog open={showAddPlayer} onOpenChange={setShowAddPlayer}>
        <DialogContent data-ocid="coach.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Player</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Nickname / Name *</Label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Rocket"
                className="h-9 text-sm"
                data-ocid="coach.input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Position *</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger className="h-9 text-sm" data-ocid="coach.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((p) => (
                    <SelectItem
                      key={p}
                      value={p}
                      className="text-sm capitalize"
                    >
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Jersey Number *</Label>
              <Input
                type="number"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                placeholder="e.g. 9"
                className="h-9 text-sm"
                data-ocid="coach.input"
                min={1}
                max={99}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddPlayer(false)}
              data-ocid="coach.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddPlayer}
              disabled={loading}
              data-ocid="coach.confirm_button"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add Player"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Match Stats Dialog */}
      <Dialog open={showMatchStats} onOpenChange={setShowMatchStats}>
        <DialogContent data-ocid="coach.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Enter Match Stats
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Select Match *</Label>
              <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                <SelectTrigger className="h-9 text-sm" data-ocid="coach.select">
                  <SelectValue placeholder="Choose a match..." />
                </SelectTrigger>
                <SelectContent>
                  {teamMatches.map((m) => {
                    const home = MOCK_TEAMS.find(
                      (t) => t.teamId === m.homeTeamId,
                    )!;
                    const away = MOCK_TEAMS.find(
                      (t) => t.teamId === m.awayTeamId,
                    )!;
                    return (
                      <SelectItem
                        key={m.matchId}
                        value={m.matchId}
                        className="text-sm"
                      >
                        {home.name} vs {away.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Home Score *</Label>
                <Input
                  type="number"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="h-9 text-sm"
                  data-ocid="coach.input"
                  min={0}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Away Score *</Label>
                <Input
                  type="number"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="h-9 text-sm"
                  data-ocid="coach.input"
                  min={0}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMatchStats(false)}
              data-ocid="coach.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitStats}
              disabled={loading}
              data-ocid="coach.confirm_button"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Submit Stats"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
