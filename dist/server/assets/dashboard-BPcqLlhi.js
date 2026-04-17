import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2, Sparkles, DollarSign, LogOut, Plus, History, Send, ExternalLink } from "lucide-react";
import { s as supabaseUntyped } from "./client-Cm5qj9sr.js";
import { e as ensureUserProfile } from "./profile-_EUS1hwE.js";
import { toast } from "sonner";
import "@supabase/supabase-js";
const AVAILABLE_REACTIONS = [{
  emoji: "👍",
  name: "Thumbs Up"
}, {
  emoji: "❤️",
  name: "Heart"
}, {
  emoji: "🔥",
  name: "Fire"
}, {
  emoji: "⚡️",
  name: "Lightning"
}, {
  emoji: "😍",
  name: "Heart Eyes"
}, {
  emoji: "🎉",
  name: "Party"
}, {
  emoji: "👏",
  name: "Clap"
}, {
  emoji: "🤔",
  name: "Thinking"
}];
const PRICE_PER_REACTION = 0.01;
function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("order");
  const [messageLink, setMessageLink] = useState("");
  const [totalReactions, setTotalReactions] = useState(100);
  const [selectedReactions, setSelectedReactions] = useState({
    "👍": 70,
    "❤️": 15,
    "🔥": 10,
    "⚡️": 5
  });
  const [submitting, setSubmitting] = useState(false);
  const [depositAmount, setDepositAmount] = useState(20);
  const [depositLoading, setDepositLoading] = useState(false);
  const [deposits, setDeposits] = useState([]);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: {
            session
          }
        } = await supabaseUntyped.auth.getSession();
        if (!session) {
          navigate({
            to: "/login"
          });
          return;
        }
        setUser(session.user);
        await ensureUserProfile(session);
        const {
          data: profile
        } = await supabaseUntyped.from("profiles").select("balance_usdt").eq("id", session.user.id).maybeSingle();
        if (profile) setBalance(Number(profile.balance_usdt) || 0);
        const {
          data: orderData
        } = await supabaseUntyped.from("orders").select("*").eq("user_id", session.user.id).order("created_at", {
          ascending: false
        });
        if (orderData) setOrders(orderData);
        const {
          data: depData
        } = await supabaseUntyped.from("deposits").select("*").eq("user_id", session.user.id).order("created_at", {
          ascending: false
        }).limit(10);
        if (depData) setDeposits(depData);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
    const {
      data: {
        subscription
      }
    } = supabaseUntyped.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate({
        to: "/login"
      });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleLogout = async () => {
    await supabaseUntyped.auth.signOut();
    navigate({
      to: "/"
    });
  };
  const totalPercentage = Object.values(selectedReactions).reduce((a, b) => a + b, 0);
  const totalCost = totalReactions * PRICE_PER_REACTION;
  const toggleReaction = (emoji) => {
    setSelectedReactions((prev) => {
      if (prev[emoji] !== void 0) {
        const {
          [emoji]: _,
          ...rest
        } = prev;
        return rest;
      }
      return {
        ...prev,
        [emoji]: 0
      };
    });
  };
  const updatePercentage = (emoji, value) => {
    setSelectedReactions((prev) => ({
      ...prev,
      [emoji]: Math.max(0, Math.min(100, value))
    }));
  };
  const handleSubmitOrder = async () => {
    if (!messageLink.trim()) {
      toast.error("Please enter a channel post link");
      return;
    }
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
      const {
        error
      } = await supabaseUntyped.rpc("place_order", {
        _message_link: messageLink.trim(),
        _total: totalReactions,
        _config: selectedReactions,
        _cost: totalCost
      });
      if (error) throw error;
      setBalance((prev) => prev - totalCost);
      setMessageLink("");
      toast.success("Order placed! Reactions are being delivered.");
      const {
        data: orderData
      } = await supabaseUntyped.from("orders").select("*").eq("user_id", user.id).order("created_at", {
        ascending: false
      });
      if (orderData) setOrders(orderData);
    } catch (err) {
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
      const {
        data: {
          session
        }
      } = await supabaseUntyped.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");
      const res = await fetch("/api/deposits/create", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: depositAmount
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create invoice");
      window.open(json.invoiceUrl, "_blank", "noopener,noreferrer");
      toast.success("Invoice created. Complete payment in the new tab.");
      const {
        data: depData
      } = await supabaseUntyped.from("deposits").select("*").eq("user_id", user.id).order("created_at", {
        ascending: false
      }).limit(10);
      if (depData) setDeposits(depData);
    } catch (err) {
      toast.error(err.message || "Failed to start deposit");
    } finally {
      setDepositLoading(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-[0_0_16px_var(--glow-primary)]", children: /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-primary-foreground" }) }),
        /* @__PURE__ */ jsxs("span", { className: "font-display font-extrabold", children: [
          "Reaction",
          /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Boost" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-semibold", children: [
          /* @__PURE__ */ jsx(DollarSign, { className: "w-4 h-4" }),
          "$",
          balance.toFixed(2)
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: handleLogout, className: "text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsx(LogOut, { className: "w-5 h-5" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsx("h1", { className: "font-display text-3xl font-black", children: "Dashboard" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mt-1", children: user?.email })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-2xl bg-card border border-border", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground mb-1", children: "Balance" }),
          /* @__PURE__ */ jsxs("div", { className: "text-3xl font-bold text-primary", children: [
            "$",
            balance.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-2xl bg-card border border-border", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground mb-1", children: "Total Orders" }),
          /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold", children: orders.length })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-2xl bg-card border border-border", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground mb-1", children: "Total Reactions" }),
          /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold", children: orders.reduce((sum, o) => sum + (o.total_reactions || 0), 0).toLocaleString() })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2 mb-6 border-b border-border pb-4", children: [{
        id: "order",
        label: "New Order",
        icon: /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" })
      }, {
        id: "history",
        label: "Order History",
        icon: /* @__PURE__ */ jsx(History, { className: "w-4 h-4" })
      }, {
        id: "deposit",
        label: "Deposit USDT",
        icon: /* @__PURE__ */ jsx(DollarSign, { className: "w-4 h-4" })
      }].map((tab) => /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`, children: [
        tab.icon,
        tab.label
      ] }, tab.id)) }),
      activeTab === "order" && /* @__PURE__ */ jsxs("div", { className: "max-w-2xl space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1.5", children: "Telegram Message Link" }),
          /* @__PURE__ */ jsx("input", { type: "url", value: messageLink, onChange: (e) => setMessageLink(e.target.value), placeholder: "https://t.me/channelname/123", className: "w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Right-click a message → Copy Message Link" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1.5", children: "Total Reactions" }),
          /* @__PURE__ */ jsx("input", { type: "number", value: totalReactions, onChange: (e) => setTotalReactions(Math.max(10, parseInt(e.target.value) || 10)), min: 10, className: "w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium mb-3", children: [
            "Select Reactions & Set Percentages",
            /* @__PURE__ */ jsxs("span", { className: `ml-2 text-xs ${totalPercentage === 100 ? "text-success" : "text-destructive"}`, children: [
              "(",
              totalPercentage,
              "% / 100%)"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4", children: AVAILABLE_REACTIONS.map((r) => /* @__PURE__ */ jsxs("button", { onClick: () => toggleReaction(r.emoji), className: `p-3 rounded-xl border text-center transition-colors ${selectedReactions[r.emoji] !== void 0 ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/30"}`, children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl", children: r.emoji }),
            /* @__PURE__ */ jsx("div", { className: "text-xs mt-1", children: r.name })
          ] }, r.emoji)) }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Object.entries(selectedReactions).map(([emoji, pct]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl w-10", children: emoji }),
            /* @__PURE__ */ jsx("input", { type: "range", min: 0, max: 100, value: pct, onChange: (e) => updatePercentage(emoji, parseInt(e.target.value)), className: "flex-1 accent-primary" }),
            /* @__PURE__ */ jsx("input", { type: "number", value: pct, onChange: (e) => updatePercentage(emoji, parseInt(e.target.value) || 0), className: "w-16 px-2 py-1 rounded-md bg-input border border-border text-center text-sm" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground w-8", children: "%" })
          ] }, emoji)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-card border border-border space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Reactions" }),
            /* @__PURE__ */ jsx("span", { children: totalReactions.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Price per reaction" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "$",
              PRICE_PER_REACTION
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-t border-border pt-2 flex justify-between font-bold", children: [
            /* @__PURE__ */ jsx("span", { children: "Total Cost" }),
            /* @__PURE__ */ jsxs("span", { className: "text-primary", children: [
              "$",
              totalCost.toFixed(2)
            ] })
          ] }),
          totalCost > balance && /* @__PURE__ */ jsxs("p", { className: "text-xs text-destructive", children: [
            "Insufficient balance. You need $",
            (totalCost - balance).toFixed(2),
            " more."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: handleSubmitOrder, disabled: submitting || totalPercentage !== 100 || totalCost > balance, className: "w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50", children: [
          submitting ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
          "Place Order — $",
          totalCost.toFixed(2)
        ] })
      ] }),
      activeTab === "history" && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: orders.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(History, { className: "w-12 h-12 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsx("p", { children: "No orders yet. Place your first order!" })
      ] }) : orders.map((order) => /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row sm:items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-1", children: /* @__PURE__ */ jsxs("a", { href: order.message_link, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-primary hover:underline truncate flex items-center gap-1", children: [
            order.message_link,
            /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3 flex-shrink-0" })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              order.total_reactions,
              " reactions"
            ] }),
            /* @__PURE__ */ jsx("span", { children: "•" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "$",
              Number(order.cost_usdt ?? 0).toFixed(2)
            ] }),
            /* @__PURE__ */ jsx("span", { children: "•" }),
            /* @__PURE__ */ jsx("span", { children: new Date(order.created_at).toLocaleDateString() })
          ] }),
          order.reaction_config && /* @__PURE__ */ jsx("div", { className: "flex gap-2 mt-2", children: Object.entries(order.reaction_config).map(([emoji, pct]) => /* @__PURE__ */ jsxs("span", { className: "text-xs bg-secondary px-2 py-0.5 rounded-md", children: [
            emoji,
            " ",
            pct,
            "%"
          ] }, emoji)) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: `px-3 py-1 rounded-full text-xs font-medium ${order.status === "completed" ? "bg-success/10 text-success" : order.status === "processing" ? "bg-warning/10 text-warning" : order.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`, children: order.status })
      ] }, order.id)) }),
      activeTab === "deposit" && /* @__PURE__ */ jsxs("div", { className: "max-w-lg space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-2xl bg-card border border-border", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(DollarSign, { className: "w-5 h-5 text-primary" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-display text-xl font-black", children: "Deposit USDT" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Powered by NOWPayments · USDT (TRC20)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-secondary/50 border border-border mb-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Current balance" }),
            /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-primary", children: [
              "$",
              balance.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1.5", children: "Amount (USD)" }),
          /* @__PURE__ */ jsx("input", { type: "number", min: 5, step: 1, value: depositAmount, onChange: (e) => setDepositAmount(Math.max(0, parseFloat(e.target.value) || 0)), className: "w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-3" }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-2 mb-5", children: [10, 25, 50, 100, 250].map((v) => /* @__PURE__ */ jsxs("button", { onClick: () => setDepositAmount(v), className: "flex-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary transition-colors", children: [
            "$",
            v
          ] }, v)) }),
          /* @__PURE__ */ jsxs("button", { onClick: handleDeposit, disabled: depositLoading || depositAmount < 5, className: "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50", children: [
            depositLoading ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(DollarSign, { className: "w-4 h-4" }),
            depositLoading ? "Creating invoice..." : `Pay $${depositAmount.toFixed(2)} with USDT`
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-3 text-center", children: "You'll be redirected to NOWPayments to complete payment. Your balance updates automatically once the transaction confirms on-chain." })
        ] }),
        deposits.length > 0 && /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-2xl bg-card border border-border", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold mb-3", children: "Recent Deposits" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: deposits.map((d) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm py-2 border-b border-border last:border-0", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "font-medium", children: [
                "$",
                Number(d.amount_usdt).toFixed(2)
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: new Date(d.created_at).toLocaleString() })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: `text-xs px-2 py-0.5 rounded-md ${d.status === "finished" || d.status === "confirmed" ? "bg-success/10 text-success" : d.status === "failed" || d.status === "expired" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`, children: d.status }),
              d.invoice_url && (d.status === "waiting" || d.status === "confirming") && /* @__PURE__ */ jsxs("a", { href: d.invoice_url, target: "_blank", rel: "noopener noreferrer", className: "text-primary hover:underline text-xs flex items-center gap-1", children: [
                "Pay ",
                /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" })
              ] })
            ] })
          ] }, d.id)) })
        ] })
      ] })
    ] })
  ] });
}
export {
  DashboardPage as component
};
