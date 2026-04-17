"""
ReactionBoost — Telegram Channel Reactions Worker
==================================================

Polls the Lovable Cloud (Supabase) `orders` table for orders with
status='pending', delivers reactions using the Telethon session pool
in MongoDB, then marks each order 'completed' or 'failed' with a
bot_response summary.

Balance has already been debited at order placement time (via the
`place_order` Postgres function), so this worker only needs to deliver
and report. On failure, balance is refunded automatically by inserting
a 'refund' transaction and updating the profile.

REQUIRED ENV VARS (set in Railway):
  API_ID, API_HASH                       — Telegram API
  MONGO_URI                              — MongoDB session pool
  SUPABASE_URL                           — https://<ref>.supabase.co
  SUPABASE_SERVICE_ROLE_KEY              — service-role key
  PORT                  (optional, default 8080)
  POLL_INTERVAL_SECONDS (optional, default 10)
"""

import os
import re
import json
import asyncio
import random
from datetime import datetime
from typing import List, Dict, Optional, Tuple

import certifi
import pymongo
from aiohttp import web, ClientSession
from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.tl.functions.messages import SendReactionRequest
from telethon.tl.types import ReactionEmoji
from telethon.errors import FloodWaitError, AuthKeyUnregisteredError

# ───────── CONFIG ─────────
API_ID = int(os.environ["API_ID"])
API_HASH = os.environ["API_HASH"]
MONGO_URI = os.environ["MONGO_URI"]
SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
PORT = int(os.environ.get("PORT", 8080))
POLL_INTERVAL_SECONDS = int(os.environ.get("POLL_INTERVAL_SECONDS", 10))

MAX_CONCURRENT_REACTIONS = 10
DELAY_BETWEEN_REACTIONS = (1.5, 4.0)
MAX_CONCURRENT_ORDERS = 3

CHANNEL_LINK_RE = re.compile(
    r"^https?://t\.me/(?!c/|\+|joinchat/)([A-Za-z0-9_]{4,})/(\d+)/?$"
)

# ───────── MONGO ─────────
print("📦 Connecting to MongoDB...", flush=True)
mongo_client = pymongo.MongoClient(
    MONGO_URI, tlsCAFile=certifi.where(),
    maxPoolSize=200, connectTimeoutMS=30000, serverSelectionTimeoutMS=30000,
)
db = mongo_client.get_default_database()
sessions_col = db["sessions"]
print("✅ MongoDB connected", flush=True)

# ───────── SUPABASE REST ─────────
SUPABASE_HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

async def sb_get(http, table, query=""):
    url = f"{SUPABASE_URL}/rest/v1/{table}{query}"
    async with http.get(url, headers=SUPABASE_HEADERS) as r:
        if r.status >= 400:
            raise RuntimeError(f"GET {url} → {r.status}: {await r.text()}")
        return await r.json()

async def sb_patch(http, table, query, body):
    url = f"{SUPABASE_URL}/rest/v1/{table}{query}"
    async with http.patch(url, headers=SUPABASE_HEADERS, data=json.dumps(body)) as r:
        if r.status >= 400:
            raise RuntimeError(f"PATCH {url} → {r.status}: {await r.text()}")
        return await r.json()

async def sb_post(http, table, body):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    async with http.post(url, headers=SUPABASE_HEADERS, data=json.dumps(body)) as r:
        if r.status >= 400:
            raise RuntimeError(f"POST {url} → {r.status}: {await r.text()}")
        return await r.json()

# ───────── REACTION DELIVERY ─────────
def parse_channel_link(link: str) -> Optional[Tuple[str, int]]:
    m = CHANNEL_LINK_RE.match(link.strip())
    return (m.group(1), int(m.group(2))) if m else None

def calc_distribution(total: int, percentages: Dict[str, float]) -> Dict[str, int]:
    raw = {e: total * (p / 100.0) for e, p in percentages.items()}
    floored = {e: int(v) for e, v in raw.items()}
    remainder = total - sum(floored.values())
    fracs = sorted(raw.items(), key=lambda kv: (raw[kv[0]] - floored[kv[0]]), reverse=True)
    for i in range(remainder):
        floored[fracs[i % len(fracs)][0]] += 1
    return floored

async def get_sessions(needed: int) -> List[Dict]:
    return list(sessions_col.find(
        {"session_string": {"$exists": True, "$ne": None}}
    ).limit(needed))

async def react_one(session_data, channel, msg_id, emoji) -> bool:
    s = session_data.get("session_string")
    phone = session_data.get("phone", "?")
    if not s: return False
    client = TelegramClient(StringSession(s), API_ID, API_HASH)
    try:
        await client.connect()
        if not await client.is_user_authorized(): return False
        entity = await client.get_entity(channel)
        await client(SendReactionRequest(
            peer=entity, msg_id=msg_id,
            reaction=[ReactionEmoji(emoticon=emoji)],
        ))
        print(f"  ✅ {phone} → {emoji}", flush=True)
        return True
    except FloodWaitError as e:
        print(f"  ⏳ {phone} flood {e.seconds}s", flush=True); return False
    except AuthKeyUnregisteredError:
        print(f"  ❌ {phone} unauthorized — removing", flush=True)
        sessions_col.delete_one({"_id": session_data["_id"]}); return False
    except Exception as e:
        print(f"  ⚠️ {phone}: {e}", flush=True); return False
    finally:
        try: await client.disconnect()
        except Exception: pass

