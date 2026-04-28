export const getRiskMetrics = (similarity) => {
  if (similarity >= 80) return { label: 'HIGH RISK', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
  if (similarity >= 55) return { label: 'MEDIUM RISK', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
  return { label: 'LOW RISK', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
};

export const getEvidenceLevel = (confidence) => {
  if (confidence > 90) return 'STRONG';
  if (confidence > 75) return 'MODERATE';
  return 'WEAK';
};
