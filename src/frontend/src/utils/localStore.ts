export function getLocalStore<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStore<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Referees ──────────────────────────────────────────────────────────────────
export type Referee = {
  refereeId: string;
  name: string;
  contact: string;
  licenseNumber: string;
  isActive: boolean;
};

export const LSH_REFEREES_KEY = "lsh_referees";

const SEED_REFEREES: Referee[] = [
  {
    refereeId: "ref-001",
    name: "Mohamed Shariff",
    contact: "+254 712 345 678",
    licenseNumber: "KFF-2023-001",
    isActive: true,
  },
  {
    refereeId: "ref-002",
    name: "Abdalla Kombo",
    contact: "+254 723 456 789",
    licenseNumber: "KFF-2023-002",
    isActive: true,
  },
  {
    refereeId: "ref-003",
    name: "Ibrahim Salim",
    contact: "+254 734 567 890",
    licenseNumber: "KFF-2022-015",
    isActive: false,
  },
];

export function getReferees(): Referee[] {
  const stored = getLocalStore<Referee[] | null>(LSH_REFEREES_KEY, null);
  if (!stored) {
    setLocalStore(LSH_REFEREES_KEY, SEED_REFEREES);
    return SEED_REFEREES;
  }
  return stored;
}

// ── Awards ────────────────────────────────────────────────────────────────────
export type Award = {
  awardId: string;
  title: string;
  recipientName: string;
  recipientType: "player" | "team";
  season: string;
  description: string;
  isConfirmed: boolean;
  awardDate: string;
};

export const LSH_AWARDS_KEY = "lsh_awards";

const SEED_AWARDS: Award[] = [
  {
    awardId: "award-001",
    title: "Golden Boot",
    recipientName: "Hassan Mwende",
    recipientType: "player",
    season: "2025/26",
    description: "Top scorer of the season with 11 goals in 12 appearances.",
    isConfirmed: true,
    awardDate: "2026-03-01",
  },
  {
    awardId: "award-002",
    title: "Best Team of the Season",
    recipientName: "Shela United FC",
    recipientType: "team",
    season: "2025/26",
    description:
      "Dominant season performance with 8 wins, 26 points and the best attack.",
    isConfirmed: true,
    awardDate: "2026-03-01",
  },
  {
    awardId: "award-003",
    title: "Fair Play Award",
    recipientName: "Mkunguni FC",
    recipientType: "team",
    season: "2025/26",
    description:
      "Fewest disciplinary incidents across the season. True island spirit.",
    isConfirmed: false,
    awardDate: "2026-03-01",
  },
];

export function getAwards(): Award[] {
  const stored = getLocalStore<Award[] | null>(LSH_AWARDS_KEY, null);
  if (!stored) {
    setLocalStore(LSH_AWARDS_KEY, SEED_AWARDS);
    return SEED_AWARDS;
  }
  return stored;
}

// ── Videos ────────────────────────────────────────────────────────────────────
export type Video = {
  videoId: string;
  title: string;
  url: string;
  category: "tactics" | "preparation" | "highlights";
};

export const LSH_VIDEOS_KEY = "lsh_videos";

const SEED_VIDEOS: Video[] = [
  {
    videoId: "vid-001",
    title: "Understanding the 4-3-3 Formation",
    url: "https://www.youtube.com/embed/dWBaVXDsS7g",
    category: "tactics",
  },
  {
    videoId: "vid-002",
    title: "Pressing & High Press Tactics Explained",
    url: "https://www.youtube.com/embed/x2cuvjfVOJg",
    category: "tactics",
  },
  {
    videoId: "vid-003",
    title: "Pre-Match Warm-Up Drills for Football Players",
    url: "https://www.youtube.com/embed/ZDz1OVX3jYE",
    category: "preparation",
  },
];

export function getVideos(): Video[] {
  const stored = getLocalStore<Video[] | null>(LSH_VIDEOS_KEY, null);
  if (!stored) {
    setLocalStore(LSH_VIDEOS_KEY, SEED_VIDEOS);
    return SEED_VIDEOS;
  }
  return stored;
}

// ── Suggestions ───────────────────────────────────────────────────────────────
export type Suggestion = {
  suggestionId: string;
  message: string;
  suggestionType: "suggestion" | "problem_report";
  timestamp: string;
  isRead: boolean;
  authorNote: string;
  officialReply: string;
};

export const LSH_SUGGESTIONS_KEY = "lsh_suggestions";

// ── Officials ─────────────────────────────────────────────────────────────────
export type Official = {
  officialId: string;
  name: string;
  title: string;
  contact: string;
  email: string;
  displayOrder: number;
};

export const LSH_OFFICIALS_KEY = "lsh_officials";

