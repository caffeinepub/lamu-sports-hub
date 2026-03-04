import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { AdminPanelPage } from "@/pages/AdminPanelPage";
import { CoachDashboardPage } from "@/pages/CoachDashboardPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LandingPage } from "@/pages/LandingPage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { MVPVotePage } from "@/pages/MVPVotePage";
import { MatchdayPage } from "@/pages/MatchdayPage";
import { MatchesPage } from "@/pages/MatchesPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { PlayerProfilePage } from "@/pages/PlayerProfilePage";
import { ProfilePage } from "@/pages/ProfilePage";
import { StandingsPage } from "@/pages/StandingsPage";
import { TeamProfilePage } from "@/pages/TeamProfilePage";
import { TeamsPage } from "@/pages/TeamsPage";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopNav } from "@/components/layout/TopNav";

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

  const playerProfileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/players/$playerId",
    component: PlayerProfilePage,
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

  const routeTree = rootRoute.addChildren([
    dashboardRoute,
    standingsRoute,
    teamsRoute,
    teamProfileRoute,
    playerProfileRoute,
    matchesRoute,
    matchdayRoute,
    leaderboardRoute,
    mvpVoteRoute,
    notificationsRoute,
    profileRoute,
    coachRoute,
    adminRoute,
  ]);

  return createRouter({ routeTree });
}

// --- Main App ---
export default function App() {
  const { identity } = useInternetIdentity();
  const [appState, setAppState] = useState<AppState>({
    role: "admin",
    favoriteTeamId: "team-001",
    userName: "Hassan Mwende",
    hasOnboarded: true,
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loginTriggered, setLoginTriggered] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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

  // If not logged in, show landing page
  if (!identity && !loginTriggered) {
    return (
      <>
        <LandingPage onLogin={handleLoginClick} />
        <Toaster position="top-center" />
      </>
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
