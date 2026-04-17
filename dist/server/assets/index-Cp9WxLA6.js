import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, Rocket, Send, Settings2, Star, Check, Lock, Clock, TrendingUp, Shield } from "lucide-react";
function HomePage() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background overflow-x-hidden", children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsx(Hero, {}),
    /* @__PURE__ */ jsx(Stats, {}),
    /* @__PURE__ */ jsx(HowItWorks, {}),
    /* @__PURE__ */ jsx(ReactionsGrid, {}),
    /* @__PURE__ */ jsx(Pricing, {}),
    /* @__PURE__ */ jsx(FAQ, {}),
    /* @__PURE__ */ jsx(CTA, {}),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
function Header() {
  return /* @__PURE__ */ jsx("header", { className: "fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2.5", children: [
      /* @__PURE__ */ jsx("div", { className: "relative w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-[0_0_20px_var(--glow-primary)]", children: /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-primary-foreground" }) }),
      /* @__PURE__ */ jsxs("span", { className: "font-display text-xl font-extrabold", children: [
        "Reaction",
        /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Boost" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "hidden md:flex items-center gap-1", children: [{
      href: "#how",
      label: "How it works"
    }, {
      href: "#pricing",
      label: "Pricing"
    }, {
      href: "#faq",
      label: "FAQ"
    }].map((l) => /* @__PURE__ */ jsx("a", { href: l.href, className: "px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors", children: l.label }, l.href)) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Link, { to: "/login", className: "hidden sm:inline-flex px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors", children: "Log in" }),
      /* @__PURE__ */ jsxs(Link, { to: "/signup", className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_var(--glow-primary)]", children: [
        "Get started",
        /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
      ] })
    ] })
  ] }) });
}
function Hero() {
  return /* @__PURE__ */ jsxs("section", { className: "relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-grid opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 pointer-events-none", style: {
      background: "var(--gradient-hero)"
    } }),
    /* @__PURE__ */ jsxs("div", { className: "relative max-w-5xl mx-auto text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-8", children: [
        /* @__PURE__ */ jsxs("span", { className: "relative flex h-2 w-2", children: [
          /* @__PURE__ */ jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" }),
          /* @__PURE__ */ jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-primary" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-foreground", children: "Trusted by Telegram channel owners worldwide" })
      ] }),
      /* @__PURE__ */ jsxs("h1", { className: "font-display text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6", children: [
        "Boost your",
        " ",
        /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Telegram channel" }),
        /* @__PURE__ */ jsx("br", { className: "hidden sm:block" }),
        " with real reactions."
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed", children: "Pick the exact emojis you want, set the percentage of each, choose how many — and watch authentic reactions roll into your channel posts within minutes." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-3 mb-16", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/signup", className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-primary text-primary-foreground font-bold animate-pulse-glow", children: [
          "Start boosting now",
          /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5" })
        ] }),
        /* @__PURE__ */ jsx("a", { href: "#how", className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-border bg-card/50 backdrop-blur-sm text-foreground font-semibold hover:bg-card transition-colors", children: "See how it works" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative max-w-2xl mx-auto", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute -inset-4 bg-gradient-primary opacity-30 blur-3xl rounded-full" }),
        /* @__PURE__ */ jsxs("div", { className: "relative rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-[var(--shadow-card)]", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4 text-left", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground", children: "C" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm", children: "Your Channel" }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Just now" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-foreground/90 text-left mb-4", children: "📈 New signal posted. Don't miss this opportunity!" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-2", children: [{
            emoji: "👍",
            count: "1.2K",
            color: "primary"
          }, {
            emoji: "❤️",
            count: "847",
            color: "pink"
          }, {
            emoji: "🔥",
            count: "612",
            color: "accent"
          }, {
            emoji: "⚡️",
            count: "203",
            color: "primary"
          }].map((r, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/80 border border-border text-sm font-medium animate-float", style: {
            animationDelay: `${i * 0.2}s`
          }, children: [
            /* @__PURE__ */ jsx("span", { children: r.emoji }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: r.count })
          ] }, r.emoji)) })
        ] })
      ] })
    ] })
  ] });
}
function Stats() {
  const stats = [{
    value: "2.5M+",
    label: "Reactions delivered"
  }, {
    value: "12K+",
    label: "Channels boosted"
  }, {
    value: "< 5 min",
    label: "Avg. delivery"
  }, {
    value: "99.8%",
    label: "Success rate"
  }];
  return /* @__PURE__ */ jsx("section", { className: "py-12 px-4 sm:px-6 lg:px-8 border-y border-border/50 bg-card/30", children: /* @__PURE__ */ jsx("div", { className: "max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6", children: stats.map((s) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "font-display text-3xl sm:text-4xl font-extrabold text-gradient", children: s.value }),
    /* @__PURE__ */ jsx("div", { className: "text-xs sm:text-sm text-muted-foreground mt-1", children: s.label })
  ] }, s.label)) }) });
}
function HowItWorks() {
  const steps = [{
    icon: Rocket,
    title: "Create & fund",
    description: "Sign up free. Top up your balance with USDT in seconds."
  }, {
    icon: Send,
    title: "Paste channel post link",
    description: "Copy any Telegram channel message link and paste it in."
  }, {
    icon: Settings2,
    title: "Customize reactions",
    description: "Pick emojis, set percentages, and choose total count."
  }, {
    icon: Sparkles,
    title: "Watch it grow",
    description: "Reactions arrive organically within minutes. Done."
  }];
  return /* @__PURE__ */ jsx("section", { id: "how", className: "py-24 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsx(SectionHeader, { eyebrow: "How it works", title: "From zero to boosted in 4 steps", subtitle: "Built specifically for Telegram channels — no setup, no tech skills required." }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5", children: steps.map((s, i) => /* @__PURE__ */ jsxs("div", { className: "group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_var(--glow-primary)]", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-5 font-display text-6xl font-black text-border/40 select-none", children: i + 1 }),
      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-[0_0_20px_var(--glow-primary)]", children: /* @__PURE__ */ jsx(s.icon, { className: "w-6 h-6 text-primary-foreground" }) }),
      /* @__PURE__ */ jsx("h3", { className: "font-display font-bold text-lg mb-1.5", children: s.title }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: s.description })
    ] }, s.title)) })
  ] }) });
}
function ReactionsGrid() {
  const reactions = ["👍", "❤️", "🔥", "⚡️", "😍", "🎉", "👏", "🤔", "🤩", "💯", "🚀", "🏆"];
  return /* @__PURE__ */ jsx("section", { className: "py-24 px-4 sm:px-6 lg:px-8 bg-card/30 border-y border-border/50", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsx(SectionHeader, { eyebrow: "Every emoji available", title: "Pick the reactions that fit your vibe", subtitle: "Mix and match across all popular Telegram channel reactions." }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 sm:grid-cols-6 gap-3 sm:gap-4", children: reactions.map((emoji, i) => /* @__PURE__ */ jsx("div", { className: "aspect-square rounded-2xl bg-card border border-border hover:border-primary/40 flex items-center justify-center text-3xl sm:text-4xl transition-all hover:scale-105 hover:-translate-y-1 hover:shadow-[0_15px_40px_-15px_var(--glow-primary)] cursor-default animate-float", style: {
      animationDelay: `${i * 0.1}s`
    }, children: emoji }, emoji)) })
  ] }) });
}
function Pricing() {
  const features = ["All Telegram emojis available", "Custom percentage per emoji", "Real accounts, no bots", "Delivery in minutes", "Pay with USDT", "No subscription, pay-as-you-go"];
  return /* @__PURE__ */ jsx("section", { id: "pricing", className: "py-24 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsx(SectionHeader, { eyebrow: "Simple pricing", title: "Pay only for what you use", subtitle: "One flat rate per reaction. No tricks, no subscriptions." }),
    /* @__PURE__ */ jsxs("div", { className: "relative max-w-md mx-auto", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -inset-1 bg-gradient-primary opacity-40 blur-2xl rounded-3xl" }),
      /* @__PURE__ */ jsxs("div", { className: "relative p-8 rounded-3xl bg-card border-2 border-primary/40 shadow-[var(--shadow-glow)]", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center mb-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold mb-4", children: [
            /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 fill-accent" }),
            "Best value"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-center gap-1", children: [
            /* @__PURE__ */ jsx("span", { className: "font-display text-6xl font-black text-gradient", children: "$0.01" }),
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-sm", children: "/reaction" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Bulk discounts apply automatically" })
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-3 mb-8", children: features.map((f) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3 text-sm", children: [
          /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center mt-0.5", children: /* @__PURE__ */ jsx(Check, { className: "w-3 h-3", strokeWidth: 3 }) }),
          f
        ] }, f)) }),
        /* @__PURE__ */ jsxs(Link, { to: "/signup", className: "w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity", children: [
          "Start now",
          /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto", children: [{
      qty: 100,
      price: 1
    }, {
      qty: 500,
      price: 5
    }, {
      qty: 1e3,
      price: 10
    }].map((p) => /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-card border border-border text-center hover:border-primary/30 transition-colors", children: [
      /* @__PURE__ */ jsx("div", { className: "font-display text-2xl font-bold", children: p.qty }),
      /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "reactions" }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm font-bold text-gradient mt-1", children: [
        "$",
        p.price.toFixed(2)
      ] })
    ] }, p.qty)) })
  ] }) });
}
function FAQ() {
  const faqs = [{
    q: "Does this work for Telegram groups too?",
    a: "No — ReactionBoost is built exclusively for public Telegram channels. Group messages are not supported."
  }, {
    q: "How quickly do reactions appear?",
    a: "Most orders start delivering within 1–5 minutes. Larger orders are spread over time to look organic."
  }, {
    q: "Are reactions from real accounts?",
    a: "Yes — we use a network of real, aged Telegram accounts. No bots, no fake-looking activity."
  }, {
    q: "What payment do you accept?",
    a: "USDT (Tether) via our crypto payment gateway. Top up once, use it whenever."
  }, {
    q: "Is my channel safe?",
    a: "Absolutely. Reactions are delivered with organic timing and varied accounts so they appear natural."
  }, {
    q: "Is there a minimum order?",
    a: "Yes — 10 reactions minimum per order. No maximum."
  }];
  return /* @__PURE__ */ jsx("section", { id: "faq", className: "py-24 px-4 sm:px-6 lg:px-8 bg-card/30 border-y border-border/50", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsx(SectionHeader, { eyebrow: "FAQ", title: "Everything you need to know" }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3", children: faqs.map((f) => /* @__PURE__ */ jsxs("details", { className: "group p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors", children: [
      /* @__PURE__ */ jsxs("summary", { className: "flex items-center justify-between cursor-pointer font-semibold text-sm sm:text-base", children: [
        f.q,
        /* @__PURE__ */ jsx("span", { className: "ml-4 flex-shrink-0 w-7 h-7 rounded-full bg-secondary text-muted-foreground group-open:bg-primary group-open:text-primary-foreground group-open:rotate-45 transition-all flex items-center justify-center text-lg leading-none", children: "+" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-muted-foreground leading-relaxed", children: f.a })
    ] }, f.q)) })
  ] }) });
}
function CTA() {
  return /* @__PURE__ */ jsx("section", { className: "py-24 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-primary/30 bg-card p-8 sm:p-14 text-center shadow-[var(--shadow-glow)]", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 opacity-60", style: {
      background: "var(--gradient-hero)"
    } }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-display text-3xl sm:text-5xl font-black mb-4", children: [
        "Ready to ",
        /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "boost" }),
        " your channel?"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8", children: "Join thousands of channel owners growing engagement with ReactionBoost." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-3", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/signup", className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-primary text-primary-foreground font-bold animate-pulse-glow", children: [
          "Get started free",
          /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Lock, { className: "w-3.5 h-3.5" }),
            " Secure"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5" }),
            " 5-min delivery"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(TrendingUp, { className: "w-3.5 h-3.5" }),
            " Real growth"
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
function Footer() {
  return /* @__PURE__ */ jsx("footer", { className: "py-10 px-4 sm:px-6 lg:px-8 border-t border-border", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center", children: /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-primary-foreground" }) }),
      /* @__PURE__ */ jsxs("span", { className: "font-display font-bold", children: [
        "Reaction",
        /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Boost" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Shield, { className: "w-3.5 h-3.5" }),
      /* @__PURE__ */ jsx("span", { children: "Telegram channel reactions, delivered safely." })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " ReactionBoost"
    ] })
  ] }) });
}
function SectionHeader({
  eyebrow,
  title,
  subtitle
}) {
  return /* @__PURE__ */ jsxs("div", { className: "text-center mb-14", children: [
    /* @__PURE__ */ jsx("div", { className: "inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4", children: eyebrow }),
    /* @__PURE__ */ jsx("h2", { className: "font-display text-3xl sm:text-4xl lg:text-5xl font-black mb-3", children: title }),
    subtitle && /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto", children: subtitle })
  ] });
}
export {
  HomePage as component
};
