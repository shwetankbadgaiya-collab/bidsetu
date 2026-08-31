import React, { useEffect, useState } from 'react';

const Seal = ({ status, text, size = 80 }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 200);
    return () => clearTimeout(timer);
  }, [status]);

  let fillColor = '#C98A1F'; // review-amber
  let statusText = text || 'REVIEW';

  const normalizedStatus = status?.toLowerCase() || '';

  if (['verified', 'matched', 'qualified', 'pass'].includes(normalizedStatus)) {
    fillColor = '#1F7A66'; // verified-teal
    statusText = text || 'VERIFIED';
  } else if (['failed', 'mismatch', 'disqualified', 'missing', 'expired'].includes(normalizedStatus)) {
    fillColor = '#A63A31'; // seal-red
    statusText = text || 'FAILED';
  } else if (['review', 'pending'].includes(normalizedStatus)) {
    fillColor = '#C98A1F'; // review-amber
    statusText = text || 'REVIEW';
  }

  return (
    <div 
      className={`inline-block ${isAnimating ? 'scale-110 -rotate-6' : 'scale-100 rotate-0'} transition-transform duration-200 ease-out`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
        {/* Outer Ring */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="#132340" strokeWidth="3" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#132340" strokeWidth="1" strokeDasharray="2 2" />
        
        {/* Inner Fill */}
        <circle cx="50" cy="50" r="38" fill={fillColor} />
        
        {/* Text */}
        <text 
          x="50" 
          y="52" 
          fontFamily="'Fraunces', serif" 
          fontSize="12" 
          fontWeight="bold" 
          fill="white" 
          textAnchor="middle" 
          alignmentBaseline="middle"
          letterSpacing="1"
        >
          {statusText.toUpperCase()}
        </text>
      </svg>
    </div>
  );
};

export default Seal;
