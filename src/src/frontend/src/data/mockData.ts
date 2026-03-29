// Lamu Sports Hub — Real FKF Lamu County League Data
// FKF Zone A, Pool A — 2nd Leg Fixture 2025/2026 Season

export type MockTeam = {
  teamId: string;
  name: string;
  area: string;
  coachName: string;
  color: string;
  secondaryColor: string;
  wins: number;
  losses: number;
  draws: number;
  goalsFor: number;
  goalsAgainst: number;
  isApproved: boolean;
};

export type MockPlayer = {
  playerId: string;
  name: string;
  nickname: string;
  teamId: string;
  position: "goalkeeper" | "defender" | "midfielder" | "forward";
  jerseyNumber: number;
  matchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  isVerified: boolean;
  nationality: string;
};

export type MockMatch = {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: string;
  status: "scheduled" | "live" | "played";
  mvpPlayerId?: string;
  refereeId?: string;
  commentary: CommentaryEntry[];
};

export type CommentaryEntry = {
  minute: number;
  type:
    | "goal"
    | "yellow_card"
    | "red_card"
    | "kickoff"
    | "halftime"
    | "fulltime"
    | "substitution"
    | "info";
  text: string;
  playerId?: string;
};

export type MockNotification = {
  notificationId: string;
  userId: string;
  type: "alert" | "reminder" | "message";
  message: string;
  timestamp: string;
  isRead: boolean;
};

