import { shareContent } from "@/utils/shareUtils";
import { Share2 } from "lucide-react";

interface ShareButtonProps {
  text: string;
  label?: string;
  variant?: "icon" | "text";
  url?: string;
  className?: string;
  "data-ocid"?: string;
}

export function ShareButton({
  text,
  label,
  variant = "icon",
  url,
  className,
  "data-ocid": dataOcid,
}: ShareButtonProps) {
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    shareContent(text, "Lamu Sports Hub", url);
  };

  if (variant === "text") {
    return (
      <button
        type="button"
        onClick={handleShare}
        data-ocid={dataOcid}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95 ${className ?? ""}`}
        style={{
          background: "oklch(0.6 0.22 24 / 0.15)",
          color: "oklch(0.72 0.2 24)",
          border: "1px solid oklch(0.6 0.22 24 / 0.35)",
        }}
        aria-label={label ?? "Share"}
      >
        <Share2 className="w-3 h-3" />
        {label ?? "Share"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      data-ocid={dataOcid}
      className={`p-1.5 rounded-full transition-all active:scale-95 hover:bg-accent/20 ${className ?? ""}`}
      style={{ color: "oklch(0.72 0.2 24)" }}
      aria-label={label ?? "Share"}
    >
      <Share2 className="w-3.5 h-3.5" />
    </button>
  );
}
