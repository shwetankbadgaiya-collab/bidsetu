import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tendersAPI } from '../services/api';

const generateTenderId = () => `TDR-2026-${Math.floor(100 + Math.random() * 900)}`;

const CreateTender = () => {
  const navigate = useNavigate();
  const [tenderId, setTenderId] = useState(generateTenderId());
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Ministry of Electronics & IT');
  const [experience, setExperience] = useState(3);
  const [loading, setLoading] = useState(false);

  const [reqs, setReqs] = useState({
    gst: true,
    udyam: true,
    pan: true,
    authLetter: true,
    experience: true,
    other: ''
  });

  const handleToggle = (key) => {
    setReqs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tendersAPI.create({
        tender_id: tenderId,
        title,
        department,
        requirements: reqs
      });
      // Try block will succeed if mock API exists, else catch
      navigate('/upload');
    } catch (error) {
      console.warn('API call failed, continuing to upload anyway for demo');
      navigate('/upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-2xl text-ink-navy mb-6">Create Tender</h1>
      
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-ink mb-1">Tender ID</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={tenderId} 
                  readOnly 
                  className="w-full font-mono text-sm border border-gray-300 bg-gray-50 rounded-lg px-4 py-2 text-gray-600 outline-none"
                />
                <button 
                  type="button" 
                  onClick={() => setTenderId(generateTenderId())}
                  className="p-2 text-ink-navy hover:bg-gray-100 rounded-lg transition"
                  title="Regenerate"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-2 w-2/3">
              <label className="block text-sm font-medium text-slate-ink mb-1">Tender Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Supply of IT Equipment"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-ink-navy focus:ring-1 focus:ring-ink-navy outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-ink mb-1">Department</label>
            <select 
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-ink-navy focus:ring-1 focus:ring-ink-navy outline-none transition bg-white"
            >
              <option>Ministry of Electronics & IT</option>
              <option>Ministry of Defence</option>
              <option>Ministry of Health</option>
              <option>Ministry of Railways</option>
              <option>Ministry of Finance</option>
            </select>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-semibold text-slate-ink mb-4">Compliance Requirements</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={reqs.gst} onChange={() => handleToggle('gst')} className="w-4 h-4 text-ink-navy rounded border-gray-300 focus:ring-ink-navy" />
                <span className="text-sm text-slate-ink">GST Registration Valid</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={reqs.udyam} onChange={() => handleToggle('udyam')} className="w-4 h-4 text-ink-navy rounded border-gray-300 focus:ring-ink-navy" />
                <span className="text-sm text-slate-ink">Udyam Registration Valid</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={reqs.pan} onChange={() => handleToggle('pan')} className="w-4 h-4 text-ink-navy rounded border-gray-300 focus:ring-ink-navy" />
                <span className="text-sm text-slate-ink">PAN Card Required</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={reqs.authLetter} onChange={() => handleToggle('authLetter')} className="w-4 h-4 text-ink-navy rounded border-gray-300 focus:ring-ink-navy" />
                <span className="text-sm text-slate-ink">Authorization Letter Required</span>
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={reqs.experience} onChange={() => handleToggle('experience')} className="w-4 h-4 text-ink-navy rounded border-gray-300 focus:ring-ink-navy" />
                  <span className="text-sm text-slate-ink">Minimum Experience</span>
                </label>
                {reqs.experience && (
                  <div className="flex items-center gap-2">
                    <input type="number" min="1" max="50" value={experience} onChange={(e) => setExperience(e.target.value)} className="w-16 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-ink-navy" />
                    <span className="text-sm text-gray-500">years</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-ink mb-1">Other Requirements</label>
              <textarea 
                value={reqs.other}
                onChange={(e) => setReqs({ ...reqs, other: e.target.value })}
                rows="2"
                placeholder="Any additional requirements..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-ink-navy focus:ring-1 focus:ring-ink-navy outline-none transition text-sm"
              />
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-ink-navy text-white px-8 py-3 rounded-lg font-semibold hover:bg-ink-navy/90 transition disabled:opacity-70"
            >
              {loading ? 'Creating...' : 'Create Tender'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTender;
