import React from 'react';
import { motion } from 'framer-motion';

const ConfidenceBar = ({ similarity, height = "h-1.5" }) => {
  const getColor = (val) => {
    if (val > 80) return "bg-rose-500";
    if (val > 50) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className={`w-full ${height} bg-white/5 rounded-full overflow-hidden`}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${similarity}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full ${getColor(similarity)} shadow-[0_0_10px_rgba(0,0,0,0.3)]`}
      />
    </div>
  );
};

export default ConfidenceBar;