async def deliver_order(order: dict) -> dict:
    oid = order["id"]
    link = order["message_link"]
    total = int(order["total_reactions"])
    config = order["reaction_config"] or {}

    parsed = parse_channel_link(link)
    if not parsed:
        return {"ok": False, "error": "Invalid channel link (only public channels)"}

    channel, msg_id = parsed
    distribution = calc_distribution(total, config)
    print(f"\n📨 Order {oid} → @{channel}/{msg_id}\n   {distribution}", flush=True)

    sessions = await get_sessions(total)
    if len(sessions) < total:
        print(f"   ⚠️ Only {len(sessions)}/{total} sessions available", flush=True)

    jobs: List[str] = []
    for emoji, count in distribution.items():
        jobs.extend([emoji] * count)
    random.shuffle(jobs)

    delivered = {e: 0 for e in distribution}
    failed = [0]
    sem = asyncio.Semaphore(MAX_CONCURRENT_REACTIONS)

    async def run(sess, emoji):
        async with sem:
            ok = await react_one(sess, channel, msg_id, emoji)
            if ok: delivered[emoji] += 1
            else: failed[0] += 1
            await asyncio.sleep(random.uniform(*DELAY_BETWEEN_REACTIONS))

    tasks = [run(sessions[i], e) for i, e in enumerate(jobs) if i < len(sessions)]
    await asyncio.gather(*tasks, return_exceptions=True)

    delivered_total = sum(delivered.values())
    return {
        "ok": delivered_total > 0,
        "delivered_total": delivered_total,
        "delivered_per_emoji": delivered,
        "failed": failed[0],
        "requested_total": total,
        "channel": channel,
        "msg_id": msg_id,
        "completed_at": datetime.utcnow().isoformat() + "Z",
    }

# ───────── ORDER LOOP ─────────
async def claim_pending(http, limit):
    pending = await sb_get(http, "orders",
        f"?status=eq.pending&order=created_at.asc&limit={limit}")
    if not pending: return []
    ids = ",".join(f'"{o["id"]}"' for o in pending)
    return await sb_patch(http, "orders",
        f"?id=in.({ids})&status=eq.pending", {"status": "processing"})

async def refund_order(http, order):
    """Refund full cost back to the user when an order fails."""
    user_id = order["user_id"]
    cost = float(order["cost_usdt"])
    # Read current balance
    rows = await sb_get(http, "profiles", f"?id=eq.{user_id}&select=balance_usdt")
    if not rows: return
    new_bal = float(rows[0]["balance_usdt"]) + cost
    await sb_patch(http, "profiles", f"?id=eq.{user_id}",
                   {"balance_usdt": new_bal})
    await sb_post(http, "transactions", {
        "user_id": user_id, "type": "refund", "amount_usdt": cost,
        "reference": order["id"],
        "metadata": {"reason": "delivery_failed", "order_id": order["id"]},
    })

async def finalize(http, order, summary):
    status = "completed" if summary.get("ok") else "failed"
    await sb_patch(http, "orders", f"?id=eq.{order['id']}",
                   {"status": status, "bot_response": summary})
    if status == "failed":
        try: await refund_order(http, order)
        except Exception as e: print(f"⚠️ refund failed: {e}", flush=True)

async def worker():
    print("🤖 ReactionBoost worker started", flush=True)
    async with ClientSession() as http:
        while True:
            try:
                orders = await claim_pending(http, MAX_CONCURRENT_ORDERS)
                if orders:
                    print(f"📥 Picked up {len(orders)} order(s)", flush=True)
                    results = await asyncio.gather(
                        *[deliver_order(o) for o in orders],
                        return_exceptions=True,
                    )
                    for o, res in zip(orders, results):
                        summary = {"ok": False, "error": str(res)} if isinstance(res, Exception) else res
                        await finalize(http, o, summary)
            except Exception as e:
                print(f"⚠️ loop error: {e}", flush=True)
            await asyncio.sleep(POLL_INTERVAL_SECONDS)

# ───────── HEALTH ─────────
async def health(_):
    return web.json_response({"status": "ok", "service": "reactionboost-worker",
                              "time": datetime.utcnow().isoformat() + "Z"})

async def start_health():
    app = web.Application()
    app.router.add_get("/", health)
    app.router.add_get("/health", health)
    runner = web.AppRunner(app); await runner.setup()
    await web.TCPSite(runner, "0.0.0.0", PORT).start()
    print(f"🌐 Health server on :{PORT}", flush=True)

async def main():
    await start_health()
    await worker()

if __name__ == "__main__":
    asyncio.run(main())
