import React from 'react';
import { Shield, Cpu, Activity, AlertCircle, Search, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = ({ isScanning = false, hasError = false }) => {
  // Priority logic for status
  const getStatus = () => {
    if (hasError) {
      return {
        label: "Connection Issue",
        color: "text-rose-500",
        bg: "bg-rose-500",
        icon: AlertCircle,
        glow: "shadow-[0_0_10px_rgba(244,63,94,0.4)]"
      };
    }
    if (isScanning) {
      return {
        label: "Scanning...",
        color: "text-amber-500",
        bg: "bg-amber-500",
        icon: Search,
        glow: "shadow-[0_0_10px_rgba(245,158,11,0.4)]"
      };
    }
    return {
      label: "System Active",
      color: "text-emerald-500",
      bg: "bg-emerald-500",
      icon: CheckCircle,
      glow: "shadow-[0_0_10px_rgba(16,185,129,0.4)]"
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card px-6 py-3 border-emerald-500/10">
        <div className="flex items-center gap-3 group">
          <div className="relative">
            <Shield className="w-8 h-8 text-emerald-500 transition-transform group-hover:scale-110" />
            <motion.div 
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-emerald-500 blur-lg rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white uppercase">
              Asset<span className="text-emerald-500">Guard</span>
            </span>
            <span className="text-[10px] text-emerald-500/60 font-mono tracking-widest leading-none">AI PROTECTION SYSTEM</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {/* Status Indicator */}
          <AnimatePresence mode="wait">
            <motion.div
              key={status.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`flex items-center gap-3 px-4 py-1.5 rounded-full bg-charcoal-light border border-charcoal-border ${status.glow} transition-shadow duration-300`}
            >
              <div className="relative flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${status.bg} ${isScanning || hasError ? 'animate-pulse' : ''}`} />
                <motion.div 
                  animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={`absolute inset-0 rounded-full ${status.bg} opacity-20`}
                />
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest">
                <StatusIcon className={`w-3 h-3 ${status.color}`} />
                <span className={status.color}>{status.label}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <Cpu className="w-4 h-4" />
            <span>NEURAL NET</span>
          </div>
          
          <div className="h-4 w-[1px] bg-charcoal-border" />
          
          <button className="text-xs font-semibold text-gray-400 hover:text-emerald-400 transition-colors uppercase tracking-wider">
            Logs
          </button>
        </div>
      </div>
    </nav>
  );
};
