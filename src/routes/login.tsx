import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { getSupabaseConfigError, isSupabaseConfigured, supabaseUntyped as supabase } from "@/integrations/supabase/client";
import { ensureUserProfile } from "@/integrations/supabase/profile";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log In — ReactionBoost" },
      { name: "description", content: "Log in to your ReactionBoost account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!isSupabaseConfigured()) {
      toast.error(getSupabaseConfigError());
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      await ensureUserProfile(data.session);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-7 sm:p-9 shadow-[var(--shadow-card)]">
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-[0_0_20px_var(--glow-primary)]">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-extrabold">
              Reaction<span className="text-gradient">Boost</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl font-black">Welcome back</h1>
          <p className="text-muted-foreground mt-2 text-sm">Log in to manage your reactions</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
