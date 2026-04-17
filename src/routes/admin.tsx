import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Sparkles, Users, DollarSign, Package, Loader2, ArrowLeft,
} from "lucide-react";
import { supabaseUntyped as supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — ReactionBoost" }] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "users" | "tx">("orders");
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/login" }); return; }

      const { data: roleData } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", session.user.id).eq("role", "admin").maybeSingle();

      if (!roleData) {
        toast.error("Access denied. Admin only.");
        navigate({ to: "/dashboard" });
        return;
      }

      await loadData();
      setLoading(false);
    };
    init();
  }, [navigate]);

  const loadData = async () => {
    const [u, o, t] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    if (u.data) setUsers(u.data);
    if (o.data) setOrders(o.data);
    if (t.data) setTxs(t.data);
  };

  const adjustBalance = async (userId: string, currentBalance: number) => {
    const input = prompt("Adjust balance by (USDT, can be negative):", "10");
    if (!input) return;
    const delta = parseFloat(input);
    if (isNaN(delta)) { toast.error("Invalid number"); return; }
    const newBal = currentBalance + delta;
    const { error } = await supabase
      .from("profiles").update({ balance_usdt: newBal }).eq("id", userId);
    if (error) { toast.error(error.message); return; }
    await supabase.from("transactions").insert({
      user_id: userId, type: "admin_adjust", amount_usdt: delta, reference: "manual",
    });
    toast.success("Balance updated");
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalRevenue = orders.reduce((s, o) => s + Number(o.cost_usdt ?? 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-extrabold">Admin <span className="text-gradient">Panel</span></span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Stat label="Users" value={users.length} />
          <Stat label="Orders" value={orders.length} />
          <Stat label="Pending" value={orders.filter(o => o.status === "pending").length} accent="warning" />
          <Stat label="Revenue" value={`$${totalRevenue.toFixed(2)}`} accent="primary" />
        </div>

        <div className="flex gap-2 mb-6 border-b border-border pb-4 overflow-x-auto">
          {[
            { id: "orders" as const, label: "Orders", icon: <Package className="w-4 h-4" /> },
            { id: "users" as const, label: "Users", icon: <Users className="w-4 h-4" /> },
            { id: "tx" as const, label: "Transactions", icon: <DollarSign className="w-4 h-4" /> },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeTab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {activeTab === "orders" && (
          <div className="space-y-3">
            {orders.length === 0 ? <Empty msg="No orders yet." /> : orders.map(o => (
              <div key={o.id} className="p-4 rounded-xl bg-card border border-border">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <a href={o.message_link} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate block">{o.message_link}</a>
                    <div className="text-xs text-muted-foreground mt-1">
                      {o.total_reactions} reactions • ${Number(o.cost_usdt).toFixed(2)} • {new Date(o.created_at).toLocaleString()}
                    </div>
                    {o.bot_response && (
                      <pre className="text-xs text-muted-foreground mt-2 bg-secondary/50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(o.bot_response, null, 2)}
                      </pre>
                    )}
                  </div>
                  <StatusPill status={o.status} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="p-4 rounded-xl bg-card border border-border flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-medium text-sm">{u.email || u.id}</div>
                  <div className="text-xs text-muted-foreground">Joined {new Date(u.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-sm font-semibold text-primary">${Number(u.balance_usdt).toFixed(2)}</div>
                <button onClick={() => adjustBalance(u.id, Number(u.balance_usdt))}
                  className="px-3 py-1.5 rounded-md bg-secondary text-xs font-semibold hover:bg-secondary/80">
                  Adjust
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "tx" && (
          <div className="space-y-2">
            {txs.length === 0 ? <Empty msg="No transactions yet." /> : txs.map(t => (
              <div key={t.id} className="p-3 rounded-lg bg-card border border-border flex items-center gap-3 text-sm">
                <span className="px-2 py-0.5 rounded bg-secondary text-xs">{t.type}</span>
                <span className={`font-semibold ${Number(t.amount_usdt) >= 0 ? "text-success" : "text-destructive"}`}>
                  {Number(t.amount_usdt) >= 0 ? "+" : ""}{Number(t.amount_usdt).toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground flex-1 truncate">{t.user_id}</span>
                <span className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: any; accent?: "primary" | "warning" }) {
  const cls = accent === "primary" ? "text-primary" : accent === "warning" ? "text-warning" : "";
  return (
    <div className="p-5 rounded-2xl bg-card border border-border">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-2xl font-bold ${cls}`}>{value}</div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <p className="text-center text-muted-foreground py-12">{msg}</p>;
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "completed" ? "bg-success/10 text-success" :
    status === "processing" ? "bg-warning/10 text-warning" :
    status === "failed" ? "bg-destructive/10 text-destructive" :
    "bg-primary/10 text-primary";
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
}
