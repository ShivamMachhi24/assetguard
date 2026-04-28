import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { getRiskMetrics } from '../utils/riskUtils';

const RiskBadge = ({ similarity }) => {
  const metrics = getRiskMetrics(similarity);
  
  return (
    <div className={`px-3 py-1.5 rounded-full border ${metrics.bg} ${metrics.border} flex items-center gap-2`}>
      <ShieldAlert className={`w-3.5 h-3.5 ${metrics.color}`} />
      <span className={`text-[10px] font-black tracking-widest ${metrics.color}`}>
        {metrics.label}
      </span>
    </div>
  );
};

export default RiskBadge;
