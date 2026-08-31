import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Seal from '../components/Seal';

const STEPS = [
  { id: 1, label: 'Documents Uploaded', duration: 0 }, // Instant
  { id: 2, label: 'Running OCR Engine', duration: 900 },
  { id: 3, label: 'Information Extracted', duration: 900 },
  { id: 4, label: 'Fields Classified', duration: 800 },
  { id: 5, label: 'Government Source Verification', duration: 1200 },
  { id: 6, label: 'Compliance Checking', duration: 800 },
  { id: 7, label: 'Risk Analysis Complete', duration: 700 },
];

const Processing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bidId = searchParams.get('bid_id') || 'BID003';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timeoutId;
    
    const processNextStep = (stepIndex) => {
      if (stepIndex >= STEPS.length) {
        setIsComplete(true);
        return;
      }
      
      setCurrentStep(STEPS[stepIndex].id);
      
      timeoutId = setTimeout(() => {
        processNextStep(stepIndex + 1);
      }, STEPS[stepIndex].duration);
    };

    // Start processing from step 1 (index 1 because step 0 is instant)
    processNextStep(1);

    return () => clearTimeout(timeoutId);
  }, []);

  const progressPercentage = Math.min(100, Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100));

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
        
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl text-ink-navy mb-2">AI Verification Pipeline</h1>
          <p className="text-gray-500 font-mono text-sm">Processing {bidId}</p>
        </div>

        <div className="mb-10">
          <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2 px-1">
            <span>Overall Progress</span>
            <span>{isComplete ? 100 : progressPercentage}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-ink-navy transition-all duration-300 ease-out"
              style={{ width: `${isComplete ? 100 : progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-6 pl-4 border-l-2 border-gray-100 ml-4 relative">
          {STEPS.map((step) => {
            const isCompleted = isComplete || step.id < currentStep;
            const isCurrent = !isComplete && step.id === currentStep;
            
            return (
              <div key={step.id} className="flex items-center relative">
                {/* Status Indicator */}
                <div className={`absolute -left-[25px] w-5 h-5 rounded-full flex items-center justify-center bg-white border-2 transition-colors ${
                  isCompleted ? 'border-verified-teal bg-verified-teal' :
                  isCurrent ? 'border-ink-navy border-t-transparent animate-spin' :
                  'border-gray-200'
                }`}>
                  {isCompleted && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                
                <span className={`ml-4 text-sm font-medium transition-colors ${
                  isCompleted ? 'text-slate-ink' :
                  isCurrent ? 'text-ink-navy' :
                  'text-gray-400'
                }`}>
                  {step.label}
                  {isCurrent && <span className="inline-block ml-1 animate-pulse">...</span>}
                </span>
              </div>
            );
          })}
        </div>

        {isComplete && (
          <div className="mt-12 text-center animate-fade-in-up">
            <div className="mb-4">
              <Seal status="verified" text="COMPLETE" size={100} />
            </div>
            <h2 className="text-xl font-bold text-slate-ink mb-6">Verification Complete!</h2>
            <button 
              onClick={() => navigate(`/verification/${bidId}`)}
              className="bg-ink-navy text-white px-8 py-3 rounded-lg font-semibold hover:bg-ink-navy/90 transition shadow-md hover:shadow-lg"
            >
              View Results
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Processing;
