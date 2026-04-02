import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Calendar,
  Globe,
  RefreshCw,
  Shield,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface EPLStanding {
  intRank: string;
  strTeam: string;
  strTeamBadge: string;
  intPlayed: string;
  intWin: string;
  intDraw: string;
  intLoss: string;
  intGoalsFor: string;
  intGoalsAgainst: string;
  intGoalDifference: string;
  intPoints: string;
}

interface EPLEvent {
  idEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string;
  strTime: string;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
}

function useEPLData() {
  const [standings, setStandings] = useState<EPLStanding[]>([]);
  const [results, setResults] = useState<EPLEvent[]>([]);
  const [fixtures, setFixtures] = useState<EPLEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshCount is intentional trigger
  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      setLoading(true);
      setError(false);
      try {
        const [sRes, rRes, fRes] = await Promise.all([
          fetch(
            "https://www.thesportsdb.com/api/v1/json/1/lookuptable.php?l=4328&s=2024-2025",
          ),
          fetch(
            "https://www.thesportsdb.com/api/v1/json/1/eventspastleague.php?id=4328",
          ),
          fetch(
            "https://www.thesportsdb.com/api/v1/json/1/eventsnextleague.php?id=4328",
          ),
        ]);
        const [sData, rData, fData] = await Promise.all([
          sRes.json(),
          rRes.json(),
          fRes.json(),
        ]);
        if (!cancelled) {
          setStandings(sData.table ?? []);
          setResults((rData.events ?? []).slice(0, 20).reverse());
          setFixtures(fData.events ?? []);
          setLastUpdated(new Date());
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }
    fetchAll();
    // Auto-refresh every 5 minutes so results update after each match
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: refreshCount triggers manual refresh
  }, [refreshCount]);

  const manualRefresh = () => setRefreshCount((c) => c + 1);

  return {
    standings,
    results,
    fixtures,
    loading,
    error,
    lastUpdated,
    manualRefresh,
  };
}

function getRankStyle(rank: number): string {
  if (rank <= 4)
    return "bg-blue-500/20 text-blue-400 border-l-2 border-blue-500";
  if (rank <= 6)
    return "bg-orange-500/20 text-orange-400 border-l-2 border-orange-500";
  if (rank >= 18) return "bg-red-500/20 text-red-400 border-l-2 border-red-500";
  return "";
}

