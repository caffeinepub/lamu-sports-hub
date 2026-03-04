import { AreaBadge, TeamBadge } from "@/components/shared/TeamBadge";
import { Button } from "@/components/ui/button";
import { MOCK_TEAMS } from "@/data/mockData";
import { CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface OnboardingPageProps {
  onComplete: (teamId: string) => void;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    onComplete(selected);
  };

  return (
    <div
      data-ocid="onboarding.page"
      className="min-h-screen ocean-gradient flex flex-col items-center justify-start px-4 pt-16 pb-24"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="font-display font-black text-3xl text-foreground mb-2">
          Pick Your Team
        </h1>
        <p className="text-muted-foreground text-sm">
          Choose the team you support. This personalizes your Hub experience.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full max-w-2xl mb-8">
        {MOCK_TEAMS.map((team, i) => (
          <motion.button
            key={team.teamId}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            data-ocid={`onboarding.team.item.${i + 1}`}
            onClick={() => setSelected(team.teamId)}
            className={`relative rounded-xl p-4 border-2 transition-all text-left flex flex-col items-center gap-3 ${
              selected === team.teamId
                ? "border-accent bg-accent/10 shadow-glow-coral"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            {selected === team.teamId && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
              </div>
            )}
            <TeamBadge team={team} size="lg" />
            <div className="text-center">
              <p className="font-bold text-xs text-foreground leading-tight">
                {team.name}
              </p>
              <AreaBadge area={team.area} className="mt-1" />
            </div>
            <div className="flex gap-1 text-xs text-muted-foreground">
              <span className="font-bold text-green-400">{team.wins}W</span>
              <span>·</span>
              <span className="font-bold text-yellow-400">{team.draws}D</span>
              <span>·</span>
              <span className="font-bold text-red-400">{team.losses}L</span>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          size="lg"
          className="px-8 font-bold"
          disabled={!selected || loading}
          onClick={handleSubmit}
          data-ocid="onboarding.submit_button"
          style={{
            background: selected
              ? "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)"
              : undefined,
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Setting up...
            </>
          ) : (
            "Confirm My Team →"
          )}
        </Button>
        {!selected && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Select a team above to continue
          </p>
        )}
      </motion.div>
    </div>
  );
}