const SEED_OFFICIALS: Official[] = [
  {
    officialId: "off-001",
    name: "Said Joseph",
    title: "Chairman & Founder",
    contact: "+254 700 000 001",
    email: "said@lamusportshub.ke",
    displayOrder: 1,
  },
  {
    officialId: "off-002",
    name: "Fatuma Hassan",
    title: "Secretary General",
    contact: "+254 700 000 002",
    email: "fatuma@lamusportshub.ke",
    displayOrder: 2,
  },
  {
    officialId: "off-003",
    name: "Omar Abdallah",
    title: "Head of Competitions",
    contact: "+254 700 000 003",
    email: "omar@lamusportshub.ke",
    displayOrder: 3,
  },
  {
    officialId: "off-004",
    name: "Amina Juma",
    title: "Treasurer",
    contact: "+254 700 000 004",
    email: "amina@lamusportshub.ke",
    displayOrder: 4,
  },
];

export function getOfficials(): Official[] {
  const stored = getLocalStore<Official[] | null>(LSH_OFFICIALS_KEY, null);
  if (!stored) {
    setLocalStore(LSH_OFFICIALS_KEY, SEED_OFFICIALS);
    return SEED_OFFICIALS;
  }
  return stored;
}

// ── Pitches ───────────────────────────────────────────────────────────────────
export type Pitch = {
  pitchId: string;
  name: string;
  location: string;
  surface: string;
  capacity: number;
};

export const LSH_PITCHES_KEY = "lsh_pitches";

const SEED_PITCHES: Pitch[] = [
  {
    pitchId: "pitch-001",
    name: "Twaif Ground",
    location: "Twaif, Lamu Island",
    surface: "Natural grass",
    capacity: 500,
  },
  {
    pitchId: "pitch-002",
    name: "Mala Ground",
    location: "Mala, Lamu Island",
    surface: "Natural grass",
    capacity: 300,
  },
  {
    pitchId: "pitch-003",
    name: "Sports Ground",
    location: "Lamu Town, Lamu Island",
    surface: "Natural grass",
    capacity: 800,
  },
  {
    pitchId: "pitch-004",
    name: "Carpet Field",
    location: "Lamu Town, Lamu Island",
    surface: "Artificial turf",
    capacity: 200,
  },
];

export function getPitches(): Pitch[] {
  const stored = getLocalStore<Pitch[] | null>(LSH_PITCHES_KEY, null);
  if (!stored) {
    setLocalStore(LSH_PITCHES_KEY, SEED_PITCHES);
    return SEED_PITCHES;
  }
  return stored;
}

// ── Season Settings ───────────────────────────────────────────────────────────
export type SeasonSettings = {
  seasonName: string;
  tournamentName: string;
  currentYear: string;
};

export const LSH_SEASON_SETTINGS_KEY = "lsh_season_settings";

export function getSeasonSettings(): SeasonSettings {
  return getLocalStore<SeasonSettings>(LSH_SEASON_SETTINGS_KEY, {
    seasonName: "2025/26",
    tournamentName: "Lamu Premier League",
    currentYear: "2026",
  });
}

// ── System Status ─────────────────────────────────────────────────────────────
export type SystemStatus = {
  isActive: boolean;
  message: string;
};

export const LSH_SYSTEM_STATUS_KEY = "lsh_system_status";

// ── Player Confirmations ──────────────────────────────────────────────────────
export const LSH_PLAYER_CONFIRMATIONS_KEY = "lsh_player_confirmations";

export function getPlayerConfirmations(): Record<string, boolean> {
  return getLocalStore<Record<string, boolean>>(
    LSH_PLAYER_CONFIRMATIONS_KEY,
    {},
  );
}

// ── Player Photos ─────────────────────────────────────────────────────────────
export const LSH_PLAYER_PHOTOS_KEY = "lsh_player_photos";

export function getPlayerPhotos(): Record<string, string> {
  return getLocalStore<Record<string, string>>(LSH_PLAYER_PHOTOS_KEY, {});
}

// ── Match Referee Assignments ─────────────────────────────────────────────────
// Maps matchId -> refereeId
export const LSH_MATCH_REFEREES_KEY = "lsh_match_referees";

export function getMatchReferees(): Record<string, string> {
  return getLocalStore<Record<string, string>>(LSH_MATCH_REFEREES_KEY, {});
}

export function setMatchReferee(
  matchId: string,
  refereeId: string | null,
): void {
  const current = getMatchReferees();
  if (refereeId === null) {
    delete current[matchId];
  } else {
    current[matchId] = refereeId;
  }
  setLocalStore(LSH_MATCH_REFEREES_KEY, current);
}

