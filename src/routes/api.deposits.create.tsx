import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createInvoice } from "@/server/nowpayments";

// Authenticated server function: creates a NOWPayments invoice + deposits row.
export const createDeposit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const obj = (input ?? {}) as { amount?: unknown };
    const amount = Number(obj.amount);
    if (!Number.isFinite(amount) || amount < 5) {
      throw new Error("Minimum deposit is $5");
    }
    if (amount > 10000) throw new Error("Maximum deposit is $10000");
    return { amount: Math.round(amount * 100) / 100 };
  })
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const req = getRequest();
    const origin =
      req?.headers.get("origin") ??
      (req ? new URL(req.url).origin : "https://example.com");
    const orderId = `dep_${userId.slice(0, 8)}_${Date.now()}`;

    const invoice = await createInvoice({
      priceAmount: data.amount,
      orderId,
      orderDescription: `ReactionBoost balance top-up $${data.amount.toFixed(2)}`,
      ipnCallbackUrl: `${origin}/api/deposits/webhook`,
      successUrl: `${origin}/dashboard?deposit=success`,
      cancelUrl: `${origin}/dashboard?deposit=cancel`,
    });

    const { error: insertErr } = await supabaseAdmin
      .from("deposits" as never)
      .insert({
        user_id: userId,
        amount_usdt: data.amount,
        np_order_id: orderId,
        np_invoice_id: invoice.id,
        invoice_url: invoice.invoice_url,
        status: "waiting",
      } as never);
    if (insertErr) throw new Error(insertErr.message);

    return { invoiceUrl: invoice.invoice_url, orderId };
  });

// Public POST route → forwards to the auth-protected server function.
export const Route = createFileRoute("/api/deposits/create")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const result = await createDeposit({
            data: body,
            headers: request.headers,
          } as never);
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (err) {
          const status = err instanceof Response ? err.status : 400;
          const message =
            err instanceof Response
              ? await err.text().catch(() => "Error")
              : err instanceof Error
              ? err.message
              : "Failed to create deposit";
          return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
