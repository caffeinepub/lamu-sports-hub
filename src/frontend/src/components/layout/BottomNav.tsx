import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Award,
  BarChart2,
  BookOpen,
  Calendar,
  Clock,
  Compass,
  Grid3x3,
  Home,
  Info,
  MessageSquare,
  Settings,
  Shield,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  ocid: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    path: "/",
    label: "Home",
    icon: <Home className="w-5 h-5" />,
    ocid: "nav.home.link",
  },
  {
    path: "/standings",
    label: "Standings",
    icon: <BarChart2 className="w-5 h-5" />,
    ocid: "nav.standings.link",
  },
  {
    path: "/matches",
    label: "Matches",
    icon: <Calendar className="w-5 h-5" />,
    ocid: "nav.matches.link",
  },
  {
    path: "/leaderboard",
    label: "Leaders",
    icon: <Trophy className="w-5 h-5" />,
    ocid: "nav.leaderboard.link",
  },
  {
    path: "/profile",
    label: "Profile",
    icon: <User className="w-5 h-5" />,
    ocid: "nav.profile.link",
  },
];

const EXTRA_NAV: NavItem[] = [
  {
    path: "/coach",
    label: "Coach",
    icon: <Users className="w-5 h-5" />,
    ocid: "nav.coach.link",
    roles: ["coach"],
  },
  {
    path: "/admin",
    label: "Admin",
    icon: <Shield className="w-5 h-5" />,
    ocid: "nav.admin.link",
    roles: ["admin"],
  },
];

const MORE_ITEMS = [
  {
    path: "/referees",
    label: "Referees",
    icon: <Shield className="w-5 h-5" />,
    ocid: "nav.referees.link",
  },
  {
    path: "/awards",
    label: "Awards",
    icon: <Award className="w-5 h-5" />,
    ocid: "nav.awards.link",
  },
  {
    path: "/explore",
    label: "Explore",
    icon: <Compass className="w-5 h-5" />,
    ocid: "nav.explore.link",
  },
  {
    path: "/about",
    label: "About",
    icon: <Info className="w-5 h-5" />,
    ocid: "nav.about.link",
  },
  {
    path: "/history",
    label: "History",
    icon: <Clock className="w-5 h-5" />,
    ocid: "nav.history.link",
  },
  {
    path: "/suggestions",
    label: "Suggestions",
    icon: <MessageSquare className="w-5 h-5" />,
    ocid: "nav.suggestions.link",
  },
  {
    path: "/settings",
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
    ocid: "nav.settings.link",
  },
];

interface BottomNavProps {
  role?: string;
}

export function BottomNav({ role }: BottomNavProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [showMore, setShowMore] = useState(false);

  const extraItems = EXTRA_NAV.filter(
    (item) => item.roles && role && item.roles.includes(role),
  );
  const allItems = [...NAV_ITEMS.slice(0, 4), ...extraItems, NAV_ITEMS[4]];

  // Check if current path is one of the "more" items
  const isMoreActive = MORE_ITEMS.some(
    (item) =>
      currentPath === item.path ||
      (item.path !== "/" && currentPath.startsWith(item.path)),
  );

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-card/95 backdrop-blur-sm border-t border-border flex items-stretch">
        {allItems.map((item) => {
          const isActive =
            currentPath === item.path ||
            (item.path !== "/" && currentPath.startsWith(item.path));
          return (
            <button
              type="button"
              key={item.path}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                isActive
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => navigate({ to: item.path })}
              data-ocid={item.ocid}
            >
              <div
                className={`${isActive ? "scale-110" : ""} transition-transform`}
              >
                {item.icon}
              </div>
              <span
                className={`text-[10px] font-semibold ${isActive ? "font-bold" : ""}`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-accent rounded-b-full" />
              )}
            </button>
          );
        })}

        {/* More button */}
        <button
          type="button"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
            isMoreActive || showMore
              ? "text-accent"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setShowMore(true)}
          data-ocid="nav.more.button"
        >
          <Grid3x3 className="w-5 h-5" />
          <span className="text-[10px] font-semibold">More</span>
          {isMoreActive && (
            <span className="absolute top-0 w-8 h-0.5 bg-accent rounded-b-full" />
          )}
        </button>
      </nav>

      {/* More Sheet */}
      <Sheet open={showMore} onOpenChange={setShowMore}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl pb-8"
          data-ocid="nav.more.sheet"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-left">More</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-4 gap-3">
            {MORE_ITEMS.map((item) => {
              const isActive =
                currentPath === item.path ||
                (item.path !== "/" && currentPath.startsWith(item.path));
              return (
                <button
                  type="button"
                  key={item.path}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                    isActive
                      ? "bg-accent/10 border-accent/40 text-accent"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                  onClick={() => {
                    navigate({ to: item.path });
                    setShowMore(false);
                  }}
                  data-ocid={item.ocid}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-semibold">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