// ── Real FKF Teams — Lamu County League Zone A Pool A ─────────────────────────
export const MOCK_TEAMS: MockTeam[] = [
  {
    teamId: "fkf-001",
    name: "Manda City",
    area: "Manda",
    coachName: "",
    color: "#1A3A6B",
    secondaryColor: "#FFFFFF",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-002",
    name: "Galatasaray FC",
    area: "Lamu Town",
    coachName: "",
    color: "#CC0000",
    secondaryColor: "#FFCC00",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-003",
    name: "Fayaz Bakers FC",
    area: "Lamu Town",
    coachName: "",
    color: "#FF6600",
    secondaryColor: "#FFFFFF",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-004",
    name: "Monaco FC",
    area: "Lamu Town",
    coachName: "",
    color: "#CC0000",
    secondaryColor: "#FFFFFF",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-005",
    name: "Amu Stars FC",
    area: "Lamu Town",
    coachName: "",
    color: "#FFD700",
    secondaryColor: "#003366",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-006",
    name: "Jaguar FC",
    area: "Lamu Town",
    coachName: "",
    color: "#228B22",
    secondaryColor: "#FFFFFF",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-007",
    name: "Nyundo B",
    area: "Lamu Town",
    coachName: "",
    color: "#00008B",
    secondaryColor: "#FFFFFF",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-008",
    name: "Dragon Juniors",
    area: "Lamu Town",
    coachName: "",
    color: "#8B0000",
    secondaryColor: "#FFD700",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-009",
    name: "Crocodile Juniors",
    area: "Lamu Town",
    coachName: "",
    color: "#2E8B57",
    secondaryColor: "#FFFFFF",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-010",
    name: "Sportlight FC",
    area: "Lamu Town",
    coachName: "",
    color: "#FF4500",
    secondaryColor: "#FFFFFF",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-011",
    name: "Team Lawasco",
    area: "Lamu Town",
    coachName: "",
    color: "#4B0082",
    secondaryColor: "#FFFFFF",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-012",
    name: "Deepsea FC",
    area: "Lamu Town",
    coachName: "",
    color: "#006994",
    secondaryColor: "#FFFFFF",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-013",
    name: "All Brothers FC",
    area: "Lamu Town",
    coachName: "",
    color: "#556B2F",
    secondaryColor: "#FFD700",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-014",
    name: "Kashmir City",
    area: "Lamu Town",
    coachName: "",
    color: "#008080",
    secondaryColor: "#FFFFFF",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-015",
    name: "Boda Nations",
    area: "Lamu Town",
    coachName: "",
    color: "#800080",
    secondaryColor: "#FFFFFF",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-016",
    name: "Dragon Fly",
    area: "Lamu Town",
    coachName: "",
    color: "#B8860B",
    secondaryColor: "#FFFFFF",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-017",
    name: "Benfica FC",
    area: "Lamu Town",
    coachName: "",
    color: "#CC0000",
    secondaryColor: "#FFFFFF",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-018",
    name: "Flamingo FC",
    area: "Lamu Town",
    coachName: "",
    color: "#FF69B4",
    secondaryColor: "#FFFFFF",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-019",
    name: "Deep Shark FC",
    area: "Lamu Town",
    coachName: "",
    color: "#1C5F8A",
    secondaryColor: "#FFFFFF",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
  {
    teamId: "fkf-020",
    name: "Team Wazee",
    area: "Lamu Town",
    coachName: "",
    color: "#696969",
    secondaryColor: "#FFD700",
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    isApproved: true,
  },
];

// No demo players — officials add real players
export const MOCK_PLAYERS: MockPlayer[] = [];

// ── Real FKF Fixtures — Pool A 2nd Leg 2025/2026 ─────────────────────────────
// All matches at 16:30 EAT. Ground: MANDA or SPORTS
export const MOCK_MATCHES: MockMatch[] = [
  {
    matchId: "fkf-m-01",
    homeTeamId: "fkf-001",
    awayTeamId: "fkf-010",
    homeScore: 0,
    awayScore: 0,
    date: "2026-03-28T16:30:00",
    status: "played",
    commentary: [],
  },
  {
    matchId: "fkf-m-02",
    homeTeamId: "fkf-002",
    awayTeamId: "fkf-020",
    homeScore: 0,
    awayScore: 0,
    date: "2026-03-29T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-03",
    homeTeamId: "fkf-003",
    awayTeamId: "fkf-012",
    homeScore: 0,
    awayScore: 0,
    date: "2026-03-30T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-04",
    homeTeamId: "fkf-004",
    awayTeamId: "fkf-014",
    homeScore: 0,
    awayScore: 0,
    date: "2026-03-31T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-05",
    homeTeamId: "fkf-005",
    awayTeamId: "fkf-013",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-01T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-06",
    homeTeamId: "fkf-006",
    awayTeamId: "fkf-015",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-02T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-07",
    homeTeamId: "fkf-007",
    awayTeamId: "fkf-016",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-03T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-08",
    homeTeamId: "fkf-008",
    awayTeamId: "fkf-017",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-04T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-09",
    homeTeamId: "fkf-009",
    awayTeamId: "fkf-019",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-05T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-10",
    homeTeamId: "fkf-010",
    awayTeamId: "fkf-018",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-06T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-11",
    homeTeamId: "fkf-011",
    awayTeamId: "fkf-020",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-07T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-12",
    homeTeamId: "fkf-012",
    awayTeamId: "fkf-001",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-08T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-13",
    homeTeamId: "fkf-002",
    awayTeamId: "fkf-014",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-09T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-14",
    homeTeamId: "fkf-013",
    awayTeamId: "fkf-003",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-10T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-15",
    homeTeamId: "fkf-004",
    awayTeamId: "fkf-015",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-11T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-16",
    homeTeamId: "fkf-016",
    awayTeamId: "fkf-005",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-12T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-17",
    homeTeamId: "fkf-006",
    awayTeamId: "fkf-017",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-13T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-18",
    homeTeamId: "fkf-019",
    awayTeamId: "fkf-007",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-14T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-19",
    homeTeamId: "fkf-008",
    awayTeamId: "fkf-009",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-15T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-20",
    homeTeamId: "fkf-018",
    awayTeamId: "fkf-020",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-16T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-21",
    homeTeamId: "fkf-010",
    awayTeamId: "fkf-012",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-17T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-22",
    homeTeamId: "fkf-011",
    awayTeamId: "fkf-014",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-18T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-23",
    homeTeamId: "fkf-001",
    awayTeamId: "fkf-013",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-19T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-24",
    homeTeamId: "fkf-002",
    awayTeamId: "fkf-015",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-19T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-25",
    homeTeamId: "fkf-003",
    awayTeamId: "fkf-016",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-20T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-26",
    homeTeamId: "fkf-004",
    awayTeamId: "fkf-017",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-21T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-27",
    homeTeamId: "fkf-005",
    awayTeamId: "fkf-019",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-22T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-28",
    homeTeamId: "fkf-006",
    awayTeamId: "fkf-009",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-23T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-29",
    homeTeamId: "fkf-007",
    awayTeamId: "fkf-008",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-24T16:30:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "fkf-m-30",
    homeTeamId: "fkf-012",
    awayTeamId: "fkf-018",
    homeScore: 0,
    awayScore: 0,
    date: "2026-04-25T16:30:00",
    status: "scheduled",
    commentary: [],
  },
];

// No demo notifications — officials send real ones via Admin Panel
export const MOCK_NOTIFICATIONS: MockNotification[] = [];

// ── Standings Computation ─────────────────────────────────────────────────────
export type StandingsEntry = {
  position: number;
  team: MockTeam;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: ("W" | "D" | "L")[];
};

export function computeStandings(): StandingsEntry[] {
  const entries: StandingsEntry[] = MOCK_TEAMS.map((team) => ({
    position: 0,
    team,
    played: team.wins + team.draws + team.losses,
    wins: team.wins,
    draws: team.draws,
    losses: team.losses,
    goalsFor: team.goalsFor,
    goalsAgainst: team.goalsAgainst,
    goalDiff: team.goalsFor - team.goalsAgainst,
    points: team.wins * 3 + team.draws,
    form: [] as ("W" | "D" | "L")[],
  }));

  entries.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsFor - a.goalsFor;
  });

  entries.forEach((entry, i) => {
    entry.position = i + 1;
    const teamMatches = MOCK_MATCHES.filter(
      (m) =>
        m.status === "played" &&
        (m.homeTeamId === entry.team.teamId ||
          m.awayTeamId === entry.team.teamId),
    ).slice(-5);
    entry.form = teamMatches.map((m) => {
      const isHome = m.homeTeamId === entry.team.teamId;
      const teamScore = isHome ? m.homeScore : m.awayScore;
      const oppScore = isHome ? m.awayScore : m.homeScore;
      if (teamScore > oppScore) return "W";
      if (teamScore === oppScore) return "D";
      return "L";
    });
  });

  return entries;
}

