import express from "express";
import { WebSocketServer } from "ws";
import { readFileSync, writeFileSync, existsSync } from "fs";

const app = express();
app.use(express.json());

// CORS for Vercel frontend
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Simple JSON file database
const DB_FILE = "solana_hive.json";

function loadDb() {
  if (existsSync(DB_FILE)) {
    return JSON.parse(readFileSync(DB_FILE, "utf-8"));
  }
  return {
    agents: [],
    messages: [],
    events: [],
    tokens: [],
    positions: [],
    decisions: [],
    portfolio_config: { id: 1, balance: 1, max_positions: 3, max_alloc: 0.1, stop_loss: 0.15, take_profit: 0.3 },
    ledger: [],
    heartbeat: [],
    downtime: [],
    snapshots: [],
    experiment: { id: 1, start_time: new Date().toISOString() }
  };
}

function saveDb(db) {
  writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

let db = loadDb();

// Seed agents
const agents = [
  { id: "agent-219320a1-8849-418f-ade4-0af69aadf256", name: "Token Scout", role: "token_scout", status: "idle" },
  { id: "agent-5dd88929-5396-4a94-88c7-82f469e15403", name: "Rug Detector", role: "rug_detector", status: "idle" },
  { id: "agent-5e982c93-a0ff-420e-b1d6-4f6c56c265af", name: "Technical Analyst", role: "technical_analyst", status: "idle" },
  { id: "agent-8346d277-f7b4-47b6-a9fc-6ed2cb35a756", name: "Social Intelligence", role: "social_intelligence", status: "idle" },
  { id: "agent-04c58d41-56ee-49ae-8624-f921f72f03aa", name: "Strategy Analyst", role: "strategy_analyst", status: "idle" },
  { id: "agent-6d2bc89d-f7c3-4d76-96b1-e17cfd567716", name: "Risk Manager", role: "risk_manager", status: "idle" },
  { id: "agent-c63800a9-affe-4ec4-b664-c38c65b59d8f", name: "Execution Trader", role: "execution_trader", status: "idle" },
  { id: "agent-093b95cf-c497-44fd-97f7-176844749e4d", name: "Portfolio Manager", role: "portfolio_manager", status: "idle" }
];
db.agents = agents;
saveDb(db);

// Helper functions
function find(table, predicate) {
  return db[table].find(predicate);
}

function findAll(table, predicate) {
  return db[table].filter(predicate);
}

function insert(table, record) {
  db[table].push(record);
  saveDb(db);
}

function update(table, predicate, updates) {
  const idx = db[table].findIndex(predicate);
  if (idx >= 0) {
    db[table][idx] = { ...db[table][idx], ...updates };
    saveDb(db);
    return db[table][idx];
  }
  return null;
}

function remove(table, predicate) {
  const idx = db[table].findIndex(predicate);
  if (idx >= 0) {
    const removed = db[table].splice(idx, 1)[0];
    saveDb(db);
    return removed;
  }
  return null;
}

// Known SOL mint addresses (wrapped SOL, native SOL, etc.)
const SOL_MINT_ADDRESSES = new Set([
  "So11111111111111111111111111111111111111112", // Native SOL
  "mSoLzYCxHdYgdzU16g5QSh3i5K3z3K3Z3K3Z3K3Z3K3", // Marinade mSOL
  "stSOLzYCxHdYgdzU16g5QSh3i5K3z3K3Z3K3Z3K3Z3K3", // Lido stSOL
  "7dHbWX5io3YcEyYshQzFz9y8nY1K1Z5X9Y8Z7X6Y5Z4X", // BONK (often mislabeled)
  "SooEj828BSjtgTecBRkqBJ4oquc713yyFZqbCawawoN", // Another SOL variant
]);

// Token metadata cache for known tokens
const KNOWN_TOKENS = {
  "So11111111111111111111111111111111111111112": { symbol: "SOL", name: "Solana" },
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": { symbol: "USDC", name: "USD Coin" },
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": { symbol: "USDT", name: "Tether USD" },
  "7dHbWX5io3YcEyYshQzFz9y8nY1K1Z5X9Y8Z7X6Y5Z4X": { symbol: "BONK", name: "Bonk" },
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xrn6Q7y5Z4X3Y2W": { symbol: "WIF", name: "dogwifhat" },
  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFjSYbKP2w3y5Z6X7": { symbol: "JUP", name: "Jupiter" },
  "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeA7Z8Y9X0W1": { symbol: "ORCA", name: "Orca" },
  "RAYjU7N8Y9Z0X1W2V3U4T5S6R7Q8P9O0I1U2Y3T4R5": { symbol: "RAY", name: "Raydium" },
  "mSoLzYCxHdYgdzU16g5QSh3i5K3z3K3Z3K3Z3K3Z3K3": { symbol: "mSOL", name: "Marinade Staked SOL" },
  "stSOLzYCxHdYgdzU16g5QSh3i5K3z3K3Z3K3Z3K3Z3K3": { symbol: "stSOL", name: "Lido Staked SOL" },
  "SooEj828BSjtgTecBRkqBJ4oquc713yyFZqbCawawoN": { symbol: "SOL", name: "Solana" },
};

function validateMintAddress(mint) {
  if (!mint || typeof mint !== 'string') return false;
  // Solana addresses are base58 encoded, 32-44 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  if (!base58Regex.test(mint)) return false;
  
  // Reject obvious pump.fun/meme token patterns that are likely scams
  if (mint.endsWith('pump') || mint.endsWith('pumps')) return false;
  
  return true;
}

function resolveTokenMetadata(mint, symbol, name) {
  // First check known tokens
  if (KNOWN_TOKENS[mint]) {
    return KNOWN_TOKENS[mint];
  }
  
  // Check if it's a known SOL variant
  if (SOL_MINT_ADDRESSES.has(mint)) {
    return { symbol: 'SOL', name: 'Solana' };
  }
  
  // Use provided symbol/name if valid
  if (symbol && name && symbol !== 'UNKNOWN' && name !== 'Unknown') {
    // Never use SOL as fallback for unknown tokens
    if (symbol === 'SOL' && !KNOWN_TOKENS[mint] && !SOL_MINT_ADDRESSES.has(mint)) {
      return { symbol: 'UNKNOWN', name: 'Unknown Token' };
    }
    return { symbol, name };
  }
  // Never use SOL as fallback for unknown tokens
  return { symbol: 'UNKNOWN', name: 'Unknown Token' };
}

app.get("/", (req, res) => res.json({ status: "ok", service: "solana-hive-backend", time: new Date().toISOString() }));
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
app.get("/agents", (req, res) => res.json(db.agents));
app.get("/tokens", (req, res) => res.json(db.tokens));
app.get("/decisions", (req, res) => res.json(db.decisions.slice().reverse().slice(0, 200)));

app.post("/scan", async (req, res) => {
  try {
    const r = await fetch("https://api.dexscreener.com/latest/dex/search?q=solana");
    const data = await r.json();
    const pairs = (data.pairs || []).filter(p => p.chainId === "solana");
    
    // Deduplicate by mint address - keep the pair with highest liquidity
    const tokenMap = new Map();
    for (const p of pairs) {
      const mint = p.baseToken?.address;
      if (!validateMintAddress(mint)) continue;
      
      const liquidity = parseFloat(p.liquidity?.usd || 0);
      const existing = tokenMap.get(mint);
      if (!existing || liquidity > existing.liquidity) {
        const metadata = resolveTokenMetadata(mint, p.baseToken?.symbol, p.baseToken?.name);
        tokenMap.set(mint, {
          mint,
          symbol: metadata.symbol,
          name: metadata.name,
          price: parseFloat(p.priceUsd || 0),
          liquidity,
          volume24h: parseFloat(p.volume?.h24 || 0),
          priceChange24h: parseFloat(p.priceChange?.h24 || 0),
          updated_at: new Date().toISOString()
        });
      }
    }
    
    let count = 0;
    for (const record of tokenMap.values()) {
      const existing = find("tokens", t => t.mint === record.mint);
      if (existing) {
        update("tokens", t => t.mint === record.mint, record);
      } else {
        insert("tokens", record);
      }
      count++;
    }
    res.json({ scanned: count });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/analysis-cycle", (req, res) => {
  const { mint } = req.body || {};
  const token = find("tokens", t => t.mint === mint);
  if (!token) return res.status(404).json({ error: "token not found" });
  const agentNames = ["Token Scout","Rug Detector","Technical Analyst","Social Intelligence","Strategy Analyst","Risk Manager","Execution Trader","Portfolio Manager"];
  for (const a of agentNames) {
    const conf = Math.random() * 0.5 + 0.5;
    const rec = a === "Risk Manager" && Math.random() < 0.3 ? "REJECT" : "BUY";
    insert("decisions", {
      mint,
      agent: a,
      findings: `Analysis by ${a} for ${token.symbol}`,
      confidence: conf,
      recommendation: rec,
      created_at: new Date().toISOString()
    });
  }
  res.json({ ok: true, mint, agents: agentNames.length });
});

app.post("/paper-trade", (req, res) => {
  const { mint, solAmount } = req.body || {};
  const token = find("tokens", t => t.mint === mint);
  if (!token) return res.status(404).json({ error: "token not found" });
  const cfg = db.portfolio_config;
  const openCount = findAll("positions", p => p.status === "open").length;
  if (openCount >= cfg.max_positions) return res.status(400).json({ error: "max positions reached" });
  const alloc = cfg.balance * cfg.max_alloc;
  const amount = Math.min(solAmount || alloc, alloc);
  const slippage = 0.01; const fee = 0.0025;
  const execPrice = token.price * (1 + slippage);
  const qty = (amount * (1 - fee)) / execPrice;
  const positionId = Date.now();
  insert("positions", { id: positionId, mint, qty, entry_price: execPrice, sol_invested: amount, status: "open", created_at: new Date().toISOString() });
  cfg.balance -= amount;
  // Record ledger entry
  insert("ledger", { type: "trade_open", amount: -amount, balance: cfg.balance, created_at: new Date().toISOString() });
  saveDb(db);
  res.json({ ok: true, mint, qty, execPrice, fee, slippage });
});

app.post("/partial-exit", (req, res) => {
  const { positionId, qty } = req.body || {};
  const pos = find("positions", p => p.id === positionId);
  if (!pos) return res.status(404).json({ error: "position not found" });
  const token = find("tokens", t => t.mint === pos.mint);
  const exitPrice = token.price * 0.99;
  const proceeds = qty * exitPrice * (1 - 0.0025);
  update("positions", p => p.id === positionId, {
    exit_qty: (pos.exit_qty || 0) + qty,
    exit_price: exitPrice,
    status: pos.qty - qty <= 0 ? "closed" : "open"
  });
  db.portfolio_config.balance += proceeds;
  // Record ledger entry
  insert("ledger", { type: "trade_close", amount: proceeds, balance: db.portfolio_config.balance, created_at: new Date().toISOString() });
  saveDb(db);
  res.json({ ok: true, positionId, qty, exitPrice, proceeds });
});

app.post("/risk-veto", (req, res) => {
  const { mint, reason } = req.body || {};
  insert("decisions", { mint, agent: "Risk Manager", findings: reason || "veto", confidence: 0, recommendation: "REJECT", created_at: new Date().toISOString() });
  res.json({ vetoed: true, mint });
});

app.get("/portfolio", (req, res) => {
  const cfg = db.portfolio_config;
  const positions = findAll("positions", p => p.status === "open");
  
  // Calculate current position values
  const positionsWithPnl = positions.map(pos => {
    const token = find("tokens", t => t.mint === pos.mint);
    if (!token) return { ...pos, current_price: pos.entry_price, unrealized_pnl: 0, unrealized_pnl_pct: 0 };
    const currentPrice = token.price;
    const unrealized_pnl = (currentPrice - pos.entry_price) * pos.qty;
    const unrealized_pnl_pct = ((currentPrice - pos.entry_price) / pos.entry_price) * 100;
    return { ...pos, current_price: currentPrice, unrealized_pnl, unrealized_pnl_pct };
  });
  
  res.json({ config: cfg, openPositions: positionsWithPnl });
});

app.get("/score/:mint", (req, res) => {
  const token = find("tokens", t => t.mint === req.params.mint);
  if (!token) return res.status(404).json({ error: "not found" });
  const liquidityScore = Math.min(token.liquidity / 1e9, 1);
  const score = liquidityScore * 0.5 + 0.5;
  res.json({ mint: token.mint, score, breakdown: { liquidity: liquidityScore }, timestamp: new Date().toISOString() });
});

app.get("/performance", (req, res) => {
  const agentStats = {};
  for (const d of db.decisions) {
    if (!agentStats[d.agent]) agentStats[d.agent] = { total: 0, buys: 0 };
    agentStats[d.agent].total++;
    if (d.recommendation === "BUY") agentStats[d.agent].buys++;
  }
  const rows = Object.entries(agentStats).map(([agent, stats]) => ({ agent, total: stats.total, buys: stats.buys }));
  res.json(rows);
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => console.log(`SOLANA HIVE backend on :${PORT}`));
const wss = new WebSocketServer({ server });
const clients = new Set();
wss.on("connection", (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: "welcome", message: "SOLANA HIVE live" }));
  ws.on("close", () => clients.delete(ws));
});
function broadcast(msg) {
  const data = JSON.stringify(msg);
  for (const c of clients) if (c.readyState === 1) c.send(data);
}

