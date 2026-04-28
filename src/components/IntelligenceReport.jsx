import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Search, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  ShieldAlert,
  Wifi,
  Activity,
  Cpu,
  Newspaper
} from 'lucide-react';
import { getEvidenceLevel } from '../utils/riskUtils';
import { formatUrl } from '../utils/formatUtils';

const IntelligenceReport = ({ platformResults, topMatch }) => {
  const [visiblePlatforms, setVisiblePlatforms] = useState(0);

  useEffect(() => {
    if (platformResults?.length > 0) {
      const timer = setInterval(() => {
        setVisiblePlatforms(prev => Math.min(prev + 1, platformResults.length));
      }, 300);
      return () => clearInterval(timer);
    }
  }, [platformResults]);

  if (!platformResults || platformResults.length === 0) return null;

  const isAuthorized = topMatch?.similarity < 50;

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return Wifi;
      case 'twitter': return Activity;
      case 'reddit': return Cpu;
      default: return Newspaper;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'match': return 'text-rose-500';
      case 'possible': return 'text-amber-500';
      default: return 'text-emerald-500';
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              Distributed Intelligence Source Audit
            </h4>
          </div>
          <p className="text-[10px] text-gray-500 font-mono tracking-wider ml-7">
            SCANNING_GLOBAL_NODE_NETWORK_FOR_VISUAL_SIGNATURES...
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-gray-500 tracking-tighter uppercase">Confidence Level</span>
            <span className="text-xs font-mono font-bold text-emerald-400">99.8% ACCURACY</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <Search className="w-5 h-5 text-gray-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformResults.map((p, idx) => {
          const PlatformIcon = getPlatformIcon(p.platform);
          const isVisible = idx < visiblePlatforms;
          const statusColor = getStatusColor(p.status);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              className={`relative overflow-hidden p-5 rounded-2xl border transition-all duration-500
                ${isVisible ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/5 opacity-50'}
              `}
            >
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${isVisible ? 'text-white' : 'text-gray-700'}`}>
                    <PlatformIcon className="w-5 h-5" />
                  </div>
                  <div className={`px-2 py-0.5 rounded-md border text-[8px] font-black tracking-widest uppercase
                    ${p.status === 'match' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                      p.status === 'possible' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 
                      'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}
                  `}>
                    {p.status}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span>{p.platform}</span>
                    <span className={statusColor}>{p.confidence}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={isVisible ? { width: `${p.confidence}%` } : {}}
                      className={`h-full ${statusColor.replace('text', 'bg')}`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter">Evidence</span>
                    <span className={`text-[9px] font-black tracking-widest uppercase ${p.evidenceLevel === 'STRONG' ? 'text-rose-500' : 'text-gray-500'}`}>
                      {p.evidenceLevel}
                    </span>
                  </div>
                  
                  {p.url && (
                    <a 
                      href={p.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      VIEW LEAK <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {visiblePlatforms === platformResults?.length && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl border flex items-center gap-6
              ${isAuthorized ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'}
            `}
          >
            <div className={`p-4 rounded-xl ${isAuthorized ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h6 className={`text-xs font-black uppercase tracking-widest ${isAuthorized ? 'text-emerald-400' : 'text-rose-400'}`}>
                Intelligence Core Synthesis
              </h6>
              <p className="text-[10px] text-gray-400 font-mono leading-relaxed max-w-2xl">
                {isAuthorized 
                  ? "Validation cycle completed. Cross-node intelligence confirms no significant unauthorized distribution across identified public clusters. No immediate mitigation required."
                  : "Critical Alert: Distributed asset breach verified on external nodes. Forensic signatures match indexed protected registry profile. Immediate DMCA takedown or legal containment recommended."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntelligenceReport;
