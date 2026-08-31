import React, { useEffect, useState } from 'react';

const ComplianceRing = ({ score = 0, size = 180 }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Animate to the target score
    const timer = setTimeout(() => {
      setProgress(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  let color = '#A63A31'; // seal-red
  if (progress >= 80) color = '#1F7A66'; // verified-teal
  else if (progress >= 60) color = '#C98A1F'; // review-amber

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E5E5"
          strokeWidth={strokeWidth}
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-display font-bold" style={{ fontSize: size * 0.25, lineHeight: 1 }}>
          {Math.round(progress)}%
        </span>
        <span className="font-body text-slate-ink/70" style={{ fontSize: size * 0.07, marginTop: 4 }}>
          Compliance Score
        </span>
      </div>
    </div>
  );
};

export default ComplianceRing;
