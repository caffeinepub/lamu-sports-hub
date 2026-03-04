import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart2,
  Calendar,
  Home,
  Shield,
  Trophy,
  User,
  Users,
} from "lucide-react";

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

interface BottomNavProps {
  role?: string;
}

export function BottomNav({ role }: BottomNavProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const extraItems = EXTRA_NAV.filter(
    (item) => item.roles && role && item.roles.includes(role),
  );
  const allItems = [...NAV_ITEMS.slice(0, 4), ...extraItems, NAV_ITEMS[4]];

  return (
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
    </nav>
  );
}
