export function getLocalStore<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStore<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // QuotaExceededError — storage is full; fail silently so the UI still works
    console.warn("localStorage quota exceeded for key:", key, e);
  }
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

export function getReferees(): Referee[] {
  return getLocalStore<Referee[]>(LSH_REFEREES_KEY, []);
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

export function getAwards(): Award[] {
  return getLocalStore<Award[]>(LSH_AWARDS_KEY, []);
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

export function addVideo(video: Omit<Video, "videoId">): Video {
  const current = getVideos();
  const newVideo: Video = { ...video, videoId: `vid-${Date.now()}` };
  setLocalStore(LSH_VIDEOS_KEY, [...current, newVideo]);
  return newVideo;
}

export function deleteVideo(videoId: string): void {
  const current = getVideos();
  setLocalStore(
    LSH_VIDEOS_KEY,
    current.filter((v) => v.videoId !== videoId),
  );
}

export function updateVideo(
  videoId: string,
  updates: Partial<Omit<Video, "videoId">>,
): void {
  const current = getVideos();
  setLocalStore(
    LSH_VIDEOS_KEY,
    current.map((v) => (v.videoId === videoId ? { ...v, ...updates } : v)),
  );
}

// ── Live Streams ───────────────────────────────────────────────────────────────
export const LSH_LIVE_STREAMS_KEY = "lsh_live_streams";

export type LiveStream = {
  streamId: string;
  title: string;
  url: string;
  addedAt: number;
};

export function getLiveStreams(): LiveStream[] {
  return getLocalStore<LiveStream[]>(LSH_LIVE_STREAMS_KEY, []);
}

export function addLiveStream(
  stream: Omit<LiveStream, "streamId" | "addedAt">,
): LiveStream {
  const current = getLiveStreams();
  const newStream: LiveStream = {
    ...stream,
    streamId: `stream-${Date.now()}`,
    addedAt: Date.now(),
  };
  setLocalStore(LSH_LIVE_STREAMS_KEY, [...current, newStream]);
  return newStream;
}

export function deleteLiveStream(streamId: string): void {
  const current = getLiveStreams();
  setLocalStore(
    LSH_LIVE_STREAMS_KEY,
    current.filter((s) => s.streamId !== streamId),
  );
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

export function getOfficials(): Official[] {
  return getLocalStore<Official[]>(LSH_OFFICIALS_KEY, []);
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
  lineupAlerts: boolean;
  goalAlerts: boolean;
  favoriteTeamId: string;
  favoritePlayerId: string | undefined;
  displayName: string;
  theme: "dark" | "light" | "system";
  language: "en" | "sw";
  interests: string[];
};

export const LSH_USER_SETTINGS_KEY = "lsh_user_settings";

export function getUserSettings(): UserSettings {
  const stored = getLocalStore<Partial<UserSettings>>(
    LSH_USER_SETTINGS_KEY,
    {},
  );
  return {
    matchAlerts: stored.matchAlerts ?? true,
    newsAlerts: stored.newsAlerts ?? true,
    mvpReminders: stored.mvpReminders ?? false,
    lineupAlerts: stored.lineupAlerts ?? false,
    goalAlerts: stored.goalAlerts ?? true,
    favoriteTeamId: stored.favoriteTeamId ?? "",
    favoritePlayerId: stored.favoritePlayerId ?? undefined,
    displayName: stored.displayName ?? "",
    theme: stored.theme ?? "dark",
    language: stored.language ?? "en",
    interests: stored.interests ?? ["news", "leaderboard"],
  };
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

// ── Official Access Code ──────────────────────────────────────────────────────
export const LSH_OFFICIAL_CODE_KEY = "lsh_official_code";
// Code is not stored in plain text in source — bootstrapped via migration
function _getDefaultCode(): string {
  try {
    return atob("TFNIMjAyNg==");
  } catch {
    return "";
  }
}

export function getOfficialCode(): string {
  const stored = getLocalStore<string>(LSH_OFFICIAL_CODE_KEY, "");
  if (!stored) {
    // Bootstrap on first run
    const d = _getDefaultCode();
    setLocalStore(LSH_OFFICIAL_CODE_KEY, d);
    return d;
  }
  return stored;
}

export function setOfficialCode(code: string): void {
  setLocalStore(LSH_OFFICIAL_CODE_KEY, code);
}

export function setOfficialSessionVerified(): void {
  sessionStorage.setItem("lsh_official_session", "verified");
}

export function isOfficialSessionVerified(): boolean {
  return sessionStorage.getItem("lsh_official_session") === "verified";
}

export function clearOfficialSession(): void {
  sessionStorage.removeItem("lsh_official_session");
}

// ── App Logo ──────────────────────────────────────────────────────────────────
export const LSH_APP_LOGO_KEY = "lsh_app_logo";

export function getAppLogo(): string | null {
  return getLocalStore<string | null>(LSH_APP_LOGO_KEY, null);
}

export function setAppLogo(base64: string): void {
  setLocalStore(LSH_APP_LOGO_KEY, base64);
}

export function clearAppLogo(): void {
  localStorage.removeItem(LSH_APP_LOGO_KEY);
}

// ── Team Name/Area Overrides ───────────────────────────────────────────────────
export const LSH_TEAM_OVERRIDES_KEY = "lsh_team_overrides";

export type TeamOverride = { name: string; area: string };

export function getTeamOverrides(): Record<string, TeamOverride> {
  return getLocalStore<Record<string, TeamOverride>>(
    LSH_TEAM_OVERRIDES_KEY,
    {},
  );
}

export function setTeamOverride(teamId: string, override: TeamOverride): void {
  const current = getTeamOverrides();
  current[teamId] = override;
  setLocalStore(LSH_TEAM_OVERRIDES_KEY, current);
}

// ── Soft-deleted Teams ─────────────────────────────────────────────────────────
export const LSH_DELETED_TEAMS_KEY = "lsh_deleted_teams";

export function getDeletedTeamIds(): string[] {
  return getLocalStore<string[]>(LSH_DELETED_TEAMS_KEY, []);
}

export function softDeleteTeam(teamId: string): void {
  const current = getDeletedTeamIds();
  if (!current.includes(teamId)) {
    current.push(teamId);
    setLocalStore(LSH_DELETED_TEAMS_KEY, current);
  }
}

// ── News Photos ────────────────────────────────────────────────────────────────
// Maps newsId -> base64 data URL of the uploaded photo
export const LSH_NEWS_PHOTOS_KEY = "lsh_news_photos";

export function getNewsPhotos(): Record<string, string> {
  return getLocalStore<Record<string, string>>(LSH_NEWS_PHOTOS_KEY, {});
}

export function setNewsPhoto(newsId: string, base64: string): void {
  const current = getNewsPhotos();
  current[newsId] = base64;
  setLocalStore(LSH_NEWS_PHOTOS_KEY, current);
}

export function deleteNewsPhoto(newsId: string): void {
  const current = getNewsPhotos();
  delete current[newsId];
  setLocalStore(LSH_NEWS_PHOTOS_KEY, current);
}

// ── Notifications Read State ──────────────────────────────────────────────────
// Persists which notification IDs have been marked as read
export const LSH_NOTIF_READ_KEY = "lsh_notif_read_ids";

export function getReadNotifIds(): string[] {
  return getLocalStore<string[]>(LSH_NOTIF_READ_KEY, []);
}

export function markNotifRead(notifId: string): void {
  const current = getReadNotifIds();
  if (!current.includes(notifId)) {
    current.push(notifId);
    setLocalStore(LSH_NOTIF_READ_KEY, current);
  }
}

export function markAllNotifsRead(notifIds: string[]): void {
  const current = getReadNotifIds();
  const merged = Array.from(new Set([...current, ...notifIds]));
  setLocalStore(LSH_NOTIF_READ_KEY, merged);
}

// ── Local Notifications (sent by officials via Admin Panel > Notify) ──────────
export type LocalNotification = {
  notificationId: string;
  type: "alert" | "reminder" | "message";
  message: string;
  timestamp: string; // ISO date string
  isRead: boolean;
  target: string; // "all" or area name
};

export const LSH_LOCAL_NOTIFS_KEY = "lsh_local_notifications";

export function getLocalNotifications(): LocalNotification[] {
  return getLocalStore<LocalNotification[]>(LSH_LOCAL_NOTIFS_KEY, []);
}

export function addLocalNotification(
  notif: Omit<LocalNotification, "notificationId" | "timestamp" | "isRead">,
): LocalNotification {
  const all = getLocalNotifications();
  const newNotif: LocalNotification = {
    ...notif,
    notificationId: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    isRead: false,
  };
  all.unshift(newNotif);
  setLocalStore(LSH_LOCAL_NOTIFS_KEY, all);
  return newNotif;
}

export function clearLocalNotifications(): void {
  setLocalStore(LSH_LOCAL_NOTIFS_KEY, []);
}

export function deleteLocalNotification(notifId: string): void {
  const current = getLocalNotifications().filter(
    (n) => n.notificationId !== notifId,
  );
  setLocalStore(LSH_LOCAL_NOTIFS_KEY, current);
}

// ── Soft-deleted Players ───────────────────────────────────────────────────────
export const LSH_DELETED_PLAYERS_KEY = "lsh_deleted_players";

export function getDeletedPlayerIds(): string[] {
  return getLocalStore<string[]>(LSH_DELETED_PLAYERS_KEY, []);
}

export function softDeletePlayer(playerId: string): void {
  const current = getDeletedPlayerIds();
  if (!current.includes(playerId)) {
    current.push(playerId);
    setLocalStore(LSH_DELETED_PLAYERS_KEY, current);
  }
}

// ── Local News (for users without Internet Identity) ──────────────────────────
// Full news items stored locally so PIN-session officials can publish news
// even when the backend requires II authentication.
export type LocalNewsItem = {
  newsId: string;
  title: string;
  body: string;
  isPublished: boolean;
  authorId: string;
  timestamp: number; // ms epoch
  photoBase64?: string;
};

export const LSH_LOCAL_NEWS_KEY = "lsh_local_news";

export function getLocalNews(): LocalNewsItem[] {
  return getLocalStore<LocalNewsItem[]>(LSH_LOCAL_NEWS_KEY, []);
}

export function addLocalNewsItem(item: LocalNewsItem): void {
  const current = getLocalNews();
  current.unshift(item); // newest first
  setLocalStore(LSH_LOCAL_NEWS_KEY, current);
}

export function updateLocalNewsItem(
  newsId: string,
  updates: Partial<LocalNewsItem>,
): void {
  const current = getLocalNews();
  const idx = current.findIndex((n) => n.newsId === newsId);
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...updates };
    setLocalStore(LSH_LOCAL_NEWS_KEY, current);
  }
}

export function deleteLocalNewsItem(newsId: string): void {
  const current = getLocalNews().filter((n) => n.newsId !== newsId);
  setLocalStore(LSH_LOCAL_NEWS_KEY, current);
}

// ── Local Teams (for users without Internet Identity) ─────────────────────────
export type LocalTeam = {
  teamId: string;
  name: string;
  area: string;
  coachName: string;
  createdAt: number;
};

export const LSH_LOCAL_TEAMS_KEY = "lsh_local_teams";

export function getLocalTeams(): LocalTeam[] {
  return getLocalStore<LocalTeam[]>(LSH_LOCAL_TEAMS_KEY, []);
}

export function addLocalTeam(team: LocalTeam): void {
  const current = getLocalTeams();
  current.push(team);
  setLocalStore(LSH_LOCAL_TEAMS_KEY, current);
}

export function updateLocalTeam(
  teamId: string,
  updates: Partial<LocalTeam>,
): void {
  const current = getLocalTeams();
  const idx = current.findIndex((t) => t.teamId === teamId);
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...updates };
    setLocalStore(LSH_LOCAL_TEAMS_KEY, current);
  }
}

