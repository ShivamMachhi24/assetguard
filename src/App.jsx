import React, { useState, useEffect, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCcw, ShieldAlert, Cpu, Terminal, Wifi, Zap, Fingerprint } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { AssetDropzone } from './components/AssetDropzone';
import ResultCard from './components/ResultCard';
import { ScanHistory } from './components/ScanHistory';
import { DetectionSimulation } from './components/DetectionSimulation';
import { AlertContainer } from './components/DetectionAlert';
import { DashboardStats } from './components/DashboardStats';
import { AssetRegistry } from './components/AssetRegistry';
import { useRef } from 'react';

// Demo Images
import demoOriginal from './assets/demo/original.png';
import demoLeak from './assets/demo/leak.png';

const API_URL = import.meta.env.VITE_API_URL || "https://assetguard-backend.onrender.com";

// ─────────────────────────────────────────────────────────────────────────────
// FINITE STATE MACHINE
//
// Phases (single source of truth — replaces isAnalyzing + isSimulating + result):
//   idle        → nothing running, no result
//   analyzing   → HTTP request in flight
//   simulating  → simulation is playing, pendingResult is ready
//   result      → simulation done, result visible
//   error       → something went wrong
//
// Valid transitions:
//   idle        → analyzing   (user clicks Analyze)
//   analyzing   → simulating  (API responded)
//   analyzing   → error       (API failed)
//   simulating  → result      (simulation onComplete fires)
//   result      → idle        (user resets)
//   error       → idle        (user resets)
//   *           → result      (user clicks history item)
// ─────────────────────────────────────────────────────────────────────────────

const PHASES = {
  IDLE: 'idle',
  ANALYZING: 'analyzing',
  SIMULATING: 'simulating',
  RESULT: 'result',
  ERROR: 'error',
};

const initialState = {
  phase: PHASES.IDLE,
  result: null,   // committed, visible result
  pendingResult: null,   // computed but waiting for simulation to finish
  error: null,
  isAuto: false,  // whether the current scan was triggered by the monitor
};

