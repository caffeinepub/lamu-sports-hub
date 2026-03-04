import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Loader2, Star, Trophy, Users, Waves } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  const handleLogin = () => {
    login();
    onLogin();
  };

  return (
    <div
      data-ocid="landing.page"
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.08 0.04 258) 0%, oklch(0.12 0.05 252) 40%, oklch(0.1 0.03 248) 70%, oklch(0.09 0.06 245) 100%)",
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Ocean waves pattern */}
        <div
          className="absolute bottom-0 left-0 right-0 h-64 opacity-5"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 28px, oklch(0.55 0.18 252 / 0.5) 28px, oklch(0.55 0.18 252 / 0.5) 30px)",
          }}
        />
        {/* Dhow silhouette glow */}
        <div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.18 252), transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full opacity-8"
          style={{
            background:
              "radial-gradient(circle, oklch(0.6 0.22 24), transparent 70%)",
          }}
        />

        {/* Floating dots */}
        {Array.from({ length: 20 }, (_, i) => i).map((i) => (
          <div
            key={`dot-${i}`}
            className="absolute w-1 h-1 rounded-full opacity-30"
            style={{
              backgroundColor:
                i % 3 === 0
                  ? "oklch(0.82 0.08 82)"
                  : i % 3 === 1
                    ? "oklch(0.55 0.18 252)"
                    : "oklch(0.6 0.22 24)",
              left: `${(i * 37 + 10) % 95}%`,
              top: `${(i * 53 + 5) % 90}%`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "backOut" }}
          className="mb-6"
        >
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-30"
              style={{ background: "oklch(0.55 0.18 252)" }}
            />
            <img
              src="/assets/generated/lamu-sports-hub-logo-transparent.dim_400x400.png"
              alt="Lamu Sports Hub"
              className="relative w-28 h-28 object-contain drop-shadow-2xl"
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-2"
        >
          <h1 className="font-display font-black text-4xl sm:text-5xl leading-tight">
            <span style={{ color: "oklch(0.82 0.08 82)" }}>LAMU</span>{" "}
            <span className="text-foreground">SPORTS</span>
          </h1>
          <h1 className="font-display font-black text-4xl sm:text-5xl leading-tight">
            <span className="text-foreground">HUB</span>
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-center mb-10 font-display font-medium tracking-widest text-xs uppercase"
          style={{ color: "oklch(0.6 0.22 24)" }}
        >
          Island Pride. Island Football.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {[
            { icon: <Trophy className="w-3 h-3" />, text: "League Tables" },
            { icon: <Users className="w-3 h-3" />, text: "Team Profiles" },
            { icon: <Star className="w-3 h-3" />, text: "MVP Votes" },
            { icon: <Waves className="w-3 h-3" />, text: "Matchday Live" },
          ].map((pill) => (
            <span
              key={pill.text}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "oklch(0.2 0.05 252)",
                border: "1px solid oklch(0.3 0.06 252)",
                color: "oklch(0.75 0.06 252)",
              }}
            >
              {pill.icon}
              {pill.text}
            </span>
          ))}
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div
            className="rounded-2xl p-6 border"
            style={{
              backgroundColor: "oklch(0.15 0.04 255 / 0.8)",
              borderColor: "oklch(0.28 0.05 252)",
              backdropFilter: "blur(12px)",
            }}
          >
            <h2 className="font-display font-bold text-lg text-foreground mb-1">
              Join the Hub
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Connect with players, coaches, and fans across Lamu's football
              community.
            </p>

            <Button
              className="w-full font-bold text-sm h-11 rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
                color: "oklch(0.97 0 0)",
              }}
              onClick={handleLogin}
              disabled={isLoggingIn || isInitializing}
              data-ocid="landing.login_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Sign In with Internet Identity"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Secure, password-free login powered by Internet Computer
            </p>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.5 }}
          className="flex gap-8 mt-10"
        >
          {[
            { value: "8", label: "Teams" },
            { value: "12+", label: "Matches" },
            { value: "100+", label: "Players" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="font-black font-stats text-2xl"
                style={{ color: "oklch(0.82 0.08 82)" }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative text-center py-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Built with ❤️ using caffeine.ai
        </a>
      </div>
    </div>
  );
}
