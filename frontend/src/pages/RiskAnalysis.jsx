import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { riskAPI, bidsAPI, complianceAPI } from '../services/api';
import StatusPill from '../components/StatusPill';
import ComplianceRing from '../components/ComplianceRing';

const DEFAULT_RISK_DATA = {
  bidder: 'Vikram Mehta', company: 'ABC Pvt Ltd', bid_id: 'BID003',
  score: 82, risk_level: 'MEDIUM',
  findings: [
    { category: 'Document Authenticity', status: 'pass', detail: 'All submitted certificates parsed and validated' },
    { category: 'GSTIN Validation', status: 'pass', detail: 'GST Registration verified against GST Portal records' },
    { category: 'Udyam Registration', status: 'pass', detail: 'Udyam MSME certificate is active' },
    { category: 'PAN Verification', status: 'pass', detail: 'PAN details match tax authority records' },
    { category: 'Authorization', status: 'review', detail: 'Minor company name variation observed on authorization' },
    { category: 'Tender Requirements', status: 'pass', detail: 'Mandatory technical parameters met' },
  ],
  recommendation: 'Bid requires officer review due to authorization letter discrepancy. Medium risk tier.',
};

export default function RiskAnalysis() {
  const { bidId } = useParams();
  const navigate = useNavigate();
  const effectiveBidId = bidId || 'BID003';
  
  const [data, setData] = useState({ ...DEFAULT_RISK_DATA, bid_id: effectiveBidId });
  const [bidInfo, setBidInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [riskRes, bidRes, compRes] = await Promise.allSettled([
          riskAPI.getByBid(effectiveBidId),
          bidsAPI.getById(effectiveBidId),
          complianceAPI.getByBid(effectiveBidId)
        ]);

        let updated = { ...DEFAULT_RISK_DATA, bid_id: effectiveBidId };

        if (bidRes.status === 'fulfilled' && bidRes.value?.data) {
          const b = bidRes.value.data;
          setBidInfo(b);
          updated.company = b.company_name || updated.company;
          updated.bidder = b.bidder_name || updated.bidder;
          if (b.compliance_score !== undefined && b.compliance_score > 0) updated.score = b.compliance_score;
          if (b.risk_level) updated.risk_level = b.risk_level.toUpperCase();
        }

        if (compRes.status === 'fulfilled' && compRes.value?.data) {
          const c = compRes.value.data;
          if (c.score !== undefined) updated.score = c.score;
          if (c.risk_level) updated.risk_level = c.risk_level.toUpperCase();
          if (c.recommendation) updated.recommendation = c.recommendation;
          
          if (c.results && Array.isArray(c.results) && c.results.length > 0) {
            updated.findings = c.results.map((r, i) => ({
              category: r.requirement.replace(/_/g, ' ').toUpperCase(),
              status: r.status === 'pass' ? 'pass' : (r.status === 'review' ? 'review' : 'fail'),
              detail: r.evidence ? `${r.requirement}: ${r.evidence}` : `Verification status: ${r.status}`
            }));
          }
        }

        if (riskRes.status === 'fulfilled' && riskRes.value?.data) {
          const r = riskRes.value.data;
          if (r.risk_level) updated.risk_level = r.risk_level.toUpperCase();
          if (r.recommendation) updated.recommendation = r.recommendation;
        }

        setData(updated);
      } catch (err) {
        console.warn('Using mock risk data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [effectiveBidId]);

  const riskColor = {
    LOW: 'text-verified-teal',
    MEDIUM: 'text-review-amber', 
    HIGH: 'text-seal-red',
  };

  const riskBg = {
    LOW: 'bg-verified-teal/10 border-verified-teal',
    MEDIUM: 'bg-review-amber/10 border-review-amber',
    HIGH: 'bg-seal-red/10 border-seal-red',
  };

  const passCount = data.findings ? data.findings.filter(f => f.status === 'pass').length : 4;
  const failCount = data.findings ? data.findings.filter(f => f.status === 'fail').length : 0;
  const reviewCount = data.findings ? data.findings.filter(f => f.status === 'review').length : 1;

  const tenderInfo = bidInfo?.tender_code ? `${bidInfo.tender_code} — ${bidInfo.tender_title}` : '';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink-navy">Risk Analysis</h1>
        <p className="text-slate-ink mt-1 font-mono">
          Bid ID: <span className="font-bold text-ink-navy">{effectiveBidId}</span> | Vendor: <span className="font-semibold">{data.company}</span>
          {tenderInfo && <span className="text-gray-500 font-sans text-xs ml-2">({tenderInfo})</span>}
        </p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Level Card */}
        <div className={`rounded-xl p-6 border-2 ${riskBg[data.risk_level] || riskBg.MEDIUM} flex flex-col items-center justify-center bg-white shadow-sm`}>
          <p className="text-sm font-medium text-gray-600 mb-2">Overall Risk Level</p>
          <p className={`text-4xl font-bold font-display ${riskColor[data.risk_level] || 'text-review-amber'}`}>{data.risk_level}</p>
          <p className="text-xs text-gray-500 mt-2">Based on {data.findings?.length || 5} risk factors</p>
        </div>

        {/* Compliance Score */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-gray-600 mb-2">Compliance Score</p>
          <ComplianceRing score={data.score} size={120} />
        </div>

        {/* Factor Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-600 mb-4">Factor Breakdown</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-ink">Passed</span>
              <span className="text-verified-teal font-bold text-lg">{passCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-ink">Needs Review</span>
              <span className="text-review-amber font-bold text-lg">{reviewCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-ink">Failed</span>
              <span className="text-seal-red font-bold text-lg">{failCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-xl text-ink-navy mb-4">Evaluated Risk Factors</h2>
        <div className="space-y-3">
          {data.findings && data.findings.map((finding, idx) => {
            let icon, statusClass;
            if (finding.status === 'pass') {
              icon = <span className="text-verified-teal font-bold text-lg">✓</span>;
              statusClass = 'verified';
            } else if (finding.status === 'fail') {
              icon = <span className="text-seal-red font-bold text-lg">✗</span>;
              statusClass = 'failed';
            } else {
              icon = <span className="text-review-amber font-bold text-lg">⚠</span>;
              statusClass = 'review';
            }

            return (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                <div className="mt-0.5">{icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-slate-ink">{finding.category}</h3>
                    <StatusPill status={statusClass} />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{finding.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Recommendation */}
      <div className={`rounded-xl p-6 shadow-sm border-l-4 bg-white border-t border-r border-b border-gray-100 ${
        data.risk_level === 'HIGH' ? 'border-seal-red' : data.risk_level === 'LOW' ? 'border-verified-teal' : 'border-review-amber'
      }`}>
        <h2 className="font-semibold text-lg text-ink-navy mb-3 flex items-center gap-2">
          <span>🤖</span> AI Risk Assessment
        </h2>
        <p className="text-slate-ink font-medium">{data.recommendation}</p>
        <p className="text-xs italic text-gray-400 mt-3">This assessment is advisory. The officer makes the final decision.</p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => navigate(`/compliance/${encodeURIComponent(effectiveBidId)}`)}
          className="px-6 py-3 border-2 border-ink-navy text-ink-navy rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          ← Back to Compliance
        </button>
        <button
          onClick={() => navigate(`/decision/${encodeURIComponent(effectiveBidId)}`)}
          className="bg-ink-navy text-white px-8 py-3 rounded-lg font-bold hover:bg-ink-navy/90 transition shadow"
        >
          Proceed to Officer Decision
        </button>
      </div>
    </div>
  );
}
