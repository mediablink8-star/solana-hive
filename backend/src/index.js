import express from "express";
import { WebSocketServer } from "ws";
import { DatabaseSync } from "node:sqlite";

const app = express();
app.use(express.json());

const db = new DatabaseSync("solana_hive.db");
db.exec(`CREATE TABLE IF NOT EXISTS agents (id TEXT PRIMARY KEY, name TEXT, role TEXT, status TEXT)`);
db.exec(`CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, agent_id TEXT, text TEXT, created_at TEXT)`);
db.exec(`CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, payload TEXT, created_at TEXT)`);
db.exec(`CREATE TABLE IF NOT EXISTS tokens (mint TEXT PRIMARY KEY, symbol TEXT, name TEXT, price REAL, liquidity REAL, updated_at TEXT)`);
db.exec(`CREATE TABLE IF NOT EXISTS positions (id INTEGER PRIMARY KEY AUTOINCREMENT, mint TEXT, qty REAL, entry_price REAL, sol_invested REAL, status TEXT, created_at TEXT, exit_price REAL, exit_qty REAL)`);
db.exec(`CREATE TABLE IF NOT EXISTS decisions (id INTEGER PRIMARY KEY AUTOINCREMENT, mint TEXT, agent TEXT, findings TEXT, confidence REAL, recommendation TEXT, created_at TEXT)`);
db.exec(`CREATE TABLE IF NOT EXISTS portfolio_config (id INTEGER PRIMARY KEY CHECK (id=1), balance REAL, max_positions INTEGER, max_alloc REAL, stop_loss REAL, take_profit REAL)`);
db.prepare("INSERT OR IGNORE INTO portfolio_config (id,balance,max_positions,max_alloc,stop_loss,take_profit) VALUES (1,1,3,0.1,0.15,0.3)").run();
db.exec(`CREATE TABLE IF NOT EXISTS ledger (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, amount REAL, balance REAL, created_at TEXT)`);
db.exec(`CREATE TABLE IF NOT EXISTS heartbeat (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT)`);
db.exec(`CREATE TABLE IF NOT EXISTS downtime (id INTEGER PRIMARY KEY AUTOINCREMENT, start TEXT, end TEXT, reason TEXT)`);
db.exec(`CREATE TABLE IF NOT EXISTS snapshots (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT, balance REAL, tokens INTEGER, positions INTEGER)`);
db.prepare("INSERT OR IGNORE INTO experiment (id,start_time) VALUES (1,?)").run(new Date().toISOString());

// seed agents
const agents = [
 ["agent-219320a1-8849-418f-ade4-0af69aadf256","Token Scout","token_scout","idle"],
 ["agent-5dd88929-5396-4a94-88c7-82f469e15403","Rug Detector","rug_detector","idle"],
 ["agent-5e982c93-a0ff-420e-b1d6-4f6c56c265af","Technical Analyst","technical_analyst","idle"],
 ["agent-8346d277-f7b4-47b6-a9fc-6ed2cb35a756","Social Intelligence","social_intelligence","idle"],
 ["agent-04c58d41-56ee-49ae-8624-f921f72f03aa","Strategy Analyst","strategy_analyst","idle"],
 ["agent-6d2bc89d-f7c3-4d76-96b1-e17cfd567716","Risk Manager","risk_manager","idle"],
 ["agent-c63800a9-affe-4ec4-b664-c38c65b59d8f","Execution Trader","execution_trader","idle"],
 ["agent-093b95cf-c497-44fd-97f7-176844749e4d","Portfolio Manager","portfolio_manager","idle"]
];
const stmt = db.prepare("INSERT OR REPLACE INTO agents (id,name,role,status) VALUES (?,?,?,?)");
for (const a of agents) stmt.run(...a);

app.get("/", (req, res) => res.json({ status: "ok", service: "solana-hive-backend", time: new Date().toISOString() }));
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
app.get("/agents", (req, res) => res.json(db.prepare("SELECT * FROM agents").all()));
app.get("/tokens", (req, res) => res.json(db.prepare("SELECT * FROM tokens").all()));
app.get("/decisions", (req, res) => res.json(db.prepare("SELECT * FROM decisions ORDER BY id DESC LIMIT 200").all()));

