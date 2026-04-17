import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { getSupabaseConfigError, isSupabaseConfigured, supabaseUntyped as supabase } from "@/integrations/supabase/client";
import { ensureUserProfile } from "@/integrations/supabase/profile";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — ReactionBoost" },
      { name: "description", content: "Create your ReactionBoost account and start boosting." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!isSupabaseConfigured()) {
      toast.error(getSupabaseConfigError());
      return;
    }

    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }

      if (data.user?.identities?.length === 0) {
        toast.info("This email is already registered. Please log in instead.");
        navigate({ to: "/login" });
        return;
      }

      if (data.session) {
        await ensureUserProfile(data.session);
        toast.success("Account created!");
        navigate({ to: "/dashboard" });
        return;
      }

      setPendingVerificationEmail(trimmedEmail);
      setPassword("");
      setConfirmPassword("");
      toast.success("Account created. Check your email to verify your account.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed";
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
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-[0_0_20px_var(--glow-primary)]">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-extrabold">
              Reaction<span className="text-gradient">Boost</span>
            </span>
          </Link>

          {pendingVerificationEmail ? (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="font-display text-3xl font-black">Check your email</h1>
              <p className="text-muted-foreground mt-3 text-sm leading-6">
                We created your account for <span className="text-foreground font-medium">{pendingVerificationEmail}</span>.
                Confirm your email, then log in to access your dashboard.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-black">Create your account</h1>
              <p className="text-muted-foreground mt-2 text-sm">Start boosting your Telegram channel</p>
            </>
          )}
        </div>

        {pendingVerificationEmail ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              If you do not see the email, check your spam folder or try logging in after confirming your address.
            </div>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold transition-opacity hover:opacity-90"
            >
              Go to login
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => setPendingVerificationEmail(null)}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSignup} className="space-y-4" noValidate>
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium mb-1.5">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="signup-confirm-password" className="block text-sm font-medium mb-1.5">Confirm password</label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
