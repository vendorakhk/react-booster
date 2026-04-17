import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { i as isSupabaseConfigured, g as getSupabaseConfigError, s as supabaseUntyped } from "./client-Cm5qj9sr.js";
import { e as ensureUserProfile } from "./profile-_EUS1hwE.js";
import { toast } from "sonner";
import "@supabase/supabase-js";
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e) => {
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
      const {
        data,
        error
      } = await supabaseUntyped.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) throw error;
      await ensureUserProfile(data.session);
      toast.success("Welcome back!");
      navigate({
        to: "/dashboard"
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
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
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-7", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/", className: "inline-flex items-center gap-2.5 mb-6", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-[0_0_20px_var(--glow-primary)]", children: /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-primary-foreground" }) }),
          /* @__PURE__ */ jsxs("span", { className: "font-display text-xl font-extrabold", children: [
            "Reaction",
            /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Boost" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "font-display text-3xl font-black", children: "Welcome back" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-2 text-sm", children: "Log in to manage your reactions" })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1.5", children: "Email" }),
          /* @__PURE__ */ jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com", className: "w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1.5", children: "Password" }),
          /* @__PURE__ */ jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "••••••••", className: "w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" })
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "submit", disabled: loading, className: "w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-60", children: [
          loading ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" }),
          loading ? "Logging in..." : "Log in"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-center text-sm text-muted-foreground mt-6", children: [
        "Don't have an account?",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/signup", className: "text-primary hover:underline font-semibold", children: "Sign up" })
      ] })
    ] })
  ] });
}
export {
  LoginPage as component
};