// ── Profile Photo ──────────────────────────────────────────────────────────────
export const LSH_PROFILE_PHOTO_KEY = "lsh_profile_photo";

export function getProfilePhoto(): string | null {
  return getLocalStore<string | null>(LSH_PROFILE_PHOTO_KEY, null);
}

// ── User Settings ─────────────────────────────────────────────────────────────
export type UserSettings = {
  matchAlerts: boolean;
  newsAlerts: boolean;
  mvpReminders: boolean;
  favoriteTeamId: string;
  favoritePlayerId: string;
  displayName: string;
};

export const LSH_USER_SETTINGS_KEY = "lsh_user_settings";

export function getUserSettings(): UserSettings {
  return getLocalStore<UserSettings>(LSH_USER_SETTINGS_KEY, {
    matchAlerts: true,
    newsAlerts: true,
    mvpReminders: false,
    favoriteTeamId: "team-001",
    favoritePlayerId: "",
    displayName: "Hassan Mwende",
  });
}

// ── Match Pitches ─────────────────────────────────────────────────────────────
export const LSH_MATCH_PITCHES_KEY = "lsh_match_pitches";

export function getMatchPitches(): Record<string, string> {
  return getLocalStore<Record<string, string>>(LSH_MATCH_PITCHES_KEY, {});
}

export function setMatchPitch(matchId: string, pitchId: string | null): void {
  const current = getMatchPitches();
  if (pitchId === null) {
    delete current[matchId];
  } else {
    current[matchId] = pitchId;
  }
  setLocalStore(LSH_MATCH_PITCHES_KEY, current);
}

// ── Team Logos ────────────────────────────────────────────────────────────────
export const LSH_TEAM_LOGOS_KEY = "lsh_team_logos";

export function getTeamLogos(): Record<string, string> {
  return getLocalStore<Record<string, string>>(LSH_TEAM_LOGOS_KEY, {});
}

export function setTeamLogo(teamId: string, base64: string): void {
  const current = getTeamLogos();
  current[teamId] = base64;
  setLocalStore(LSH_TEAM_LOGOS_KEY, current);
}

// ── News Confirmations ────────────────────────────────────────────────────────
// Maps newsId -> { confirmedBy: string; confirmedAt: string }
export type NewsConfirmation = {
  confirmedBy: string;
  confirmedAt: string;
};

export const LSH_NEWS_CONFIRMATIONS_KEY = "lsh_news_confirmations";

export function getNewsConfirmations(): Record<string, NewsConfirmation> {
  return getLocalStore<Record<string, NewsConfirmation>>(
    LSH_NEWS_CONFIRMATIONS_KEY,
    {},
  );
}

export function confirmNews(newsId: string, confirmedBy: string): void {
  const current = getNewsConfirmations();
  current[newsId] = {
    confirmedBy,
    confirmedAt: new Date().toISOString(),
  };
  setLocalStore(LSH_NEWS_CONFIRMATIONS_KEY, current);
}

export function unconfirmNews(newsId: string): void {
  const current = getNewsConfirmations();
  delete current[newsId];
  setLocalStore(LSH_NEWS_CONFIRMATIONS_KEY, current);
}

// ── Recovery Requests ─────────────────────────────────────────────────────────
export type RecoveryRequest = {
  ticketId: string; // e.g. "LSH-REC-1234"
  submittedAt: string; // ISO date
  name: string;
  contact: string; // phone or email
  lastPrincipalId: string; // what the user remembers
  issueDescription: string;
  status: "pending" | "resolved" | "rejected";
  adminReply: string;
};

export const LSH_RECOVERY_KEY = "lsh_recovery_requests";

export function getRecoveryRequests(): RecoveryRequest[] {
  return getLocalStore<RecoveryRequest[]>(LSH_RECOVERY_KEY, []);
}

export function addRecoveryRequest(
  req: Omit<
    RecoveryRequest,
    "ticketId" | "submittedAt" | "status" | "adminReply"
  >,
): RecoveryRequest {
  const all = getRecoveryRequests();
  const ticket: RecoveryRequest = {
    ...req,
    ticketId: `LSH-REC-${Math.floor(1000 + Math.random() * 9000)}`,
    submittedAt: new Date().toISOString(),
    status: "pending",
    adminReply: "",
  };
  all.push(ticket);
  setLocalStore(LSH_RECOVERY_KEY, all);
  return ticket;
}

export function updateRecoveryRequest(
  ticketId: string,
  updates: Partial<Pick<RecoveryRequest, "status" | "adminReply">>,
): void {
  const all = getRecoveryRequests();
  const idx = all.findIndex((r) => r.ticketId === ticketId);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...updates };
    setLocalStore(LSH_RECOVERY_KEY, all);
  }
}
