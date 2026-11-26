import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "ok", service: "solana-hive-test", time: new Date().toISOString() }));
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Test server on :${PORT}`));