const express  = require('express');
const multer   = require('multer');
const { compareImages } = require('../controllers/compareController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ── Route ─────────────────────────────────────────────────────────────────────
// Endpoint renamed from /compare → /api/v1/compare (versioned).
// Frontend fetch URL must be updated to match (see migration note in server.js).
router.post(
  '/',
  upload.fields([{ name: 'suspectedImage', maxCount: 1 }]),
  compareImages,
);

module.exports = router;
