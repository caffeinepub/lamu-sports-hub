import { Position, Role } from "@/backend";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_TEAMS } from "@/data/mockData";
import { useActor } from "@/hooks/useActor";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Award,
  BarChart2,
  BookOpen,
  Calendar,
  Clock,
  Compass,
  DollarSign,
  FilePlus,
  Grid3x3,
  Heart,
  Home,
  Info,
  Loader2,
  MessageSquare,
  Settings,
  Shield,
  Trophy,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  ocid: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    path: "/",
    label: "Home",
    icon: <Home className="w-5 h-5" />,
    ocid: "nav.home.link",
  },
  {
    path: "/standings",
    label: "Standings",
    icon: <BarChart2 className="w-5 h-5" />,
    ocid: "nav.standings.link",
  },
  {
    path: "/matches",
    label: "Matches",
    icon: <Calendar className="w-5 h-5" />,
    ocid: "nav.matches.link",
  },
  {
    path: "/leaderboard",
    label: "Leaders",
    icon: <Trophy className="w-5 h-5" />,
    ocid: "nav.leaderboard.link",
  },
  {
    path: "/profile",
    label: "Profile",
    icon: <User className="w-5 h-5" />,
    ocid: "nav.profile.link",
  },
];

const EXTRA_NAV: NavItem[] = [
  {
    path: "/coach",
    label: "Coach",
    icon: <Users className="w-5 h-5" />,
    ocid: "nav.coach.link",
    roles: ["coach", "admin"],
  },
  {
    path: "/admin",
    label: "Admin",
    icon: <Shield className="w-5 h-5" />,
    ocid: "nav.admin.link",
    roles: ["admin"],
  },
];

const MORE_ITEMS = [
  {
    path: "/referees",
    label: "Referees",
    icon: <Shield className="w-5 h-5" />,
    ocid: "nav.referees.link",
  },
  {
    path: "/awards",
    label: "Awards",
    icon: <Award className="w-5 h-5" />,
    ocid: "nav.awards.link",
  },
  {
    path: "/explore",
    label: "Explore",
    icon: <Compass className="w-5 h-5" />,
    ocid: "nav.explore.link",
  },
  {
    path: "/about",
    label: "About",
    icon: <Info className="w-5 h-5" />,
    ocid: "nav.about.link",
  },
  {
    path: "/history",
    label: "History",
    icon: <Clock className="w-5 h-5" />,
    ocid: "nav.history.link",
  },
  {
    path: "/suggestions",
    label: "Suggestions",
    icon: <MessageSquare className="w-5 h-5" />,
    ocid: "nav.suggestions.link",
  },
  {
    path: "/settings",
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
    ocid: "nav.settings.link",
  },
  {
    path: "/officials",
    label: "Officials",
    icon: <Users className="w-5 h-5" />,
    ocid: "nav.officials.link",
  },
  {
    path: "/monetize",
    label: "Support",
    icon: <Heart className="w-5 h-5" />,
    ocid: "nav.monetize.link",
  },
];

const AREAS = [
  "Shela",
  "Hindi",
  "Mkunguni",
  "Langoni",
  "Mkomani",
  "Lamu Town",
] as const;

// ─── Add Player Dialog ────────────────────────────────────────────────────────

interface AddPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const positionMap: Record<string, Position> = {
  goalkeeper: Position.goalkeeper,
  defender: Position.defender,
  midfielder: Position.midfielder,
  forward: Position.forward,
};

