import { getUserPrediction, submitMatchPrediction } from "@/utils/localStore";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface PredictionWidgetProps {
  matchId: string;
  homeName: string;
  awayName: string;
  userId: string;
  allPredictions?: { matchId: string; prediction: "home" | "draw" | "away" }[];
}

function calcPercents(
  predictions: { prediction: "home" | "draw" | "away" }[],
): { home: number; draw: number; away: number } {
  if (predictions.length === 0) return { home: 33, draw: 34, away: 33 };
  const home = predictions.filter((p) => p.prediction === "home").length;
  const draw = predictions.filter((p) => p.prediction === "draw").length;
  const away = predictions.filter((p) => p.prediction === "away").length;
  const total = predictions.length;
  return {
    home: Math.round((home / total) * 100),
    draw: Math.round((draw / total) * 100),
    away: Math.round((away / total) * 100),
  };
}

export function PredictionWidget({
  matchId,
  homeName,
  awayName,
  userId,
  allPredictions = [],
}: PredictionWidgetProps) {
  const existing = getUserPrediction(matchId, userId);
  const [voted, setVoted] = useState<"home" | "draw" | "away" | null>(
    existing?.prediction ?? null,
  );
  const [localPredictions, setLocalPredictions] = useState(allPredictions);

  const matchPredictions = localPredictions.filter(
    (p) => p.matchId === matchId,
  );
  const percents = calcPercents(matchPredictions);
  const totalVotes = matchPredictions.length;

  const handleVote = (choice: "home" | "draw" | "away") => {
    if (voted) return;
    submitMatchPrediction(matchId, userId, choice);
    setVoted(choice);
    setLocalPredictions((prev) => [...prev, { matchId, prediction: choice }]);
  };

  const options: {
    key: "home" | "draw" | "away";
    label: string;
    pct: number;
  }[] = [
    { key: "home", label: homeName.split(" ")[0], pct: percents.home },
    { key: "draw", label: "Draw", pct: percents.draw },
    { key: "away", label: awayName.split(" ")[0], pct: percents.away },
  ];

  return (
    <div
      className="px-3 pb-3 border-t border-border/30"
      data-ocid="matches.prediction.panel"
    >
      <div className="mt-2.5">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
            🔮 Predict Result
          </span>
          {totalVotes > 0 && (
            <span className="text-[10px] text-muted-foreground/60">
              · {totalVotes} prediction{totalVotes !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {!voted ? (
          <div className="grid grid-cols-3 gap-1.5">
            {options.map((opt) => (
              <button
                key={opt.key}
                type="button"
                data-ocid={`matches.predict_${opt.key}.button`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(opt.key);
                }}
                className="py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                style={{
                  background:
                    opt.key === "draw"
                      ? "oklch(0.22 0.04 255 / 0.8)"
                      : "oklch(0.2 0.06 252 / 0.8)",
                  border:
                    opt.key === "home"
                      ? "1px solid oklch(0.55 0.18 252 / 0.5)"
                      : opt.key === "away"
                        ? "1px solid oklch(0.6 0.22 24 / 0.5)"
                        : "1px solid oklch(0.4 0.06 255 / 0.4)",
                  color:
                    opt.key === "home"
                      ? "oklch(0.75 0.16 252)"
                      : opt.key === "away"
                        ? "oklch(0.75 0.2 24)"
                        : "oklch(0.72 0.06 255)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1.5"
            >
              {options.map((opt) => (
                <div key={opt.key} className="relative">
                  <div
                    className="w-full h-6 rounded-md overflow-hidden"
                    style={{
                      background: "oklch(0.18 0.04 252 / 0.6)",
                      border:
                        voted === opt.key
                          ? opt.key === "home"
                            ? "1px solid oklch(0.55 0.18 252 / 0.6)"
                            : opt.key === "away"
                              ? "1px solid oklch(0.6 0.22 24 / 0.6)"
                              : "1px solid oklch(0.5 0.08 255 / 0.5)"
                          : "1px solid transparent",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${opt.pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-md"
                      style={{
                        background:
                          voted === opt.key
                            ? opt.key === "home"
                              ? "oklch(0.55 0.18 252 / 0.4)"
                              : opt.key === "away"
                                ? "oklch(0.6 0.22 24 / 0.4)"
                                : "oklch(0.45 0.08 255 / 0.35)"
                            : "oklch(0.3 0.04 255 / 0.3)",
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-between px-2">
                    <span
                      className="text-[10px] font-bold"
                      style={{
                        color:
                          voted === opt.key
                            ? opt.key === "home"
                              ? "oklch(0.8 0.16 252)"
                              : opt.key === "away"
                                ? "oklch(0.8 0.2 24)"
                                : "oklch(0.78 0.08 255)"
                            : "oklch(0.6 0.06 255)",
                      }}
                    >
                      {voted === opt.key && "✓ "}
                      {opt.label}
                    </span>
                    <span
                      className="text-[10px] font-black"
                      style={{
                        color:
                          voted === opt.key
                            ? "oklch(0.85 0.1 255)"
                            : "oklch(0.55 0.06 255)",
                      }}
                    >
                      {opt.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
