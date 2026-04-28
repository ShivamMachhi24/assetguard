import React from 'react';
import { motion } from 'framer-motion';
import { Layers, FileText, ChevronRight } from 'lucide-react';
import ConfidenceBar from './ConfidenceBar';

const MatchList = ({ matches }) => {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-gray-500" />
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
            Detected Instances
          </h4>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold text-gray-500">
          {matches.length} MATCHES_INDEXED
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300"
          >
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-black/40">
              <img 
                src={item.previewUrl} 
                alt="Match" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-white truncate pr-2">
                  {item.assetName}
                </span>
                <span className={`text-[10px] font-mono font-bold ${item.similarity > 80 ? 'text-rose-500' : 'text-amber-500'}`}>
                  {item.similarity}%
                </span>
              </div>
              <ConfidenceBar similarity={item.similarity} />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[8px] font-bold text-gray-500 uppercase tracking-tighter">
                  <FileText className="w-2.5 h-2.5" />
                  ID: {Math.random().toString(36).substring(7).toUpperCase()}
                </div>
              </div>
            </div>
            
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MatchList;
