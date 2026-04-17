import { jsx, jsxs } from "react/jsx-runtime";
import { createRootRoute, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { createClient } from "@supabase/supabase-js";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, a as getRequest, c as createServerFn } from "../server.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router/ssr/server";
var createMiddleware = (options, __opts) => {
  const resolvedOptions = {
    type: "request",
    ...__opts || options
  };
  return {
    options: resolvedOptions,
    middleware: (middleware) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { middleware }));
    },
    inputValidator: (inputValidator) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { inputValidator }));
    },
    client: (client) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { client }));
    },
    server: (server) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { server }));
    }
  };
};
const Route$7 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ReactionBoost — Boost Telegram Channel Reactions Instantly" },
      {
        name: "description",
        content: "Buy real Telegram channel reactions and likes. Choose emojis, set percentages, pay with USDT. Delivered in minutes."
      }
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com"
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap"
      }
    ]
  }),
  component: RootComponent,
  notFoundComponent: () => /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold mb-4", children: "404" }),
    /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-8", children: "Page not found" }),
    /* @__PURE__ */ jsx("a", { href: "/", className: "text-primary hover:underline", children: "Go Home" })
  ] }) }) })
});
function RootComponent() {
  return /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", className: "dark", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { className: "min-h-screen antialiased", children: [
      children,
      /* @__PURE__ */ jsx(Toaster, { richColors: true, position: "top-right" }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$4 = () => import("./signup-D5zTU_ch.js");
const Route$6 = createFileRoute("/signup")({
  head: () => ({
    meta: [{
      title: "Sign Up — ReactionBoost"
    }, {
      name: "description",
      content: "Create your ReactionBoost account and start boosting."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./login-DPzl6ddv.js");
const Route$5 = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Log In — ReactionBoost"
    }, {
      name: "description",
      content: "Log in to your ReactionBoost account."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./dashboard-BPcqLlhi.js");
const Route$4 = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{
      title: "Dashboard — ReactionBoost"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./admin-D0xWyIuk.js");
const Route$3 = createFileRoute("/admin")({
  head: () => ({
    meta: [{
      title: "Admin — ReactionBoost"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-Cp9WxLA6.js");
const Route$2 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "ReactionBoost — Boost Your Telegram Channel With Real Reactions"
    }, {
      name: "description",
      content: "Get authentic reactions on your Telegram channel posts. Pick emojis, set percentages, pay with USDT. Delivered in minutes."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing Supabase server environment variables. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    );
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
let _supabaseAdmin;
const supabaseAdmin = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  }
});
function getNowPaymentsIpnSecret() {
  const s = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!s) throw new Error("NOWPAYMENTS_IPN_SECRET is not configured");
  return s;
}
function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") {
    const sorted = {};
    for (const k of Object.keys(value).sort()) {
      sorted[k] = sortObject(value[k]);
    }
    return sorted;
  }
  return value;
}
async function verifyIpnSignature(rawBody, signatureHeader) {
  if (!signatureHeader) return false;
  const secret = getNowPaymentsIpnSecret();
  let parsed;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return false;
  }
  const sortedJson = JSON.stringify(sortObject(parsed));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(sortedJson));
  const hex = Array.from(new Uint8Array(sigBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex.toLowerCase() === signatureHeader.toLowerCase();
}
const Route$1 = createFileRoute("/api/deposits/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const sig = request.headers.get("x-nowpayments-sig");
        const valid = await verifyIpnSignature(raw, sig).catch(() => false);
        if (!valid) {
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 401,
            headers: { "content-type": "application/json" }
          });
        }
        let payload;
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }
        const orderId = String(payload.order_id ?? "");
        const paymentId = payload.payment_id != null ? String(payload.payment_id) : null;
        const status = String(payload.payment_status ?? "");
        if (!orderId || !status) {
          return new Response("Missing fields", { status: 400 });
        }
        const { error } = await supabaseAdmin.rpc("credit_deposit", {
          _np_order_id: orderId,
          _np_payment_id: paymentId,
          _final_status: status,
          _raw: payload
        });
        if (error) {
          console.error("credit_deposit error", error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "content-type": "application/json" }
          });
        }
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" }
        });
      }
    }
  }
});
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      throw new Response(
        "Missing Supabase environment variables. Ensure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are set.",
        { status: 500 }
      );
    }
    const request = getRequest();
    if (!request?.headers) {
      throw new Response("Unauthorized: No request headers available", { status: 401 });
    }
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new Response("Unauthorized: No authorization header provided", { status: 401 });
    }
    if (!authHeader.startsWith("Bearer ")) {
      throw new Response("Unauthorized: Only Bearer tokens are supported", { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      throw new Response("Unauthorized: No token provided", { status: 401 });
    }
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
        auth: {
          storage: void 0,
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims) {
      throw new Response("Unauthorized: Invalid token", { status: 401 });
    }
    if (!data.claims.sub) {
      throw new Response("Unauthorized: No user ID found in token", { status: 401 });
    }
    return next({
      context: {
        supabase,
        userId: data.claims.sub,
        claims: data.claims
      }
    });
  }
);
const createDeposit = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => {
  const obj = input ?? {};
  const amount = Number(obj.amount);
  if (!Number.isFinite(amount) || amount < 5) {
    throw new Error("Minimum deposit is $5");
  }
  if (amount > 1e4) throw new Error("Maximum deposit is $10000");
  return {
    amount: Math.round(amount * 100) / 100
  };
}).handler(createSsrRpc("6a95e6350d7c9ad5a3769da505b0fcb1c50140aec902ef27f5c807e7732d244f"));
const Route = createFileRoute("/api/deposits/create")({
  server: {
    handlers: {
      POST: async ({
        request
      }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const result = await createDeposit({
            data: body,
            headers: request.headers
          });
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
              "content-type": "application/json"
            }
          });
        } catch (err) {
          const status = err instanceof Response ? err.status : 400;
          const message = err instanceof Response ? await err.text().catch(() => "Error") : err instanceof Error ? err.message : "Failed to create deposit";
          return new Response(JSON.stringify({
            error: message
          }), {
            status,
            headers: {
              "content-type": "application/json"
            }
          });
        }
      }
    }
  }
});
const SignupRoute = Route$6.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => Route$7
});
const LoginRoute = Route$5.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$7
});
const DashboardRoute = Route$4.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$7
});
const AdminRoute = Route$3.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$7
});
const IndexRoute = Route$2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$7
});
const ApiDepositsWebhookRoute = Route$1.update({
  id: "/api/deposits/webhook",
  path: "/api/deposits/webhook",
  getParentRoute: () => Route$7
});
const ApiDepositsCreateRoute = Route.update({
  id: "/api/deposits/create",
  path: "/api/deposits/create",
  getParentRoute: () => Route$7
});
const rootRouteChildren = {
  IndexRoute,
  AdminRoute,
  DashboardRoute,
  LoginRoute,
  SignupRoute,
  ApiDepositsCreateRoute,
  ApiDepositsWebhookRoute
};
const routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultErrorComponent: ({ error }) => /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen bg-background text-foreground", children: /* @__PURE__ */ jsxs("div", { className: "text-center p-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-4", children: "Something went wrong" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: error.message })
    ] }) })
  });
  return router;
}
export {
  getRouter
};
