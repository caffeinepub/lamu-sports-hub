import { Toaster } from "@/components/ui/sonner";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { AboutPage } from "@/pages/AboutPage";
import { AdminPanelPage } from "@/pages/AdminPanelPage";
import { AwardsPage } from "@/pages/AwardsPage";
import { CoachDashboardPage } from "@/pages/CoachDashboardPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ExplorePage } from "@/pages/ExplorePage";
import { HistoryPage } from "@/pages/HistoryPage";
import { LandingPage } from "@/pages/LandingPage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { MVPVotePage } from "@/pages/MVPVotePage";
import { MatchdayPage } from "@/pages/MatchdayPage";
import { MatchesPage } from "@/pages/MatchesPage";
import { MonetizePage } from "@/pages/MonetizePage";
import { NewsPage } from "@/pages/NewsPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { OfficialsPage } from "@/pages/OfficialsPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { PlayerProfilePage } from "@/pages/PlayerProfilePage";
import { PlayersPage } from "@/pages/PlayersPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RecoveryPage } from "@/pages/RecoveryPage";
import { RecoveryStatusPage } from "@/pages/RecoveryStatusPage";
import { RefereesPage } from "@/pages/RefereesPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { StandingsPage } from "@/pages/StandingsPage";
import { SuggestionsPage } from "@/pages/SuggestionsPage";
import { TeamProfilePage } from "@/pages/TeamProfilePage";
import { TeamsPage } from "@/pages/TeamsPage";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopNav } from "@/components/layout/TopNav";
import { applyStoredTheme } from "@/utils/themeUtils";

// --- App State ---
type AppRole = "fan" | "player" | "coach" | "admin";

interface AppState {
  role: AppRole;
  favoriteTeamId: string;
  userName: string;
  hasOnboarded: boolean;
}

