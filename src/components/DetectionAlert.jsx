import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

export const DetectionAlert = ({ alert, onDismiss }) => {
  const { id, platform, score, message, type = 'breach' } = alert;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`relative w-80 glass-card border-rose-500/30 overflow-hidden group shadow-[0_0_30px_-10px_rgba(244,63,94,0.3)]`}
    >
      {/* Background Pulse */}
      <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none" />
      
      <div className="p-4 relative">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-500 mb-0.5">
              {message}
            </h4>
            <div className="text-[13px] font-bold text-white mb-1">
              {platform}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-400 uppercase">Confidence</span>
              <span className="text-[10px] font-mono text-rose-400 font-bold">{score}%</span>
            </div>
          </div>

          <button 
            onClick={() => onDismiss(id)}
            className="p-1 hover:bg-rose-500/10 rounded transition-colors text-gray-500 hover:text-rose-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Insight Subtext */}
        <div className="mt-3 pt-3 border-t border-rose-500/10">
          <p className="text-[10px] text-rose-400/60 font-mono italic leading-relaxed">
            High-risk duplication pattern identified in neural cluster.
          </p>
        </div>
      </div>

      {/* Progress Bar Timer */}
      <motion.div 
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
        className="absolute bottom-0 left-0 h-[2px] bg-rose-500"
      />
    </motion.div>
  );
};

export const AlertContainer = ({ alerts, onDismiss }) => {
  return (
    <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {alerts.map(alert => (
          <div key={alert.id} className="pointer-events-auto">
            <DetectionAlert alert={alert} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
