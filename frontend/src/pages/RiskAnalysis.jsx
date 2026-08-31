import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { riskAPI, bidsAPI, complianceAPI } from '../services/api';
import StatusPill from '../components/StatusPill';
import ComplianceRing from '../components/ComplianceRing';

const MOCK_RISK_DATA = {
  'BID001': {
    bidder: 'Sunita Reddy', company: 'TechServe Solutions', bid_id: 'BID001',
    score: 96, risk_level: 'LOW',
    findings: [
      { category: 'Document Authenticity', status: 'pass', detail: 'All documents verified against government sources' },
      { category: 'GSTIN Validation', status: 'pass', detail: 'GSTIN 27FGHIJ5678K2Z3 matches GST Portal records' },
      { category: 'Udyam Registration', status: 'pass', detail: 'UDYAM-MH-01-0000042 is active and valid' },
      { category: 'PAN Verification', status: 'pass', detail: 'PAN FGHIJ5678K matches Income Tax records' },
      { category: 'Experience Requirement', status: 'pass', detail: 'Meets minimum 3 years experience requirement' },
      { category: 'Authorization', status: 'pass', detail: 'Authorization letter verified with matching company name' },
    ],
    recommendation: 'All documents verified. Bid meets all tender requirements. Low risk — recommended for qualification.',
  },
  'BID002': {
    bidder: 'Amit Patel', company: 'Global Infra Corp', bid_id: 'BID002',
    score: 45, risk_level: 'HIGH',
    findings: [
      { category: 'GSTIN Validation', status: 'fail', detail: 'GSTIN mismatch: Document shows 07KLMNO9012P3Z8, GST Portal shows 07KLMNX9999P3Z8' },
      { category: 'Udyam Registration', status: 'fail', detail: 'Udyam certificate UDYAM-DL-02-0000099 has expired' },
      { category: 'Declaration Document', status: 'fail', detail: 'Required declaration document is missing from submission' },
      { category: 'PAN Verification', status: 'pass', detail: 'PAN KLMNO9012P matches records' },
      { category: 'Authorization', status: 'review', detail: 'Authorization letter has company name discrepancy' },
      { category: 'Experience Requirement', status: 'review', detail: 'Unable to verify experience from submitted documents' },
    ],
    recommendation: 'Critical compliance failures detected. GSTIN mismatch with government records. Udyam certificate expired. Declaration document missing. High risk — recommended for disqualification.',
  },
  'BID003': {
    bidder: 'Vikram Mehta', company: 'ABC Pvt Ltd', bid_id: 'BID003',
    score: 82, risk_level: 'MEDIUM',
    findings: [
      { category: 'GSTIN Validation', status: 'pass', detail: 'GSTIN 23ABCDE1234F1Z5 verified against GST Portal' },
      { category: 'Udyam Registration', status: 'pass', detail: 'UDYAM-XX-00-0000001 is active and valid' },
      { category: 'PAN Verification', status: 'pass', detail: 'PAN ABCDE1234F matches Income Tax records' },
      { category: 'Authorization', status: 'review', detail: 'Company name on authorization: "ABC Private Limited" vs bid: "ABC Pvt Ltd"' },
      { category: 'Experience Requirement', status: 'fail', detail: 'Minimum 3 years experience not evidenced in submitted documents' },
      { category: 'Declaration Document', status: 'pass', detail: 'Self-declaration submitted and signed' },
    ],
    recommendation: 'Bid requires officer review. Authorization letter has a minor company name discrepancy. Experience requirement not evidenced. Medium risk.',
  },
};

export default function RiskAnalysis() {
  const { bidId } = useParams();
  const navigate = useNavigate();
  const effectiveId = bidId || 'BID003';
  const [data, setData] = useState(MOCK_RISK_DATA[effectiveId] || MOCK_RISK_DATA['BID003']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to get real data from API
        const [riskRes, bidRes] = await Promise.allSettled([
          riskAPI.getByBid(effectiveId),
          bidsAPI.getById(effectiveId)
        ]);

        let updated = { ...(MOCK_RISK_DATA[effectiveId] || MOCK_RISK_DATA['BID003']) };

        if (bidRes.status === 'fulfilled' && bidRes.value?.data) {
          const b = bidRes.value.data;
          updated.company = b.company_name || updated.company;
          updated.bidder = b.bidder_name || updated.bidder;
          if (b.compliance_score !== undefined) updated.score = b.compliance_score;
          if (b.risk_level) updated.risk_level = b.risk_level.toUpperCase();
        }

        setData(updated);
      } catch (err) {
        console.error('Using mock risk data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [effectiveId]);

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

  const passCount = data.findings.filter(f => f.status === 'pass').length;
  const failCount = data.findings.filter(f => f.status === 'fail').length;
  const reviewCount = data.findings.filter(f => f.status === 'review').length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink-navy">Risk Analysis</h1>
        <p className="text-slate-ink mt-1">Bid #{effectiveId} — {data.company}</p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Level Card */}
        <div className={`rounded-xl p-6 border-2 ${riskBg[data.risk_level] || riskBg.MEDIUM} flex flex-col items-center justify-center`}>
          <p className="text-sm font-medium text-gray-600 mb-2">Overall Risk Level</p>
          <p className={`text-4xl font-bold font-display ${riskColor[data.risk_level] || ''}`}>{data.risk_level}</p>
          <p className="text-xs text-gray-500 mt-2">Based on {data.findings.length} risk factors</p>
        </div>

        {/* Compliance Score */}
        <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-gray-600 mb-2">Compliance Score</p>
          <ComplianceRing score={data.score} size={120} />
        </div>

        {/* Factor Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-4">Factor Summary</p>
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
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-xl text-ink-navy mb-4">Risk Factors</h2>
        <div className="space-y-3">
          {data.findings.map((finding, idx) => {
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
      <div className={`rounded-xl p-6 shadow-sm border-l-4 bg-white ${
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
          onClick={() => navigate(`/compliance/${effectiveId}`)}
          className="px-6 py-3 border-2 border-ink-navy text-ink-navy rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          ← Back to Compliance
        </button>
        <button
          onClick={() => navigate(`/decision/${effectiveId}`)}
          className="bg-ink-navy text-white px-8 py-3 rounded-lg font-bold hover:bg-ink-navy/90 transition"
        >
          Proceed to Officer Decision
        </button>
      </div>
    </div>
  );
}
