import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync("solana_hive.db");
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
console.log("seeded", agents.length);