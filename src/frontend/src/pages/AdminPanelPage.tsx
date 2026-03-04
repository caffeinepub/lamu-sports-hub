import { type ExternalBlob, Role } from "@/backend";
import { AreaBadge, TeamBadge } from "@/components/shared/TeamBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  MOCK_MATCHES,
  MOCK_PLAYERS,
  MOCK_TEAMS,
  type MockMatch,
  type MockTeam,
} from "@/data/mockData";
import { useActor } from "@/hooks/useActor";
import {
  Bell,
  Calendar,
  CheckCircle,
  Edit,
  ImageIcon,
  Loader2,
  Newspaper,
  Plus,
  Shield,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type MockUser = {
  userId: string;
  name: string;
  role: string;
  area: string;
  email: string;
};

const MOCK_USERS = [
  {
    userId: "u-001",
    name: "Hassan Mwende",
    role: "player",
    area: "Shela",
    email: "hassan@lamu.ke",
  },
  {
    userId: "u-002",
    name: "Omar Kiprotich",
    role: "coach",
    area: "Hindi",
    email: "omar@lamu.ke",
  },
  {
    userId: "u-003",
    name: "Amani Juma",
    role: "fan",
    area: "Mkunguni",
    email: "amani@lamu.ke",
  },
  {
    userId: "u-004",
    name: "Fatuma Hassan",
    role: "fan",
    area: "Langoni",
    email: "fatuma@lamu.ke",
  },
  {
    userId: "u-005",
    name: "Ali Hassan",
    role: "admin",
    area: "Lamu Town",
    email: "ali@lamu.ke",
  },
];

const AREAS = ["Shela", "Hindi", "Mkunguni", "Langoni", "Mkomani", "Lamu Town"];

type NewsItem = {
  newsId: string;
  title: string;
  body: string;
  isPublished: boolean;
  timestamp: bigint;
  photo?: ExternalBlob;
  authorId: string;
};

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const date = new Date(ms);
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function AdminPanelPage() {
  const { actor } = useActor();
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifTarget, setNotifTarget] = useState("all");

  // Edit state
  const [editingUser, setEditingUser] = useState<MockUser | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserRole, setEditUserRole] = useState("");
  const [editUserArea, setEditUserArea] = useState("");

  const [editingTeam, setEditingTeam] = useState<MockTeam | null>(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamArea, setEditTeamArea] = useState("");

  const [editingMatch, setEditingMatch] = useState<MockMatch | null>(null);
  const [editHomeScore, setEditHomeScore] = useState("");
  const [editAwayScore, setEditAwayScore] = useState("");
  const [editMatchStatus, setEditMatchStatus] = useState<
    "scheduled" | "live" | "played"
  >("scheduled");

  // Add User state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<string>("fan");
  const [newUserArea, setNewUserArea] = useState<string>("Lamu Town");
  const [addUserLoading, setAddUserLoading] = useState(false);

  // Add Team state
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamArea, setNewTeamArea] = useState<string>("Lamu Town");
  const [newTeamCoach, setNewTeamCoach] = useState("");
  const [addTeamLoading, setAddTeamLoading] = useState(false);

  // News state
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [showAddNews, setShowAddNews] = useState(false);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsBody, setNewsBody] = useState("");
  const [newsPublished, setNewsPublished] = useState(true);
  const [_newsPhotoFile, setNewsPhotoFile] = useState<File | null>(null);
  const [newsPhotoPreview, setNewsPhotoPreview] = useState<string | null>(null);
  const [addNewsLoading, setAddNewsLoading] = useState(false);
  const newsFileRef = useRef<HTMLInputElement>(null);

  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editNewsTitle, setEditNewsTitle] = useState("");
  const [editNewsBody, setEditNewsBody] = useState("");
  const [editNewsPublished, setEditNewsPublished] = useState(true);
  const [editNewsLoading, setEditNewsLoading] = useState(false);

  const [deleteNewsId, setDeleteNewsId] = useState<string | null>(null);
  const [deleteNewsLoading, setDeleteNewsLoading] = useState(false);

  // Load news when tab becomes active
  const fetchNews = async () => {
    if (!actor) return;
    setNewsLoading(true);
    try {
      const items = await actor.getAllNewsAdmin();
      setNewsList(items as NewsItem[]);
    } catch {
      toast.error("Failed to load news");
    } finally {
      setNewsLoading(false);
    }
  };

  const openEditUser = (user: MockUser) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserRole(user.role);
    setEditUserArea(user.area);
  };

  const handleSaveUser = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setEditingUser(null);
    toast.success(`${editUserName}'s profile updated!`);
  };

  const openEditTeam = (team: MockTeam) => {
    setEditingTeam(team);
    setEditTeamName(team.name);
    setEditTeamArea(team.area);
  };

  const handleSaveTeam = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setEditingTeam(null);
    toast.success(`${editTeamName} updated successfully!`);
  };

  const openEditMatch = (match: MockMatch) => {
    setEditingMatch(match);
    setEditHomeScore(String(match.homeScore));
    setEditAwayScore(String(match.awayScore));
    setEditMatchStatus(match.status);
  };

  const handleSaveMatch = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setEditingMatch(null);
    toast.success("Match details updated!");
  };

  const handleCreateMatch = async () => {
    if (!homeTeam || !awayTeam || !matchDate) {
      toast.error("Please fill all fields");
      return;
    }
    if (homeTeam === awayTeam) {
      toast.error("Home and away teams must be different");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setShowCreateMatch(false);
    toast.success("Match scheduled successfully!");
  };

  const handleSendNotification = async () => {
    if (!notifMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setNotifMessage("");
    toast.success(
      `Notification sent to ${notifTarget === "all" ? "all users" : `${notifTarget} area`}!`,
    );
  };

  const handleAddUser = async () => {
    if (!newUserName.trim()) {
      toast.error("Full name is required");
      return;
    }
    setAddUserLoading(true);
    try {
      const roleMap: Record<string, Role> = {
        admin: Role.admin,
        coach: Role.coach,
        player: Role.player,
        fan: Role.fan,
      };
      await actor?.adminCreateUser(
        newUserName.trim(),
        newUserPhone.trim(),
        newUserEmail.trim(),
        roleMap[newUserRole] ?? Role.fan,
        newUserArea,
      );
      toast.success(`User "${newUserName}" added successfully!`);
      setShowAddUser(false);
      setNewUserName("");
      setNewUserPhone("");
      setNewUserEmail("");
      setNewUserRole("fan");
      setNewUserArea("Lamu Town");
    } catch {
      toast.error("Failed to add user. Please try again.");
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error("Team name is required");
      return;
    }
    setAddTeamLoading(true);
    try {
      await actor?.adminCreateTeam(
        newTeamName.trim(),
        newTeamArea,
        newTeamCoach.trim(),
      );
      toast.success(`Team "${newTeamName}" created!`);
      setShowAddTeam(false);
      setNewTeamName("");
      setNewTeamArea("Lamu Town");
      setNewTeamCoach("");
    } catch {
      toast.error("Failed to create team. Please try again.");
    } finally {
      setAddTeamLoading(false);
    }
  };

  const handleNewsPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewsPhotoFile(file);
    const url = URL.createObjectURL(file);
    setNewsPhotoPreview(url);
  };

  const handleAddNews = async () => {
    if (!newsTitle.trim() || !newsBody.trim()) {
      toast.error("Title and body are required");
      return;
    }
    setAddNewsLoading(true);
    try {
      await actor?.createNews(newsTitle.trim(), newsBody.trim(), newsPublished);
      toast.success("News post created!");
      setShowAddNews(false);
      setNewsTitle("");
      setNewsBody("");
      setNewsPublished(true);
      setNewsPhotoFile(null);
      setNewsPhotoPreview(null);
      await fetchNews();
    } catch {
      toast.error("Failed to create news. Please try again.");
    } finally {
      setAddNewsLoading(false);
    }
  };

  const openEditNews = (item: NewsItem) => {
    setEditingNews(item);
    setEditNewsTitle(item.title);
    setEditNewsBody(item.body);
    setEditNewsPublished(item.isPublished);
  };

  const handleEditNews = async () => {
    if (!editingNews || !editNewsTitle.trim() || !editNewsBody.trim()) {
      toast.error("Title and body are required");
      return;
    }
    setEditNewsLoading(true);
    try {
      await actor?.updateNews(
        editingNews.newsId,
        editNewsTitle.trim(),
        editNewsBody.trim(),
        editNewsPublished,
      );
      toast.success("News post updated!");
      setEditingNews(null);
      await fetchNews();
    } catch {
      toast.error("Failed to update news.");
    } finally {
      setEditNewsLoading(false);
    }
  };

  const handleDeleteNews = async () => {
    if (!deleteNewsId) return;
    setDeleteNewsLoading(true);
    try {
      await actor?.deleteNews(deleteNewsId);
      toast.success("News post deleted.");
      setDeleteNewsId(null);
      await fetchNews();
    } catch {
      toast.error("Failed to delete news.");
    } finally {
      setDeleteNewsLoading(false);
    }
  };

  const roleColor = (role: string) => {
    const map: Record<string, string> = {
      admin: "oklch(0.82 0.15 85)",
      coach: "oklch(0.55 0.18 252)",
      player: "oklch(0.6 0.22 24)",
      fan: "oklch(0.82 0.08 82)",
    };
    return map[role] || "oklch(0.62 0 0)";
  };

  return (
    <div data-ocid="admin.page" className="min-h-screen pb-24 pt-14">
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
            <Shield className="w-6 h-6 text-primary" />
            Admin Panel
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full platform management
          </p>
        </motion.div>
      </div>

      {/* Summary stats */}
      <div className="px-4 mt-4 grid grid-cols-4 gap-2 mb-2">
        {[
          { label: "Users", value: MOCK_USERS.length, icon: "👤" },
          { label: "Teams", value: MOCK_TEAMS.length, icon: "🏟️" },
          { label: "Matches", value: MOCK_MATCHES.length, icon: "⚽" },
          { label: "Players", value: MOCK_PLAYERS.length, icon: "🏃" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-3 bg-card border border-border text-center"
          >
            <div className="text-lg">{stat.icon}</div>
            <div className="font-black font-stats text-xl text-foreground">
              {stat.value}
            </div>
            <div className="text-[9px] text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <Tabs
        defaultValue="users"
        className="px-4 pt-2"
        onValueChange={(v) => {
          if (v === "news") fetchNews();
        }}
      >
        <TabsList
          className="w-full grid grid-cols-5 mb-4"
          data-ocid="admin.tab"
        >
          <TabsTrigger value="users" className="text-[10px] px-0.5">
            <Users className="w-3 h-3 mr-0.5" />
            Users
          </TabsTrigger>
          <TabsTrigger value="teams" className="text-[10px] px-0.5">
            <Trophy className="w-3 h-3 mr-0.5" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="matches" className="text-[10px] px-0.5">
            <Calendar className="w-3 h-3 mr-0.5" />
            Matches
          </TabsTrigger>
          <TabsTrigger value="news" className="text-[10px] px-0.5">
            <Newspaper className="w-3 h-3 mr-0.5" />
            News
          </TabsTrigger>
          <TabsTrigger value="notify" className="text-[10px] px-0.5">
            <Bell className="w-3 h-3 mr-0.5" />
            Notify
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="flex justify-end mb-3">
            <Button
              size="sm"
              className="text-xs gap-1"
              onClick={() => setShowAddUser(true)}
              data-ocid="admin.add_user.open_modal_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              <Plus className="w-3 h-3" />
              Add User
            </Button>
          </div>
          <div
            className="rounded-xl border border-border overflow-hidden bg-card"
            data-ocid="admin.users.table"
          >
            <div className="px-3 py-2 border-b border-border bg-muted/20">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                All Users ({MOCK_USERS.length})
              </span>
            </div>
            {MOCK_USERS.map((user, i) => (
              <div
                key={user.userId}
                className="flex items-center gap-3 px-3 py-3 border-b border-border/50 last:border-0"
                data-ocid={`admin.user.row.${i + 1}`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    backgroundColor: `${roleColor(user.role)}22`,
                    color: roleColor(user.role),
                  }}
                >
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-foreground">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {user.area}
                  </div>
                </div>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-bold capitalize"
                  style={{
                    backgroundColor: `${roleColor(user.role)}22`,
                    color: roleColor(user.role),
                  }}
                >
                  {user.role}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-muted-foreground hover:text-foreground"
                  data-ocid={`admin.user.edit_button.${i + 1}`}
                  onClick={() => openEditUser(user)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-red-400 hover:text-red-300"
                  data-ocid={`admin.user.delete_button.${i + 1}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams">
          <div className="flex justify-end mb-3">
            <Button
              size="sm"
              className="text-xs gap-1"
              onClick={() => setShowAddTeam(true)}
              data-ocid="admin.add_team.open_modal_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              <Plus className="w-3 h-3" />
              Add Team
            </Button>
          </div>
          <div
            className="rounded-xl border border-border overflow-hidden bg-card"
            data-ocid="admin.teams.table"
          >
            <div className="px-3 py-2 border-b border-border bg-muted/20">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                All Teams ({MOCK_TEAMS.length})
              </span>
            </div>
            {MOCK_TEAMS.map((team, i) => (
              <div
                key={team.teamId}
                className="flex items-center gap-3 px-3 py-3 border-b border-border/50 last:border-0"
                data-ocid={`admin.team.row.${i + 1}`}
              >
                <TeamBadge team={team} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-foreground">
                    {team.name}
                  </div>
                  <AreaBadge area={team.area} className="mt-0.5" />
                </div>
                <div className="flex items-center gap-1">
                  {team.isApproved ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold">
                      Approved
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] px-2 text-primary border-primary/40"
                      data-ocid={`admin.team.approve_button.${i + 1}`}
                    >
                      Approve
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-muted-foreground hover:text-foreground"
                  data-ocid={`admin.team.edit_button.${i + 1}`}
                  onClick={() => openEditTeam(team)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Matches Tab */}
        <TabsContent value="matches">
          <div className="flex justify-end mb-3">
            <Button
              size="sm"
              className="text-xs gap-1"
              onClick={() => setShowCreateMatch(true)}
              data-ocid="admin.create_match.button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              <Plus className="w-3 h-3" />
              Create Match
            </Button>
          </div>

          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="px-3 py-2 border-b border-border bg-muted/20">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                All Matches ({MOCK_MATCHES.length})
              </span>
            </div>
            {MOCK_MATCHES.map((match, i) => {
              const home = MOCK_TEAMS.find(
                (t) => t.teamId === match.homeTeamId,
              )!;
              const away = MOCK_TEAMS.find(
                (t) => t.teamId === match.awayTeamId,
              )!;
              return (
                <div
                  key={match.matchId}
                  className="flex items-center gap-3 px-3 py-3 border-b border-border/50 last:border-0"
                  data-ocid={`admin.match.row.${i + 1}`}
                >
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <TeamBadge team={home} size="xs" />
                    <span className="text-xs font-semibold text-foreground truncate">
                      {home.name}
                    </span>
                    {match.status !== "scheduled" && (
                      <span className="font-black font-stats text-xs text-foreground">
                        {match.homeScore}–{match.awayScore}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">vs</span>
                    <span className="text-xs font-semibold text-foreground truncate">
                      {away.name}
                    </span>
                    <TeamBadge team={away} size="xs" />
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold capitalize flex-shrink-0 ${
                      match.status === "live"
                        ? "bg-accent/20 text-accent"
                        : match.status === "played"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {match.status}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-muted-foreground hover:text-foreground flex-shrink-0"
                    data-ocid={`admin.match.edit_button.${i + 1}`}
                    onClick={() => openEditMatch(match)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* News Tab */}
        <TabsContent value="news">
          <div className="flex justify-end mb-3">
            <Button
              size="sm"
              className="text-xs gap-1"
              onClick={() => setShowAddNews(true)}
              data-ocid="admin.add_news.open_modal_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              <Plus className="w-3 h-3" />
              Add News
            </Button>
          </div>

          {newsLoading ? (
            <div
              className="flex items-center justify-center py-12 text-muted-foreground"
              data-ocid="admin.news.loading_state"
            >
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Loading news...</span>
            </div>
          ) : newsList.length === 0 ? (
            <div
              className="rounded-xl border border-border bg-card py-12 flex flex-col items-center gap-3 text-center"
              data-ocid="admin.news.empty_state"
            >
              <Newspaper className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No news posts yet.
              </p>
              <p className="text-xs text-muted-foreground/60">
                Create your first post with the "Add News" button above.
              </p>
            </div>
          ) : (
            <div
              className="rounded-xl border border-border overflow-hidden bg-card"
              data-ocid="admin.news.list"
            >
              <div className="px-3 py-2 border-b border-border bg-muted/20">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  All Posts ({newsList.length})
                </span>
              </div>
              {newsList.map((item, i) => (
                <div
                  key={item.newsId}
                  className="flex items-center gap-3 px-3 py-3 border-b border-border/50 last:border-0"
                  data-ocid={`admin.news.row.${i + 1}`}
                >
                  {/* Thumbnail */}
                  <div
                    className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.2 0.06 252) 0%, oklch(0.15 0.04 255) 100%)",
                    }}
                  >
                    {item.photo ? (
                      <img
                        src={item.photo.getDirectURL()}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-foreground truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {formatTimestamp(item.timestamp)}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                      item.isPublished
                        ? "bg-green-500/20 text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.isPublished ? "Live" : "Draft"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-muted-foreground hover:text-foreground flex-shrink-0"
                    data-ocid={`admin.news.edit_button.${i + 1}`}
                    onClick={() => openEditNews(item)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-red-400 hover:text-red-300 flex-shrink-0"
                    data-ocid={`admin.news.delete_button.${i + 1}`}
                    onClick={() => setDeleteNewsId(item.newsId)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Notify Tab */}
        <TabsContent value="notify">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="font-display font-bold text-sm text-foreground">
              Send Notification
            </h3>
            <div>
              <Label className="text-xs mb-1 block">Target Audience</Label>
              <Select value={notifTarget} onValueChange={setNotifTarget}>
                <SelectTrigger className="h-9 text-sm" data-ocid="admin.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-sm">
                    All Users
                  </SelectItem>
                  <SelectItem value="Shela" className="text-sm">
                    Shela Area
                  </SelectItem>
                  <SelectItem value="Hindi" className="text-sm">
                    Hindi Area
                  </SelectItem>
                  <SelectItem value="Mkunguni" className="text-sm">
                    Mkunguni Area
                  </SelectItem>
                  <SelectItem value="Langoni" className="text-sm">
                    Langoni Area
                  </SelectItem>
                  <SelectItem value="Mkomani" className="text-sm">
                    Mkomani Area
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Message *</Label>
              <Textarea
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                placeholder="Enter your notification message..."
                className="text-sm min-h-[80px] resize-none"
                data-ocid="admin.textarea"
              />
            </div>
            <Button
              className="w-full text-sm"
              onClick={handleSendNotification}
              disabled={loading}
              data-ocid="admin.notify.button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.18 252) 0%, oklch(0.45 0.16 252) 100%)",
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Send Notification
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── ADD USER DIALOG ── */}
      <Dialog
        open={showAddUser}
        onOpenChange={(open) => {
          if (!open) setShowAddUser(false);
        }}
      >
        <DialogContent data-ocid="admin.add_user.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Full Name *</Label>
              <Input
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="e.g. Hassan Mwende"
                className="h-9 text-sm"
                data-ocid="admin.add_user.input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Phone (optional)</Label>
              <Input
                value={newUserPhone}
                onChange={(e) => setNewUserPhone(e.target.value)}
                placeholder="+254 7XX XXX XXX"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Email (optional)</Label>
              <Input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@example.com"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Role</Label>
              <Select value={newUserRole} onValueChange={setNewUserRole}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin" className="text-sm">
                    Admin
                  </SelectItem>
                  <SelectItem value="coach" className="text-sm">
                    Coach
                  </SelectItem>
                  <SelectItem value="player" className="text-sm">
                    Player
                  </SelectItem>
                  <SelectItem value="fan" className="text-sm">
                    Fan
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Area</Label>
              <Select value={newUserArea} onValueChange={setNewUserArea}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((area) => (
                    <SelectItem key={area} value={area} className="text-sm">
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddUser(false)}
              data-ocid="admin.add_user.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddUser}
              disabled={addUserLoading}
              data-ocid="admin.add_user.submit_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {addUserLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ADD TEAM DIALOG ── */}
      <Dialog
        open={showAddTeam}
        onOpenChange={(open) => {
          if (!open) setShowAddTeam(false);
        }}
      >
        <DialogContent data-ocid="admin.add_team.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Team Name *</Label>
              <Input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. Shela United FC"
                className="h-9 text-sm"
                data-ocid="admin.add_team.input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Area</Label>
              <Select value={newTeamArea} onValueChange={setNewTeamArea}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((area) => (
                    <SelectItem key={area} value={area} className="text-sm">
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">
                Coach Name (optional)
              </Label>
              <Input
                value={newTeamCoach}
                onChange={(e) => setNewTeamCoach(e.target.value)}
                placeholder="e.g. Omar Kiprotich"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddTeam(false)}
              data-ocid="admin.add_team.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddTeam}
              disabled={addTeamLoading}
              data-ocid="admin.add_team.submit_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {addTeamLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create Team"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ADD NEWS DIALOG ── */}
      <Dialog
        open={showAddNews}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddNews(false);
            setNewsPhotoPreview(null);
            setNewsPhotoFile(null);
          }
        }}
      >
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          data-ocid="admin.add_news.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Add News Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Title *</Label>
              <Input
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                placeholder="News headline..."
                className="h-9 text-sm"
                data-ocid="admin.add_news.input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Body *</Label>
              <Textarea
                value={newsBody}
                onChange={(e) => setNewsBody(e.target.value)}
                placeholder="Write the full news story here..."
                className="text-sm min-h-[100px] resize-none"
                data-ocid="admin.add_news.textarea"
              />
            </div>
            {/* Photo Upload */}
            <div>
              <Label className="text-xs mb-1 block">Photo (optional)</Label>
              <input
                type="file"
                accept="image/*"
                ref={newsFileRef}
                className="hidden"
                onChange={handleNewsPhotoChange}
              />
              {newsPhotoPreview ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={newsPhotoPreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white hover:bg-black/80"
                    onClick={() => {
                      setNewsPhotoFile(null);
                      setNewsPhotoPreview(null);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-1.5 text-muted-foreground"
                  onClick={() => newsFileRef.current?.click()}
                  data-ocid="admin.add_news.upload_button"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-xs">Click to upload photo</span>
                </button>
              )}
            </div>
            <div className="flex items-center justify-between py-1">
              <Label className="text-xs">Publish immediately</Label>
              <Switch
                checked={newsPublished}
                onCheckedChange={setNewsPublished}
                data-ocid="admin.add_news.switch"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddNews(false)}
              data-ocid="admin.add_news.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddNews}
              disabled={addNewsLoading}
              data-ocid="admin.add_news.submit_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {addNewsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Publish Post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT NEWS DIALOG ── */}
      <Dialog
        open={!!editingNews}
        onOpenChange={(open) => {
          if (!open) setEditingNews(null);
        }}
      >
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          data-ocid="admin.edit_news.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Edit News Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Title *</Label>
              <Input
                value={editNewsTitle}
                onChange={(e) => setEditNewsTitle(e.target.value)}
                className="h-9 text-sm"
                data-ocid="admin.edit_news.input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Body *</Label>
              <Textarea
                value={editNewsBody}
                onChange={(e) => setEditNewsBody(e.target.value)}
                className="text-sm min-h-[100px] resize-none"
                data-ocid="admin.edit_news.textarea"
              />
            </div>
            <div className="flex items-center justify-between py-1">
              <Label className="text-xs">Published</Label>
              <Switch
                checked={editNewsPublished}
                onCheckedChange={setEditNewsPublished}
                data-ocid="admin.edit_news.switch"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingNews(null)}
              data-ocid="admin.edit_news.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleEditNews}
              disabled={editNewsLoading}
              data-ocid="admin.edit_news.save_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {editNewsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE NEWS CONFIRM DIALOG ── */}
      <Dialog
        open={!!deleteNewsId}
        onOpenChange={(open) => {
          if (!open) setDeleteNewsId(null);
        }}
      >
        <DialogContent data-ocid="admin.delete_news.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Delete News Post?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The news post will be permanently
            removed.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteNewsId(null)}
              data-ocid="admin.delete_news.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteNews}
              disabled={deleteNewsLoading}
              data-ocid="admin.delete_news.confirm_button"
            >
              {deleteNewsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
      >
        <DialogContent data-ocid="admin.user.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Full Name</Label>
              <Input
                value={editUserName}
                onChange={(e) => setEditUserName(e.target.value)}
                className="h-9 text-sm"
                data-ocid="admin.user.input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Role</Label>
              <Select value={editUserRole} onValueChange={setEditUserRole}>
                <SelectTrigger
                  className="h-9 text-sm"
                  data-ocid="admin.user.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin" className="text-sm">
                    Admin
                  </SelectItem>
                  <SelectItem value="coach" className="text-sm">
                    Coach
                  </SelectItem>
                  <SelectItem value="player" className="text-sm">
                    Player
                  </SelectItem>
                  <SelectItem value="fan" className="text-sm">
                    Fan
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Area</Label>
              <Select value={editUserArea} onValueChange={setEditUserArea}>
                <SelectTrigger
                  className="h-9 text-sm"
                  data-ocid="admin.user.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((area) => (
                    <SelectItem key={area} value={area} className="text-sm">
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingUser(null)}
              data-ocid="admin.user.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveUser}
              disabled={loading}
              data-ocid="admin.user.save_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog
        open={!!editingTeam}
        onOpenChange={(open) => {
          if (!open) setEditingTeam(null);
        }}
      >
        <DialogContent data-ocid="admin.team.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Team Name</Label>
              <Input
                value={editTeamName}
                onChange={(e) => setEditTeamName(e.target.value)}
                className="h-9 text-sm"
                data-ocid="admin.team.input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Area</Label>
              <Select value={editTeamArea} onValueChange={setEditTeamArea}>
                <SelectTrigger
                  className="h-9 text-sm"
                  data-ocid="admin.team.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((area) => (
                    <SelectItem key={area} value={area} className="text-sm">
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingTeam(null)}
              data-ocid="admin.team.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveTeam}
              disabled={loading}
              data-ocid="admin.team.save_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Match Dialog */}
      <Dialog
        open={!!editingMatch}
        onOpenChange={(open) => {
          if (!open) setEditingMatch(null);
        }}
      >
        <DialogContent data-ocid="admin.match.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Match</DialogTitle>
          </DialogHeader>
          {editingMatch &&
            (() => {
              const home = MOCK_TEAMS.find(
                (t) => t.teamId === editingMatch.homeTeamId,
              );
              const away = MOCK_TEAMS.find(
                (t) => t.teamId === editingMatch.awayTeamId,
              );
              return (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground text-center font-semibold">
                    {home?.name} <span className="text-foreground">vs</span>{" "}
                    {away?.name}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs mb-1 block">
                        {home?.name} Score
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={editHomeScore}
                        onChange={(e) => setEditHomeScore(e.target.value)}
                        className="h-9 text-sm text-center"
                        data-ocid="admin.match.input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">
                        {away?.name} Score
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={editAwayScore}
                        onChange={(e) => setEditAwayScore(e.target.value)}
                        className="h-9 text-sm text-center"
                        data-ocid="admin.match.input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Status</Label>
                    <Select
                      value={editMatchStatus}
                      onValueChange={(v) =>
                        setEditMatchStatus(v as "scheduled" | "live" | "played")
                      }
                    >
                      <SelectTrigger
                        className="h-9 text-sm"
                        data-ocid="admin.match.select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled" className="text-sm">
                          Scheduled
                        </SelectItem>
                        <SelectItem value="live" className="text-sm">
                          Live
                        </SelectItem>
                        <SelectItem value="played" className="text-sm">
                          Played
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })()}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingMatch(null)}
              data-ocid="admin.match.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveMatch}
              disabled={loading}
              data-ocid="admin.match.save_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Match Dialog */}
      <Dialog open={showCreateMatch} onOpenChange={setShowCreateMatch}>
        <DialogContent data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Schedule New Match
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Home Team *</Label>
              <Select value={homeTeam} onValueChange={setHomeTeam}>
                <SelectTrigger className="h-9 text-sm" data-ocid="admin.select">
                  <SelectValue placeholder="Select home team..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_TEAMS.map((t) => (
                    <SelectItem
                      key={t.teamId}
                      value={t.teamId}
                      className="text-sm"
                    >
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Away Team *</Label>
              <Select value={awayTeam} onValueChange={setAwayTeam}>
                <SelectTrigger className="h-9 text-sm" data-ocid="admin.select">
                  <SelectValue placeholder="Select away team..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_TEAMS.map((t) => (
                    <SelectItem
                      key={t.teamId}
                      value={t.teamId}
                      className="text-sm"
                    >
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Match Date & Time *</Label>
              <Input
                type="datetime-local"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="h-9 text-sm"
                data-ocid="admin.input"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateMatch(false)}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateMatch}
              disabled={loading}
              data-ocid="admin.confirm_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Schedule Match"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
