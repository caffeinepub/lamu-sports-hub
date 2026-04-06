import { useEffect, useState } from "react";

const EMOJIS: { key: string; emoji: string; label: string }[] = [
  { key: "fire", emoji: "🔥", label: "Fire" },
  { key: "angry", emoji: "😡", label: "Angry" },
  { key: "sad", emoji: "😭", label: "Sad" },
  { key: "clap", emoji: "👏", label: "Clap" },
];

interface QuickReactionsProps {
  matchId: string;
}

function getReactionCounts(matchId: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(`reactions_${matchId}`);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function getMyReaction(matchId: string): string | null {
  return localStorage.getItem(`myReaction_${matchId}`);
}

function saveReactionCounts(
  matchId: string,
  counts: Record<string, number>,
): void {
  localStorage.setItem(`reactions_${matchId}`, JSON.stringify(counts));
}

function saveMyReaction(matchId: string, key: string | null): void {
  if (key) {
    localStorage.setItem(`myReaction_${matchId}`, key);
  } else {
    localStorage.removeItem(`myReaction_${matchId}`);
  }
}

export function QuickReactions({ matchId }: QuickReactionsProps) {
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    getReactionCounts(matchId),
  );
  const [myReaction, setMyReaction] = useState<string | null>(() =>
    getMyReaction(matchId),
  );

  // Sync from storage when matchId changes
  useEffect(() => {
    setCounts(getReactionCounts(matchId));
    setMyReaction(getMyReaction(matchId));
  }, [matchId]);

  const handleReact = (key: string) => {
    const currentCounts = { ...counts };

    if (myReaction === key) {
      // Toggle off
      currentCounts[key] = Math.max((currentCounts[key] ?? 1) - 1, 0);
      saveMyReaction(matchId, null);
      setMyReaction(null);
    } else {
      // Remove old reaction if any
      if (myReaction) {
        currentCounts[myReaction] = Math.max(
          (currentCounts[myReaction] ?? 1) - 1,
          0,
        );
      }
      // Add new reaction
      currentCounts[key] = (currentCounts[key] ?? 0) + 1;
      saveMyReaction(matchId, key);
      setMyReaction(key);
    }

    saveReactionCounts(matchId, currentCounts);
    setCounts(currentCounts);
  };

  return (
    <div
      className="flex items-center gap-1.5 flex-wrap"
      data-ocid="match.reactions.panel"
    >
      {EMOJIS.map(({ key, emoji, label }) => {
        const isActive = myReaction === key;
        const count = counts[key] ?? 0;
        return (
          <button
            key={key}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReact(key);
            }}
            aria-label={`React with ${label}`}
            aria-pressed={isActive}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold transition-all active:scale-90"
            style={{
              background: isActive
                ? "oklch(0.6 0.22 24 / 0.2)"
                : "oklch(0.18 0.04 255 / 0.6)",
              border: isActive
                ? "1px solid oklch(0.6 0.22 24 / 0.5)"
                : "1px solid oklch(0.3 0.04 255 / 0.5)",
              color: isActive ? "oklch(0.85 0.15 24)" : "oklch(0.65 0.06 255)",
            }}
            data-ocid={`match.reaction_${key}.toggle`}
          >
            <span className="text-base leading-none">{emoji}</span>
            {count > 0 && <span className="leading-none">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
