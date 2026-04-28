const Comparison = require('../models/Comparison');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/history
// Returns the 50 most recent comparisons, newest first.
// ─────────────────────────────────────────────────────────────────────────────
const getHistory = async (_req, res, next) => {
  try {
    const records = await Comparison.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select('originalName suspectedName similarity status createdAt'); // only UI-relevant fields

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/history/:id
// Returns full detail for one comparison (including raw hashes).
// ─────────────────────────────────────────────────────────────────────────────
const getHistoryById = async (req, res, next) => {
  try {
    const record = await Comparison.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, error: 'Comparison not found.' });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/history/:id
// Hard-deletes one record by ID.
// ─────────────────────────────────────────────────────────────────────────────
const deleteHistory = async (req, res, next) => {
  try {
    const record = await Comparison.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, error: 'Comparison not found.' });
    }

    res.json({ success: true, message: 'Record deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHistory, getHistoryById, deleteHistory };
