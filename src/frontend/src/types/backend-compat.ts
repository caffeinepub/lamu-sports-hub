/**
 * Backend compatibility types for Lamu Sports Hub.
 *
 * The canister backend is currently minimal (local-first app).
 * These types provide the same shape as the previous backend API so that
 * all pages can compile without changes to their internal logic.
 *
 * Pages guard every actor call with `if (!actor)` and fall through to
 * localStorage — these type stubs just need to be structurally correct.
 */

// ── Enums ────────────────────────────────────────────────────────────────────

export const Role = {
  fan: { fan: null } as { fan: null },
  player: { player: null } as { player: null },
  coach: { coach: null } as { coach: null },
  admin: { admin: null } as { admin: null },
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Position = {
  goalkeeper: { goalkeeper: null } as { goalkeeper: null },
  defender: { defender: null } as { defender: null },
  midfielder: { midfielder: null } as { midfielder: null },
  forward: { forward: null } as { forward: null },
} as const;
export type Position = (typeof Position)[keyof typeof Position];

export const Status = {
  scheduled: { scheduled: null } as { scheduled: null },
  live: { live: null } as { live: null },
  played: { played: null } as { played: null },
} as const;
export type Status = (typeof Status)[keyof typeof Status];

// ── Core entity types ─────────────────────────────────────────────────────────

/** T — UserProfile */
export interface T {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: Role | string;
  area: string;
  favoriteTeamId: string | null;
  createdAt?: bigint;
  [key: string]: unknown;
}

/** T__1 — Team */
export interface T__1 {
  teamId: string;
  name: string;
  area: string;
  coachId: string;
  logoUrl: string;
  wins: bigint;
  losses: bigint;
  draws: bigint;
  goalsFor: bigint;
  goalsAgainst: bigint;
  isApproved: boolean;
  createdAt?: bigint;
  [key: string]: unknown;
}

/** T__2 — Player */
export interface T__2 {
  playerId: string;
  name: string;
  teamId: string;
  position: Position | string;
  jerseyNumber: bigint | number;
  nickname: string;
  goals: bigint | number;
  assists: bigint | number;
  appearances: bigint | number;
  matchesPlayed: bigint | number;
  yellowCards: bigint | number;
  redCards: bigint | number;
  userId: string;
  isConfirmed: boolean;
  isVerified: boolean;
  createdAt?: bigint;
  [key: string]: unknown;
}

/** T__3 — Referee */
export interface T__3 {
  refereeId: string;
  name: string;
  contact: string;
  createdAt?: bigint;
}

/** T__4 — NewsItem */
export interface T__4 {
  newsId: string;
  title: string;
  body: string;
  isPublished: boolean;
  authorId: string;
  timestamp: bigint;
  photo?: ExternalBlob;
  [key: string]: unknown;
}

/** T__5 — Match */
export interface T__5 {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: bigint;
  awayScore: bigint;
  status: Status | string | Record<string, null>;
  date: bigint;
  venue?: string;
  kickoffTime?: string;
  refereeId?: string | null;
  mvpPlayerId?: string | null;
  commentary?: string[];
  createdAt?: bigint;
  [key: string]: unknown;
}

// ── ExternalBlob stub ─────────────────────────────────────────────────────────

export class ExternalBlob {
  directURL: string;
  constructor(url: string) {
    this.directURL = url;
  }
  getDirectURL(): string {
    return this.directURL;
  }
  async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
    const response = await fetch(this.directURL);
    const blob = await response.blob();
    return new Uint8Array(await blob.arrayBuffer()) as Uint8Array<ArrayBuffer>;
  }
  static fromURL(url: string): ExternalBlob {
    return new ExternalBlob(url);
  }
  static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
    const url = URL.createObjectURL(
      new Blob([new Uint8Array(blob)], { type: "application/octet-stream" }),
    );
    return new ExternalBlob(url);
  }
}
