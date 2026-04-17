// NOWPayments server helpers — runs in Worker SSR (no Node-only deps).
// Docs: https://documenter.getpostman.com/view/7907941/2s93JusNJt

const NP_BASE = "https://api.nowpayments.io/v1";

export function getNowPaymentsApiKey(): string {
  const key = process.env.NOWPAYMENTS_API_KEY;
  if (!key) throw new Error("NOWPAYMENTS_API_KEY is not configured");
  return key;
}

export function getNowPaymentsIpnSecret(): string {
  const s = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!s) throw new Error("NOWPAYMENTS_IPN_SECRET is not configured");
  return s;
}

export interface CreateInvoiceArgs {
  priceAmount: number;
  orderId: string;
  orderDescription: string;
  ipnCallbackUrl: string;
  successUrl: string;
  cancelUrl: string;
}

export interface NpInvoice {
  id: string;
  invoice_url: string;
  order_id: string;
  price_amount: string;
  price_currency: string;
  pay_currency: string | null;
}

export async function createInvoice(args: CreateInvoiceArgs): Promise<NpInvoice> {
  const res = await fetch(`${NP_BASE}/invoice`, {
    method: "POST",
    headers: {
      "x-api-key": getNowPaymentsApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: args.priceAmount,
      price_currency: "usd",
      pay_currency: "usdttrc20",
      order_id: args.orderId,
      order_description: args.orderDescription,
      ipn_callback_url: args.ipnCallbackUrl,
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NOWPayments invoice failed: ${res.status} ${text}`);
  }
  return (await res.json()) as NpInvoice;
}

// Sort keys recursively (NOWPayments IPN signature requires sorted JSON)
function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[k] = sortObject((value as Record<string, unknown>)[k]);
    }
    return sorted;
  }
  return value;
}

// Verify HMAC-SHA512 signature using Web Crypto API (Worker-compatible).
export async function verifyIpnSignature(
  rawBody: string,
  signatureHeader: string | null,
): Promise<boolean> {
  if (!signatureHeader) return false;
  const secret = getNowPaymentsIpnSecret();

  let parsed: unknown;
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
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(sortedJson));
  const hex = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.toLowerCase() === signatureHeader.toLowerCase();
}