// --- Root Layout (with nav) ---
function AppLayout({
  appState,
  onNotificationsClick,
}: {
  appState: AppState;
  onNotificationsClick: () => void;
}) {
  const year = new Date().getFullYear();
  const footerLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`;

  return (
    <div className="min-h-screen bg-background">
      <TopNav onNotificationsClick={onNotificationsClick} />
      <main>
        <Outlet />
      </main>
      <footer className="pb-16 pt-6 text-center text-xs text-muted-foreground border-t border-border/40 mt-4">
        <p>
          © {year}.{" "}
          <a
            href={footerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </p>
        <p className="mt-1 opacity-60">Island Pride. Island Football. 🏝️</p>
      </footer>
      <BottomNav role={appState.role} />
    </div>
  );
}

// --- Build router outside component to avoid re-creation ---
function buildRouter(
  appState: AppState,
  setShowNotifications: (v: boolean) => void,
) {
  const rootRoute = createRootRoute({
    component: () => (
      <AppLayout
        appState={appState}
        onNotificationsClick={() => setShowNotifications(true)}
      />
    ),
  });

  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => (
      <DashboardPage
        favoriteTeamId={appState.favoriteTeamId}
        role={appState.role}
        userName={appState.userName}
      />
    ),
  });

  const standingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/standings",
    component: StandingsPage,
  });

  const teamsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/teams",
    component: TeamsPage,
  });

  const teamProfileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/teams/$teamId",
    component: TeamProfilePage,
  });

  const playersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/players",
    component: PlayersPage,
  });

  const playerProfileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/players/$playerId",
    component: PlayerProfilePage,
  });

  const newsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/news",
    component: NewsPage,
  });

  const matchesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/matches",
    component: MatchesPage,
  });

  const matchdayRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/matchday/$matchId",
    component: MatchdayPage,
  });

  const leaderboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/leaderboard",
    component: LeaderboardPage,
  });

  const mvpVoteRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/mvp-vote/$matchId",
    component: MVPVotePage,
  });

  const notificationsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/notifications",
    component: NotificationsPage,
  });

  const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/profile",
    component: () => (
      <ProfilePage
        role={appState.role}
        favoriteTeamId={appState.favoriteTeamId}
        userName={appState.userName}
      />
    ),
  });

  const coachRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/coach",
    component: CoachDashboardPage,
  });

  const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/admin",
    component: AdminPanelPage,
  });

  const refereesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/referees",
    component: RefereesPage,
  });

  const awardsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/awards",
    component: AwardsPage,
  });

  const exploreRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/explore",
    component: ExplorePage,
  });

  const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/about",
    component: AboutPage,
  });

  const historyRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/history",
    component: HistoryPage,
  });

  const suggestionsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/suggestions",
    component: SuggestionsPage,
  });

  const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings",
    component: SettingsPage,
  });

  const officialsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/officials",
    component: OfficialsPage,
  });

  const monetizeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/monetize",
    component: MonetizePage,
  });

  const recoveryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/recovery",
    component: RecoveryPage,
  });

  const recoveryStatusRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/recovery-status",
    component: RecoveryStatusPage,
  });

  const routeTree = rootRoute.addChildren([
    dashboardRoute,
    standingsRoute,
    teamsRoute,
    teamProfileRoute,
    playersRoute,
    playerProfileRoute,
    newsRoute,
    matchesRoute,
    matchdayRoute,
    leaderboardRoute,
    mvpVoteRoute,
    notificationsRoute,
    profileRoute,
    coachRoute,
    adminRoute,
    refereesRoute,
    awardsRoute,
    exploreRoute,
    aboutRoute,
    historyRoute,
    suggestionsRoute,
    settingsRoute,
    officialsRoute,
    monetizeRoute,
    recoveryRoute,
    recoveryStatusRoute,
  ]);

  return createRouter({ routeTree });
}

// --- Main App ---
export default function App() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  // Apply saved theme on first render
  useEffect(() => {
    applyStoredTheme();
  }, []);

  const [appState, setAppState] = useState<AppState>({
    role: "fan",
    favoriteTeamId: "team-001",
    userName: "",
    hasOnboarded: true,
  });
  const [roleLoading, setRoleLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loginTriggered, setLoginTriggered] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Detect real role once actor is available
  useEffect(() => {
    if (!actor || actorFetching) return;
    setRoleLoading(true);
    actor
      .isCallerAdmin()
      .then((isAdmin) => {
        setAppState((prev) => ({
          ...prev,
          role: isAdmin ? "admin" : "fan",
        }));
      })
      .catch(() => {
        // On error, default to fan
        setAppState((prev) => ({ ...prev, role: "fan" }));
      })
      .finally(() => setRoleLoading(false));
  }, [actor, actorFetching]);

  const handleLoginClick = () => {
    setLoginTriggered(true);
  };

  const handleOnboardingComplete = (teamId: string) => {
    setAppState((prev) => ({
      ...prev,
      favoriteTeamId: teamId,
      hasOnboarded: true,
    }));
    setShowOnboarding(false);
  };

  // Recovery pages are standalone — accessible without login
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";
  if (currentPath === "/recovery") {
    return (
      <>
        <RecoveryPage />
        <Toaster position="top-center" />
      </>
    );
  }
  if (currentPath === "/recovery-status") {
    return (
      <>
        <RecoveryStatusPage />
        <Toaster position="top-center" />
      </>
    );
  }

  // If not logged in, show landing page
  if (!identity && !loginTriggered) {
    return (
      <>
        <LandingPage onLogin={handleLoginClick} />
        <Toaster position="top-center" />
      </>
    );
  }

  // Show role detection spinner while checking after login
  if (identity && roleLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Verifying your access...
        </p>
        <Toaster position="top-center" />
      </div>
    );
  }

  // Show onboarding if needed
  if (showOnboarding && !appState.hasOnboarded) {
    return (
      <>
        <OnboardingPage onComplete={handleOnboardingComplete} />
        <Toaster position="top-center" />
      </>
    );
  }

  const router = buildRouter(appState, setShowNotifications);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />

      {/* Notifications slide-over */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60]"
              onClick={() => setShowNotifications(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-80 bg-card border-l border-border z-[70] overflow-y-auto"
            >
              <NotificationsPage />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
