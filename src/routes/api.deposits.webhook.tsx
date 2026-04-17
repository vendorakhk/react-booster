import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyIpnSignature } from "@/server/nowpayments";

// NOWPayments IPN webhook — verifies HMAC-SHA512 then credits balance atomically.
export const Route = createFileRoute("/api/deposits/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const sig = request.headers.get("x-nowpayments-sig");

        const valid = await verifyIpnSignature(raw, sig).catch(() => false);
        if (!valid) {
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }

        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        const orderId = String(payload.order_id ?? "");
        const paymentId =
          payload.payment_id != null ? String(payload.payment_id) : null;
        const status = String(payload.payment_status ?? "");
        if (!orderId || !status) {
          return new Response("Missing fields", { status: 400 });
        }

        const { error } = await supabaseAdmin.rpc("credit_deposit" as never, {
          _np_order_id: orderId,
          _np_payment_id: paymentId,
          _final_status: status,
          _raw: payload,
        } as never);

        if (error) {
          // Log and return 500 so NOWPayments retries
          console.error("credit_deposit error", error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
