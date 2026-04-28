import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Fingerprint, Activity, Clock } from 'lucide-react';
import CountUp from './CountUp';
import RiskBadge from './RiskBadge';
import ConfidenceBar from './ConfidenceBar';
import { formatDate } from '../utils/formatUtils';

const TopMatchCard = ({ topMatch }) => {
  if (!topMatch) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-rose-500/5 opacity-50 group-hover:opacity-70 transition-opacity" />
      
      <div className="relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/20 rounded-xl border border-rose-500/30">
                <Shield className="w-6 h-6 text-rose-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white leading-none">
                  CRITICAL BREACH
                </h3>
                <p className="text-[10px] font-mono text-rose-500/70 tracking-[0.2em] mt-1 uppercase">
                  Primary Vector Detected
                </p>
              </div>
            </div>
          </div>
          <RiskBadge similarity={topMatch.similarity} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black tracking-widest text-gray-400 uppercase">
                <span>Core Similarity</span>
                <span className="text-white"><CountUp end={topMatch.similarity} suffix="%" /></span>
              </div>
              <ConfidenceBar similarity={topMatch.similarity} height="h-2.5" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                  <Fingerprint className="w-3 h-3 text-rose-500" />
                  Asset Signature
                </div>
                <div className="text-xs font-mono text-white truncate">{topMatch.assetName}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                  <Clock className="w-3 h-3 text-rose-500" />
                  Detection Time
                </div>
                <div className="text-xs font-mono text-white tracking-tighter">
                  {formatDate(new Date())}
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-rose-500/20 blur-[80px] rounded-full opacity-30" />
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-rose-500/30 shadow-2xl shadow-rose-500/20 translate-z-0 group-hover:scale-[1.02] transition-transform duration-500">
              <img 
                src={topMatch.previewUrl} 
                alt="Source" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                <div className="flex items-center gap-2 text-[8px] font-mono text-rose-400/80">
                  <Activity className="w-2.5 h-2.5" />
                  LIVE_FORENSIC_OVERLAY
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TopMatchCard;
