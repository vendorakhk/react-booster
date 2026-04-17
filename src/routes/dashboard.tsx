import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Sparkles, LogOut, DollarSign, Plus, History, Send,
  ExternalLink, Loader2,
} from "lucide-react";
import { supabaseUntyped as supabase } from "@/integrations/supabase/client";
import { ensureUserProfile } from "@/integrations/supabase/profile";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ReactionBoost" },
    ],
  }),
  component: DashboardPage,
});

// Available reactions
const AVAILABLE_REACTIONS = [
  { emoji: "👍", name: "Thumbs Up" },
  { emoji: "❤️", name: "Heart" },
  { emoji: "🔥", name: "Fire" },
  { emoji: "⚡️", name: "Lightning" },
  { emoji: "😍", name: "Heart Eyes" },
  { emoji: "🎉", name: "Party" },
  { emoji: "👏", name: "Clap" },
  { emoji: "🤔", name: "Thinking" },
];

const PRICE_PER_REACTION = 0.01;

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"order" | "history" | "deposit">("order");

  // Order form state
  const [messageLink, setMessageLink] = useState("");
  const [totalReactions, setTotalReactions] = useState(100);
  const [selectedReactions, setSelectedReactions] = useState<Record<string, number>>({
    "👍": 70,
    "❤️": 15,
    "🔥": 10,
    "⚡️": 5,
  });
  const [submitting, setSubmitting] = useState(false);

  // Deposit form state
  const [depositAmount, setDepositAmount] = useState<number>(20);
  const [depositLoading, setDepositLoading] = useState(false);
  const [deposits, setDeposits] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate({ to: "/login" });
          return;
        }

        setUser(session.user);
        await ensureUserProfile(session);

        const { data: profile } = await supabase
          .from("profiles")
          .select("balance_usdt")
          .eq("id", session.user.id)
          .maybeSingle();
        if (profile) setBalance(Number(profile.balance_usdt) || 0);

        const { data: orderData } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
        if (orderData) setOrders(orderData);

        const { data: depData } = await supabase
          .from("deposits")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(10);
        if (depData) setDeposits(depData);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      if (!session) navigate({ to: "/login" });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const totalPercentage = Object.values(selectedReactions).reduce((a, b) => a + b, 0);
  const totalCost = totalReactions * PRICE_PER_REACTION;

  const toggleReaction = (emoji: string) => {
    setSelectedReactions((prev) => {
      if (prev[emoji] !== undefined) {
        const { [emoji]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [emoji]: 0 };
    });
  };

  const updatePercentage = (emoji: string, value: number) => {
    setSelectedReactions((prev) => ({ ...prev, [emoji]: Math.max(0, Math.min(100, value)) }));
  };

  const handleSubmitOrder = async () => {
    if (!messageLink.trim()) {
      toast.error("Please enter a channel post link");
      return;
    }
    // Channel-only validation: must match https://t.me/<username>/<msgId>
    // and NOT be a private group/chat link (t.me/c/, t.me/+, t.me/joinchat)
    const link = messageLink.trim();
    const channelPattern = /^https?:\/\/t\.me\/(?!c\/|\+|joinchat\/)[A-Za-z0-9_]{4,}\/\d+/;
    if (!channelPattern.test(link)) {
      toast.error("Only public Telegram channel links are supported (e.g. https://t.me/yourchannel/123)");
      return;
    }
    if (totalPercentage !== 100) {
      toast.error(`Reaction percentages must total 100% (currently ${totalPercentage}%)`);
      return;
    }
    if (totalReactions < 10) {
      toast.error("Minimum 10 reactions required");
      return;
    }
    if (totalCost > balance) {
      toast.error("Insufficient balance. Please deposit USDT first.");
      return;
    }

    setSubmitting(true);
    try {
      // Atomic: debits balance + creates order + writes transaction
      const { error } = await supabase.rpc("place_order", {
        _message_link: messageLink.trim(),
        _total: totalReactions,
        _config: selectedReactions,
        _cost: totalCost,
      });
      if (error) throw error;

      setBalance((prev) => prev - totalCost);
      setMessageLink("");
      toast.success("Order placed! Reactions are being delivered.");

      // Refresh orders
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (orderData) setOrders(orderData);
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || depositAmount < 5) {
      toast.error("Minimum deposit is $5");
      return;
    }
    setDepositLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/deposits/create", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: depositAmount }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create invoice");

      window.open(json.invoiceUrl, "_blank", "noopener,noreferrer");
      toast.success("Invoice created. Complete payment in the new tab.");

      const { data: depData } = await supabase
        .from("deposits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (depData) setDeposits(depData);
    } catch (err: any) {
      toast.error(err.message || "Failed to start deposit");
    } finally {
      setDepositLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-[0_0_16px_var(--glow-primary)]">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-extrabold">
              Reaction<span className="text-gradient">Boost</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-semibold">
              <DollarSign className="w-4 h-4" />
              ${balance.toFixed(2)}
            </div>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-black">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {user?.email}
          </p>
        </div>

        {/* Balance card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="text-sm text-muted-foreground mb-1">Balance</div>
            <div className="text-3xl font-bold text-primary">${balance.toFixed(2)}</div>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="text-sm text-muted-foreground mb-1">Total Orders</div>
            <div className="text-3xl font-bold">{orders.length}</div>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="text-sm text-muted-foreground mb-1">Total Reactions</div>
            <div className="text-3xl font-bold">
              {orders.reduce((sum, o) => sum + (o.total_reactions || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border pb-4">
          {[
            { id: "order" as const, label: "New Order", icon: <Plus className="w-4 h-4" /> },
            { id: "history" as const, label: "Order History", icon: <History className="w-4 h-4" /> },
            { id: "deposit" as const, label: "Deposit USDT", icon: <DollarSign className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "order" && (
          <div className="max-w-2xl space-y-6">
            {/* Message link */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Telegram Message Link</label>
              <input
                type="url"
                value={messageLink}
                onChange={(e) => setMessageLink(e.target.value)}
                placeholder="https://t.me/channelname/123"
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Right-click a message → Copy Message Link
              </p>
            </div>

            {/* Total reactions */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Total Reactions</label>
              <input
                type="number"
                value={totalReactions}
                onChange={(e) => setTotalReactions(Math.max(10, parseInt(e.target.value) || 10))}
                min={10}
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Reaction selection */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Select Reactions & Set Percentages
                <span className={`ml-2 text-xs ${totalPercentage === 100 ? "text-success" : "text-destructive"}`}>
                  ({totalPercentage}% / 100%)
                </span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {AVAILABLE_REACTIONS.map((r) => (
                  <button
                    key={r.emoji}
                    onClick={() => toggleReaction(r.emoji)}
                    className={`p-3 rounded-xl border text-center transition-colors ${
                      selectedReactions[r.emoji] !== undefined
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <span className="text-2xl">{r.emoji}</span>
                    <div className="text-xs mt-1">{r.name}</div>
                  </button>
                ))}
              </div>

              {/* Percentage sliders */}
              <div className="space-y-3">
                {Object.entries(selectedReactions).map(([emoji, pct]) => (
                  <div key={emoji} className="flex items-center gap-4">
                    <span className="text-2xl w-10">{emoji}</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={pct}
                      onChange={(e) => updatePercentage(emoji, parseInt(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <input
                      type="number"
                      value={pct}
                      onChange={(e) => updatePercentage(emoji, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 rounded-md bg-input border border-border text-center text-sm"
                    />
                    <span className="text-xs text-muted-foreground w-8">%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost summary */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reactions</span>
                <span>{totalReactions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per reaction</span>
                <span>${PRICE_PER_REACTION}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span>Total Cost</span>
                <span className="text-primary">${totalCost.toFixed(2)}</span>
              </div>
              {totalCost > balance && (
                <p className="text-xs text-destructive">
                  Insufficient balance. You need ${(totalCost - balance).toFixed(2)} more.
                </p>
              )}
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={submitting || totalPercentage !== 100 || totalCost > balance}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Place Order — ${totalCost.toFixed(2)}
            </button>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No orders yet. Place your first order!</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <a
                        href={order.message_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate flex items-center gap-1"
                      >
                        {order.message_link}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{order.total_reactions} reactions</span>
                      <span>•</span>
                      <span>${Number(order.cost_usdt ?? 0).toFixed(2)}</span>
                      <span>•</span>
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    {order.reaction_config && (
                      <div className="flex gap-2 mt-2">
                        {Object.entries(order.reaction_config as Record<string, number>).map(([emoji, pct]) => (
                          <span key={emoji} className="text-xs bg-secondary px-2 py-0.5 rounded-md">
                            {emoji} {pct}%
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "completed"
                        ? "bg-success/10 text-success"
                        : order.status === "processing"
                        ? "bg-warning/10 text-warning"
                        : order.status === "failed"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {order.status}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "deposit" && (
          <div className="max-w-lg space-y-6">
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-black">Deposit USDT</h3>
                  <p className="text-xs text-muted-foreground">Powered by NOWPayments · USDT (TRC20)</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary/50 border border-border mb-5">
                <p className="text-xs text-muted-foreground mb-1">Current balance</p>
                <p className="text-2xl font-bold text-primary">${balance.toFixed(2)}</p>
              </div>

              <label className="block text-sm font-medium mb-1.5">Amount (USD)</label>
              <input
                type="number"
                min={5}
                step={1}
                value={depositAmount}
                onChange={(e) => setDepositAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-3"
              />
              <div className="flex gap-2 mb-5">
                {[10, 25, 50, 100, 250].map((v) => (
                  <button
                    key={v}
                    onClick={() => setDepositAmount(v)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary transition-colors"
                  >
                    ${v}
                  </button>
                ))}
              </div>

              <button
                onClick={handleDeposit}
                disabled={depositLoading || depositAmount < 5}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {depositLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                {depositLoading ? "Creating invoice..." : `Pay $${depositAmount.toFixed(2)} with USDT`}
              </button>

              <p className="text-xs text-muted-foreground mt-3 text-center">
                You'll be redirected to NOWPayments to complete payment. Your balance updates automatically once the transaction confirms on-chain.
              </p>
            </div>

            {deposits.length > 0 && (
              <div className="p-5 rounded-2xl bg-card border border-border">
                <h4 className="text-sm font-bold mb-3">Recent Deposits</h4>
                <div className="space-y-2">
                  {deposits.map((d) => (
                    <div key={d.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                      <div>
                        <div className="font-medium">${Number(d.amount_usdt).toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(d.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-md ${
                          d.status === "finished" || d.status === "confirmed"
                            ? "bg-success/10 text-success"
                            : d.status === "failed" || d.status === "expired"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-warning/10 text-warning"
                        }`}>
                          {d.status}
                        </span>
                        {d.invoice_url && (d.status === "waiting" || d.status === "confirming") && (
                          <a href={d.invoice_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                            Pay <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