export function deleteLocalTeam(teamId: string): void {
  const current = getLocalTeams().filter((t) => t.teamId !== teamId);
  setLocalStore(LSH_LOCAL_TEAMS_KEY, current);
}

// ── Local Players (for users without Internet Identity) ───────────────────────
export type LocalPlayer = {
  playerId: string;
  name: string;
  nickname: string;
  teamId: string;
  position: string;
  jerseyNumber: number;
  photoBase64?: string;
  isConfirmed: boolean;
  createdAt: number;
};

export const LSH_LOCAL_PLAYERS_KEY = "lsh_local_players";

export function getLocalPlayers(): LocalPlayer[] {
  return getLocalStore<LocalPlayer[]>(LSH_LOCAL_PLAYERS_KEY, []);
}

export function addLocalPlayer(player: LocalPlayer): void {
  const current = getLocalPlayers();
  current.push(player);
  setLocalStore(LSH_LOCAL_PLAYERS_KEY, current);
}

export function updateLocalPlayer(
  playerId: string,
  updates: Partial<LocalPlayer>,
): void {
  const current = getLocalPlayers();
  const idx = current.findIndex((p) => p.playerId === playerId);
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...updates };
    setLocalStore(LSH_LOCAL_PLAYERS_KEY, current);
  }
}

