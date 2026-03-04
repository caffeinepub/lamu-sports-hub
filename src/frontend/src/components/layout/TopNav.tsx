import { Button } from "@/components/ui/button";
import { MOCK_NOTIFICATIONS } from "@/data/mockData";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { Bell, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

interface TopNavProps {
  onNotificationsClick: () => void;
}

export function TopNav({ onNotificationsClick }: TopNavProps) {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  // Start with mock unread count; replace with backend count when actor is ready
  const mockUnread = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
  const [unreadCount, setUnreadCount] = useState(mockUnread);

  useEffect(() => {
    if (!actor || actorFetching || !identity) return;

    let cancelled = false;

    async function loadUnread() {
      try {
        const allNotifs = await actor!.getAllNotifications();
        if (cancelled) return;
        const unread = allNotifs.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } catch {
        // If backend call fails, keep mock count
      }
    }

    loadUnread();
    return () => {
      cancelled = true;
    };
  }, [actor, actorFetching, identity]);

  const displayCount =
    unreadCount > 9 ? "9+" : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-card/95 backdrop-blur-sm border-b border-border flex items-center px-4 gap-3">
      {/* Logo + Name */}
      <button
        type="button"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        onClick={() => navigate({ to: "/" })}
        data-ocid="nav.link"
      >
        <img
          src="/assets/generated/lamu-sports-hub-logo-transparent.dim_400x400.png"
          alt="Lamu Sports Hub"
          className="w-8 h-8 object-contain"
        />
        <span className="font-display font-black text-sm hidden sm:block">
          <span className="text-secondary">Lamu</span>{" "}
          <span className="text-foreground">Sports Hub</span>
        </span>
      </button>

      <div className="flex-1" />

      {/* Notification Bell */}
      <button
        type="button"
        className="relative p-2 rounded-full hover:bg-muted/50 transition-colors"
        onClick={onNotificationsClick}
        data-ocid="nav.link"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {displayCount !== null && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center px-0.5">
            {displayCount}
          </span>
        )}
      </button>

      {/* Auth button */}
      {identity ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={clear}
          className="text-muted-foreground hover:text-foreground"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      ) : null}
    </header>
  );
}