function AddPlayerDialog({ open, onOpenChange }: AddPlayerDialogProps) {
  const { actor } = useActor();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [teamId, setTeamId] = useState("");
  const [position, setPosition] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [bio, setBio] = useState("");

  function resetForm() {
    setName("");
    setNickname("");
    setTeamId("");
    setPosition("");
    setJerseyNumber("");
    setBio("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !teamId || !position) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const positionEnum = positionMap[position];
    if (!positionEnum) {
      toast.error("Invalid position selected.");
      return;
    }
    setLoading(true);
    try {
      await actor?.adminAddPlayer(
        teamId,
        nickname.trim(),
        name.trim(),
        positionEnum,
        BigInt(jerseyNumber || 0),
      );
      toast.success("Player registered!");
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error("Failed to register player. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) {
          if (!v) resetForm();
          onOpenChange(v);
        }
      }}
      data-ocid="more.add_player.dialog"
    >
      <DialogContent
        className="max-w-sm mx-auto rounded-2xl"
        data-ocid="more.add_player.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <span className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-accent" />
            </span>
            Register Player
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="player-name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="player-name"
              placeholder="e.g. Hassan Mwende"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="more.add_player.input"
              required
            />
          </div>

          {/* Nickname */}
          <div className="space-y-1.5">
            <Label htmlFor="player-nickname">Nickname (optional)</Label>
            <Input
              id="player-nickname"
              placeholder="e.g. Rocket"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {/* Team */}
          <div className="space-y-1.5">
            <Label htmlFor="player-team">
              Team <span className="text-destructive">*</span>
            </Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger
                id="player-team"
                data-ocid="more.add_player.select"
              >
                <SelectValue placeholder="Select team…" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_TEAMS.map((t) => (
                  <SelectItem key={t.teamId} value={t.teamId}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Position */}
          <div className="space-y-1.5">
            <Label htmlFor="player-position">
              Position <span className="text-destructive">*</span>
            </Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger
                id="player-position"
                data-ocid="more.add_player.select"
              >
                <SelectValue placeholder="Select position…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                <SelectItem value="defender">Defender</SelectItem>
                <SelectItem value="midfielder">Midfielder</SelectItem>
                <SelectItem value="forward">Forward</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jersey Number */}
          <div className="space-y-1.5">
            <Label htmlFor="player-jersey">Jersey Number</Label>
            <Input
              id="player-jersey"
              type="number"
              min={1}
              max={99}
              placeholder="e.g. 10"
              value={jerseyNumber}
              onChange={(e) => setJerseyNumber(e.target.value)}
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label htmlFor="player-bio">Description / Bio</Label>
            <Textarea
              id="player-bio"
              placeholder="e.g. Fast winger with excellent dribbling skills…"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              data-ocid="more.add_player.textarea"
            />
          </div>

          <DialogFooter className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={loading}
              data-ocid="more.add_player.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={loading}
              data-ocid="more.add_player.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering…
                </>
              ) : (
                "Register Player"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Coach Dialog ─────────────────────────────────────────────────────────

interface AddCoachDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddCoachDialog({ open, onOpenChange }: AddCoachDialogProps) {
  const { actor } = useActor();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  function resetForm() {
    setName("");
    setArea("");
    setPhone("");
    setEmail("");
    setDescription("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !area) {
      toast.error("Name and area are required.");
      return;
    }
    setLoading(true);
    try {
      await actor?.adminCreateUser(
        name.trim(),
        phone.trim(),
        email.trim(),
        Role.coach,
        area,
      );
      toast.success("Coach added!");
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error("Failed to add coach. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) {
          if (!v) resetForm();
          onOpenChange(v);
        }
      }}
    >
      <DialogContent
        className="max-w-sm mx-auto rounded-2xl"
        data-ocid="more.add_coach.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <span className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-accent" />
            </span>
            Add Coach
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="coach-name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="coach-name"
              placeholder="e.g. Ali Hassan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="more.add_coach.input"
              required
            />
          </div>

          {/* Area */}
          <div className="space-y-1.5">
            <Label htmlFor="coach-area">
              Area <span className="text-destructive">*</span>
            </Label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger id="coach-area" data-ocid="more.add_coach.select">
                <SelectValue placeholder="Select area…" />
              </SelectTrigger>
              <SelectContent>
                {AREAS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="coach-phone">Phone (optional)</Label>
            <Input
              id="coach-phone"
              type="tel"
              placeholder="e.g. +254 712 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="coach-email">Email (optional)</Label>
            <Input
              id="coach-email"
              type="email"
              placeholder="e.g. ali@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="coach-desc">Coaching Description</Label>
            <Textarea
              id="coach-desc"
              placeholder="e.g. 10 years experience in youth football, specializes in 4-3-3…"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-ocid="more.add_coach.textarea"
            />
          </div>

          <DialogFooter className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={loading}
              data-ocid="more.add_coach.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={loading}
              data-ocid="more.add_coach.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding…
                </>
              ) : (
                "Add Coach"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add News Dialog ──────────────────────────────────────────────────────────

interface AddNewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddNewsDialog({ open, onOpenChange }: AddNewsDialogProps) {
  const { actor } = useActor();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  function resetForm() {
    setTitle("");
    setBody("");
    setIsPublished(true);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required.");
      return;
    }
    setLoading(true);
    try {
      await actor?.createNews(title.trim(), body.trim(), isPublished);
      toast.success(isPublished ? "News published!" : "News saved as draft.");
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error("Failed to publish news. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) {
          if (!v) resetForm();
          onOpenChange(v);
        }
      }}
    >
      <DialogContent
        className="max-w-sm mx-auto rounded-2xl"
        data-ocid="more.add_news.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <span className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
              <FilePlus className="w-4 h-4 text-accent" />
            </span>
            Create News
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="news-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="news-title"
              placeholder="e.g. Shela United Win Island Derby 3-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-ocid="more.add_news.input"
              required
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label htmlFor="news-body">
              Story <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="news-body"
              placeholder="Write the full story here…"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              data-ocid="more.add_news.textarea"
              required
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-1.5">
            <Label>Photo (optional)</Label>
            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-card/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => {
                    URL.revokeObjectURL(photoPreview);
                    setPhotoPreview(null);
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <label
                htmlFor="news-photo"
                className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                data-ocid="more.add_news.upload_button"
              >
                <FilePlus className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">
                  Tap to add a photo
                </span>
                <input
                  id="news-photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
            )}
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Publish immediately</p>
              <p className="text-xs text-muted-foreground">
                Off = save as draft
              </p>
            </div>
            <Switch
              checked={isPublished}
              onCheckedChange={setIsPublished}
              data-ocid="more.add_news.switch"
            />
          </div>

          <DialogFooter className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={loading}
              data-ocid="more.add_news.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={loading}
              data-ocid="more.add_news.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing…
                </>
              ) : isPublished ? (
                "Publish"
              ) : (
                "Save Draft"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── BottomNav ────────────────────────────────────────────────────────────────

interface BottomNavProps {
  role?: string;
}

export function BottomNav({ role }: BottomNavProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [showMore, setShowMore] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showAddCoach, setShowAddCoach] = useState(false);
  const [showAddNews, setShowAddNews] = useState(false);

  const extraItems = EXTRA_NAV.filter(
    (item) => item.roles && role && item.roles.includes(role),
  );
  const allItems = [...NAV_ITEMS.slice(0, 4), ...extraItems, NAV_ITEMS[4]];

  // Check if current path is one of the "more" items
  const isMoreActive = MORE_ITEMS.some(
    (item) =>
      currentPath === item.path ||
      (item.path !== "/" && currentPath.startsWith(item.path)),
  );

  const isAdmin = role === "admin";

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-card/95 backdrop-blur-sm border-t border-border flex items-stretch">
        {allItems.map((item) => {
          const isActive =
            currentPath === item.path ||
            (item.path !== "/" && currentPath.startsWith(item.path));
          return (
            <button
              type="button"
              key={item.path}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                isActive
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => navigate({ to: item.path })}
              data-ocid={item.ocid}
            >
              <div
                className={`${isActive ? "scale-110" : ""} transition-transform`}
              >
                {item.icon}
              </div>
              <span
                className={`text-[10px] font-semibold ${isActive ? "font-bold" : ""}`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-accent rounded-b-full" />
              )}
            </button>
          );
        })}

        {/* More button */}
        <button
          type="button"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
            isMoreActive || showMore
              ? "text-accent"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setShowMore(true)}
          data-ocid="nav.more.button"
        >
          <Grid3x3 className="w-5 h-5" />
          <span className="text-[10px] font-semibold">More</span>
          {isMoreActive && (
            <span className="absolute top-0 w-8 h-0.5 bg-accent rounded-b-full" />
          )}
        </button>
      </nav>

      {/* More Sheet */}
      <Sheet open={showMore} onOpenChange={setShowMore}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl pb-8"
          data-ocid="nav.more.sheet"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-left">More</SheetTitle>
          </SheetHeader>

          {/* Standard MORE_ITEMS grid */}
          <div className="grid grid-cols-4 gap-3">
            {MORE_ITEMS.map((item) => {
              const isActive =
                currentPath === item.path ||
                (item.path !== "/" && currentPath.startsWith(item.path));
              return (
                <button
                  type="button"
                  key={item.path}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                    isActive
                      ? "bg-accent/10 border-accent/40 text-accent"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                  onClick={() => {
                    navigate({ to: item.path });
                    setShowMore(false);
                  }}
                  data-ocid={item.ocid}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-semibold">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Officials Quick Actions — admin only */}
          {isAdmin && (
            <div className="mt-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Officials Quick Actions
              </p>
              <div className="grid grid-cols-3 gap-3">
                {/* Add Player */}
                <button
                  type="button"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-accent/30 bg-accent/8 text-accent hover:bg-accent/15 hover:border-accent/60 transition-all"
                  onClick={() => {
                    setShowMore(false);
                    setShowAddPlayer(true);
                  }}
                  data-ocid="more.add_player.open_modal_button"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold">Add Player</span>
                </button>

                {/* Add Coach */}
                <button
                  type="button"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-accent/30 bg-accent/8 text-accent hover:bg-accent/15 hover:border-accent/60 transition-all"
                  onClick={() => {
                    setShowMore(false);
                    setShowAddCoach(true);
                  }}
                  data-ocid="more.add_coach.open_modal_button"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold">Add Coach</span>
                </button>

                {/* Add News */}
                <button
                  type="button"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-accent/30 bg-accent/8 text-accent hover:bg-accent/15 hover:border-accent/60 transition-all"
                  onClick={() => {
                    setShowMore(false);
                    setShowAddNews(true);
                  }}
                  data-ocid="more.add_news.open_modal_button"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FilePlus className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold">Add News</span>
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Quick-action Dialogs */}
      <AddPlayerDialog open={showAddPlayer} onOpenChange={setShowAddPlayer} />
      <AddCoachDialog open={showAddCoach} onOpenChange={setShowAddCoach} />
      <AddNewsDialog open={showAddNews} onOpenChange={setShowAddNews} />
    </>
  );
}