// auto-scan
setInterval(async () => {
  try {
    const r = await fetch("https://api.dexscreener.com/latest/dex/search?q=solana");
    const data = await r.json();
    const pairs = (data.pairs || []).filter(p => p.chainId === "solana");
    
    const tokenMap = new Map();
    for (const p of pairs) {
      const mint = p.baseToken?.address;
      if (!validateMintAddress(mint)) continue;
      
      const liquidity = parseFloat(p.liquidity?.usd || 0);
      const existing = tokenMap.get(mint);
      if (!existing || liquidity > existing.liquidity) {
        const metadata = resolveTokenMetadata(mint, p.baseToken?.symbol, p.baseToken?.name);
        tokenMap.set(mint, {
          mint,
          symbol: metadata.symbol,
          name: metadata.name,
          price: parseFloat(p.priceUsd || 0),
          liquidity,
          volume24h: parseFloat(p.volume?.h24 || 0),
          priceChange24h: parseFloat(p.priceChange?.h24 || 0),
          updated_at: new Date().toISOString()
        });
      }
    }
    
    for (const record of tokenMap.values()) {
      const existing = find("tokens", t => t.mint === record.mint);
      if (existing) {
        update("tokens", t => t.mint === record.mint, record);
      } else {
        insert("tokens", record);
      }
    }
  } catch (e) { console.error("auto-scan err", e.message); }
}, 30000);

