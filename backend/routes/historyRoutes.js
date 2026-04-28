const express = require('express');
const { getHistory, getHistoryById, deleteHistory } = require('../controllers/historyController');

const router = express.Router();

// GET  /api/v1/history        → list last 50 comparisons
router.get('/',    getHistory);

// GET  /api/v1/history/:id    → single comparison detail
router.get('/:id', getHistoryById);

// DELETE /api/v1/history/:id  → remove one record
router.delete('/:id', deleteHistory);

module.exports = router;
