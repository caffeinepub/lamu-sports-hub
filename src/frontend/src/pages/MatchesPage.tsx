import { MatchCard } from "@/components/shared/MatchCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_MATCHES, MOCK_TEAMS } from "@/data/mockData";
import { useNavigate } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export function MatchesPage() {
  const navigate = useNavigate();

  const upcomingMatches = MOCK_MATCHES.filter((m) => m.status === "scheduled");
  const liveMatches = MOCK_MATCHES.filter((m) => m.status === "live");
  const playedMatches = MOCK_MATCHES.filter(
    (m) => m.status === "played",
  ).reverse();

  const defaultTab = liveMatches.length > 0 ? "live" : "upcoming";

  return (
    <div data-ocid="matches.page" className="min-h-screen pb-24 pt-14">
      {/* Header */}
      <div
        className="px-4 py-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.04 255) 0%, oklch(0.14 0.06 252) 100%)",
        }}
      >
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="font-display font-black text-2xl text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Fixtures & Results
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Season 2025/26 — Lamu Football League
          </p>
        </motion.div>
      </div>

      <Tabs defaultValue={defaultTab} className="px-4 pt-4">
        <TabsList
          className="w-full grid grid-cols-3 mb-4"
          data-ocid="matches.tab"
        >
          <TabsTrigger value="upcoming" className="text-xs">
            Upcoming ({upcomingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="live" className="text-xs">
            {liveMatches.length > 0 && (
              <span className="live-indicator mr-1 w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            )}
            Live ({liveMatches.length})
          </TabsTrigger>
          <TabsTrigger value="results" className="text-xs">
            Results ({playedMatches.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming */}
        <TabsContent value="upcoming">
          <div className="space-y-3" data-ocid="matches.list">
            {upcomingMatches.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="matches.empty_state"
              >
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No upcoming matches scheduled</p>
              </div>
            ) : (
              upcomingMatches.map((match, i) => {
                const home = MOCK_TEAMS.find(
                  (t) => t.teamId === match.homeTeamId,
                )!;
                const away = MOCK_TEAMS.find(
                  (t) => t.teamId === match.awayTeamId,
                )!;
                return (
                  <motion.div
                    key={match.matchId}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    data-ocid={`matches.item.${i + 1}`}
                  >
                    <MatchCard
                      match={match}
                      homeTeam={home}
                      awayTeam={away}
                      onClick={() => navigate({ to: "/matches" })}
                    />
                  </motion.div>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Live */}
        <TabsContent value="live">
          <div className="space-y-3">
            {liveMatches.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="matches.empty_state"
              >
                <div className="w-10 h-10 rounded-full border-2 border-muted mx-auto mb-2 flex items-center justify-center">
                  <span className="text-lg">⚽</span>
                </div>
                <p className="text-sm">No matches currently live</p>
              </div>
            ) : (
              liveMatches.map((match, i) => {
                const home = MOCK_TEAMS.find(
                  (t) => t.teamId === match.homeTeamId,
                )!;
                const away = MOCK_TEAMS.find(
                  (t) => t.teamId === match.awayTeamId,
                )!;
                return (
                  <motion.div
                    key={match.matchId}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    data-ocid={`matches.item.${i + 1}`}
                  >
                    <MatchCard
                      match={match}
                      homeTeam={home}
                      awayTeam={away}
                      onClick={() =>
                        navigate({ to: `/matchday/${match.matchId}` })
                      }
                    />
                  </motion.div>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Results */}
        <TabsContent value="results">
          <div className="space-y-3">
            {playedMatches.map((match, i) => {
              const home = MOCK_TEAMS.find(
                (t) => t.teamId === match.homeTeamId,
              )!;
              const away = MOCK_TEAMS.find(
                (t) => t.teamId === match.awayTeamId,
              )!;
              return (
                <motion.div
                  key={match.matchId}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  data-ocid={`matches.item.${i + 1}`}
                >
                  <MatchCard
                    match={match}
                    homeTeam={home}
                    awayTeam={away}
                    onClick={() =>
                      navigate({ to: `/matchday/${match.matchId}` })
                    }
                  />
                </motion.div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
