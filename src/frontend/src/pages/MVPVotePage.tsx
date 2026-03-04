import { TeamBadge } from "@/components/shared/TeamBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MOCK_MATCHES, MOCK_PLAYERS, MOCK_TEAMS } from "@/data/mockData";
import { useNavigate, useParams } from "@tanstack/react-router";
import { CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export function MVPVotePage() {
  const { matchId } = useParams({ strict: false }) as { matchId: string };
  const navigate = useNavigate();

  const match =
    MOCK_MATCHES.find((m) => m.matchId === matchId) || MOCK_MATCHES[0];
  const homeTeam = MOCK_TEAMS.find((t) => t.teamId === match.homeTeamId)!;
  const awayTeam = MOCK_TEAMS.find((t) => t.teamId === match.awayTeamId)!;

  const homePlayers = MOCK_PLAYERS.filter(
    (p) => p.teamId === match.homeTeamId,
  ).slice(0, 4);
  const awayPlayers = MOCK_PLAYERS.filter(
    (p) => p.teamId === match.awayTeamId,
  ).slice(0, 4);
  const allPlayers = [...homePlayers, ...awayPlayers];

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock vote tallies
  const tallies: Record<string, number> = {
    [homePlayers[0]?.playerId]: 45,
    [homePlayers[1]?.playerId]: 12,
    [awayPlayers[0]?.playerId]: 28,
    [awayPlayers[1]?.playerId]: 15,
  };
  const totalVotes = Object.values(tallies).reduce((a, b) => a + b, 0);

  const handleVote = async () => {
    if (!selectedPlayerId) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setHasVoted(true);
    toast.success("Vote submitted! Thank you for participating.");
  };

  return (
    <div data-ocid="mvp_vote.page" className="min-h-screen pb-24 pt-14">
      {/* Back */}
      <button
        type="button"
        className="fixed top-14 left-0 z-40 flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors bg-card/80 backdrop-blur-sm"
        onClick={() => navigate({ to: "/matches" })}
      >
        <ChevronLeft className="w-4 h-4" />
        Matches
      </button>

      {/* Header */}
      <div
        className="px-4 pt-8 pb-6"
        style={{
          background: `linear-gradient(135deg, ${homeTeam.color}40 0%, oklch(0.1 0.04 252) 50%, ${awayTeam.color}40 100%)`,
        }}
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <TeamBadge team={homeTeam} size="sm" />
              <span className="font-bold text-sm">{homeTeam.name}</span>
            </div>
            <span className="font-black font-stats text-lg text-foreground">
              {match.homeScore} — {match.awayScore}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{awayTeam.name}</span>
              <TeamBadge team={awayTeam} size="sm" />
            </div>
          </div>
          <h1 className="font-display font-black text-xl text-foreground">
            Vote for MVP
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Choose the player of the match
          </p>
        </div>
      </div>

      <div className="px-4 mt-5">
        {!hasVoted ? (
          <>
            <p className="text-xs text-muted-foreground mb-3 font-medium">
              Select a player:
            </p>
            <div
              className="grid grid-cols-2 gap-3 mb-5"
              data-ocid="mvp_vote.player.item.1"
            >
              {allPlayers.map((player, i) => {
                const team = MOCK_TEAMS.find(
                  (t) => t.teamId === player.teamId,
                )!;
                const isSelected = selectedPlayerId === player.playerId;
                return (
                  <motion.button
                    key={player.playerId}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    data-ocid={`mvp_vote.player.item.${i + 1}`}
                    className={`rounded-xl p-3 border-2 transition-all text-left relative overflow-hidden ${
                      isSelected
                        ? "border-accent bg-accent/10 shadow-glow-coral"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                    onClick={() =>
                      !hasVoted && setSelectedPlayerId(player.playerId)
                    }
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                      </div>
                    )}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-base font-black font-stats border-2 mb-2"
                      style={{
                        backgroundColor: team.color,
                        color: team.secondaryColor,
                        borderColor: `${team.secondaryColor}66`,
                      }}
                    >
                      {player.jerseyNumber}
                    </div>
                    <div className="font-bold text-xs text-foreground leading-tight">
                      {player.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {team.name}
                    </div>
                    <div className="text-[10px] mt-1">
                      <span className="text-green-400 font-bold">
                        {player.goals}G
                      </span>{" "}
                      <span className="text-blue-400 font-bold">
                        {player.assists}A
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <Button
              className="w-full font-bold h-11"
              disabled={!selectedPlayerId || loading}
              onClick={handleVote}
              data-ocid="mvp_vote.submit_button"
              style={
                selectedPlayerId
                  ? {
                      background:
                        "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
                    }
                  : undefined
              }
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Vote ⭐"
              )}
            </Button>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-4 mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2" />
            <h2 className="font-display font-bold text-lg text-foreground">
              Vote Submitted!
            </h2>
            <p className="text-sm text-muted-foreground">
              Here are the current results:
            </p>
          </motion.div>
        )}

        {/* Vote tallies */}
        {(hasVoted || match.status === "played") && (
          <div className="mt-4" data-ocid="mvp_vote.tally.list">
            <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Current Vote Tallies
            </h3>
            <div className="space-y-3">
              {allPlayers
                .sort(
                  (a, b) =>
                    (tallies[b.playerId] || 0) - (tallies[a.playerId] || 0),
                )
                .map((player) => {
                  const team = MOCK_TEAMS.find(
                    (t) => t.teamId === player.teamId,
                  )!;
                  const votes = tallies[player.playerId] || 0;
                  const pct = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                  return (
                    <div
                      key={player.playerId}
                      className="flex items-center gap-3"
                    >
                      <div className="flex items-center gap-2 w-32 flex-shrink-0">
                        <TeamBadge team={team} size="xs" />
                        <span className="text-xs font-medium text-foreground truncate">
                          {player.name.split(" ")[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <Progress value={pct} className="h-2" />
                      </div>
                      <span className="text-xs font-black text-foreground w-8 text-right">
                        {votes}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
