import React from 'react';

const StatusPill = ({ status, size = 'sm' }) => {
  const normalizedStatus = status?.toLowerCase() || '';
  
  let colorClasses = 'bg-gray-100 text-gray-800 border-gray-300';
  let displayStatus = status || 'Unknown';

  if (['verified', 'qualified', 'pass', 'low', 'active'].includes(normalizedStatus)) {
    colorClasses = 'bg-verified-teal/10 text-verified-teal border-verified-teal';
  } else if (['review', 'pending', 'pending_review', 'medium'].includes(normalizedStatus)) {
    colorClasses = 'bg-review-amber/10 text-review-amber border-review-amber';
    if (normalizedStatus === 'pending_review') displayStatus = 'Pending Review';
  } else if (['failed', 'disqualified', 'high', 'mismatch', 'expired', 'missing'].includes(normalizedStatus)) {
    colorClasses = 'bg-seal-red/10 text-seal-red border-seal-red';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full font-semibold uppercase border ${colorClasses} ${sizeClasses}`}>
      {displayStatus}
    </span>
  );
};

export default StatusPill;