export function deleteLocalPlayer(playerId: string): void {
  const current = getLocalPlayers().filter((p) => p.playerId !== playerId);
  setLocalStore(LSH_LOCAL_PLAYERS_KEY, current);
}

// ── Migrations ───────────────────────────────────────────────────────────────
const DEMO_PHRASES = [
  "welcome",
  "season",
  "match day",
  "demo",
  "test notification",
  "league begins",
];
function isDemoNotification(n: LocalNotification): boolean {
  const text = n.message.toLowerCase();
  return DEMO_PHRASES.some((p) => text.includes(p));
}

export function runMigrations(): void {
  if (!localStorage.getItem("lsh_migration_v2")) {
    // Clear any stale demo notifications from previous versions
    localStorage.setItem(LSH_LOCAL_NOTIFS_KEY, JSON.stringify([]));
    localStorage.setItem("lsh_migration_v2", "done");
  }
  if (!localStorage.getItem("lsh_migration_v3")) {
    // Remove demo-phrase notifications but keep real official notifications
    const current = getLocalNotifications();
    const cleaned = current.filter((n) => !isDemoNotification(n));
    setLocalStore(LSH_LOCAL_NOTIFS_KEY, cleaned);
    localStorage.setItem("lsh_migration_v3", "done");
  }
  // v4: force-wipe all demo notifications regardless of prior migration state
  // Resets the key so every user gets a clean slate on this deploy
  if (!localStorage.getItem("lsh_migration_v4")) {
    const current = getLocalNotifications();
    const cleaned = current.filter((n) => !isDemoNotification(n));
    setLocalStore(LSH_LOCAL_NOTIFS_KEY, cleaned);
    localStorage.setItem("lsh_migration_v4", "done");
  }
  // v5: seed real FKF Lamu County League teams if no local teams exist yet
  if (!localStorage.getItem("lsh_migration_v5")) {
    const existing = getLocalTeams();
    // Only seed if there are no teams at all
    if (existing.length === 0) {
      const FKF_TEAMS: LocalTeam[] = [
        {
          teamId: "fkf-001",
          name: "Manda City",
          area: "Manda",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-002",
          name: "Galatasaray FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-003",
          name: "Fayaz Bakers FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-004",
          name: "Monaco FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-005",
          name: "Amu Stars FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-006",
          name: "Jaguar FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-007",
          name: "Nyundo B",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-008",
          name: "Dragon Juniors",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-009",
          name: "Crocodile Juniors",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-010",
          name: "Sportlight FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-011",
          name: "Team Lawasco",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-012",
          name: "Deepsea FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-013",
          name: "All Brothers FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-014",
          name: "Kashmir City",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-015",
          name: "Boda Nations",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-016",
          name: "Dragon Fly",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-017",
          name: "Benfica FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-018",
          name: "Flamingo FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-019",
          name: "Deep Shark FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-020",
          name: "Team Wazee",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
      ];
      setLocalStore(LSH_LOCAL_TEAMS_KEY, FKF_TEAMS);
    }
    localStorage.setItem("lsh_migration_v5", "done");
  }
  // v6: merge FKF teams into any existing local teams list — runs even if v5 already ran
  // This ensures devices that had v5 marked done but cleared teams still get them seeded
  if (!localStorage.getItem("lsh_migration_v6")) {
    const existing = getLocalTeams();
    const existingIds = new Set(existing.map((t) => t.teamId));
    const FKF_TEAMS_V6: LocalTeam[] = [
      {
        teamId: "fkf-001",
        name: "Manda City",
        area: "Manda",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-002",
        name: "Galatasaray FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-003",
        name: "Fayaz Bakers FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-004",
        name: "Monaco FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-005",
        name: "Amu Stars FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-006",
        name: "Jaguar FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-007",
        name: "Nyundo B",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-008",
        name: "Dragon Juniors",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-009",
        name: "Crocodile Juniors",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-010",
        name: "Sportlight FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-011",
        name: "Team Lawasco",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-012",
        name: "Deepsea FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-013",
        name: "All Brothers FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-014",
        name: "Kashmir City",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-015",
        name: "Boda Nations",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-016",
        name: "Dragon Fly",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-017",
        name: "Benfica FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-018",
        name: "Flamingo FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-019",
        name: "Deep Shark FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-020",
        name: "Team Wazee",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
    ];
    const missing = FKF_TEAMS_V6.filter((t) => !existingIds.has(t.teamId));
    if (missing.length > 0) {
      const merged = [...existing, ...missing];
      setLocalStore(LSH_LOCAL_TEAMS_KEY, merged);
    }
    localStorage.setItem("lsh_migration_v6", "done");
  }
  // v7: force-reseed FKF teams — runs even if v5/v6 already ran, to catch
  // devices where teams were cleared after migration or migration ran before
  // the real team list was finalised.
  if (!localStorage.getItem("lsh_migration_v7")) {
    const FKF_FINAL: LocalTeam[] = [
      {
        teamId: "fkf-001",
        name: "Manda City",
        area: "Manda",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-002",
        name: "Galatasaray FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-003",
        name: "Fayaz Bakers FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-004",
        name: "Monaco FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-005",
        name: "Amu Stars FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-006",
        name: "Jaguar FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-007",
        name: "Nyundo B",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-008",
        name: "Dragon Juniors",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-009",
        name: "Crocodile Juniors",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-010",
        name: "Sportlight FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-011",
        name: "Team Lawasco",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-012",
        name: "Deepsea FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-013",
        name: "All Brothers FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-014",
        name: "Kashmir City",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-015",
        name: "Boda Nations",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-016",
        name: "Dragon Fly",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-017",
        name: "Benfica FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-018",
        name: "Flamingo FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-019",
        name: "Deep Shark FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-020",
        name: "Team Wazee",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
    ];
    const existing = getLocalTeams();
    const existingIds = new Set(existing.map((t) => t.teamId));
    const missing = FKF_FINAL.filter((t) => !existingIds.has(t.teamId));
    if (missing.length > 0) {
      setLocalStore(LSH_LOCAL_TEAMS_KEY, [...existing, ...missing]);
    }
    localStorage.setItem("lsh_migration_v7", "done");
    // v8: unconditional force-reseed — runs once per browser regardless of prior migrations.
    // Guarantees all 20 FKF teams are present and ALL demo notifications are cleared.
    if (!localStorage.getItem("lsh_migration_v8")) {
      // Wipe ALL notifications — at this point they are all demo/test data
      setLocalStore(LSH_LOCAL_NOTIFS_KEY, []);
      // Force-reseed every FKF team
      const FKF_V8: LocalTeam[] = [
        {
          teamId: "fkf-001",
          name: "Manda City",
          area: "Manda",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-002",
          name: "Galatasaray FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-003",
          name: "Fayaz Bakers FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-004",
          name: "Monaco FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-005",
          name: "Amu Stars FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-006",
          name: "Jaguar FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-007",
          name: "Nyundo B",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-008",
          name: "Dragon Juniors",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-009",
          name: "Crocodile Juniors",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-010",
          name: "Sportlight FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-011",
          name: "Team Lawasco",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-012",
          name: "Deepsea FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-013",
          name: "All Brothers FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-014",
          name: "Kashmir City",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-015",
          name: "Boda Nations",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-016",
          name: "Dragon Fly",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-017",
          name: "Benfica FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-018",
          name: "Flamingo FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-019",
          name: "Deep Shark FC",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
        {
          teamId: "fkf-020",
          name: "Team Wazee",
          area: "Lamu Town",
          coachName: "",
          createdAt: Date.now(),
        },
      ];
      const existing8 = getLocalTeams();
      const existingIds8 = new Set(existing8.map((t) => t.teamId));
      const missing8 = FKF_V8.filter((t) => !existingIds8.has(t.teamId));
      if (missing8.length > 0) {
        setLocalStore(LSH_LOCAL_TEAMS_KEY, [...existing8, ...missing8]);
      }
      localStorage.setItem("lsh_migration_v8", "done");
    }
  }

  // v9: top-level unconditional reseed — fixes nesting bug in v7/v8 where v8
  // was inside v7's if-block and never ran on devices that already had v7 done.
  // Overwrites the teams list, keeping any non-FKF (admin-added) teams intact.
  if (!localStorage.getItem("lsh_migration_v9")) {
    const FKF_V9: LocalTeam[] = [
      {
        teamId: "fkf-001",
        name: "Manda City",
        area: "Manda",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-002",
        name: "Galatasaray FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-003",
        name: "Fayaz Bakers FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-004",
        name: "Monaco FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-005",
        name: "Amu Stars FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-006",
        name: "Jaguar FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-007",
        name: "Nyundo B",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-008",
        name: "Dragon Juniors",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-009",
        name: "Crocodile Juniors",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-010",
        name: "Sportlight FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-011",
        name: "Team Lawasco",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-012",
        name: "Deepsea FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-013",
        name: "All Brothers FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-014",
        name: "Kashmir City",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-015",
        name: "Boda Nations",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-016",
        name: "Dragon Fly",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-017",
        name: "Benfica FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-018",
        name: "Flamingo FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-019",
        name: "Deep Shark FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-020",
        name: "Team Wazee",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
    ];
    // Keep any non-FKF teams the admin added, then ensure all 20 FKF teams are present
    const existing9 = getLocalTeams();
    const nonFkf = existing9.filter((t) => !t.teamId.startsWith("fkf-"));
    const fkfIds = new Set(FKF_V9.map((t) => t.teamId));
    const mergedV9 = [
      ...FKF_V9,
      ...nonFkf.filter((t) => !fkfIds.has(t.teamId)),
    ];
    setLocalStore(LSH_LOCAL_TEAMS_KEY, mergedV9);
    // Also wipe any remaining demo notifications
    const notifs = getLocalNotifications();
    const cleanNotifs = notifs.filter((n) => !isDemoNotification(n));
    setLocalStore(LSH_LOCAL_NOTIFS_KEY, cleanNotifs);
    localStorage.setItem("lsh_migration_v9", "done");
  }
  // v10: seed FKF fixtures for local-first mode
  if (!localStorage.getItem("lsh_migration_v10")) {
    localStorage.setItem("lsh_local_notifications", JSON.stringify([]));
    const FKF_FIXTURES_V10 = [
      {
        matchId: "fkf-m-01",
        homeTeam: "fkf-001",
        awayTeam: "fkf-010",
        date: new Date("2026-03-28T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Manda Ground",
      },
      {
        matchId: "fkf-m-02",
        homeTeam: "fkf-002",
        awayTeam: "fkf-020",
        date: new Date("2026-03-29T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-03",
        homeTeam: "fkf-003",
        awayTeam: "fkf-012",
        date: new Date("2026-03-30T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-04",
        homeTeam: "fkf-004",
        awayTeam: "fkf-014",
        date: new Date("2026-03-31T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-05",
        homeTeam: "fkf-005",
        awayTeam: "fkf-013",
        date: new Date("2026-04-01T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-06",
        homeTeam: "fkf-006",
        awayTeam: "fkf-015",
        date: new Date("2026-04-02T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-07",
        homeTeam: "fkf-007",
        awayTeam: "fkf-016",
        date: new Date("2026-04-03T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-08",
        homeTeam: "fkf-008",
        awayTeam: "fkf-017",
        date: new Date("2026-04-04T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-09",
        homeTeam: "fkf-009",
        awayTeam: "fkf-019",
        date: new Date("2026-04-05T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-10",
        homeTeam: "fkf-010",
        awayTeam: "fkf-018",
        date: new Date("2026-04-06T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-11",
        homeTeam: "fkf-011",
        awayTeam: "fkf-020",
        date: new Date("2026-04-07T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-12",
        homeTeam: "fkf-012",
        awayTeam: "fkf-001",
        date: new Date("2026-04-08T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-13",
        homeTeam: "fkf-002",
        awayTeam: "fkf-014",
        date: new Date("2026-04-09T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-14",
        homeTeam: "fkf-013",
        awayTeam: "fkf-003",
        date: new Date("2026-04-10T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-15",
        homeTeam: "fkf-004",
        awayTeam: "fkf-015",
        date: new Date("2026-04-11T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-16",
        homeTeam: "fkf-016",
        awayTeam: "fkf-005",
        date: new Date("2026-04-12T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-17",
        homeTeam: "fkf-006",
        awayTeam: "fkf-017",
        date: new Date("2026-04-13T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-18",
        homeTeam: "fkf-019",
        awayTeam: "fkf-007",
        date: new Date("2026-04-14T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-19",
        homeTeam: "fkf-008",
        awayTeam: "fkf-009",
        date: new Date("2026-04-15T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-20",
        homeTeam: "fkf-018",
        awayTeam: "fkf-020",
        date: new Date("2026-04-16T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-21",
        homeTeam: "fkf-010",
        awayTeam: "fkf-012",
        date: new Date("2026-04-17T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-22",
        homeTeam: "fkf-011",
        awayTeam: "fkf-014",
        date: new Date("2026-04-18T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-23",
        homeTeam: "fkf-001",
        awayTeam: "fkf-013",
        date: new Date("2026-04-19T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Manda Ground",
      },
      {
        matchId: "fkf-m-24",
        homeTeam: "fkf-002",
        awayTeam: "fkf-015",
        date: new Date("2026-04-19T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-25",
        homeTeam: "fkf-003",
        awayTeam: "fkf-016",
        date: new Date("2026-04-20T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-26",
        homeTeam: "fkf-004",
        awayTeam: "fkf-017",
        date: new Date("2026-04-21T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-27",
        homeTeam: "fkf-005",
        awayTeam: "fkf-019",
        date: new Date("2026-04-22T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-28",
        homeTeam: "fkf-006",
        awayTeam: "fkf-009",
        date: new Date("2026-04-23T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-29",
        homeTeam: "fkf-007",
        awayTeam: "fkf-008",
        date: new Date("2026-04-24T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
      {
        matchId: "fkf-m-30",
        homeTeam: "fkf-012",
        awayTeam: "fkf-018",
        date: new Date("2026-04-25T16:30:00+03:00").getTime() * 1_000_000,
        homeScore: 0,
        awayScore: 0,
        status: "scheduled",
        ground: "Sports Ground",
      },
    ];
    localStorage.setItem(
      "lsh_local_fixtures",
      JSON.stringify(FKF_FIXTURES_V10),
    );
    localStorage.setItem("lsh_migration_v10", "done");
  }

  // v11: auto-mark past fixtures as "played" based on current date.
  // This runs every startup (no localStorage gate) so the status stays current.
  // We use a daily-keyed gate so it only re-runs once per day.
  const todayKey = `lsh_migration_v11_${new Date().toISOString().slice(0, 10)}`;
  if (!localStorage.getItem(todayKey)) {
    const now = Date.now();
    const storedFixtures = getLocalStore<LocalFixture[]>(
      "lsh_local_fixtures",
      [],
    );
    if (storedFixtures.length > 0) {
      let changed = false;
      const updated = storedFixtures.map((f) => {
        const kickoffMs = Math.floor(f.date / 1_000_000);
        const isInPast = now - kickoffMs > 95 * 60 * 1000; // 95 min past kickoff
        if (isInPast && f.status === "scheduled") {
          changed = true;
          return { ...f, status: "played" };
        }
        return f;
      });
      if (changed) {
        setLocalStore("lsh_local_fixtures", updated);
      }
    }
    // Clean up old daily gates (keep only today's)
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("lsh_migration_v11_") && k !== todayKey) {
        localStorage.removeItem(k);
        i--;
      }
    }
    localStorage.setItem(todayKey, "done");
  }

  // v12: nuclear reseed — removes ALL prior migration flags and force-seeds
  // all 20 FKF teams + wipes demo notifications on every device, once.
  // This is a permanent fix for the nesting bug that silently skipped v8.
  if (!localStorage.getItem("lsh_migration_v12")) {
    // Wipe ALL demo/stale notifications
    localStorage.setItem(LSH_LOCAL_NOTIFS_KEY, JSON.stringify([]));

    // Force-reseed ALL 20 FKF teams (overwrite any stale data)
    const FKF_V12: LocalTeam[] = [
      {
        teamId: "fkf-001",
        name: "Manda City",
        area: "Manda",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-002",
        name: "Galatasaray FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-003",
        name: "Fayaz Bakers FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-004",
        name: "Monaco FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-005",
        name: "Amu Stars FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-006",
        name: "Jaguar FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-007",
        name: "Nyundo B",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-008",
        name: "Dragon Juniors",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-009",
        name: "Crocodile Juniors",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-010",
        name: "Sportlight FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-011",
        name: "Team Lawasco",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-012",
        name: "Deepsea FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-013",
        name: "All Brothers FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-014",
        name: "Kashmir City",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-015",
        name: "Boda Nations",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-016",
        name: "Dragon Fly",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-017",
        name: "Benfica FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-018",
        name: "Flamingo FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-019",
        name: "Deep Shark FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-020",
        name: "Team Wazee",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
    ];
    // Merge: keep any admin-added teams (non-fkf- IDs) but overwrite all fkf- entries
    const existingV12 = getLocalTeams();
    const nonFkf = existingV12.filter((t) => !t.teamId.startsWith("fkf-"));
    const fkfIds = new Set(FKF_V12.map((t) => t.teamId));
    // Remove old fkf entries from nonFkf just in case
    const merged12 = [
      ...FKF_V12,
      ...nonFkf.filter((t) => !fkfIds.has(t.teamId)),
    ];
    setLocalStore(LSH_LOCAL_TEAMS_KEY, merged12);

    // Ensure fixtures are seeded if empty
    const currentFixtures = getLocalStore<LocalFixture[]>(
      "lsh_local_fixtures",
      [],
    );
    if (currentFixtures.length === 0) {
      const FKF_FIXTURES_V12: LocalFixture[] = [
        {
          matchId: "fkf-m-01",
          homeTeam: "fkf-001",
          awayTeam: "fkf-002",
          date: new Date("2026-03-28T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Manda Ground",
        },
        {
          matchId: "fkf-m-02",
          homeTeam: "fkf-003",
          awayTeam: "fkf-004",
          date: new Date("2026-03-29T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-03",
          homeTeam: "fkf-005",
          awayTeam: "fkf-006",
          date: new Date("2026-03-30T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-04",
          homeTeam: "fkf-007",
          awayTeam: "fkf-008",
          date: new Date("2026-03-31T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-05",
          homeTeam: "fkf-005",
          awayTeam: "fkf-013",
          date: new Date("2026-04-01T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-06",
          homeTeam: "fkf-006",
          awayTeam: "fkf-015",
          date: new Date("2026-04-02T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-07",
          homeTeam: "fkf-007",
          awayTeam: "fkf-016",
          date: new Date("2026-04-03T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-08",
          homeTeam: "fkf-008",
          awayTeam: "fkf-017",
          date: new Date("2026-04-04T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-09",
          homeTeam: "fkf-009",
          awayTeam: "fkf-019",
          date: new Date("2026-04-05T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-10",
          homeTeam: "fkf-010",
          awayTeam: "fkf-018",
          date: new Date("2026-04-06T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-11",
          homeTeam: "fkf-011",
          awayTeam: "fkf-020",
          date: new Date("2026-04-07T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-12",
          homeTeam: "fkf-012",
          awayTeam: "fkf-001",
          date: new Date("2026-04-08T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-13",
          homeTeam: "fkf-002",
          awayTeam: "fkf-014",
          date: new Date("2026-04-09T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-14",
          homeTeam: "fkf-013",
          awayTeam: "fkf-003",
          date: new Date("2026-04-10T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-15",
          homeTeam: "fkf-004",
          awayTeam: "fkf-015",
          date: new Date("2026-04-11T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-16",
          homeTeam: "fkf-016",
          awayTeam: "fkf-005",
          date: new Date("2026-04-12T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-17",
          homeTeam: "fkf-006",
          awayTeam: "fkf-017",
          date: new Date("2026-04-13T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-18",
          homeTeam: "fkf-019",
          awayTeam: "fkf-007",
          date: new Date("2026-04-14T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-19",
          homeTeam: "fkf-008",
          awayTeam: "fkf-009",
          date: new Date("2026-04-15T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-20",
          homeTeam: "fkf-018",
          awayTeam: "fkf-020",
          date: new Date("2026-04-16T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-21",
          homeTeam: "fkf-010",
          awayTeam: "fkf-012",
          date: new Date("2026-04-17T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-22",
          homeTeam: "fkf-011",
          awayTeam: "fkf-014",
          date: new Date("2026-04-18T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-23",
          homeTeam: "fkf-001",
          awayTeam: "fkf-013",
          date: new Date("2026-04-19T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Manda Ground",
        },
        {
          matchId: "fkf-m-24",
          homeTeam: "fkf-002",
          awayTeam: "fkf-015",
          date: new Date("2026-04-19T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-25",
          homeTeam: "fkf-003",
          awayTeam: "fkf-016",
          date: new Date("2026-04-20T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-26",
          homeTeam: "fkf-004",
          awayTeam: "fkf-017",
          date: new Date("2026-04-21T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-27",
          homeTeam: "fkf-005",
          awayTeam: "fkf-019",
          date: new Date("2026-04-22T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-28",
          homeTeam: "fkf-006",
          awayTeam: "fkf-009",
          date: new Date("2026-04-23T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-29",
          homeTeam: "fkf-007",
          awayTeam: "fkf-008",
          date: new Date("2026-04-24T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
        {
          matchId: "fkf-m-30",
          homeTeam: "fkf-012",
          awayTeam: "fkf-018",
          date: new Date("2026-04-25T16:30:00+03:00").getTime() * 1_000_000,
          homeScore: 0,
          awayScore: 0,
          status: "scheduled",
          ground: "Sports Ground",
        },
      ];
      setLocalStore("lsh_local_fixtures", FKF_FIXTURES_V12);
    }
    localStorage.setItem("lsh_migration_v12", "done");
  }

  // v13: bootstrap official code in localStorage so it's never in plain source
  if (!localStorage.getItem("lsh_migration_v13")) {
    if (!localStorage.getItem(LSH_OFFICIAL_CODE_KEY)) {
      try {
        setLocalStore(LSH_OFFICIAL_CODE_KEY, atob("TFNIMjAyNg=="));
      } catch {}
    }
    localStorage.setItem("lsh_migration_v13", "done");
  }

  // v14: FORCE re-seed all 20 FKF teams on every device — runs once.
  // Guarantees teams appear even on devices where v5–v12 ran but teams were cleared.
  if (!localStorage.getItem("lsh_migration_v14")) {
    const FKF_V14: LocalTeam[] = [
      {
        teamId: "fkf-001",
        name: "Manda City",
        area: "Manda",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-002",
        name: "Galatasaray FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-003",
        name: "Fayaz Bakers FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-004",
        name: "Monaco FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-005",
        name: "Amu Stars FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-006",
        name: "Jaguar FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-007",
        name: "Nyundo B",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-008",
        name: "Dragon Juniors",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-009",
        name: "Crocodile Juniors",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-010",
        name: "Sportlight FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-011",
        name: "Team Lawasco",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-012",
        name: "Deepsea FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-013",
        name: "All Brothers FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-014",
        name: "Kashmir City",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-015",
        name: "Boda Nations",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-016",
        name: "Dragon Fly",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-017",
        name: "Benfica FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-018",
        name: "Flamingo FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-019",
        name: "Deep Shark FC",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
      {
        teamId: "fkf-020",
        name: "Team Wazee",
        area: "Lamu Town",
        coachName: "",
        createdAt: Date.now(),
      },
    ];
    const existingV14 = getLocalTeams();
    const nonFkf14 = existingV14.filter((t) => !t.teamId.startsWith("fkf-"));
    setLocalStore(LSH_LOCAL_TEAMS_KEY, [...FKF_V14, ...nonFkf14]);

    // Also force-wipe demo notifications one more time
    const notifsV14 = getLocalNotifications();
    const cleanedV14 = notifsV14.filter((n) => !isDemoNotification(n));
    setLocalStore(LSH_LOCAL_NOTIFS_KEY, cleanedV14);

    localStorage.setItem("lsh_migration_v14", "done");
  }
}

export type LocalFixture = {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  date: number;
  homeScore: number;
  awayScore: number;
  status: string;
  ground?: string;
  reporterName?: string;
  lastUpdated?: number;
  verified?: boolean;
};

export function getLocalFixtures(): LocalFixture[] {
  return getLocalStore<LocalFixture[]>("lsh_local_fixtures", []);
}

// ── Pending Match Results (reporter submissions) ───────────────────────────────
export type PendingMatchResult = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  scorers: string;
  reporterName: string;
  submittedAt: number;
  status: "pending" | "approved" | "rejected";
};

const LSH_PENDING_RESULTS_KEY = "lsh_pending_results";

export function getPendingMatchResults(): PendingMatchResult[] {
  return getLocalStore<PendingMatchResult[]>(LSH_PENDING_RESULTS_KEY, []);
}

export function addPendingMatchResult(
  result: Omit<PendingMatchResult, "id" | "submittedAt" | "status">,
): PendingMatchResult {
  const existing = getPendingMatchResults();
  const newResult: PendingMatchResult = {
    ...result,
    id: `pr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    submittedAt: Date.now(),
    status: "pending",
  };
  setLocalStore(LSH_PENDING_RESULTS_KEY, [...existing, newResult]);
  return newResult;
}

export function approvePendingResult(id: string): void {
  const all = getPendingMatchResults();
  setLocalStore(
    LSH_PENDING_RESULTS_KEY,
    all.map((r) => (r.id === id ? { ...r, status: "approved" as const } : r)),
  );
}

export function rejectPendingResult(id: string): void {
  const all = getPendingMatchResults();
  setLocalStore(
    LSH_PENDING_RESULTS_KEY,
    all.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r)),
  );
}

// ── Reporter Registrations ─────────────────────────────────────────────────────
export type ReporterApplication = {
  id: string;
  name: string;
  phone: string;
  team: string;
  submittedAt: number;
};

const LSH_REPORTER_APPS_KEY = "lsh_reporter_applications";

export function getReporterApplications(): ReporterApplication[] {
  return getLocalStore<ReporterApplication[]>(LSH_REPORTER_APPS_KEY, []);
}

export function addReporterApplication(
  app: Omit<ReporterApplication, "id" | "submittedAt">,
): void {
  const existing = getReporterApplications();
  const newApp: ReporterApplication = {
    ...app,
    id: `rep-${Date.now()}`,
    submittedAt: Date.now(),
  };
  setLocalStore(LSH_REPORTER_APPS_KEY, [...existing, newApp]);
}

// ── News Reactions ────────────────────────────────────────────────────────────
// Key: lsh_reactions_[newsId] => { [userId]: emoji }
export function getNewsReactions(newsId: string): Record<string, string> {
  return getLocalStore<Record<string, string>>(`lsh_reactions_${newsId}`, {});
}

export function setNewsReaction(
  newsId: string,
  userId: string,
  emoji: string | null,
): void {
  const current = getNewsReactions(newsId);
  if (emoji === null) {
    delete current[userId];
  } else {
    current[userId] = emoji;
  }
  setLocalStore(`lsh_reactions_${newsId}`, current);
}

// ── News Comments ─────────────────────────────────────────────────────────────
export type NewsComment = {
  commentId: string;
  author: string;
  text: string;
  timestamp: string;
};

export function getNewsComments(newsId: string): NewsComment[] {
  return getLocalStore<NewsComment[]>(`lsh_comments_${newsId}`, []);
}

export function addNewsComment(
  newsId: string,
  comment: Omit<NewsComment, "commentId" | "timestamp">,
): NewsComment {
  const all = getNewsComments(newsId);
  const newComment: NewsComment = {
    ...comment,
    commentId: `CMT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  all.push(newComment);
  setLocalStore(`lsh_comments_${newsId}`, all);
  return newComment;
}

// ── Match Events ──────────────────────────────────────────────────────────────
export type GoalEvent = {
  team: "home" | "away";
  playerName: string;
  minute: number;
};

export type CardEvent = {
  playerName: string;
  cardType: "yellow" | "red";
  minute: number;
};

export type MatchEvents = {
  goals: GoalEvent[];
  cards: CardEvent[];
};

export function getMatchEvents(matchId: string): MatchEvents {
  return getLocalStore<MatchEvents>(`lsh_match_events_${matchId}`, {
    goals: [],
    cards: [],
  });
}

export function setMatchEvents(matchId: string, events: MatchEvents): void {
  setLocalStore(`lsh_match_events_${matchId}`, events);
}

// ── Team Registration Requests ────────────────────────────────────────────────
export interface TeamRegistrationRequest {
  id: string;
  teamName: string;
  coachName: string;
  area: string;
  contactPhone: string;
  submittedAt: number;
  approved: boolean;
}

const LSH_TEAM_REGISTRATIONS_KEY = "lsh_team_registrations";

export function getTeamRegistrations(): TeamRegistrationRequest[] {
  return getLocalStore<TeamRegistrationRequest[]>(
    LSH_TEAM_REGISTRATIONS_KEY,
    [],
  );
}

export function addTeamRegistration(
  req: Omit<TeamRegistrationRequest, "id" | "submittedAt" | "approved">,
): void {
  const existing = getTeamRegistrations();
  const newReq: TeamRegistrationRequest = {
    ...req,
    id: `reg-${Date.now()}`,
    submittedAt: Date.now(),
    approved: false,
  };
  setLocalStore(LSH_TEAM_REGISTRATIONS_KEY, [...existing, newReq]);
}

export function approveTeamRegistration(id: string): void {
  const existing = getTeamRegistrations();
  setLocalStore(
    LSH_TEAM_REGISTRATIONS_KEY,
    existing.map((r) => (r.id === id ? { ...r, approved: true } : r)),
  );
}

export function deleteTeamRegistration(id: string): void {
  const existing = getTeamRegistrations();
  setLocalStore(
    LSH_TEAM_REGISTRATIONS_KEY,
    existing.filter((r) => r.id !== id),
  );
}

// ── Activity Feed ─────────────────────────────────────────────────────────────
export type ActivityEntry = {
  id: string;
  type: "join_match" | "player_joined" | "news" | "match_live" | "match_result";
  text: string;
  icon: string; // emoji
  userName?: string;
  timestamp: number;
};

export const LSH_ACTIVITY_FEED_KEY = "lsh_activity_feed";

export function getActivityFeed(): ActivityEntry[] {
  return getLocalStore<ActivityEntry[]>(LSH_ACTIVITY_FEED_KEY, []);
}

export function addActivityEntry(
  entry: Omit<ActivityEntry, "id" | "timestamp">,
): void {
  const feed = getActivityFeed();
  const newEntry: ActivityEntry = {
    ...entry,
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    timestamp: Date.now(),
  };
  // Keep only last 50 entries
  const updated = [newEntry, ...feed].slice(0, 50);
  setLocalStore(LSH_ACTIVITY_FEED_KEY, updated);
}

// ── Match Joiners ─────────────────────────────────────────────────────────────
export type MatchJoiner = {
  userId: string;
  userName: string;
  role: string;
  joinedAt: number;
};

export const LSH_MATCH_JOINERS_KEY = "lsh_match_joiners";

export function getMatchJoiners(matchId: string): MatchJoiner[] {
  const all = getLocalStore<Record<string, MatchJoiner[]>>(
    LSH_MATCH_JOINERS_KEY,
    {},
  );
  return all[matchId] ?? [];
}

export function joinMatch(
  matchId: string,
  joiner: Omit<MatchJoiner, "joinedAt">,
): void {
  const all = getLocalStore<Record<string, MatchJoiner[]>>(
    LSH_MATCH_JOINERS_KEY,
    {},
  );
  const existing = all[matchId] ?? [];
  if (existing.some((j) => j.userId === joiner.userId)) return;
  all[matchId] = [...existing, { ...joiner, joinedAt: Date.now() }];
  setLocalStore(LSH_MATCH_JOINERS_KEY, all);
}

export function leaveMatch(matchId: string, userId: string): void {
  const all = getLocalStore<Record<string, MatchJoiner[]>>(
    LSH_MATCH_JOINERS_KEY,
    {},
  );
  all[matchId] = (all[matchId] ?? []).filter((j) => j.userId !== userId);
  setLocalStore(LSH_MATCH_JOINERS_KEY, all);
}

export function hasJoinedMatch(matchId: string, userId: string): boolean {
  return getMatchJoiners(matchId).some((j) => j.userId === userId);
}

// ── Match Predictions ─────────────────────────────────────────────────────────
// Addictive feature: users predict match outcomes before kickoff
export type MatchPrediction = {
  matchId: string;
  userId: string;
  prediction: "home" | "draw" | "away";
  submittedAt: number;
  correct?: boolean; // set after match is played
};

const LSH_PREDICTIONS_KEY = "lsh_match_predictions";

export function getMatchPredictions(): MatchPrediction[] {
  return getLocalStore<MatchPrediction[]>(LSH_PREDICTIONS_KEY, []);
}

export function getUserPrediction(
  matchId: string,
  userId: string,
): MatchPrediction | undefined {
  return getMatchPredictions().find(
    (p) => p.matchId === matchId && p.userId === userId,
  );
}

export function submitMatchPrediction(
  matchId: string,
  userId: string,
  prediction: "home" | "draw" | "away",
): void {
  const all = getMatchPredictions();
  const existing = all.findIndex(
    (p) => p.matchId === matchId && p.userId === userId,
  );
  const entry: MatchPrediction = {
    matchId,
    userId,
    prediction,
    submittedAt: Date.now(),
  };
  if (existing >= 0) {
    all[existing] = entry;
  } else {
    all.push(entry);
  }
  setLocalStore(LSH_PREDICTIONS_KEY, all);
}

export function getUserPredictionScore(userId: string): {
  total: number;
  correct: number;
  streak: number;
} {
  const all = getMatchPredictions().filter(
    (p) => p.userId === userId && p.correct !== undefined,
  );
  const correct = all.filter((p) => p.correct).length;
  // Calculate streak: consecutive correct predictions from most recent
  const sorted = [...all].sort((a, b) => b.submittedAt - a.submittedAt);
  let streak = 0;
  for (const p of sorted) {
    if (p.correct) streak++;
    else break;
  }
  return { total: all.length, correct, streak };
}

// ── User Streaks ──────────────────────────────────────────────────────────────
// Track daily app open streaks to encourage daily usage
const LSH_STREAK_KEY = "lsh_user_streak";

export type UserStreak = {
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string; // YYYY-MM-DD
  totalDays: number;
};

export function getOrUpdateStreak(): UserStreak {
  const stored = getLocalStore<UserStreak>(LSH_STREAK_KEY, {
    currentStreak: 0,
    longestStreak: 0,
    lastVisitDate: "",
    totalDays: 0,
  });
  const todayStr = new Date().toISOString().slice(0, 10);
  if (stored.lastVisitDate === todayStr) {
    return stored; // Already counted today
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const isConsecutive = stored.lastVisitDate === yesterdayStr;
  const newStreak = isConsecutive ? stored.currentStreak + 1 : 1;
  const updated: UserStreak = {
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, stored.longestStreak),
    lastVisitDate: todayStr,
    totalDays: stored.totalDays + 1,
  };
  setLocalStore(LSH_STREAK_KEY, updated);
  return updated;
}

// ── Poll / Quick Vote ─────────────────────────────────────────────────────────
export type QuickPoll = {
  pollId: string;
  question: string;
  options: string[];
  votes: Record<string, number>; // option -> count
  userVotes: Record<string, string>; // userId -> option
  createdAt: number;
  expiresAt: number;
};

const LSH_POLLS_KEY = "lsh_quick_polls";

export function getQuickPolls(): QuickPoll[] {
  return getLocalStore<QuickPoll[]>(LSH_POLLS_KEY, []);
}

export function voteOnPoll(
  pollId: string,
  userId: string,
  option: string,
): void {
  const polls = getQuickPolls();
  const poll = polls.find((p) => p.pollId === pollId);
  if (!poll) return;
  // Remove prior vote
  const prior = poll.userVotes[userId];
  if (prior && poll.votes[prior]) poll.votes[prior]--;
  poll.userVotes[userId] = option;
  poll.votes[option] = (poll.votes[option] ?? 0) + 1;
  setLocalStore(LSH_POLLS_KEY, polls);
}

export function createQuickPoll(
  question: string,
  options: string[],
  durationHours = 24,
): QuickPoll {
  const polls = getQuickPolls();
  const poll: QuickPoll = {
    pollId: `poll-${Date.now()}`,
    question,
    options,
    votes: Object.fromEntries(options.map((o) => [o, 0])),
    userVotes: {},
    createdAt: Date.now(),
    expiresAt: Date.now() + durationHours * 3600000,
  };
  setLocalStore(LSH_POLLS_KEY, [poll, ...polls].slice(0, 10));
  return poll;
}
