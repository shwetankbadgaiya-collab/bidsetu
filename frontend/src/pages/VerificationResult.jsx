import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verificationAPI, bidsAPI } from '../services/api';
import Seal from '../components/Seal';

const MOCK_DATA = [
  { document: 'GST Certificate', extracted: 'GSTIN: 23ABCDE1234F1Z5', source: 'GST Portal', status: 'verified' },
  { document: 'Udyam Certificate', extracted: 'UDYAM-XX-00-0000001', source: 'Udyam Portal', status: 'verified' },
  { document: 'PAN Card', extracted: 'PAN: ABCDE1234F', source: 'PAN Authority', status: 'matched' },
  { document: 'Authorization Letter', extracted: 'Company: ABC Private Limited', source: 'Document Review', status: 'review' },
  { document: 'Declaration', extracted: 'Declared by: Vikram Mehta', source: 'Document Review', status: 'verified' },
];

export default function VerificationResult() {
  const { bidId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(MOCK_DATA);
  const [bidInfo, setBidInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (bidId) {
          try {
            const bRes = await bidsAPI.getById(bidId);
            if (bRes?.data) setBidInfo(bRes.data);
          } catch (e) {
            console.warn("Could not fetch bid info", e);
          }
        }
        const response = await verificationAPI.getByBid(bidId || 'BID003');
        const resData = response?.data || response;
        if (Array.isArray(resData) && resData.length > 0) {
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

  const companyName = bidInfo?.company_name || bidInfo?.bidder_name || (bidId === 'BID001' ? 'TechServe Solutions' : (bidId === 'BID002' ? 'Global Infra Corp' : 'ABC Pvt Ltd'));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink-navy">Verification Results</h1>
        <p className="font-mono text-slate-ink mt-1">ID: {bidId || 'BID003'} | {companyName}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-lg text-ink-navy">Document Verification</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-paper border-b border-gray-100 text-sm text-slate-ink">
                <tr>
                  <th className="px-6 py-3 font-medium">Document</th>
                  <th className="px-6 py-3 font-medium">Extracted Data</th>
                  <th className="px-6 py-3 font-medium">Verified Against</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-body text-ink-navy">{row.document}</td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-ink">{row.extracted}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{row.source}</td>
                    <td className="px-6 py-4 flex justify-center">
                      <Seal status={row.status} size={48} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Section - 1/3 */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col h-full">
          <h2 className="font-semibold text-lg text-ink-navy mb-4">Findings</h2>
          <ul className="space-y-4 flex-1">
            {data.map((row, idx) => {
              let dotColor = 'bg-verified-teal';
              if (row.status === 'review') {
                dotColor = 'bg-review-amber';
              } else if (['failed', 'disqualified', 'mismatch', 'expired', 'missing'].includes(row.status)) {
                dotColor = 'bg-seal-red';
              }
              
              let textStatus = 'Verified';
              if (row.status === 'review') textStatus = 'Needs Review';
              if (row.status === 'matched') textStatus = 'Matched';
              if (row.status === 'mismatch') textStatus = 'Mismatch';
              if (row.status === 'expired') textStatus = 'Expired';
              if (row.status === 'missing') textStatus = 'Missing';
              
              return (
                <li key={idx} className="flex items-start gap-3">
                  <span className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`}></span>
                  <span className="text-sm text-slate-ink">
                    <span className="font-medium">{row.document}:</span> {textStatus}
                  </span>
                </li>
              );
            })}
          </ul>
          
          <button 
            onClick={() => navigate(`/compliance/${bidId || 'BID003'}`)}
            className="w-full mt-8 bg-ink-navy text-white py-3 rounded-lg font-medium hover:bg-ink-navy/90 transition-colors"
          >
            Continue to Compliance Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