export type TopScorer = {
  rank: number;
  player: MockPlayer;
  team: MockTeam;
};

export function getTopScorers(): TopScorer[] {
  const sorted = [...MOCK_PLAYERS]
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
    .slice(0, 10);
  return sorted.map((p, i) => ({
    rank: i + 1,
    player: p,
    team: MOCK_TEAMS.find((t) => t.teamId === p.teamId)!,
  }));
}

export function getTopAssists(): TopScorer[] {
  const sorted = [...MOCK_PLAYERS]
    .filter((p) => p.assists > 0)
    .sort((a, b) => b.assists - a.assists || b.goals - a.goals)
    .slice(0, 10);
  return sorted.map((p, i) => ({
    rank: i + 1,
    player: p,
    team: MOCK_TEAMS.find((t) => t.teamId === p.teamId)!,
  }));
}

export function getAreaColor(area: string): string {
  const map: Record<string, string> = {
    Manda: "#1A3A6B",
    "Lamu Town": "#E84B3A",
  };
  return map[area] || "#E84B3A";
}

export function getPositionLabel(position: string): string {
  const map: Record<string, string> = {
    goalkeeper: "GK",
    defender: "DEF",
    midfielder: "MID",
    forward: "FWD",
  };
  return map[position] || position.toUpperCase();
}

export function getPositionColor(position: string): string {
  const map: Record<string, string> = {
    goalkeeper: "#F59E0B",
    defender: "#3B82F6",
    midfielder: "#10B981",
    forward: "#EF4444",
  };
  return map[position] || "#6B7280";
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function formatMatchDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
