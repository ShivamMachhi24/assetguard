import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Shield, AlertTriangle, CheckCircle, Search, Clock, Zap } from 'lucide-react';

export const AssetRegistry = ({ assets, onAdd, onDelete, onLoad }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'text-rose-500 border-rose-500/20 bg-rose-500/5';
      case 'medium': return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
      case 'low': return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
      default: return 'text-gray-500 border-gray-500/20 bg-gray-500/5';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'breach': return <AlertTriangle className="w-3 h-3 text-rose-500" />;
      case 'safe': return <CheckCircle className="w-3 h-3 text-emerald-500" />;
      case 'monitoring': return <MonitoringIcon className="w-3 h-3 text-emerald-400 animate-pulse" />;
      default: return <Clock className="w-3 h-3 text-gray-500" />;
    }
  };

  const MonitoringIcon = ({ className }) => <Zap className={className} />;

  return (
    <section className="mt-16 mb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Protected Asset Registry</h2>
          <p className="text-xs text-gray-500 font-mono">Manage and monitor verified digital property</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-xs font-bold hover:bg-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Register Asset
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="glass-card border-emerald-500/20 p-6 flex flex-col md:flex-row items-end gap-6">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-mono px-1">Asset Internal Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Master_Shield_Component_v1"
                  className="w-full bg-charcoal-border/20 border border-charcoal-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[10px] text-gray-500 uppercase font-mono px-1">Source Asset</p>
                <p className="text-[11px] text-emerald-500/70 py-2.5 px-1 italic">Will use currently uploaded "Original Source Asset"</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-2.5 rounded-lg text-xs font-bold text-gray-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onAdd(newName);
                    setNewName('');
                    setIsAdding(false);
                  }}
                  className="px-8 py-2.5 bg-emerald-500 text-black rounded-lg text-xs font-black uppercase tracking-wider hover:bg-emerald-400 transition-colors"
                >
                  Confirm Registration
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {assets.map((asset) => (
            <motion.div
              layout
              key={asset.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card border-emerald-500/10 p-5 group hover:border-emerald-500/30 transition-all duration-500 relative flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-charcoal-border/30 overflow-hidden border border-charcoal-border flex items-center justify-center">
                      {asset.image ? (
                        <img src={asset.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      ) : (
                        <Shield className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white truncate max-w-[140px]">{asset.name}</h4>
                      <p className="text-[10px] text-gray-500 font-mono">{String(asset?.id || "").slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-[9px] font-mono border ${getRiskColor(asset.risk)}`}>
                    RISK: {asset.risk?.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-charcoal-border/50">
                  <div className="space-y-1">
                    <p className="text-[9px] text-gray-500 uppercase font-mono">Current Status</p>
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(asset.status)}
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{asset.status || 'UNRANKED'}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] text-gray-500 uppercase font-mono">Last Scan</p>
                    <p className="text-[10px] text-gray-400 font-mono tracking-tighter">{asset.lastScan || 'NEVER'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-5 pt-2">
                <button 
                  onClick={() => onLoad(asset)}
                  className="flex-1 py-2 bg-charcoal-light border border-charcoal-border rounded-lg text-[10px] font-bold text-gray-400 hover:text-emerald-500 hover:border-emerald-500/40 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-3 h-3" />
                  Load for Scanning
                </button>
                <button 
                  onClick={() => onDelete(asset.id)}
                  className="p-2 bg-rose-500/5 border border-rose-500/10 rounded-lg text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {assets.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-charcoal-border rounded-2xl">
            <Shield className="w-12 h-12 text-gray-800 mb-4" />
            <p className="text-gray-600 font-mono text-sm">No protected assets in registry.</p>
          </div>
        )}
      </div>
    </section>
  );
};
