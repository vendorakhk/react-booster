import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, Sparkles, Package, Users, DollarSign } from "lucide-react";
import { s as supabaseUntyped } from "./client-Cm5qj9sr.js";
import { toast } from "sonner";
import "@supabase/supabase-js";
function AdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [txs, setTxs] = useState([]);
  useEffect(() => {
    const init = async () => {
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
      const {
        data: roleData
      } = await supabaseUntyped.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
      if (!roleData) {
        toast.error("Access denied. Admin only.");
        navigate({
          to: "/dashboard"
        });
        return;
      }
      await loadData();
      setLoading(false);
    };
    init();
  }, [navigate]);
  const loadData = async () => {
    const [u, o, t] = await Promise.all([supabaseUntyped.from("profiles").select("*").order("created_at", {
      ascending: false
    }), supabaseUntyped.from("orders").select("*").order("created_at", {
      ascending: false
    }).limit(200), supabaseUntyped.from("transactions").select("*").order("created_at", {
      ascending: false
    }).limit(200)]);
    if (u.data) setUsers(u.data);
    if (o.data) setOrders(o.data);
    if (t.data) setTxs(t.data);
  };
  const adjustBalance = async (userId, currentBalance) => {
    const input = prompt("Adjust balance by (USDT, can be negative):", "10");
    if (!input) return;
    const delta = parseFloat(input);
    if (isNaN(delta)) {
      toast.error("Invalid number");
      return;
    }
    const newBal = currentBalance + delta;
    const {
      error
    } = await supabaseUntyped.from("profiles").update({
      balance_usdt: newBal
    }).eq("id", userId);
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabaseUntyped.from("transactions").insert({
      user_id: userId,
      type: "admin_adjust",
      amount_usdt: delta,
      reference: "manual"
    });
    toast.success("Balance updated");
    loadData();
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }) });
  }
  const totalRevenue = orders.reduce((s, o) => s + Number(o.cost_usdt ?? 0), 0);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(Link, { to: "/dashboard", className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }) }),
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center", children: /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-primary-foreground" }) }),
      /* @__PURE__ */ jsxs("span", { className: "font-display font-extrabold", children: [
        "Admin ",
        /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Panel" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: [
        /* @__PURE__ */ jsx(Stat, { label: "Users", value: users.length }),
        /* @__PURE__ */ jsx(Stat, { label: "Orders", value: orders.length }),
        /* @__PURE__ */ jsx(Stat, { label: "Pending", value: orders.filter((o) => o.status === "pending").length, accent: "warning" }),
        /* @__PURE__ */ jsx(Stat, { label: "Revenue", value: `$${totalRevenue.toFixed(2)}`, accent: "primary" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2 mb-6 border-b border-border pb-4 overflow-x-auto", children: [{
        id: "orders",
        label: "Orders",
        icon: /* @__PURE__ */ jsx(Package, { className: "w-4 h-4" })
      }, {
        id: "users",
        label: "Users",
        icon: /* @__PURE__ */ jsx(Users, { className: "w-4 h-4" })
      }, {
        id: "tx",
        label: "Transactions",
        icon: /* @__PURE__ */ jsx(DollarSign, { className: "w-4 h-4" })
      }].map((t) => /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab(t.id), className: `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`, children: [
        t.icon,
        t.label
      ] }, t.id)) }),
      activeTab === "orders" && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: orders.length === 0 ? /* @__PURE__ */ jsx(Empty, { msg: "No orders yet." }) : orders.map((o) => /* @__PURE__ */ jsx("div", { className: "p-4 rounded-xl bg-card border border-border", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("a", { href: o.message_link, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-primary hover:underline truncate block", children: o.message_link }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
            o.total_reactions,
            " reactions • $",
            Number(o.cost_usdt).toFixed(2),
            " • ",
            new Date(o.created_at).toLocaleString()
          ] }),
          o.bot_response && /* @__PURE__ */ jsx("pre", { className: "text-xs text-muted-foreground mt-2 bg-secondary/50 p-2 rounded overflow-x-auto", children: JSON.stringify(o.bot_response, null, 2) })
        ] }),
        /* @__PURE__ */ jsx(StatusPill, { status: o.status })
      ] }) }, o.id)) }),
      activeTab === "users" && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: users.map((u) => /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-card border border-border flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium text-sm", children: u.email || u.id }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "Joined ",
            new Date(u.created_at).toLocaleDateString()
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm font-semibold text-primary", children: [
          "$",
          Number(u.balance_usdt).toFixed(2)
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => adjustBalance(u.id, Number(u.balance_usdt)), className: "px-3 py-1.5 rounded-md bg-secondary text-xs font-semibold hover:bg-secondary/80", children: "Adjust" })
      ] }, u.id)) }),
      activeTab === "tx" && /* @__PURE__ */ jsx("div", { className: "space-y-2", children: txs.length === 0 ? /* @__PURE__ */ jsx(Empty, { msg: "No transactions yet." }) : txs.map((t) => /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-card border border-border flex items-center gap-3 text-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded bg-secondary text-xs", children: t.type }),
        /* @__PURE__ */ jsxs("span", { className: `font-semibold ${Number(t.amount_usdt) >= 0 ? "text-success" : "text-destructive"}`, children: [
          Number(t.amount_usdt) >= 0 ? "+" : "",
          Number(t.amount_usdt).toFixed(2)
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground flex-1 truncate", children: t.user_id }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: new Date(t.created_at).toLocaleString() })
      ] }, t.id)) })
    ] })
  ] });
}
function Stat({
  label,
  value,
  accent
}) {
  const cls = accent === "primary" ? "text-primary" : accent === "warning" ? "text-warning" : "";
  return /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-2xl bg-card border border-border", children: [
    /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mb-1", children: label }),
    /* @__PURE__ */ jsx("div", { className: `text-2xl font-bold ${cls}`, children: value })
  ] });
}
function Empty({
  msg
}) {
  return /* @__PURE__ */ jsx("p", { className: "text-center text-muted-foreground py-12", children: msg });
}
function StatusPill({
  status
}) {
  const cls = status === "completed" ? "bg-success/10 text-success" : status === "processing" ? "bg-warning/10 text-warning" : status === "failed" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary";
  return /* @__PURE__ */ jsx("span", { className: `px-3 py-1 rounded-full text-xs font-medium ${cls}`, children: status });
}
export {
  AdminPage as component
};
