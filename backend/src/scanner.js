import { db, broadcast } from "./index.js";

export async function scanDexScreener() {
  try {
    const res = await fetch("https://api.dexscreener.com/latest/dex/search?q=solana");
    const data = await res.json();
    const pairs = data.pairs || [];
    let count = 0;
    for (const p of pairs.slice(0, 20)) {
      if (p.chainId !== "solana") continue;
      db.prepare("INSERT OR REPLACE INTO tokens (mint,symbol,name,price,liquidity,updated_at) VALUES (?,?,?,?,?,?)")
        .run(p.baseToken?.address, p.baseToken?.symbol, p.baseToken?.name, parseFloat(p.priceUsd || 0), parseFloat(p.liquidity?.usd || 0), new Date().toISOString());
      count++;
    }
    broadcast({ type: "scan", source: "dexscreener", count });
    return count;
  } catch (e) {
    console.error("scan error", e.message);
    return 0;
  }
}
EOF