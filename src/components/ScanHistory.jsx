import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, CheckCircle2, AlertTriangle, Clock, ArrowRight, Loader2, WifiOff, RefreshCcw, Inbox } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "https://assetguard-backend.onrender.com";
const API_BASE = `${API_URL}/api/v1`;

// ─────────────────────────────────────────────────────────────────────────────
// ScanHistory
//
// Fetches comparison history from GET /api/v1/history on mount and whenever
// the `refreshTrigger` prop increments (set by App after each new scan).
//
// Props:
//   onSelect(scan)    — called when user clicks a history row
//   refreshTrigger    — any incrementing number; changing it re-fetches history
// ─────────────────────────────────────────────────────────────────────────────
export const ScanHistory = ({ onSelect, refreshTrigger = 0 }) => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/history`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      // Normalise the MongoDB documents to the shape the UI expects
      const normalised = (json.data || []).map(record => ({
        id: record.id || record._id,
        score: record.similarity,
        isAuthorized: record.status === 'Authorized',
        originalName: record.originalName,
        suspectedName: record.suspectedName,
        timestamp: new Date(record.createdAt).toLocaleTimeString([], {
          hour: '2-digit', minute: '2-digit',
        }),
        // Pass through any extra fields so ResultCard works if user clicks
        similarity: record.similarity,
        status: record.status,
        platformResults: record.platformResults || [],
      }));
      setScans(normalised);
    } catch (err) {
      console.error('[ScanHistory] fetch error:', err.message);
      setError('Could not load history from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch on mount and whenever a new scan completes
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // don't fire onSelect
    try {
      const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setScans(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('[ScanHistory] delete error:', err.message);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mt-12 flex items-center justify-center gap-3 text-gray-600 font-mono text-xs py-8">
        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
        <span>Loading scan history...</span>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="mt-12 flex flex-col items-center gap-3 text-rose-500/70 font-mono text-xs py-8">
        <WifiOff className="w-5 h-5" />
        <span>{error}</span>
        <button
          onClick={fetchHistory}
          className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-600 hover:text-emerald-400 transition-colors"
        >
          <RefreshCcw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (scans.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center gap-3 text-gray-700 font-mono text-xs py-8">
        <Inbox className="w-6 h-6 text-gray-600" />
        <span>No scans in history yet.</span>
        <span className="text-[10px] text-gray-700">Run your first comparison above to see results here.</span>
      </div>
    );
  }

  // ── Scan list ──────────────────────────────────────────────────────────────
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-12 space-y-4"
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-500/60" />
          <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-emerald-500/60 font-mono">
            Recent Scans (Protocol History)
          </h2>
        </div>
        <button
          onClick={fetchHistory}
          title="Refresh history"
          className="text-gray-600 hover:text-emerald-400 transition-colors"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid gap-3">
        <AnimatePresence initial={false}>
          {scans.map((scan, index) => (
            <motion.div
              key={scan.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ x: 4 }}
              onClick={() => onSelect(scan)}
              className="glass-card p-4 flex items-center justify-between cursor-pointer border-emerald-500/5 hover:border-emerald-500/20 group transition-all"
            >
              {/* Left: score badge + verdict + timestamp */}
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0
                  ${scan.isAuthorized ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {scan.score}%
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    {scan.isAuthorized
                      ? <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      : <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                    }
                    <span className={`text-xs font-bold uppercase tracking-wider ${scan.isAuthorized ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {scan.isAuthorized ? 'Authorized' : 'Unauthorized'}
                    </span>
                  </div>

                  {/* File names if available */}
                  {scan.originalName && (
                    <span className="text-[10px] text-gray-600 font-mono truncate max-w-[220px] mt-0.5">
                      {scan.originalName} vs {scan.suspectedName}
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono mt-0.5">
                    <Clock className="w-2.5 h-2.5 shrink-0" />
                    {scan.timestamp}
                  </div>
                </div>
              </div>

              {/* Right: reload + delete */}
              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleDelete(e, scan.id)}
                  className="text-[10px] font-mono text-rose-500/50 hover:text-rose-400 transition-colors uppercase"
                  title="Delete record"
                >
                  ✕ Delete
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-emerald-500/60 uppercase">Reload Data</span>
                  <ArrowRight className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};
