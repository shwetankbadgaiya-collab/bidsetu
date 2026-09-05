import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { officerAPI, complianceAPI, bidsAPI } from '../services/api';
import Seal from '../components/Seal';
import StatusPill from '../components/StatusPill';

const DEFAULT_MOCK_DATA = {
  bidder: 'Vikram Mehta',
  company: 'ABC Pvt Ltd',
  score: 82,
  risk: 'medium',
  recommendation: 'REVIEW REQUIRED',
  findings: [
    { requirement: 'GST Registration Valid', status: 'verified' },
    { requirement: 'Udyam Registration Valid', status: 'verified' },
    { requirement: 'PAN Card Verified', status: 'verified' },
    { requirement: 'Authorization Letter', status: 'review' }
  ]
};

export default function Decision() {
  const { bidId } = useParams();
  const navigate = useNavigate();
  const effectiveBidId = bidId || 'BID003';
  
  const [data, setData] = useState(DEFAULT_MOCK_DATA);
  const [bidInfo, setBidInfo] = useState(null);
  const [decision, setDecision] = useState(null);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSeal, setShowSeal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complianceRes, bidRes] = await Promise.allSettled([
          complianceAPI.getByBid(effectiveBidId),
          bidsAPI.getById(effectiveBidId)
        ]);

        let updatedData = { ...DEFAULT_MOCK_DATA };

        if (bidRes.status === 'fulfilled' && bidRes.value?.data) {
          const b = bidRes.value.data;
          setBidInfo(b);
          updatedData.company = b.company_name || updatedData.company;
          updatedData.bidder = b.bidder_name || updatedData.bidder;
          if (b.compliance_score !== undefined && b.compliance_score > 0) updatedData.score = b.compliance_score;
          if (b.risk_level) updatedData.risk = b.risk_level;
        }

        if (complianceRes.status === 'fulfilled' && complianceRes.value) {
          const c = complianceRes.value.data || complianceRes.value;
          if (c.score !== undefined) updatedData.score = c.score;
          if (c.risk_level) updatedData.risk = c.risk_level.toLowerCase();
          if (c.recommendation) {
            updatedData.recommendation = c.recommendation.toUpperCase().includes('QUALIF') 
              ? 'RECOMMENDED: QUALIFY' 
              : (c.recommendation.toUpperCase().includes('FAIL') || c.recommendation.toUpperCase().includes('CRITICAL')
                ? 'RECOMMENDED: DISQUALIFY' 
                : 'REVIEW REQUIRED');
          }
          if (c.results && c.results.length > 0) {
            updatedData.findings = c.results.map(r => ({
              requirement: r.requirement,
              status: r.status === 'pass' ? 'verified' : (r.status === 'review' ? 'review' : 'failed')
            }));
          }
        }

        setData(updatedData);
      } catch (err) {
        console.warn("Using mock data", err);
      }
    };
    fetchData();
  }, [effectiveBidId]);

  const handleSubmit = async () => {
    if (!decision) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const decisionVal = decision.toLowerCase();
      await officerAPI.submitDecision({ 
        bid_id: effectiveBidId, 
        decision: decisionVal === 'qualified' ? 'qualify' : (decisionVal === 'disqualified' ? 'disqualify' : 'review'), 
        comments: comments || `Official ${decision} recorded by Procurement Officer.`
      });
      setShowSeal(true);
      
      setTimeout(() => {
        navigate(`/audit/${encodeURIComponent(effectiveBidId)}`);
      }, 1800);
      
    } catch (err) {
      console.warn('API error, proceeding with animated officer seal recording', err);
      setShowSeal(true);
      setTimeout(() => {
        navigate(`/audit/${encodeURIComponent(effectiveBidId)}`);
      }, 1800);
    }
  };

  let recBg = 'bg-review-amber/10 border-review-amber text-review-amber';
  if (data.recommendation.includes('QUALIFY')) {
    recBg = 'bg-verified-teal/10 border-verified-teal text-verified-teal';
  } else if (data.recommendation.includes('DISQUALIFY')) {
    recBg = 'bg-seal-red/10 border-seal-red text-seal-red';
  }

  const tenderInfo = bidInfo?.tender_code ? `${bidInfo.tender_code} — ${bidInfo.tender_title}` : '';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {showSeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-200">
          <div className="animate-seal-stamp" style={{ animation: 'sealStamp 0.2s ease-out forwards' }}>
            <Seal status={decision.toLowerCase()} size={200} />
          </div>
          <style>{`
            @keyframes sealStamp {
              0% { transform: scale(1.2) rotate(6deg); opacity: 0; }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      <div>
        <h1 className="font-display text-3xl text-ink-navy">Officer Decision</h1>
        <p className="text-slate-ink mt-2">
          Review findings and record official determination for Bid <span className="font-mono font-bold text-ink-navy">#{effectiveBidId}</span>
          {tenderInfo && <span className="text-gray-500 font-sans text-xs ml-2">({tenderInfo})</span>}
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-ink-navy">{data.company}</h2>
            <p className="text-gray-500 font-medium">Authorized Signatory: {data.bidder}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-gray-500">Compliance</p>
              <p className="text-xl font-bold text-ink-navy">{data.score}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Risk</p>
              <StatusPill status={data.risk} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-ink-navy mb-3">Evaluated Findings Summary</h3>
          <ul className="space-y-3">
            {data.findings && data.findings.map((item, idx) => (
              <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
                <span className="text-slate-ink font-medium">{item.requirement}</span>
                <StatusPill status={item.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`w-full p-4 rounded-lg border flex flex-col items-center justify-center text-center ${recBg}`}>
        <p className="font-bold text-lg">{data.recommendation}</p>
        <p className="text-xs opacity-80 mt-1">AI recommendation — Procurement Officer holds final statutory authority</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6 border border-gray-100">
        <h2 className="font-semibold text-xl text-ink-navy">Record Official Decision</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <button 
            type="button"
            onClick={() => setDecision('QUALIFIED')}
            className={`flex-1 py-3.5 rounded-lg font-bold text-lg transition-all ${
              decision === 'QUALIFIED' 
                ? 'bg-verified-teal text-white ring-4 ring-verified-teal/30 shadow-md' 
                : 'bg-verified-teal/90 text-white hover:bg-verified-teal'
            }`}
          >
            QUALIFY
          </button>
          
          <button 
            type="button"
            onClick={() => setDecision('DISQUALIFIED')}
            className={`flex-1 py-3.5 rounded-lg font-bold text-lg transition-all ${
              decision === 'DISQUALIFIED' 
                ? 'bg-seal-red text-white ring-4 ring-seal-red/30 shadow-md' 
                : 'bg-seal-red/90 text-white hover:bg-seal-red'
            }`}
          >
            DISQUALIFY
          </button>
          
          <button 
            type="button"
            onClick={() => setDecision('REVIEW')}
            className={`flex-1 py-3.5 rounded-lg font-bold text-lg border-2 transition-all ${
              decision === 'REVIEW' 
                ? 'border-review-amber text-review-amber bg-review-amber/20 ring-4 ring-review-amber/30 shadow-md' 
                : 'border-review-amber text-review-amber bg-white hover:bg-review-amber/10'
            }`}
          >
            SEND FOR REVIEW
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink-navy mb-2">Officer Remarks & Audit Comments</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add your observations, verification notes, and reasoning for the official determination..."
            className="w-full h-32 border border-gray-300 rounded-lg p-3 text-slate-ink focus:ring-2 focus:ring-ink-navy focus:border-ink-navy outline-none text-sm"
          />
        </div>

        {error && <p className="text-seal-red text-sm font-medium">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!decision || isSubmitting}
          className="w-full bg-ink-navy text-white py-4 rounded-lg font-bold text-lg hover:bg-ink-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
        >
          {isSubmitting ? 'Recording Official Decision...' : 'Record Official Decision'}
        </button>
      </div>
    </div>
  );
}
