import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { complianceAPI } from '../services/api';
import ComplianceRing from '../components/ComplianceRing';
import StatusPill from '../components/StatusPill';

const MOCK_DATA = {
  score: 82,
  risk_level: 'medium',
  recommendation: 'Bid requires officer review due to one unverified requirement and authorization letter discrepancy.',
  results: [
    { requirement: 'GST Registration Valid', status: 'verified' },
    { requirement: 'Udyam Registration Valid', status: 'verified' },
    { requirement: 'PAN Card Verified', status: 'verified' },
    { requirement: 'Authorization Letter', status: 'review' }
  ]
};

export default function Compliance() {
  const { bidId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await complianceAPI.getByBid(bidId || 'BID003');
        const resData = response?.data || response;
        if (resData && resData.score !== undefined) {
          setData(resData);
        }
      } catch (error) {
        console.error("Using mock data due to API error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bidId]);

  let recBorder = 'border-verified-teal';
  if (data.risk_level === 'medium') recBorder = 'border-review-amber';
  if (data.risk_level === 'high') recBorder = 'border-seal-red';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink-navy">Compliance & Risk Analysis</h1>
      </div>

      <div className="flex flex-row items-center gap-8">
        <div>
          <ComplianceRing score={data.score} size={180} />
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-2">Risk Level</p>
          <StatusPill status={data.risk_level} />
          <p className="text-xs text-gray-400 italic mt-3">Prototype scoring — for demonstration</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-xl text-ink-navy mb-4">Compliance Findings</h2>
        <div className="space-y-4">
          {data.results.map((item, idx) => {
            let icon = <span className="text-verified-teal font-bold text-lg">✓</span>;
            let displayStatus = 'verified';
            if (item.status === 'review') {
              icon = <span className="text-review-amber font-bold text-lg">⚠</span>;
              displayStatus = 'review';
            } else if (item.status === 'failed' || item.status === 'missing') {
              icon = <span className="text-seal-red font-bold text-lg">✗</span>;
              displayStatus = 'failed';
            }

            return (
              <div key={idx} className="flex flex-row items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  {icon}
                  <span className="font-body text-slate-ink">{item.requirement}</span>
                </div>
                <StatusPill status={displayStatus} />
              </div>
            );
          })}
        </div>
      </div>

      <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${recBorder}`}>
        <h2 className="font-semibold text-lg text-ink-navy mb-3 flex items-center gap-2">
          <span>🤖</span> AI Recommendation
        </h2>
        <p className="text-xl text-slate-ink font-medium mb-6">
          {data.recommendation}
        </p>
        
        <div className="mb-4">
          <p className="text-sm font-semibold text-ink-navy mb-2">Evidence:</p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="text-verified-teal hover:underline font-medium">View GST Source</a>
            <a href="#" className="text-verified-teal hover:underline font-medium">View Udyam Source</a>
            <a href="#" className="text-verified-teal hover:underline font-medium">View Document</a>
          </div>
        </div>

        <p className="text-xs italic text-gray-400">
          This recommendation is advisory. The officer makes the final decision.
        </p>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => navigate(`/risk/${bidId || 'BID003'}`)}
          className="bg-ink-navy text-white px-8 py-3 rounded-lg font-bold hover:bg-ink-navy/90 transition-colors"
        >
          Proceed to Risk Analysis
        </button>
      </div>
    </div>
  );
}
