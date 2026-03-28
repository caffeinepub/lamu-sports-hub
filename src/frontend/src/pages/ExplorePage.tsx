import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Video, getLocalStore, getVideos } from "@/utils/localStore";
import {
  ExternalLink,
  Layers,
  PlayCircle,
  Radio,
  Swords,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const LSH_LIVE_STREAMS_KEY = "lsh_live_streams";

type LiveStream = {
  streamId: string;
  title: string;
  url: string;
  addedAt: number;
};

function getLiveStreams(): LiveStream[] {
  return getLocalStore<LiveStream[]>(LSH_LIVE_STREAMS_KEY, []);
}

export function ExplorePage() {
  const videos = getVideos();
  const liveStreams = getLiveStreams();

  const tactics = videos.filter((v) => v.category === "tactics");
  const preparation = videos.filter((v) => v.category === "preparation");
  const highlights = videos.filter((v) => v.category === "highlights");

  return (
    <div data-ocid="explore.page" className="min-h-screen pb-24 pt-14">
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
            <Layers className="w-6 h-6 text-primary" />
            Explore
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live streams, tactics, training &amp; highlights
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="live" className="px-4 pt-4">
        <TabsList
          className="w-full grid grid-cols-4 mb-4"
          data-ocid="explore.tab"
        >
          <TabsTrigger value="live" data-ocid="explore.live.tab">
            <Radio className="w-3.5 h-3.5 mr-1" />
            Live
          </TabsTrigger>
          <TabsTrigger value="tactics" data-ocid="explore.tactics.tab">
            <Swords className="w-3.5 h-3.5 mr-1" />
            Tactics
          </TabsTrigger>
          <TabsTrigger value="preparation" data-ocid="explore.preparation.tab">
            <Zap className="w-3.5 h-3.5 mr-1" />
            Training
          </TabsTrigger>
          <TabsTrigger value="highlights" data-ocid="explore.highlights.tab">
            <PlayCircle className="w-3.5 h-3.5 mr-1" />
            Highlights
          </TabsTrigger>
        </TabsList>

        {/* Live Tab */}
        <TabsContent value="live">
          <LiveTab streams={liveStreams} />
        </TabsContent>

        <TabsContent value="tactics">
          <VideoGrid
            videos={tactics}
            emptyLabel="No tactics videos yet."
            ocidScope="explore.tactics"
          />
        </TabsContent>
        <TabsContent value="preparation">
          <VideoGrid
            videos={preparation}
            emptyLabel="No training videos yet."
            ocidScope="explore.preparation"
          />
        </TabsContent>
        <TabsContent value="highlights">
          <VideoGrid
            videos={highlights}
            emptyLabel="No highlight videos yet."
            ocidScope="explore.highlights"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LiveTab({ streams }: { streams: LiveStream[] }) {
  if (streams.length === 0) {
    return (
      <div
        className="rounded-xl border border-border bg-card py-14 flex flex-col items-center gap-3 text-center"
        data-ocid="explore.live.empty_state"
      >
        <div className="relative">
          <Radio className="w-12 h-12 text-muted-foreground/30" />
          <span
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
            style={{ background: "oklch(0.55 0.25 20)" }}
          />
        </div>
        <p className="font-semibold text-foreground">
          No live streams right now
        </p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Officials can add streaming links from the Admin Panel → Explore tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* LIVE badge */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2"
      >
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-white"
          style={{ background: "oklch(0.55 0.25 20)" }}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          LIVE
        </span>
        <span className="text-xs text-muted-foreground">
          {streams.length} stream{streams.length !== 1 ? "s" : ""} available
        </span>
      </motion.div>

      {streams.map((stream, i) => (
        <LiveStreamCard key={stream.streamId} stream={stream} index={i} />
      ))}
    </div>
  );
}

function LiveStreamCard({
  stream,
  index,
}: { stream: LiveStream; index: number }) {
  const isYoutube =
    stream.url.includes("youtube.com") || stream.url.includes("youtu.be");
  const embedUrl = isYoutube
    ? stream.url
        .replace("watch?v=", "embed/")
        .replace("youtu.be/", "youtube.com/embed/")
    : null;

  return (
    <motion.div
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.08 }}
      data-ocid={`explore.live.item.${index + 1}`}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Embed or placeholder */}
      {embedUrl ? (
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={embedUrl}
            title={stream.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <div
          className="w-full flex items-center justify-center"
          style={{
            height: 160,
            background:
              "linear-gradient(135deg, oklch(0.18 0.07 20) 0%, oklch(0.12 0.04 20) 100%)",
          }}
        >
          <Radio className="w-14 h-14 opacity-40 text-white" />
        </div>
      )}

      <div className="p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
            style={{ background: "oklch(0.55 0.25 20)" }}
          />
          <h3 className="font-semibold text-sm text-foreground truncate">
            {stream.title}
          </h3>
        </div>
        {!embedUrl && (
          <a
            href={stream.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: "oklch(0.55 0.25 20)", color: "white" }}
            data-ocid={`explore.live.link.${index + 1}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Watch
          </a>
        )}
      </div>
    </motion.div>
  );
}

function VideoGrid({
  videos,
  emptyLabel,
  ocidScope,
}: {
  videos: Video[];
  emptyLabel: string;
  ocidScope: string;
}) {
  if (videos.length === 0) {
    return (
      <div
        className="rounded-xl border border-border bg-card py-12 flex flex-col items-center gap-2 text-center"
        data-ocid={`${ocidScope}.empty_state`}
      >
        <PlayCircle className="w-10 h-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        <p className="text-xs text-muted-foreground/60">
          Admins can add videos from the admin panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {videos.map((video, i) => (
        <VideoCard
          key={video.videoId}
          video={video}
          index={i}
          ocidScope={ocidScope}
        />
      ))}
    </div>
  );
}

function VideoCard({
  video,
  index,
  ocidScope,
}: {
  video: Video;
  index: number;
  ocidScope: string;
}) {
  const isYoutubeEmbed = video.url.includes("youtube.com/embed/");

  return (
    <motion.div
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.08 }}
      data-ocid={`${ocidScope}.item.${index + 1}`}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Video Embed or gradient thumbnail */}
      {isYoutubeEmbed ? (
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={video.url}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative group"
          data-ocid={`${ocidScope}.link.${index + 1}`}
        >
          <div
            className="w-full flex items-center justify-center transition-all duration-300 group-hover:brightness-110"
            style={{
              height: 180,
              background:
                "linear-gradient(135deg, oklch(0.18 0.06 252) 0%, oklch(0.12 0.04 255) 100%)",
            }}
          >
            <motion.div
              whileHover={{ scale: 1.12 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <PlayCircle
                className="w-16 h-16"
                style={{ color: "oklch(0.6 0.22 24)" }}
              />
            </motion.div>
          </div>
        </a>
      )}

      {/* Info */}
      <div className="p-3 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 flex-1">
          {video.title}
        </h3>
        {!isYoutubeEmbed && (
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
          </a>
        )}
      </div>
    </motion.div>
  );
}