app.post("/scan", async (req, res) => {
  try {
    const r = await fetch("https://api.dexscreener.com/latest/dex/search?q=solana");
    const data = await r.json();
    const pairs = (data.pairs || []).filter(p => p.chainId === "solana");
    let count = 0;
    for (const p of pairs) {
      db.prepare("INSERT OR REPLACE INTO tokens (mint,symbol,name,price,liquidity,updated_at) VALUES (?,?,?,?,?,?)")
        .run(p.baseToken?.address, p.baseToken?.symbol, p.baseToken?.name, parseFloat(p.priceUsd || 0), parseFloat(p.liquidity?.usd || 0), new Date().toISOString());
      count++;
    }
    res.json({ scanned: count });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// analysis cycle
app.post("/analysis-cycle", (req, res) => {
  const { mint } = req.body || {};
  const token = db.prepare("SELECT * FROM tokens WHERE mint=?").get(mint);
  if (!token) return res.status(404).json({ error: "token not found" });
  const agentNames = ["Token Scout","Rug Detector","Technical Analyst","Social Intelligence","Strategy Analyst","Risk Manager","Execution Trader","Portfolio Manager"];
  const recs = ["BUY","HOLD","REJECT"];
  for (const a of agentNames) {
    const conf = Math.random() * 0.5 + 0.5;
    const rec = a === "Risk Manager" && Math.random() < 0.3 ? "REJECT" : "BUY";
    db.prepare("INSERT INTO decisions (mint,agent,findings,confidence,recommendation,created_at) VALUES (?,?,?,?,?,?)")
      .run(mint, a, `Analysis by ${a} for ${token.symbol}`, conf, rec, new Date().toISOString());
  }
  res.json({ ok: true, mint, agents: agentNames.length });
});

// paper trade
app.post("/paper-trade", (req, res) => {
  const { mint, solAmount } = req.body || {};
  const token = db.prepare("SELECT * FROM tokens WHERE mint=?").get(mint);
  if (!token) return res.status(404).json({ error: "token not found" });
  const cfg = db.prepare("SELECT * FROM portfolio_config WHERE id=1").get();
  const openCount = db.prepare("SELECT COUNT(*) as c FROM positions WHERE status='open'").get().c;
  if (openCount >= cfg.max_positions) return res.status(400).json({ error: "max positions reached" });
  const alloc = cfg.balance * cfg.max_alloc;
  const amount = Math.min(solAmount || alloc, alloc);
  const slippage = 0.01; const fee = 0.0025;
  const execPrice = token.price * (1 + slippage);
  const qty = (amount * (1 - fee)) / execPrice;
  db.prepare("INSERT INTO positions (mint,qty,entry_price,sol_invested,status,created_at) VALUES (?,?,?,?,?,?)")
    .run(mint, qty, execPrice, amount, "open", new Date().toISOString());
  db.prepare("UPDATE portfolio_config SET balance=balance-? WHERE id=1").run(amount);
  res.json({ ok: true, mint, qty, execPrice, fee, slippage });
});

// partial exit
app.post("/partial-exit", (req, res) => {
  const { positionId, qty } = req.body || {};
  const pos = db.prepare("SELECT * FROM positions WHERE id=?").get(positionId);
  if (!pos) return res.status(404).json({ error: "position not found" });
  const token = db.prepare("SELECT * FROM tokens WHERE mint=?").get(pos.mint);
  const exitPrice = token.price * 0.99;
  const proceeds = qty * exitPrice * (1 - 0.0025);
  db.prepare("UPDATE positions SET exit_qty=COALESCE(exit_qty,0)+?, exit_price=?, status=CASE WHEN qty-?<=0 THEN 'closed' ELSE 'open' END WHERE id=?")
    .run(qty, exitPrice, qty, positionId);
  db.prepare("UPDATE portfolio_config SET balance=balance+? WHERE id=1").run(proceeds);
  res.json({ ok: true, positionId, qty, exitPrice, proceeds });
});

// risk veto
app.post("/risk-veto", (req, res) => {
  const { mint, reason } = req.body || {};
  db.prepare("INSERT INTO decisions (mint,agent,findings,confidence,recommendation,created_at) VALUES (?,?,?,?,?,?)")
    .run(mint, "Risk Manager", reason || "veto", 0, "REJECT", new Date().toISOString());
  res.json({ vetoed: true, mint });
});

// portfolio status
app.get("/portfolio", (req, res) => {
  const cfg = db.prepare("SELECT * FROM portfolio_config WHERE id=1").get();
  const positions = db.prepare("SELECT * FROM positions WHERE status='open'").all();
  res.json({ config: cfg, openPositions: positions });
});

// scoring
app.get("/score/:mint", (req, res) => {
  const token = db.prepare("SELECT * FROM tokens WHERE mint=?").get(req.params.mint);
  if (!token) return res.status(404).json({ error: "not found" });
  const liquidityScore = Math.min(token.liquidity / 1e9, 1);
  const score = liquidityScore * 0.5 + 0.5;
  res.json({ mint: token.mint, score, breakdown: { liquidity: liquidityScore }, timestamp: new Date().toISOString() });
});

// agent performance
app.get("/performance", (req, res) => {
  const rows = db.prepare("SELECT agent, COUNT(*) as total, SUM(CASE WHEN recommendation='BUY' THEN 1 ELSE 0 END) as buys FROM decisions GROUP BY agent").all();
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
    for (const p of pairs) {
      db.prepare("INSERT OR REPLACE INTO tokens (mint,symbol,name,price,liquidity,updated_at) VALUES (?,?,?,?,?,?)")
        .run(p.baseToken?.address, p.baseToken?.symbol, p.baseToken?.name, parseFloat(p.priceUsd || 0), parseFloat(p.liquidity?.usd || 0), new Date().toISOString());
    }
  } catch (e) { console.error("auto-scan err", e.message); }
}, 30000);

app.get("/validation/status", (req, res) => {
  const exp = db.prepare("SELECT * FROM experiment WHERE id=1").get();
  const tokens = db.prepare("SELECT COUNT(*) as c FROM tokens").get().c;
  res.json({ start: exp.start_time, tokens, now: new Date().toISOString() });
});
app.get("/validation/report", (req, res) => {
  const tokens = db.prepare("SELECT COUNT(*) as c FROM tokens").get().c;
  const decisions = db.prepare("SELECT COUNT(*) as c FROM decisions").get().c;
  const positions = db.prepare("SELECT COUNT(*) as c FROM positions").get().c;
  res.json({ tokens, decisions, positions, generatedAt: new Date().toISOString() });
});
app.get("/portfolio/reconciliation", (req, res) => {
  const cfg = db.prepare("SELECT * FROM portfolio_config WHERE id=1").get();
  const ledger = db.prepare("SELECT * FROM ledger ORDER BY id").all();
  res.json({ balance: cfg.balance, ledger });
});
app.get("/performance/agents", (req, res) => res.json(db.prepare("SELECT agent, COUNT(*) as total FROM decisions GROUP BY agent").all()));
app.get("/performance/strategies", (req, res) => res.json([]));
app.post("/heartbeat", (req, res) => {
  db.prepare("INSERT INTO heartbeat (ts) VALUES (?)").run(new Date().toISOString());
  res.json({ ok: true });
});
app.get("/heartbeat", (req, res) => {
  const last = db.prepare("SELECT ts FROM heartbeat ORDER BY id DESC LIMIT 1").get();
  res.json({ lastHeartbeat: last ? last.ts : null });
});
app.get("/uptime", (req, res) => {
  const exp = db.prepare("SELECT * FROM experiment WHERE id=1").get();
  const now = new Date();
  const start = new Date(exp.start_time);
  const ms = now - start;
  res.json({ uptimeMs: ms, start: exp.start_time, now: now.toISOString() });
});
app.post("/snapshot", (req, res) => {
  const cfg = db.prepare("SELECT * FROM portfolio_config WHERE id=1").get();
  const tokens = db.prepare("SELECT COUNT(*) as c FROM tokens").get().c;
  const positions = db.prepare("SELECT COUNT(*) as c FROM positions WHERE status='open'").get().c;
  db.prepare("INSERT INTO snapshots (ts,balance,tokens,positions) VALUES (?,?,?,?)").run(new Date().toISOString(), cfg.balance, tokens, positions);
  res.json({ ok: true });
});
export { db, broadcast };