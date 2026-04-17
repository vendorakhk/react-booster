import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, Shield, Zap, ArrowRight, Send, Settings2, Rocket,
  Check, Star, TrendingUp, Lock, Clock,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ReactionBoost — Boost Your Telegram Channel With Real Reactions" },
      {
        name: "description",
        content:
          "Get authentic reactions on your Telegram channel posts. Pick emojis, set percentages, pay with USDT. Delivered in minutes.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <Hero />
      <Stats />
      <HowItWorks />
      <ReactionsGrid />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

/* ───────────────────────── HEADER ───────────────────────── */

function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-[0_0_20px_var(--glow-primary)]">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-extrabold">
            Reaction<span className="text-gradient">Boost</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "#how", label: "How it works" },
            { href: "#pricing", label: "Pricing" },
            { href: "#faq", label: "FAQ" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_var(--glow-primary)]"
          >
            Get started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ───────────────────────── HERO ───────────────────────── */

function Hero() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--gradient-hero)" }}
      />

      <div className="relative max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-xs font-medium text-foreground">
            Trusted by Telegram channel owners worldwide
          </span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6">
          Boost your{" "}
          <span className="text-gradient">Telegram channel</span>
          <br className="hidden sm:block" /> with real reactions.
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Pick the exact emojis you want, set the percentage of each, choose how
          many — and watch authentic reactions roll into your channel posts within minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-primary text-primary-foreground font-bold animate-pulse-glow"
          >
            Start boosting now
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#how"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-border bg-card/50 backdrop-blur-sm text-foreground font-semibold hover:bg-card transition-colors"
          >
            See how it works
          </a>
        </div>

        {/* Floating preview card */}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute -inset-4 bg-gradient-primary opacity-30 blur-3xl rounded-full" />
          <div className="relative rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3 mb-4 text-left">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground">
                C
              </div>
              <div>
                <div className="font-semibold text-sm">Your Channel</div>
                <div className="text-xs text-muted-foreground">Just now</div>
              </div>
            </div>
            <div className="text-sm text-foreground/90 text-left mb-4">
              📈 New signal posted. Don't miss this opportunity!
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { emoji: "👍", count: "1.2K", color: "primary" },
                { emoji: "❤️", count: "847", color: "pink" },
                { emoji: "🔥", count: "612", color: "accent" },
                { emoji: "⚡️", count: "203", color: "primary" },
              ].map((r, i) => (
                <div
                  key={r.emoji}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/80 border border-border text-sm font-medium animate-float"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  <span>{r.emoji}</span>
                  <span className="text-xs text-muted-foreground">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── STATS ───────────────────────── */

function Stats() {
  const stats = [
    { value: "2.5M+", label: "Reactions delivered" },
    { value: "12K+", label: "Channels boosted" },
    { value: "< 5 min", label: "Avg. delivery" },
    { value: "99.8%", label: "Success rate" },
  ];
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-border/50 bg-card/30">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-display text-3xl sm:text-4xl font-extrabold text-gradient">
              {s.value}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── HOW IT WORKS ───────────────────────── */

function HowItWorks() {
  const steps = [
    {
      icon: Rocket,
      title: "Create & fund",
      description: "Sign up free. Top up your balance with USDT in seconds.",
    },
    {
      icon: Send,
      title: "Paste channel post link",
      description: "Copy any Telegram channel message link and paste it in.",
    },
    {
      icon: Settings2,
      title: "Customize reactions",
      description: "Pick emojis, set percentages, and choose total count.",
    },
    {
      icon: Sparkles,
      title: "Watch it grow",
      description: "Reactions arrive organically within minutes. Done.",
    },
  ];
  return (
    <section id="how" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          eyebrow="How it works"
          title="From zero to boosted in 4 steps"
          subtitle="Built specifically for Telegram channels — no setup, no tech skills required."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_var(--glow-primary)]"
            >
              <div className="absolute top-4 right-5 font-display text-6xl font-black text-border/40 select-none">
                {i + 1}
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-[0_0_20px_var(--glow-primary)]">
                <s.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg mb-1.5">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── REACTIONS GRID ───────────────────────── */

function ReactionsGrid() {
  const reactions = [
    "👍", "❤️", "🔥", "⚡️", "😍", "🎉", "👏", "🤔",
    "🤩", "💯", "🚀", "🏆",
  ];
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card/30 border-y border-border/50">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          eyebrow="Every emoji available"
          title="Pick the reactions that fit your vibe"
          subtitle="Mix and match across all popular Telegram channel reactions."
        />
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 sm:gap-4">
          {reactions.map((emoji, i) => (
            <div
              key={emoji}
              className="aspect-square rounded-2xl bg-card border border-border hover:border-primary/40 flex items-center justify-center text-3xl sm:text-4xl transition-all hover:scale-105 hover:-translate-y-1 hover:shadow-[0_15px_40px_-15px_var(--glow-primary)] cursor-default animate-float"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── PRICING ───────────────────────── */

function Pricing() {
  const features = [
    "All Telegram emojis available",
    "Custom percentage per emoji",
    "Real accounts, no bots",
    "Delivery in minutes",
    "Pay with USDT",
    "No subscription, pay-as-you-go",
  ];
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          eyebrow="Simple pricing"
          title="Pay only for what you use"
          subtitle="One flat rate per reaction. No tricks, no subscriptions."
        />

        <div className="relative max-w-md mx-auto">
          <div className="absolute -inset-1 bg-gradient-primary opacity-40 blur-2xl rounded-3xl" />
          <div className="relative p-8 rounded-3xl bg-card border-2 border-primary/40 shadow-[var(--shadow-glow)]">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold mb-4">
                <Star className="w-3 h-3 fill-accent" />
                Best value
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-display text-6xl font-black text-gradient">
                  $0.01
                </span>
                <span className="text-muted-foreground text-sm">/reaction</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Bulk discounts apply automatically
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              to="/signup"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
            >
              Start now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {[
            { qty: 100, price: 1 },
            { qty: 500, price: 5 },
            { qty: 1000, price: 10 },
          ].map((p) => (
            <div
              key={p.qty}
              className="p-4 rounded-xl bg-card border border-border text-center hover:border-primary/30 transition-colors"
            >
              <div className="font-display text-2xl font-bold">{p.qty}</div>
              <div className="text-xs text-muted-foreground">reactions</div>
              <div className="text-sm font-bold text-gradient mt-1">
                ${p.price.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── FAQ ───────────────────────── */

function FAQ() {
  const faqs = [
    {
      q: "Does this work for Telegram groups too?",
      a: "No — ReactionBoost is built exclusively for public Telegram channels. Group messages are not supported.",
    },
    {
      q: "How quickly do reactions appear?",
      a: "Most orders start delivering within 1–5 minutes. Larger orders are spread over time to look organic.",
    },
    {
      q: "Are reactions from real accounts?",
      a: "Yes — we use a network of real, aged Telegram accounts. No bots, no fake-looking activity.",
    },
    {
      q: "What payment do you accept?",
      a: "USDT (Tether) via our crypto payment gateway. Top up once, use it whenever.",
    },
    {
      q: "Is my channel safe?",
      a: "Absolutely. Reactions are delivered with organic timing and varied accounts so they appear natural.",
    },
    {
      q: "Is there a minimum order?",
      a: "Yes — 10 reactions minimum per order. No maximum.",
    },
  ];
  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-card/30 border-y border-border/50">
      <div className="max-w-3xl mx-auto">
        <SectionHeader
          eyebrow="FAQ"
          title="Everything you need to know"
        />
        <div className="space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-sm sm:text-base">
                {f.q}
                <span className="ml-4 flex-shrink-0 w-7 h-7 rounded-full bg-secondary text-muted-foreground group-open:bg-primary group-open:text-primary-foreground group-open:rotate-45 transition-all flex items-center justify-center text-lg leading-none">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── CTA ───────────────────────── */

function CTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-primary/30 bg-card p-8 sm:p-14 text-center shadow-[var(--shadow-glow)]">
        <div
          className="absolute inset-0 opacity-60"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative">
          <h2 className="font-display text-3xl sm:text-5xl font-black mb-4">
            Ready to <span className="text-gradient">boost</span> your channel?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8">
            Join thousands of channel owners growing engagement with ReactionBoost.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-primary text-primary-foreground font-bold animate-pulse-glow"
            >
              Get started free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Secure
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> 5-min delivery
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Real growth
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── FOOTER ───────────────────────── */

function Footer() {
  return (
    <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">
            Reaction<span className="text-gradient">Boost</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          <span>Telegram channel reactions, delivered safely.</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ReactionBoost
        </p>
      </div>
    </footer>
  );
}

/* ───────────────────────── HELPERS ───────────────────────── */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-14">
      <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
        {eyebrow}
      </div>
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
