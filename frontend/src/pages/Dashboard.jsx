import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import { bidsAPI } from '../services/api';

const Dashboard = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fallbackData = [
    { bid_id: 'BID001', company: 'TechServe Solutions', status: 'qualified', risk: 'low', score: 96 },
    { bid_id: 'BID002', company: 'Global Infra Corp', status: 'disqualified', risk: 'high', score: 45 },
    { bid_id: 'BID003', company: 'ABC Pvt Ltd', status: 'pending_review', risk: 'medium', score: 82 },
    { bid_id: 'BID004', company: 'Nexus Enterprises', status: 'verified', risk: 'low', score: 91 },
    { bid_id: 'BID005', company: 'Horizon Tech', status: 'pending', risk: 'medium', score: 68 },
    { bid_id: 'BID006', company: 'Pinnacle Systems', status: 'verified', risk: 'low', score: 88 },
  ];

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await bidsAPI.getAll();
        if (response.data && response.data.length > 0) {
          setBids(response.data);
        } else {
          setBids(fallbackData);
        }
      } catch (error) {
        console.warn('Using fallback data for bids');
        setBids(fallbackData);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  const stats = {
    total: bids.length,
    verified: bids.filter(b => ['verified', 'qualified', 'pass'].includes((b.status || '').toLowerCase())).length,
    pending: bids.filter(b => ['pending', 'pending_review', 'review'].includes((b.status || '').toLowerCase())).length,
    nonCompliant: bids.filter(b => ['disqualified', 'failed'].includes((b.status || '').toLowerCase())).length,
    highRisk: bids.filter(b => ((b.risk_level || b.risk || '')).toLowerCase() === 'high').length,
  };

  const columns = [
    { key: 'bid_id', label: 'Bid ID', render: (val) => <span className="font-mono text-xs font-semibold">{val}</span> },
    { key: 'company', label: 'Bidder', render: (_, row) => row.company_name || row.company || row.bidder_name },
    { key: 'status', label: 'Status', render: (val) => <StatusPill status={val} /> },
    { key: 'risk', label: 'Risk', render: (_, row) => <StatusPill status={row.risk_level || row.risk} /> },
    { key: 'score', label: 'Compliance Score', render: (_, row) => <span className="font-semibold">{row.compliance_score !== undefined ? row.compliance_score : (row.score || 0)}%</span> },
    { key: 'action', label: 'Action', render: (_, row) => (
      <button 
        onClick={(e) => { e.stopPropagation(); navigate(`/verification/${row.bid_id}`); }}
        className="text-ink-navy hover:text-ink-navy/80 font-medium text-sm underline"
      >
        View
      </button>
    )}
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-ink-navy">Dashboard</h1>
        <button 
          onClick={() => navigate('/tenders/create')}
          className="border border-ink-navy text-ink-navy px-4 py-2 rounded-lg font-medium hover:bg-ink-navy/5 transition text-sm"
        >
          Create New Tender
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-ink-navy">
          <div className="text-3xl font-bold text-slate-ink mb-1">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Bids</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-verified-teal">
          <div className="text-3xl font-bold text-slate-ink mb-1">{stats.verified}</div>
          <div className="text-sm text-gray-500">Verified Bids</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-review-amber">
          <div className="text-3xl font-bold text-slate-ink mb-1">{stats.pending}</div>
          <div className="text-sm text-gray-500">Pending Bids</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-seal-red">
          <div className="text-3xl font-bold text-slate-ink mb-1">{stats.nonCompliant}</div>
          <div className="text-sm text-gray-500">Non-Compliant</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-seal-red">
          <div className="text-3xl font-bold text-slate-ink mb-1">{stats.highRisk}</div>
          <div className="text-sm text-gray-500">High Risk</div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-ink mb-4">Recent Bids</h2>
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading bids...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={bids} 
            onRowClick={(row) => navigate(`/verification/${row.bid_id}`)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
