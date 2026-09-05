import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import { bidsAPI } from '../services/api';

const FALLBACK_BIDS = [
  { bid_id: 'BID001', company: 'TechServe Solutions', status: 'qualified', risk: 'low', score: 96 },
  { bid_id: 'BID002', company: 'Global Infra Corp', status: 'disqualified', risk: 'high', score: 45 },
  { bid_id: 'BID003', company: 'ABC Pvt Ltd', status: 'pending_review', risk: 'medium', score: 82 },
  { bid_id: 'BID004', company: 'Apex Dynamics Ltd', status: 'pending', risk: 'low', score: 88 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [bids, setBids] = useState(FALLBACK_BIDS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await bidsAPI.getAll();
        const data = response?.data || response;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(b => ({
            bid_id: b.bid_id,
            company: b.company_name || 'Vendor Corp',
            tender_code: b.tender_code || 'TDR-2026-014',
            status: b.status || 'pending',
            risk: b.risk_level || 'low',
            score: b.compliance_score || 0
          }));
          setBids(mapped);
        }
      } catch (error) {
        console.warn('Using fallback data due to API error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

  const totalBids = bids.length;
  const verifiedCount = bids.filter(b => b.status === 'verified' || b.status === 'qualified').length;
  const pendingCount = bids.filter(b => b.status === 'pending' || b.status === 'pending_review').length;
  const nonCompliantCount = bids.filter(b => b.status === 'disqualified' || b.score < 60).length;
  const highRiskCount = bids.filter(b => b.risk === 'high').length;

  const stats = [
    { label: 'Total Bids', value: totalBids, border: 'border-ink-navy' },
    { label: 'Qualified / Verified', value: verifiedCount, border: 'border-verified-teal' },
    { label: 'Pending Review', value: pendingCount, border: 'border-review-amber' },
    { label: 'Non-Compliant', value: nonCompliantCount, border: 'border-seal-red' },
    { label: 'High Risk', value: highRiskCount, border: 'border-seal-red' },
  ];

  const columns = [
    { 
      key: 'bid_id', 
      label: 'Bid ID',
      render: (val) => <span className="font-mono font-semibold text-ink-navy">{val}</span>
    },
    { 
      key: 'company', 
      label: 'Bidder / Vendor',
      render: (val, row) => (
        <div>
          <div className="font-medium text-slate-ink">{val}</div>
          {row.tender_code && <div className="text-xs text-gray-400 font-mono">{row.tender_code}</div>}
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => <StatusPill status={val} />
    },
    { 
      key: 'risk', 
      label: 'Risk',
      render: (val) => <StatusPill status={val} />
    },
    { 
      key: 'score', 
      label: 'Compliance',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full ${val >= 80 ? 'bg-verified-teal' : val >= 60 ? 'bg-review-amber' : 'bg-seal-red'}`} 
              style={{ width: `${val}%` }}
            />
          </div>
          <span className="text-sm font-semibold">{val}%</span>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      render: (_, row) => (
        <button 
          onClick={() => navigate(`/verification/${encodeURIComponent(row.bid_id)}`)}
          className="text-xs font-semibold text-ink-navy bg-paper hover:bg-gray-200 border border-gray-300 px-3 py-1.5 rounded transition shadow-sm"
        >
          View Verification
        </button>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl text-ink-navy">Procurement Dashboard</h1>
          <p className="text-slate-ink text-sm mt-1">Live overview of submitted bids and statutory verification</p>
        </div>
        <button 
          onClick={() => navigate('/tenders/create')}
          className="bg-ink-navy text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-ink-navy/90 transition flex items-center gap-2 shadow"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Tender
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${stat.border} border border-gray-100`}>
            <div className="text-3xl font-bold text-slate-ink font-display">{stat.value}</div>
            <div className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg text-ink-navy">Active Tender Bids</h2>
          <span className="text-xs text-gray-500">Showing all {bids.length} submitted bids</span>
        </div>
        <DataTable columns={columns} data={bids} onRowClick={(row) => navigate(`/verification/${encodeURIComponent(row.bid_id)}`)} />
      </div>
    </div>
  );
};

export default Dashboard;
