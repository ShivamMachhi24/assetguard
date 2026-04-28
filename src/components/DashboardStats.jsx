import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, ShieldAlert, Cpu } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, subtext, trend, highlight = false }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`glass-card p-5 border-emerald-500/10 relative overflow-hidden group transition-all duration-500 ${highlight ? 'border-rose-500/30 bg-rose-500/5' : ''}`}
  >
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-2">
          <motion.h3 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            key={value}
            className={`text-2xl font-black ${highlight ? 'text-rose-500' : 'text-white'}`}
          >
            {value}
          </motion.h3>
          {trend && <span className="text-[10px] text-emerald-500 font-mono">{trend}</span>}
        </div>
        <p className="text-[10px] text-gray-600 font-mono italic">{subtext}</p>
      </div>
      <div className={`p-2 rounded-lg ${highlight ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    
    {/* Animated background accent */}
    <div className={`absolute -bottom-2 -right-2 w-16 h-16 blur-2xl rounded-full opacity-20 ${highlight ? 'bg-rose-500' : 'bg-emerald-500'}`} />
  </motion.div>
);

export const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <StatCard 
        icon={Shield}
        label="Protected Assets"
        value={stats.totalAssets}
        subtext="Stored in local registry"
        trend="+100% Secure"
      />
      <StatCard 
        icon={Activity}
        label="Active Monitors"
        value={stats.activeMonitoring}
        subtext="Real-time scan loops"
        trend="Live Status"
      />
      <StatCard 
        highlight={stats.breachCount > 0}
        icon={ShieldAlert}
        label="Integrity Breaches"
        value={stats.breachCount}
        subtext="Unauthorized matches found"
        trend={stats.breachCount > 0 ? "ACTION REQUIRED" : "No Threats"}
      />
      <StatCard 
        icon={Cpu}
        label="Neural Load"
        value="0.12ms"
        subtext="Processing latency"
        trend="Optimal"
      />
    </div>
  );
};
