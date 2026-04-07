import type {
  Position,
  Role,
  Status,
  T,
  T__1,
  T__2,
  T__4,
  T__5,
} from "@/types/backend-compat";

/**
 * The full actor interface that pages expect to call.
 * The canister backend is currently empty/local-first, so actor will be null
 * in most sessions. Pages guard every call with `if (!actor)` and fall through
 * to localStorage — these types just ensure TypeScript is happy.
 */
export interface ActorInterface {
  isCallerAdmin(): Promise<boolean>;
  getCallerUserProfile(): Promise<T | null>;
  getAllUserProfiles(): Promise<T[]>;
  getUserIdFromCaller(): Promise<string>;
  createOrUpdateUserProfile(
    name: string,
    phone: string,
    email: string,
    role: Role,
    area: string,
    favoriteTeamId?: string | null,
  ): Promise<void>;

  getAllTeams(): Promise<T__1[]>;
  getTeam(teamId: string): Promise<T__1 | null>;

  getAllPlayers(): Promise<T__2[]>;
  getPlayer(playerId: string): Promise<T__2 | null>;
  getPlayersByTeam(teamId: string): Promise<T__2[]>;

  getAllMatches(): Promise<T__5[]>;
  getMatch(matchId: string): Promise<T__5 | null>;
  updateMatchScore(
    matchId: string,
    homeScore: bigint,
    awayScore: bigint,
    status: Status,
  ): Promise<void>;
  createMatch(
    homeTeam: string,
    awayTeam: string,
    date: bigint,
    venue: string,
    ...rest: unknown[]
  ): Promise<void>;

  getAllNews(): Promise<T__4[]>;
  getAllNewsAdmin(): Promise<T__4[]>;
  createNews(
    title: string,
    body: string,
    isPublished: boolean,
    ...rest: unknown[]
  ): Promise<string | undefined>;
  updateNews(
    newsId: string,
    title: string,
    body: string,
    isPublished: boolean,
    ...rest: unknown[]
  ): Promise<void>;
  deleteNews(newsId: string): Promise<void>;

  adminCreateUser(
    name: string,
    phone: string,
    email: string,
    role: Role,
    area: string,
    teamId?: string | null,
  ): Promise<void>;
  adminCreateTeam(
    name: string,
    area: string,
    coachId: string,
    ...rest: unknown[]
  ): Promise<void>;
  adminAddPlayer(
    teamId: string,
    nickname: string,
    name: string,
    position: Position,
    jerseyNumber: bigint,
    ...rest: unknown[]
  ): Promise<void>;
}

/**
 * Returns the actor interface for calling backend canister methods.
 * Since the backend is currently empty (local-first app), actor is always null.
 * Pages guard every call with `if (!actor)` and fall through to localStorage.
 */
export function useActor(): {
  actor: ActorInterface | null;
  isFetching: boolean;
} {
  return { actor: null, isFetching: false };
}
