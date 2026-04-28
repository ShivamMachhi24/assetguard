/**
 * Centralized Express error handler.
 * Must have 4 arguments — (err, req, res, next) — or Express won't treat
 * it as an error-handling middleware.
 *
 * Place this AFTER all route registrations in server.js.
 */
const errorHandler = (err, _req, res, _next) => {
  console.error('[ERROR]', err.message || err);

  // Multer-specific errors (e.g. file too large)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 10 MB.' });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected file field name.' });
  }

  // Generic fallback — matches the original server.js 500 response
  res.status(err.status || 500).json({
    error: err.message || 'Failed to process images.',
  });
};

module.exports = errorHandler;
