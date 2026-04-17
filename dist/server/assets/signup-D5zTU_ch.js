import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { i as isSupabaseConfigured, g as getSupabaseConfigError, s as supabaseUntyped } from "./client-Cm5qj9sr.js";
import { e as ensureUserProfile } from "./profile-_EUS1hwE.js";
import { toast } from "sonner";
import "@supabase/supabase-js";
function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null);
  const handleSignup = async (e) => {
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
      const {
        data,
        error
      } = await supabaseUntyped.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      if (error) {
        throw error;
      }
      if (data.user?.identities?.length === 0) {
        toast.info("This email is already registered. Please log in instead.");
        navigate({
          to: "/login"
        });
        return;
      }
      if (data.session) {
        await ensureUserProfile(data.session);
        toast.success("Account created!");
        navigate({
          to: "/dashboard"
        });
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
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background flex items-center justify-center px-4 py-10 relative overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 pointer-events-none", style: {
      background: "var(--gradient-hero)"
    } }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-md rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-7 sm:p-9 shadow-[var(--shadow-card)]", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/", className: "inline-flex items-center gap-2.5 mb-6", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-[0_0_20px_var(--glow-primary)]", children: /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-primary-foreground" }) }),
          /* @__PURE__ */ jsxs("span", { className: "font-display text-xl font-extrabold", children: [
            "Reaction",
            /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Boost" })
          ] })
        ] }),
        pendingVerificationEmail ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-7 w-7" }) }),
          /* @__PURE__ */ jsx("h1", { className: "font-display text-3xl font-black", children: "Check your email" }),
          /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mt-3 text-sm leading-6", children: [
            "We created your account for ",
            /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium", children: pendingVerificationEmail }),
            ". Confirm your email, then log in to access your dashboard."
          ] })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("h1", { className: "font-display text-3xl font-black", children: "Create your account" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-2 text-sm", children: "Start boosting your Telegram channel" })
        ] })
      ] }),
      pendingVerificationEmail ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground", children: "If you do not see the email, check your spam folder or try logging in after confirming your address." }),
        /* @__PURE__ */ jsxs(Link, { to: "/login", className: "w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold transition-opacity hover:opacity-90", children: [
          "Go to login",
          /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setPendingVerificationEmail(null), className: "w-full rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary", children: "Use a different email" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSignup, className: "space-y-4", noValidate: true, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "signup-email", className: "block text-sm font-medium mb-1.5", children: "Email" }),
            /* @__PURE__ */ jsx("input", { id: "signup-email", type: "email", autoComplete: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com", className: "w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "signup-password", className: "block text-sm font-medium mb-1.5", children: "Password" }),
            /* @__PURE__ */ jsx("input", { id: "signup-password", type: "password", autoComplete: "new-password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "At least 6 characters", className: "w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "signup-confirm-password", className: "block text-sm font-medium mb-1.5", children: "Confirm password" }),
            /* @__PURE__ */ jsx("input", { id: "signup-confirm-password", type: "password", autoComplete: "new-password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), placeholder: "Repeat your password", className: "w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" })
          ] }),
          /* @__PURE__ */ jsxs("button", { type: "submit", disabled: loading, className: "w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60", children: [
            loading ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" }),
            loading ? "Creating account..." : "Create account"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-center text-sm text-muted-foreground mt-6", children: [
          "Already have an account?",
          " ",
          /* @__PURE__ */ jsx(Link, { to: "/login", className: "text-primary hover:underline font-medium", children: "Log in" })
        ] })
      ] })
    ] })
  ] });
}
export {
  SignupPage as component
};