function TeamBadge({
  src,
  name,
  size = 24,
}: { src?: string; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className="rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground"
        style={{ width: size, height: size, minWidth: size }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className="object-contain"
      style={{ minWidth: size }}
      onError={() => setFailed(true)}
    />
  );
}

function StandingsSkeleton() {
  return (
    <div className="space-y-1">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-2">
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center px-4">
      <AlertCircle className="w-12 h-12 text-destructive/50" />
      <p className="font-semibold text-foreground">
        Unable to load Premier League data.
      </p>
      <p className="text-sm text-muted-foreground">
        Check your internet connection and try again.
      </p>
    </div>
  );
}

export function EPLPage() {
  const {
    standings,
    results,
    fixtures,
    loading,
    error,
    lastUpdated,
    manualRefresh,
  } = useEPLData();

  return (
    <div data-ocid="epl.page" className="min-h-screen pb-24 pt-14">
      {/* Header */}
      <div
        className="px-4 py-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.15 0.08 255) 0%, oklch(0.1 0.04 250) 100%)",
        }}
      >
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.55 0.25 60)" }}
          >
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-foreground">
              Premier League
            </h1>
            <p className="text-xs text-muted-foreground">
              2024/25 Season · Live Data
            </p>
          </div>
          <div className="ml-auto flex flex-col items-end gap-1">
            <Badge
              className="text-xs cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1"
              style={{ background: "oklch(0.55 0.25 60)", color: "white" }}
              onClick={manualRefresh}
            >
              <RefreshCw
                className={`w-2.5 h-2.5 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Updating…" : "EPL"}
            </Badge>
            {lastUpdated && !loading && (
              <span className="text-[9px] text-muted-foreground/60">
                Updated{" "}
                {lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 mt-3 text-xs"
        >
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
            Champions League (Top 4)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block" />
            Europa (5–6)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
            Relegation
          </span>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="table" className="px-4 pt-4">
        <TabsList className="w-full grid grid-cols-3 mb-4" data-ocid="epl.tab">
          <TabsTrigger value="table" data-ocid="epl.table.tab">
            <Trophy className="w-3.5 h-3.5 mr-1.5" />
            Table
          </TabsTrigger>
          <TabsTrigger value="results" data-ocid="epl.results.tab">
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            Results
          </TabsTrigger>
          <TabsTrigger value="fixtures" data-ocid="epl.fixtures.tab">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Fixtures
          </TabsTrigger>
        </TabsList>

        {/* Table Tab */}
        <TabsContent value="table">
          {error ? (
            <ErrorState />
          ) : loading ? (
            <StandingsSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Header row */}
              <div
                className="grid text-xs font-bold text-muted-foreground px-3 py-2 bg-muted/40"
                style={{
                  gridTemplateColumns: "28px 1fr 32px 32px 32px 32px 40px 40px",
                }}
              >
                <span>#</span>
                <span>Club</span>
                <span className="text-center">P</span>
                <span className="text-center">W</span>
                <span className="text-center">D</span>
                <span className="text-center">L</span>
                <span className="text-center">GD</span>
                <span className="text-center font-black">Pts</span>
              </div>
              {standings.map((team, i) => {
                const rank = Number.parseInt(team.intRank);
                const rowStyle = getRankStyle(rank);
                return (
                  <motion.div
                    key={team.strTeam}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`grid items-center px-3 py-2 border-t border-border/50 text-sm ${rowStyle}`}
                    style={{
                      gridTemplateColumns:
                        "28px 1fr 32px 32px 32px 32px 40px 40px",
                    }}
                  >
                    <span className="text-xs font-bold text-muted-foreground">
                      {rank}
                    </span>
                    <span className="flex items-center gap-2 min-w-0">
                      <TeamBadge
                        src={team.strTeamBadge}
                        name={team.strTeam}
                        size={20}
                      />
                      <span className="truncate font-medium text-foreground text-xs">
                        {team.strTeam}
                      </span>
                    </span>
                    <span className="text-center text-xs text-muted-foreground">
                      {team.intPlayed}
                    </span>
                    <span className="text-center text-xs text-muted-foreground">
                      {team.intWin}
                    </span>
                    <span className="text-center text-xs text-muted-foreground">
                      {team.intDraw}
                    </span>
                    <span className="text-center text-xs text-muted-foreground">
                      {team.intLoss}
                    </span>
                    <span className="text-center text-xs text-muted-foreground">
                      {team.intGoalDifference}
                    </span>
                    <span className="text-center text-xs font-black text-foreground">
                      {team.intPoints}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          {error ? (
            <ErrorState />
          ) : loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No results available.
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((event, i) => (
                <motion.div
                  key={event.idEvent}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="border-border bg-card">
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground mb-2 text-center">
                        {new Date(event.dateEvent).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <TeamBadge
                            src={event.strHomeTeamBadge}
                            name={event.strHomeTeam}
                            size={32}
                          />
                          <span className="text-xs font-semibold text-center line-clamp-2">
                            {event.strHomeTeam}
                          </span>
                        </div>
                        <div className="text-center px-3">
                          <span
                            className="text-xl font-black"
                            style={{ color: "oklch(0.75 0.22 60)" }}
                          >
                            {event.intHomeScore ?? "–"} :{" "}
                            {event.intAwayScore ?? "–"}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <TeamBadge
                            src={event.strAwayTeamBadge}
                            name={event.strAwayTeam}
                            size={32}
                          />
                          <span className="text-xs font-semibold text-center line-clamp-2">
                            {event.strAwayTeam}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Fixtures Tab */}
        <TabsContent value="fixtures">
          {error ? (
            <ErrorState />
          ) : loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : fixtures.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No upcoming fixtures.
            </div>
          ) : (
            <div className="space-y-3">
              {fixtures.map((event, i) => (
                <motion.div
                  key={event.idEvent}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="border-border bg-card">
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground mb-2 text-center">
                        {new Date(event.dateEvent).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {event.strTime ? ` · ${event.strTime}` : ""}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <TeamBadge
                            src={event.strHomeTeamBadge}
                            name={event.strHomeTeam}
                            size={32}
                          />
                          <span className="text-xs font-semibold text-center line-clamp-2">
                            {event.strHomeTeam}
                          </span>
                        </div>
                        <div className="text-center px-3">
                          <span className="text-sm font-bold text-muted-foreground">
                            vs
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <TeamBadge
                            src={event.strAwayTeamBadge}
                            name={event.strAwayTeam}
                            size={32}
                          />
                          <span className="text-xs font-semibold text-center line-clamp-2">
                            {event.strAwayTeam}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground/50 mt-6 mb-2 px-4">
        Data provided by TheSportsDB · Not affiliated with the Premier League
      </p>
    </div>
  );
}
