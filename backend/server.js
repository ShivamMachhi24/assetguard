require('dotenv').config();

const express        = require('express');
const cors           = require('cors');
const compareRoutes  = require('./routes/compareRoutes');
const errorHandler   = require('./middleware/errorHandler');

// ── Global Error Safety ──────────────────────────────────────────────────────
process.on("uncaughtException", (err) => console.error("Uncaught Exception:", err));
process.on("unhandledRejection", (err) => console.error("Unhandled Rejection:", err));

// ── App ───────────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors()); // Enable broad CORS for production
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.json({ status: 'AssetGuard API running (Stateless Mode)' }));

app.use('/api/v1/compare', compareRoutes);
app.get('/api/v1/history', (_req, res) => res.json({ success: true, count: 0, data: [] }));

// ── Error Handler (must be last) ──────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`AssetGuard API running on port ${PORT}`);
});
