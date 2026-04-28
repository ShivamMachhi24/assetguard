import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Terminal, 
  AlertTriangle,
  FileSearch,
  CheckCircle2,
  XCircle
} from 'lucide-react';

// Sub-components
import TopMatchCard from './TopMatchCard';
import MatchList from './MatchList';
import IntelligenceReport from './IntelligenceReport';

const ResultCard = ({ results, onReset }) => {
  if (!results) return null;

  const { matches = [], topMatch = null, platformResults = [] } = results;
  const isAuthorized = !topMatch || topMatch.similarity < 55;

  const downloadReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      status: isAuthorized ? 'CLEAN' : 'BREACH_DETECTED',
      topMatch,
      allMatches: matches,
      intelligence: platformResults
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forensic-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-6xl mx-auto space-y-8 pb-12"
    >
      {/* Dynamic Header Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
        <div className={`absolute inset-y-0 left-0 w-1 ${isAuthorized ? 'bg-emerald-500' : 'bg-rose-500'} opacity-50`} />
        
        <div className="flex items-center gap-6">
          <div className={`p-5 rounded-2xl ${isAuthorized ? 'bg-emerald-500/10' : 'bg-rose-500/10'} transition-colors duration-500`}>
            {isAuthorized ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-rose-500" />
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight text-white flex flex-col md:flex-row md:items-center gap-3">
              {isAuthorized ? '✅ Asset secure – No matches found' : '🚨 BREACH DETECTED – Unauthorized duplication identified'}
              <span className="text-[10px] font-mono px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-500 w-fit">
                v4.0_INTEL_ENGINE
              </span>
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
              <Terminal className="w-3 h-3" />
              SYSTEM_STATUS: {isAuthorized ? 'OPTIMAL' : 'INTERCEPTION_REQUIRED'} // LATENCY: 24ms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadReport}
            className="group/btn relative px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Forensic Export</span>
          </button>
          
          <button
            onClick={onReset}
            className="px-6 py-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all text-xs font-black uppercase tracking-widest text-white flex items-center gap-2"
          >
            <FileSearch className="w-4 h-4" />
            New Audit
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isAuthorized ? (
          <motion.div
            key="breach"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            {/* Top Match Core Forensic View */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-4 text-rose-500/80">
                <Terminal className="w-4 h-4" />
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Primary Breach Vector Analysis</span>
              </div>
              <TopMatchCard topMatch={topMatch} />
            </section>

            {/* Platform Intelligence Engine */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-4 text-emerald-500/80">
                <Terminal className="w-4 h-4" />
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Cross-Node Intelligence Report</span>
              </div>
              <IntelligenceReport platformResults={platformResults} topMatch={topMatch} />
            </section>

            {/* Match Registry Grid */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-4 text-gray-500">
                <Terminal className="w-4 h-4" />
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Distribution Registry Archive</span>
              </div>
              <MatchList matches={matches} />
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="clean"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-20 flex flex-col items-center justify-center text-center space-y-6 rounded-[3rem] border border-emerald-500/10 bg-emerald-500/[0.02] backdrop-blur-3xl"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
              <div className="relative p-8 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck className="w-16 h-16 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-white tracking-tight italic">
                ZERO_THREAT_DETECTED
              </h3>
              <p className="text-gray-400 font-mono text-xs max-w-md mx-auto leading-relaxed uppercase tracking-widest">
                Comprehensive node-network scan yielded no unauthorized signatures. 
                Asset remains cryptographically secure within protected clusters.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forensic Footer */}
      <div className="flex items-center justify-between pt-12 border-t border-white/5 text-[9px] font-mono text-gray-600 uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            ENGINE_STABLE
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-rose-500" />
            LAST_BREACH: {formatDate(new Date())}
          </div>
        </div>
        <div>
          PROTECTION_CERTIFICATE: AS77-X991-F22
        </div>
      </div>
    </motion.div>
  );
};

// Helper inside for now to keep it internal to the result lifecycle
const ShieldCheck = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const formatDate = (date) => {
  return date.toLocaleTimeString('en-US', { hour12: false }) + '.' + date.getMilliseconds();
};

export default ResultCard;
