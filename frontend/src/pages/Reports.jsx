import React, { useState, useEffect } from 'react';
import { bidsAPI } from '../services/api';
import StatusPill from '../components/StatusPill';
import ComplianceRing from '../components/ComplianceRing';

const MOCK_BIDS = [
  {
    bid_id: 'BID001', company_name: 'TechServe Solutions', bidder_name: 'Sunita Reddy',
    status: 'qualified', risk_level: 'low', compliance_score: 96,
    tender: 'TDR-2026-014 — Supply of IT Equipment for District Office',
    verification: { gst: 'verified', udyam: 'verified', pan: 'matched', auth: 'verified', declaration: 'verified' },
    findings: ['All documents verified against government sources', 'All tender requirements met', 'No risk factors identified'],
  },
  {
    bid_id: 'BID002', company_name: 'Global Infra Corp', bidder_name: 'Amit Patel',
    status: 'disqualified', risk_level: 'high', compliance_score: 45,
    tender: 'TDR-2026-014 — Supply of IT Equipment for District Office',
    verification: { gst: 'mismatch', udyam: 'expired', pan: 'matched', auth: 'review', declaration: 'missing' },
    findings: ['GSTIN mismatch with government records', 'Udyam certificate expired', 'Declaration document missing', 'Authorization letter has company name discrepancy'],
  },
  {
    bid_id: 'BID003', company_name: 'ABC Pvt Ltd', bidder_name: 'Vikram Mehta',
    status: 'pending_review', risk_level: 'medium', compliance_score: 82,
    tender: 'TDR-2026-014 — Supply of IT Equipment for District Office',
    verification: { gst: 'verified', udyam: 'verified', pan: 'matched', auth: 'review', declaration: 'verified' },
    findings: ['Authorization letter has minor company name discrepancy', 'Experience requirement not evidenced in documents'],
  },
];

export default function Reports() {
  const [bids, setBids] = useState(MOCK_BIDS);
  const [selectedBid, setSelectedBid] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await bidsAPI.getAll();
        const apiData = res?.data || res;
        if (Array.isArray(apiData) && apiData.length > 0) {
          // Merge API data with mock details
          const merged = MOCK_BIDS.map(mock => {
            const apiBid = apiData.find(b => b.bid_id === mock.bid_id);
            return apiBid ? { ...mock, ...apiBid, verification: mock.verification, findings: mock.findings, tender: mock.tender } : mock;
          });
          setBids(merged);
        }
      } catch (err) {
        console.error('Using mock report data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  const getVerStatusIcon = (status) => {
    if (status === 'verified' || status === 'matched') return <span className="text-verified-teal">✓</span>;
    if (status === 'mismatch' || status === 'expired' || status === 'missing') return <span className="text-seal-red">✗</span>;
    return <span className="text-review-amber">⚠</span>;
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl text-ink-navy">Procurement Reports</h1>
          <p className="text-slate-ink mt-1">Generated: {dateStr}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-ink-navy text-white px-6 py-2 rounded-lg font-medium hover:bg-ink-navy/90 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-ink-navy">
          <div className="text-3xl font-bold text-slate-ink">{bids.length}</div>
          <div className="text-sm text-gray-500">Total Bids Evaluated</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-verified-teal">
          <div className="text-3xl font-bold text-verified-teal">
            {bids.filter(b => ['qualified', 'verified'].includes((b.status || '').toLowerCase())).length}
          </div>
          <div className="text-sm text-gray-500">Qualified</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-seal-red">
          <div className="text-3xl font-bold text-seal-red">
            {bids.filter(b => (b.status || '').toLowerCase() === 'disqualified').length}
          </div>
          <div className="text-sm text-gray-500">Disqualified</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-review-amber">
          <div className="text-3xl font-bold text-review-amber">
            {bids.filter(b => ['pending_review', 'pending', 'review'].includes((b.status || '').toLowerCase())).length}
          </div>
          <div className="text-sm text-gray-500">Pending Review</div>
        </div>
      </div>

      {/* Tender Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-lg text-ink-navy mb-2">Tender Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Tender ID:</span> <span className="font-mono font-semibold">TDR-2026-014</span></div>
          <div><span className="text-gray-500">Department:</span> <span className="font-medium">Ministry of Electronics & IT</span></div>
          <div><span className="text-gray-500">Title:</span> <span className="font-medium">Supply of IT Equipment for District Office</span></div>
          <div><span className="text-gray-500">Report Date:</span> <span className="font-medium">{dateStr}</span></div>
        </div>
      </div>

      {/* Bidder Reports */}
      <div className="space-y-4">
        <h2 className="font-semibold text-xl text-ink-navy">Bidder Assessment Reports</h2>
        
        {bids.map((bid) => (
          <div key={bid.bid_id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div 
              className="p-5 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setSelectedBid(selectedBid === bid.bid_id ? null : bid.bid_id)}
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm font-semibold text-ink-navy">{bid.bid_id}</span>
                <div>
                  <h3 className="font-bold text-slate-ink">{bid.company_name}</h3>
                  <p className="text-xs text-gray-500">Bidder: {bid.bidder_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Score</p>
                  <p className="font-bold text-lg text-ink-navy">{bid.compliance_score}%</p>
                </div>
                <StatusPill status={bid.risk_level} />
                <StatusPill status={bid.status} />
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${selectedBid === bid.bid_id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Expanded Detail */}
            {selectedBid === bid.bid_id && (
              <div className="border-t border-gray-100 p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Verification Status */}
                  <div>
                    <h4 className="font-semibold text-sm text-ink-navy mb-3">Document Verification</h4>
                    <div className="space-y-2">
                      {Object.entries(bid.verification || {}).map(([doc, status]) => (
                        <div key={doc} className="flex justify-between items-center text-sm">
                          <span className="text-slate-ink capitalize">{doc.replace('_', ' ')} {doc === 'gst' ? 'Certificate' : doc === 'pan' ? 'Card' : doc === 'auth' ? 'Letter' : ''}</span>
                          <div className="flex items-center gap-2">
                            {getVerStatusIcon(status)}
                            <span className="text-xs font-medium capitalize">{status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Compliance Score Visual */}
                  <div className="flex flex-col items-center justify-center">
                    <ComplianceRing score={bid.compliance_score} size={100} />
                    <p className="text-sm text-gray-500 mt-2">Compliance Score</p>
                  </div>
                </div>

                {/* Key Findings */}
                <div>
                  <h4 className="font-semibold text-sm text-ink-navy mb-2">Key Findings</h4>
                  <ul className="space-y-1">
                    {(bid.findings || []).map((finding, idx) => (
                      <li key={idx} className="text-sm text-slate-ink flex items-start gap-2">
                        <span className="mt-1">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Decision */}
                <div className={`p-3 rounded-lg text-sm font-medium ${
                  bid.status === 'qualified' ? 'bg-verified-teal/10 text-verified-teal' :
                  bid.status === 'disqualified' ? 'bg-seal-red/10 text-seal-red' :
                  'bg-review-amber/10 text-review-amber'
                }`}>
                  Decision: {bid.status === 'qualified' ? '✅ QUALIFIED' : bid.status === 'disqualified' ? '❌ DISQUALIFIED' : '⚠️ PENDING REVIEW'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200">
        <p>BidSetu — AI-Powered Bid Compliance Verification Platform</p>
        <p>Report generated on {dateStr} | Prototype — Mock Government API Data</p>
      </div>
    </div>
  );
}
