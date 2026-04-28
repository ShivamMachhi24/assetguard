import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Search, CheckCircle, Database, Globe, Wifi } from 'lucide-react';

const SCAN_STEPS = [
  { text: "Initializing secure neural node connection...", icon: Database, color: "text-emerald-400" },
  { text: "Scanning social media platforms...", icon: Globe, color: "text-emerald-400" },
  { text: "Checking Instagram...", icon: Search, color: "text-emerald-400", sub: "Match detected!", subColor: "text-rose-400" },
  { text: "Checking Twitter...", icon: Search, color: "text-emerald-400", sub: "No match found", subColor: "text-gray-500" },
  { text: "Analyzing news sources...", icon: Wifi, color: "text-emerald-400", sub: "High similarity detected", subColor: "text-amber-400" },
  { text: "Querying YouTube and Reddit databases...", icon: Database, color: "text-emerald-400" },
  { text: "Computing perceptual hash vectors...", icon: Shield, color: "text-emerald-400" },
  { text: "Scan complete. Generating integrity report...", icon: CheckCircle, color: "text-emerald-300" },
];

const STEP_DELAY_MS = 650;
const COMPLETE_DELAY_MS = 900;

export const DetectionSimulation = ({ onComplete, isAuto = false }) => {
  const [visibleLogs, setVisibleLogs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (currentIndex < SCAN_STEPS.length) {
      const t = setTimeout(() => {
        setVisibleLogs(prev => [...prev, { ...SCAN_STEPS[currentIndex], timestamp: new Date().toLocaleTimeString([], { hour12: false }) }]);
        setCurrentIndex(prev => prev + 1);
      }, STEP_DELAY_MS);
      return () => clearTimeout(t);
    } else {
      setIsDone(true);
      const t = setTimeout(() => onComplete(), COMPLETE_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [currentIndex, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto glass-card border-emerald-500/20 p-6 font-mono text-sm relative overflow-hidden"
      style={{ minHeight: '340px' }}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-charcoal-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/40 border border-rose-500/60" />
            <div className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500/60" />
          </div>
          <span className="text-gray-500 text-[10px] uppercase tracking-widest ml-4 flex items-center gap-2">
            <Terminal className="w-3 h-3" />
            Live_Detection_Trace.sh
          </span>
        </div>
        <motion.div
          className="text-[10px] text-emerald-400 font-mono tracking-wider flex items-center gap-2"
          animate={isDone ? { opacity: 1 } : { opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: isDone ? 0 : Infinity }}
        >
          {isAuto && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] animate-pulse">
              AUTO
            </span>
          )}
          {isDone ? '▶ COMPLETE' : '● SCANNING...'}
        </motion.div>
      </div>

      {/* Fallback: always show at least a prompt */}
      {visibleLogs.length === 0 && (
        <div className="flex items-center gap-3 text-emerald-600 text-xs animate-pulse">
          <span className="opacity-40">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
          <span>{isAuto ? '[Auto] Initializing scheduled scan...' : 'Initializing manual scan...'}</span>
          <motion.span
            className="inline-block w-2 h-4 bg-emerald-500/60"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </div>
      )}

      {/* Log Lines */}
      <div className="space-y-3">
        <AnimatePresence>
          {visibleLogs.map((log, index) => {
            const Icon = log.icon;
            const isLatest = index === visibleLogs.length - 1;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -14, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                {/* Main log line */}
                <div className={`flex items-start gap-3 ${log.color}`}>
                  <Icon className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="opacity-35 text-[10px] shrink-0">[{log.timestamp}]</span>
                      <span className="leading-relaxed break-words">{log.text}</span>
                      {/* Blinking cursor on the latest line still being written */}
                      {isLatest && !isDone && currentIndex <= SCAN_STEPS.length && (
                        <motion.span
                          className="inline-block w-2 h-4 bg-emerald-500/60 translate-y-0.5"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.7, repeat: Infinity }}
                        />
                      )}
                    </div>
                    {/* Sub-result line (e.g. "Match detected!") */}
                    {log.sub && (
                      <motion.div
                        initial={{ opacity: 0, x: 4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className={`mt-1 ml-1 text-[11px] flex items-center gap-1.5 ${log.subColor}`}
                      >
                        <span className="opacity-60">└─</span>
                        <span className="font-semibold tracking-wide">{log.sub}</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Scanning line sweep effect */}
      {!isDone && (
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent pointer-events-none"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Background shield watermark */}
      <div className="absolute bottom-4 right-4 opacity-[0.04] pointer-events-none">
        <Shield className="w-28 h-28 text-emerald-400" />
      </div>
    </motion.div>
  );
};
