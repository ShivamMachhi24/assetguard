// ─────────────────────────────────────────────────────────────────────────────
// History Controller — Stateless (No Database)
// MongoDB removed for Render compatibility. History routes return empty stubs
// so the frontend ScanHistory component continues to work without errors.
// ─────────────────────────────────────────────────────────────────────────────

const getHistory = (_req, res) => {
  res.json({ success: true, count: 0, data: [] });
};

const getHistoryById = (req, res) => {
  res.status(404).json({ success: false, error: 'History is not persisted in stateless mode.' });
};

const deleteHistory = (req, res) => {
  res.json({ success: true, message: 'No-op: stateless mode.' });
};

module.exports = { getHistory, getHistoryById, deleteHistory };