app.get("/validation/status", (req, res) => {
  const exp = db.experiment;
  const tokens = db.tokens.length;
  res.json({ start: exp.start_time, tokens, now: new Date().toISOString() });
});
app.get("/validation/report", (req, res) => {
  const tokens = db.tokens.length;
  const decisions = db.decisions.length;
  const positions = db.positions.length;
  res.json({ tokens, decisions, positions, generatedAt: new Date().toISOString() });
});
app.get("/portfolio/reconciliation", (req, res) => {
  const cfg = db.portfolio_config;
  const ledger = db.ledger;
  res.json({ balance: cfg.balance, ledger });
});
app.get("/performance/agents", (req, res) => {
  const agentStats = {};
  for (const d of db.decisions) {
    if (!agentStats[d.agent]) agentStats[d.agent] = { total: 0 };
    agentStats[d.agent].total++;
  }
  const rows = Object.entries(agentStats).map(([agent, stats]) => ({ agent, total: stats.total }));
  res.json(rows);
});
app.get("/performance/strategies", (req, res) => res.json([]));
app.post("/heartbeat", (req, res) => {
  db.heartbeat.push({ ts: new Date().toISOString() });
  saveDb(db);
  res.json({ ok: true });
});
app.get("/heartbeat", (req, res) => {
  const last = db.heartbeat.slice(-1)[0];
  res.json({ lastHeartbeat: last ? last.ts : null });
});
app.get("/uptime", (req, res) => {
  const exp = db.experiment;
  const now = new Date();
  const start = new Date(exp.start_time);
  const ms = now - start;
  res.json({ uptimeMs: ms, start: exp.start_time, now: now.toISOString() });
});
app.post("/snapshot", (req, res) => {
  const cfg = db.portfolio_config;
  const tokens = db.tokens.length;
  const positions = findAll("positions", p => p.status === "open").length;
  db.snapshots.push({ ts: new Date().toISOString(), balance: cfg.balance, tokens, positions });
  saveDb(db);
  res.json({ ok: true });
});

export { db, broadcast };