function appReducer(state, action) {
  switch (action.type) {

    case 'ANALYZE_START':
      return { ...initialState, phase: PHASES.ANALYZING, isAuto: action.payload?.isAuto || false };

    case 'ANALYZE_SUCCESS':
      // API done → hand off to simulation; keep result null until sim completes
      return { ...state, phase: PHASES.SIMULATING, pendingResult: action.payload, error: null };

    case 'ANALYZE_ERROR':
      return { ...state, phase: PHASES.ERROR, error: action.payload, pendingResult: null };

    case 'SIMULATION_COMPLETE':
      // Atomic: result is set and simulating ends in the SAME dispatch → no blank frame ever
      return { ...state, phase: PHASES.RESULT, result: state.pendingResult, pendingResult: null };

    case 'VIEW_HISTORY_ITEM':
      return { ...state, phase: PHASES.RESULT, result: action.payload, pendingResult: null, error: null };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

export default function App() {
  const [appState, dispatch] = useReducer(appReducer, initialState);
  const { phase, result, pendingResult, error, isAuto } = appState;

  const [originalFile, setOriginalFile] = useState(null);
  const [suspectedFile, setSuspectedFile] = useState(null);

  // Alert System State
  const [alerts, setAlerts] = useState([]);
  const lastAlertTimes = useRef({}); // Platform -> Timestamp for 10s cooldown

  // Monitoring State
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastScanTimestamp, setLastScanTimestamp] = useState(null);
  const [now, setNow] = useState(Date.now());
  // Incrementing this triggers ScanHistory to re-fetch from MongoDB
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [scans, setScans] = useState([]);

  // Startup Product States
  const [registry, setRegistry] = useState(() => {
    const saved = localStorage.getItem('registry');
    return saved ? JSON.parse(saved) : [];
  });

  const [breachCount, setBreachCount] = useState(() => {
    const saved = localStorage.getItem('guard_breach_count');
    return saved ? parseInt(saved) || 0 : 0;
  });

  // ── One-time Storage Cleanup (Fix QuotaExceededError) ───────────────────────
  useEffect(() => {
    const isCleaned = localStorage.getItem('guard_v1_cleanup');
    if (!isCleaned) {
      localStorage.removeItem("registry");
      localStorage.setItem('guard_v1_cleanup', 'true');
      console.log("Storage Cleanup: Old heavy registry items removed.");
    }
  }, []);

  useEffect(() => {
    try {
      // Strip images before saving to stay under 5MB localStorage limit
      const lightRegistry = registry.map(({ image, ...rest }) => ({ ...rest, image: null }));
      localStorage.setItem('registry', JSON.stringify(lightRegistry));
    } catch (e) {
      console.error("Storage limit exceeded", e);
    }
  }, [registry]);

  useEffect(() => {
    localStorage.setItem('guard_breach_count', breachCount.toString());
  }, [breachCount]);

  // ── Monitoring Logic ────────────────────────────────────────────────────────

  // 1. UI Clock: Updates every second to refresh "X seconds ago"
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // 2. Monitoring Interval: Triggers scan every 5 seconds
  useEffect(() => {
    let t;
    if (isMonitoring) {
      t = setInterval(() => {
        // Concurrency Guard: Don't trigger if already in flight
        if (phase === PHASES.ANALYZING || phase === PHASES.SIMULATING) {
          console.log("[Monitor] Scan skip: Active process detected.");
          return;
        }
        handleAnalyze(true);
      }, 5000);
    }
    return () => clearInterval(t);
  }, [isMonitoring, phase, originalFile, suspectedFile]); // Dependencies ensure we have access to files

  const handleToggleMonitoring = () => {
    if (!isMonitoring && (!originalFile || !suspectedFile)) {
      dispatch({ type: 'ANALYZE_ERROR', payload: 'Monitoring failed: Upload required asset clusters first.' });
      setTimeout(() => dispatch({ type: 'RESET' }), 4000);
      return;
    }
    setIsMonitoring(prev => !prev);
  };

  const handleOriginalFileUpload = (file) => {
    setOriginalFile(file);
    if (file) {
      handleRegisterAsset(file.name, file);
    }
  };

  const handleRegisterAsset = (name, file = null) => {
    const targetFile = file || originalFile;
    if (!targetFile) return;

    // Convert current targetFile to base64 for registry storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const newAsset = {
        id: Date.now().toString(),
        name: name || targetFile.name || 'Unnamed Asset',
        image: null, // Don't store full base64 in registry state to prevent crashes
        pHash: null // Generated on backend
      };

      setRegistry(prev => {
        const updated = [newAsset, ...prev];
        console.log("Registry Updated:", updated.map(a => ({ name: a.name, id: a.id })));
        return updated;
      });
    };
    reader.readAsDataURL(targetFile);
  };

  const handleDeleteAsset = (id) => {
    setRegistry(prev => prev.filter(a => a.id !== id));
  };

  const handleLoadAsset = async (asset) => {
    // Convert base64 back to File if needed, or just use the dataURL
    // For simplicity, we can just trigger a manual scan by setting the state 
    // but dropzone needs a File object.
    const res = await fetch(asset.image);
    const blob = await res.blob();
    const file = new File([blob], `${asset.name}.png`, { type: 'image/png' });
    setOriginalFile(file);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const runDemoMode = async () => {
    dispatch({ type: 'RESET' });

    // Use local demo assets
    const resOrig = await fetch(demoOriginal);
    const blobOrig = await resOrig.blob();
    const fileOrig = new File([blobOrig], 'original.png', { type: 'image/png' });

    const resLeak = await fetch(demoLeak);
    const blobLeak = await resLeak.blob();
    const fileLeak = new File([blobLeak], 'leak.png', { type: 'image/png' });

    setOriginalFile(fileOrig);
    setSuspectedFile(fileLeak);

    // Add small delay for user to see the files appear
    setTimeout(() => {
      handleAnalyze(false);
    }, 1000);
  };


  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setOriginalFile(null);
    setSuspectedFile(null);
    dispatch({ type: 'RESET' });
  };

  const handleSelectHistory = (scan) => {
    dispatch({ type: 'VIEW_HISTORY_ITEM', payload: scan });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleAnalyze = async (autoTriggered = false) => {
    if (!suspectedFile) {
      if (!autoTriggered) {
        dispatch({ type: 'ANALYZE_ERROR', payload: 'Analysis aborted: Missing suspected asset cluster.' });
        setTimeout(() => dispatch({ type: 'RESET' }), 4000);
      }
      return;
    }

    if (registry.length === 0) {
      dispatch({ type: 'ANALYZE_ERROR', payload: 'Registry Empty: No assets to compare against.' });
      setTimeout(() => dispatch({ type: 'RESET' }), 4000);
      return;
    }

    console.log("Sending registry:", registry);
    console.log("Registry Size:", registry.length);
    dispatch({ type: 'ANALYZE_START', payload: { isAuto: autoTriggered } });

    try {
      const formData = new FormData();
      formData.append('suspectedImage', suspectedFile);
      formData.append('registry', JSON.stringify(registry));

      console.log("Sending request to:", `${API_URL}/api/v1/compare`);
      const response = await fetch(`${API_URL}/api/v1/compare`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Neural network processing failure.');

      const data = await response.json();
      const topMatch = data.topMatch;

      // Update Registry with any newly computed pHashes for performance
      setRegistry(prev => prev.map(asset => {
        const match = data.matches.find(m => m.id === asset.id);
        return match ? { ...asset, pHash: match.pHash } : asset;
      }));

      const platformResults = data.platformResults || [];

      const newResult = {
        id: Date.now(),
        score: topMatch ? topMatch.similarity : 0,
        isAuthorized: topMatch ? topMatch.status === 'Authorized' : true,
        platformResults,
        matches: data.matches,
        topMatch: topMatch,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      dispatch({ type: 'ANALYZE_SUCCESS', payload: newResult });
      setLastScanTimestamp(Date.now());

    } catch (err) {
      console.error('Analysis error:', err);
      dispatch({ type: 'ANALYZE_ERROR', payload: 'CORE ERROR: Connection to analysis server interrupted.' });
    }
  };

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); // Slide up for 'tech' feel

      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.warn("Audio Context unavailable", e);
    }
  };

  const addAlert = (platform, score) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const newAlert = {
      id,
      platform,
      score,
      message: `Breach detected on ${platform} — Strong evidence (${score}%)`,
    };

    setAlerts(prev => [...prev, newAlert]);
    playAlertSound();

    // Update cooldown
    lastAlertTimes.current[platform] = Date.now();
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Called by DetectionSimulation when all logs have played
  const handleSimulationComplete = () => {
    // Single atomic dispatch: result committed + phase = 'result' in ONE render
    dispatch({ type: 'SIMULATION_COMPLETE' });
    setRefreshTrigger(n => n + 1);

    // Populate session audit log (Last 5 results only)
    if (appState.pendingResult) {
      setScans(prev => [appState.pendingResult, ...prev].slice(0, 5));
    }

    // Alert Logic: Delay 300ms for realism as requested
    setTimeout(() => {
      const finalResult = appState.pendingResult; // Use pending since current state might not have updated yet in this enclosure
      if (finalResult && finalResult.score > 80) {
        setBreachCount(prev => prev + 1);

        finalResult.platformResults.forEach(platform => {
          if (platform.status === 'match') {
            const now = Date.now();
            const platformName = platform.platform;
            const lastAlert = lastAlertTimes.current[platformName] || 0;

            // 10s cooldown per platform
            if (now - lastAlert > 10000) {
              addAlert(platformName, platform.confidence);
            }
          }
        });

        // Update Registry Status if scanning a registered asset
        setRegistry(prev => prev.map(asset => {
          if (finalResult.topMatch && asset.id === finalResult.topMatch.id) {
            return { ...asset, status: 'Breach', risk: 'High', lastScan: new Date().toLocaleTimeString() };
          }
          return asset;
        }));
      }
    }, 300);
  };


  // ── Derived flags (for readability, NOT for branching UI logic) ─────────────
  const isScanning = phase === PHASES.ANALYZING || phase === PHASES.SIMULATING;
  const isDisabled = phase === PHASES.ANALYZING || phase === PHASES.SIMULATING;
  const showReset = originalFile || suspectedFile || result;


  // ── Rendering helper: which panel to show ───────────────────────────────────
  // The FSM phase is the single authority. No boolean combinations needed.
  const renderMainPanel = () => {
    switch (phase) {

      case PHASES.IDLE:
        return (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl mx-auto glass-card border-emerald-500/10 p-8 font-mono text-sm
                       flex flex-col items-center justify-center gap-5 min-h-[260px] text-center"
          >
            <div className="w-12 h-12 rounded-full border border-emerald-500/20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60 animate-pulse" />
            </div>
            <div>
              <p className="text-emerald-600 text-xs uppercase tracking-[0.25em] mb-2">
                System ready. Awaiting asset input...
              </p>
              <p className="text-gray-700 text-[11px] leading-relaxed">
                Upload original and suspected media above, then initialize detection.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-700 font-mono">
              <Terminal className="w-3 h-3 text-emerald-700" />
              <span>ASSETGUARD v2.0 | READY</span>
            </div>
          </motion.div>
        );

      case PHASES.ANALYZING:
        return (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl mx-auto glass-card border-emerald-500/20 p-8 font-mono text-sm
                       flex flex-col items-center justify-center gap-5 min-h-[260px] text-center"
          >
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <div>
              <p className="text-emerald-400 text-xs uppercase tracking-[0.25em] mb-1 animate-pulse">
                Processing perceptual hash vectors...
              </p>
              <p className="text-gray-600 text-[11px]">Connecting to neural analysis server</p>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, delay: i * 0.18, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        );

      case PHASES.SIMULATING:
        return (
          <motion.div key="simulating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DetectionSimulation onComplete={handleSimulationComplete} isAuto={isAuto} />
          </motion.div>
        );

      case PHASES.RESULT:
        return (
          <motion.div
            key={result?.id || 'result'}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <ResultCard results={result} onReset={handleReset} />
          </motion.div>
        );

      case PHASES.ERROR:
        return (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl mx-auto glass-card border-rose-500/20 p-8 font-mono text-sm
                       flex flex-col items-center justify-center gap-4 min-h-[200px] text-center"
          >
            <ShieldAlert className="w-10 h-10 text-rose-500" />
            <p className="text-rose-400 text-xs uppercase tracking-wider">{error}</p>
            <button
              onClick={handleReset}
              className="text-[11px] text-gray-500 hover:text-emerald-400 transition-colors mt-2 font-mono"
            >
              ↩ Reset system
            </button>
          </motion.div>
        );

      default:
        // Exhaustive safety net — should never reach here with the FSM
        return (
          <div className="w-full max-w-2xl mx-auto p-8 text-center text-gray-700 font-mono text-xs min-h-[200px] flex items-center justify-center">
            UNKNOWN STATE — RESETTING...
          </div>
        );
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-6 overflow-x-hidden">
      <AlertContainer alerts={alerts} onDismiss={removeAlert} />
      <Navbar isScanning={isScanning} hasError={phase === PHASES.ERROR} />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <main className="max-w-5xl mx-auto relative z-10 pt-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-16 space-y-4"
        >
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-emerald-500 font-mono text-[10px] uppercase tracking-[0.3em]">
              <Cpu className="w-3 h-3" />
              <span>Neural Asset Integrity Protocol</span>
            </div>
            <button
              onClick={runDemoMode}
              className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[9px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center gap-2 group"
            >
              <Zap className="w-3 h-3 group-hover:scale-110 transition-transform" />
              Run Demo Mode
            </button>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase">
            Asset <span className="text-emerald-500">Verification</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-500 text-sm md:text-base leading-relaxed">
            Protect your intellectual property with recursive neural scanning.
            Manage your registry and monitor unauthorized redistribution in real-time.
          </p>
        </motion.div>

        {/* Dashboard Stats */}
        <DashboardStats stats={{
          totalAssets: registry.length,
          activeMonitoring: isMonitoring ? registry.length : 0,
          breachCount: breachCount
        }} />

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <AssetDropzone label="Original Source Asset" onFileSelect={handleOriginalFileUpload} file={originalFile} id="original" />
          <AssetDropzone label="Suspected Replica Asset" onFileSelect={setSuspectedFile} file={suspectedFile} id="suspected" />
        </section>

        {/* Controls */}
        <div className="flex flex-col items-center gap-8 mb-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleAnalyze(false)}
              disabled={isDisabled}
              className="btn-emerald min-w-[240px]"
            >
              {phase === PHASES.ANALYZING ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing Hashes...</>
              ) : phase === PHASES.SIMULATING ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Clusters...</>
              ) : (
                <>Initialize Detection</>
              )}
            </button>

            <button
              onClick={handleToggleMonitoring}
              className={`flex items-center gap-2 py-3 px-6 rounded-lg font-mono text-[11px] font-bold tracking-widest uppercase transition-all duration-300 border
                ${isMonitoring
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]'
                  : 'bg-charcoal-light border-charcoal-border border-dashed text-gray-500 hover:text-emerald-500 hover:border-emerald-500/40'}
              `}
            >
              <Wifi className={`w-4 h-4 ${isMonitoring ? 'animate-pulse' : ''}`} />
              {isMonitoring ? 'Monitoring Active' : 'Start Monitoring'}
            </button>

            {showReset && (
              <button
                onClick={handleReset}
                className="p-3 rounded-lg border border-charcoal-border hover:bg-charcoal-light text-gray-400 hover:text-emerald-400 transition-all group"
                title="System Reset"
              >
                <RefreshCcw className="w-5 h-5 group-active:rotate-180 transition-transform duration-500" />
              </button>
            )}
          </div>

          {/* Monitoring Status Bar */}
          <AnimatePresence>
            {isMonitoring && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-8 text-[10px] font-mono tracking-[0.2em] text-emerald-600/60 uppercase"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
                  <span>Loop: 5000ms</span>
                </div>
                <div>
                  {lastScanTimestamp
                    ? `Last Scan: ${Math.floor((now - lastScanTimestamp) / 1000)}s ago`
                    : 'Awaiting first interval...'}
                </div>
                {phase === PHASES.ANALYZING && (
                  <div className="text-emerald-400 animate-pulse bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                    Next Scan running...
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main panel — driven exclusively by FSM phase */}
        <section className="space-y-12 mb-20">
          <div className="min-h-[300px]">
            <AnimatePresence mode="sync">
              {renderMainPanel()}
            </AnimatePresence>
          </div>

          <ScanHistory onSelect={handleSelectHistory} refreshTrigger={refreshTrigger} />

          {/* Safe Audit Log */}
          {scans && scans.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 space-y-1.5 border-t border-charcoal-border pt-6"
            >
              <h4 className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-3">Live Session Audit</h4>
              {scans.map((scan) => (
                <div key={scan.id} className="flex items-center gap-3 text-[10px] font-mono text-gray-500">
                  <span className="text-emerald-500/50">[{scan.timestamp}]</span>
                  <span>BREACH_CHECK_{scan.id.toString().slice(-4)}</span>
                  <span className={scan.score > 80 ? 'text-rose-500' : 'text-emerald-500'}>
                    {scan.score}% MATCH
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          <AssetRegistry
            assets={registry}
            onAdd={handleRegisterAsset}
            onDelete={handleDeleteAsset}
            onLoad={handleLoadAsset}
          />
        </section>
      </main>

      <footer className="mt-20 border-t border-charcoal-border pt-8 text-center pb-8">
        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} ASSETGUARD SECURITY | ALL SYSTEMS GREEN
        </p>
      </footer>
    </div>
  );
}
