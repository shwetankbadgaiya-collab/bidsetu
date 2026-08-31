import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { auditAPI } from '../services/api';

const MOCK_DATA = [
  { timestamp: '2026-08-30T10:30:00', action: 'Bid documents uploaded', details: '5 documents uploaded for ABC Pvt Ltd', entity: 'document', user: 'Priya Sharma' },
  { timestamp: '2026-08-30T10:31:00', action: 'OCR processing completed', details: 'All documents processed successfully', entity: 'document', user: 'System' },
  { timestamp: '2026-08-30T10:31:30', action: 'Data extraction completed', details: '15 fields extracted across 5 documents', entity: 'extraction', user: 'System' },
  { timestamp: '2026-08-30T10:32:00', action: 'Government source verification initiated', details: 'GST Portal, Udyam Portal, PAN Authority queried', entity: 'verification', user: 'System' },
  { timestamp: '2026-08-30T10:33:00', action: 'Verification completed', details: 'GST: Verified, Udyam: Verified, PAN: Matched, Authorization: Review', entity: 'verification', user: 'System' },
  { timestamp: '2026-08-30T10:34:00', action: 'Compliance analysis completed', details: 'Score: 82% — 1 requirement needs review', entity: 'compliance', user: 'System' },
  { timestamp: '2026-08-30T10:35:00', action: 'Risk assessment completed', details: 'Risk Level: MEDIUM — Authorization discrepancy flagged', entity: 'risk', user: 'System' },
  { timestamp: '2026-08-30T10:36:00', action: 'Officer decision recorded: QUALIFIED', details: 'Decision by Officer Priya Sharma. Comments: "Authorization verified via phone call."', entity: 'decision', user: 'Priya Sharma' },
];

export default function AuditTrail() {
  const { bidId } = useParams();
  const [data, setData] = useState(MOCK_DATA);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = bidId ? await auditAPI.getByBid(bidId) : await auditAPI.getAll();
        const resData = response?.data || response;
        if (Array.isArray(resData) && resData.length > 0) {
          setData(resData);
        }
      } catch (error) {
        console.error("Using mock data due to API error", error);
      }
    };
    fetchData();
  }, [bidId]);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString; // fallback for non-iso strings in mock
    
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    }) + ' — ' + date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDotColor = (action, details) => {
    const lower = (action + details).toLowerCase();
    if (lower.includes('qualified') || lower.includes('verified') || lower.includes('success')) return 'bg-verified-teal';
    if (lower.includes('review') || lower.includes('medium') || lower.includes('discrepancy')) return 'bg-review-amber';
    if (lower.includes('fail') || lower.includes('disqualified') || lower.includes('reject')) return 'bg-seal-red';
    return 'bg-ink-navy';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink-navy">
          {bidId ? `Audit Trail — Bid #${bidId}` : 'Audit Trail'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pb-4">
          {data.map((event, idx) => (
            <div key={idx} className="relative pl-8">
              {/* Timeline Dot */}
              <div className={`absolute -left-2.5 top-1 w-5 h-5 rounded-full border-4 border-white ${getDotColor(event.action, event.details)} shadow-sm`}></div>
              
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs text-gray-400">
                  {formatTime(event.timestamp)}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-medium text-ink-navy">{event.action}</h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold tracking-wide uppercase">
                    {event.user_name || event.user || 'System'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{event.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button 
          onClick={() => alert('Export feature available in production')}
          className="px-6 py-2 border-2 border-ink-navy text-ink-navy rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Export Audit Log
        </button>
      </div>
    </div>
  );
}
