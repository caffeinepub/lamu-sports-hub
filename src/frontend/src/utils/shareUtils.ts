import { toast } from "sonner";

export function shareContent(
  text: string,
  title = "Lamu Sports Hub",
  url?: string,
): void {
  const shareUrl = url ?? window.location.href;
  if (navigator.share) {
    navigator.share({ title, text, url: shareUrl }).catch(() => {
      // User dismissed or share failed — fall back silently
    });
  } else {
    const full = `${text}\n${shareUrl}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(full)
        .then(() => toast.success("Copied to clipboard!"))
        .catch(() => toast.error("Could not copy"));
    } else {
      // Legacy fallback
      const ta = document.createElement("textarea");
      ta.value = full;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
        toast.success("Copied to clipboard!");
      } catch {
        toast.error("Could not copy");
      }
      document.body.removeChild(ta);
    }
  }
}
