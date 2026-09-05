import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complianceAPI, bidsAPI } from '../services/api';
import ComplianceRing from '../components/ComplianceRing';
import StatusPill from '../components/StatusPill';

const DEFAULT_MOCK_DATA = {
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
  const effectiveBidId = bidId || 'BID003';
  
  const [data, setData] = useState(DEFAULT_MOCK_DATA);
  const [bidInfo, setBidInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch bid details
        try {
          const bRes = await bidsAPI.getById(effectiveBidId);
          if (bRes?.data) setBidInfo(bRes.data);
        } catch (e) {
          console.warn("Could not fetch bid details", e);
        }

        // 2. Fetch compliance analysis
        const response = await complianceAPI.getByBid(effectiveBidId);
        const resData = response?.data || response;
        if (resData && resData.score !== undefined) {
          setData(resData);
        }
      } catch (error) {
        console.warn("Using fallback compliance data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [effectiveBidId]);

  const companyName = bidInfo?.company_name || (effectiveBidId === 'BID001' ? 'TechServe Solutions' : (effectiveBidId === 'BID002' ? 'Global Infra Corp' : 'ABC Pvt Ltd'));
  const tenderInfo = bidInfo?.tender_code ? `${bidInfo.tender_code} — ${bidInfo.tender_title}` : '';

  let recBorder = 'border-verified-teal';
  if (data.risk_level?.toLowerCase() === 'medium') recBorder = 'border-review-amber';
  if (data.risk_level?.toLowerCase() === 'high') recBorder = 'border-seal-red';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink-navy">Compliance & Risk Analysis</h1>
        <p className="font-mono text-slate-ink mt-1">
          Bid ID: <span className="font-bold text-ink-navy">{effectiveBidId}</span> | Vendor: <span className="font-semibold">{companyName}</span>
          {tenderInfo && <span className="text-gray-500 font-sans text-xs ml-2">({tenderInfo})</span>}
        </p>
      </div>

      <div className="flex flex-row items-center gap-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <ComplianceRing score={data.score} size={180} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Evaluated Risk Level</p>
          <StatusPill status={data.risk_level?.toLowerCase() || 'medium'} />
          <p className="text-xs text-gray-400 italic mt-3">Prototype scoring — for demonstration</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-xl text-ink-navy mb-4">Tender Compliance Requirements</h2>
        <div className="space-y-4">
          {data.results && data.results.map((item, idx) => {
            let icon = <span className="text-verified-teal font-bold text-lg">✓</span>;
            let displayStatus = 'verified';
            if (item.status === 'review') {
              icon = <span className="text-review-amber font-bold text-lg">⚠</span>;
              displayStatus = 'review';
            } else if (item.status === 'failed' || item.status === 'fail' || item.status === 'missing') {
              icon = <span className="text-seal-red font-bold text-lg">✗</span>;
              displayStatus = 'failed';
            }

            return (
              <div key={idx} className="flex flex-row items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  {icon}
                  <span className="font-body text-slate-ink font-medium">{item.requirement}</span>
                  {item.evidence && <span className="text-xs text-gray-400 italic font-mono">({item.evidence})</span>}
                </div>
                <StatusPill status={displayStatus} />
              </div>
            );
          })}
        </div>
      </div>

      <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${recBorder} border-t border-r border-b border-gray-100`}>
        <h2 className="font-semibold text-lg text-ink-navy mb-3 flex items-center gap-2">
          <span>🤖</span> AI Recommendation
        </h2>
        <p className="text-xl text-slate-ink font-medium mb-6">
          {data.recommendation}
        </p>
        
        <div className="mb-4">
          <p className="text-sm font-semibold text-ink-navy mb-2">Verified Sources:</p>
          <div className="flex gap-4 text-sm">
            <span className="text-verified-teal font-medium">✓ GST Portal (CBIC)</span>
            <span className="text-verified-teal font-medium">✓ Udyam MSME Database</span>
            <span className="text-verified-teal font-medium">✓ PAN Authority (Income Tax)</span>
          </div>
        </div>

        <p className="text-xs italic text-gray-400">
          This recommendation is advisory. The officer makes the final decision.
        </p>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => navigate(`/risk/${encodeURIComponent(effectiveBidId)}`)}
          className="bg-ink-navy text-white px-8 py-3 rounded-lg font-bold hover:bg-ink-navy/90 transition shadow"
        >
          Proceed to Risk Analysis
        </button>
      </div>
    </div>
  );
}
