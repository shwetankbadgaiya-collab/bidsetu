import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { documentsAPI, tendersAPI, bidsAPI } from '../services/api';

const DEFAULT_TENDERS = [
  { id: 1, tender_id: 'TDR-2026-014', title: 'Supply of IT Equipment for District Office' },
];

const DEMO_BIDDERS = [
  { id: 1, name: 'Vikram Mehta', company: 'ABC Pvt Ltd', profile: 'Medium Risk Review Scenario' },
  { id: 2, name: 'Sunita Reddy', company: 'TechServe Solutions', profile: '96% Clean Qualify Scenario' },
  { id: 3, name: 'Amit Patel', company: 'Global Infra Corp', profile: '45% Critical Disqualify Scenario' },
  { id: 4, name: 'Rahul Verma', company: 'Apex Dynamics Ltd', profile: '88% Standard Vendor Scenario' },
  { id: 5, name: 'Neha Sharma', company: 'CyberNet Systems', profile: '92% Verified SME Scenario' },
];

const Upload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramTender = searchParams.get('tender_id');
  
  const [tenders, setTenders] = useState(DEFAULT_TENDERS);
  const [selectedTenderId, setSelectedTenderId] = useState(paramTender || 'TDR-2026-014');
  const [selectedBidderId, setSelectedBidderId] = useState(1);
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [checkedItems, setCheckedItems] = useState({
    gst_certificate: true,
    udyam_certificate: true,
    pan_card: true,
    authorization_letter: true,
    declaration: true
  });
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error' | null
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const MAX_SIZE_MB = 10;

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const res = await tendersAPI.getAll();
        const tList = res?.data || res;
        if (Array.isArray(tList) && tList.length > 0) {
          setTenders(tList);
          if (paramTender) {
            const found = tList.find(t => t.tender_id === paramTender || String(t.id) === String(paramTender));
            if (found) setSelectedTenderId(found.tender_id);
            else setSelectedTenderId(paramTender);
          } else {
            setSelectedTenderId(tList[0].tender_id);
          }
        }
      } catch (e) {
        console.warn('Could not fetch tenders from API, using local tenders list', e);
        if (paramTender) {
          setTenders(prev => [{ id: Date.now(), tender_id: paramTender, title: sessionStorage.getItem('active_tender_title') || 'New Procurement Tender' }, ...prev]);
          setSelectedTenderId(paramTender);
        }
      }
    };
    fetchTenders();
  }, [paramTender]);

  const handleFileChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    setUploadStatus(null);
    setErrorMsg('');

    // Validate files
    for (const file of files) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setErrorMsg(`File ${file.name} exceeds ${MAX_SIZE_MB}MB limit.`);
        setUploadStatus('error');
        return;
      }
      if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|png|jpg|jpeg|doc|docx)$/i)) {
        setErrorMsg(`File ${file.name} format is not supported. Please upload PDF, PNG, JPG, or DOC.`);
        setUploadStatus('error');
        return;
      }
    }

    setUploading(true);
    try {
      const newlyUploaded = [];
      const updatedChecked = { ...checkedItems };

      for (const file of files) {
        // Determine document type
        const lowerName = file.name.toLowerCase();
        let docType = 'other_document';
        if (lowerName.includes('gst')) docType = 'gst_certificate';
        else if (lowerName.includes('udyam')) docType = 'udyam_certificate';
        else if (lowerName.includes('pan')) docType = 'pan_card';
        else if (lowerName.includes('auth')) docType = 'authorization_letter';
        else if (lowerName.includes('decl')) docType = 'declaration';
        else {
          const uncheckedKeys = ['gst_certificate', 'udyam_certificate', 'pan_card', 'authorization_letter', 'declaration']
            .filter(k => !updatedChecked[k]);
          docType = uncheckedKeys[0] || 'other_document';
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('bidder_id', selectedBidderId);
        formData.append('tender_id', selectedTenderId);
        formData.append('document_type', docType);

        try {
          const res = await documentsAPI.upload(formData);
          newlyUploaded.push({
            id: res.data?.id || Date.now() + Math.random(),
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: docType,
            status: 'Uploaded'
          });
        } catch (apiErr) {
          console.warn('Backend upload failed, staging locally for demonstration', apiErr);
          newlyUploaded.push({
            id: Date.now() + Math.random(),
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: docType,
            status: 'Ready'
          });
        }

        if (docType in updatedChecked) {
          updatedChecked[docType] = true;
        }
      }

      setUploadedFiles(prev => [...prev, ...newlyUploaded]);
      setCheckedItems(updatedChecked);
      setUploadStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to process documents. Please check file formats and try again.');
      setUploadStatus('error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const toggleItem = (key) => {
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const expectedDocuments = [
    { key: 'gst_certificate', label: 'GST Certificate', mandatory: true },
    { key: 'udyam_certificate', label: 'Udyam Certificate', mandatory: true },
    { key: 'pan_card', label: 'PAN Card', mandatory: true },
    { key: 'authorization_letter', label: 'Authorization Letter', mandatory: false },
    { key: 'declaration', label: 'Declaration', mandatory: false },
  ];

  const mandatoryMatched = expectedDocuments
    .filter(doc => doc.mandatory)
    .every(doc => checkedItems[doc.key]);

  const handleStartVerification = async () => {
    setUploading(true);
    try {
      // Create or link a real dynamic bid for this tender & bidder
      const bidPayload = {
        bidder_id: Number(selectedBidderId),
        tender_id: selectedTenderId
      };
      
      let bidId = `BID${Math.floor(100 + Math.random() * 900)}`;
      try {
        const res = await bidsAPI.create(bidPayload);
        const bData = res?.data || res;
        if (bData?.bid_id) bidId = bData.bid_id;
      } catch (err) {
        console.warn('API create bid fallback, using generated ID:', bidId);
      }

      navigate(`/processing?bid_id=${encodeURIComponent(bidId)}&tender_id=${encodeURIComponent(selectedTenderId)}`);
    } catch (e) {
      navigate(`/processing?bid_id=BID003&tender_id=${encodeURIComponent(selectedTenderId)}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-display text-2xl text-ink-navy mb-6">Upload Bid Documents</h1>
      
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-ink mb-1">Target Tender</label>
            <select 
              value={selectedTenderId} 
              onChange={(e) => setSelectedTenderId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white outline-none text-sm focus:border-ink-navy"
            >
              {tenders.map((t) => (
                <option key={t.id || t.tender_id} value={t.tender_id}>
                  {t.tender_id} — {t.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-ink mb-1">Bidder / Vendor</label>
            <select 
              value={selectedBidderId} 
              onChange={(e) => setSelectedBidderId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white outline-none text-sm focus:border-ink-navy"
            >
              {DEMO_BIDDERS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.company} — {b.name} ({b.profile})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-ink-navy transition cursor-pointer relative bg-gray-50/50"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            multiple 
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            onChange={handleFileChange}
            className="hidden" 
          />
          <div className="mx-auto w-12 h-12 text-ink-navy mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-ink mb-1">Drag and drop bid documents here</p>
          <p className="text-sm text-gray-500 mb-4">or click to browse from your computer (PDF, PNG, JPG up to 10MB)</p>
          <button 
            type="button" 
            className="bg-paper text-ink-navy border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
          >
            Browse Files
          </button>
        </div>

        {uploading && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center gap-3 text-sm text-ink-navy">
            <div className="w-4 h-4 border-2 border-ink-navy border-t-transparent rounded-full animate-spin"></div>
            <span>Uploading and parsing documents...</span>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="mt-4 p-3 bg-verified-teal/10 border border-verified-teal/20 rounded-lg text-sm text-verified-teal font-medium flex items-center justify-between">
            <span>✓ Documents uploaded successfully and added to checklist!</span>
            <button onClick={() => setUploadStatus(null)} className="text-xs hover:underline">Dismiss</button>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="mt-4 p-3 bg-seal-red/10 border border-seal-red/20 rounded-lg text-sm text-seal-red font-medium flex items-center justify-between">
            <span>✗ {errorMsg || 'Upload failed. Please try again.'}</span>
            <button onClick={() => setUploadStatus(null)} className="text-xs hover:underline">Dismiss</button>
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-slate-ink mb-3">Uploaded Files ({uploadedFiles.length})</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between bg-gray-50 px-4 py-2.5 rounded-lg text-sm border border-gray-200">
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-ink truncate max-w-md">
                    <span className="text-verified-teal font-bold">📄</span>
                    <span className="truncate">{file.name}</span>
                    <span className="text-gray-400">({file.size})</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-verified-teal/10 text-verified-teal">
                    {file.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-gray-100 pt-6">
          <h3 className="font-semibold text-slate-ink mb-4">Document Verification Checklist</h3>
          <p className="text-xs text-gray-500 mb-4">Click any checklist item below to toggle its status for demonstration:</p>
          <div className="space-y-3">
            {expectedDocuments.map((doc) => {
              const isChecked = checkedItems[doc.key];
              return (
                <div 
                  key={doc.key} 
                  onClick={() => toggleItem(doc.key)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition cursor-pointer select-none ${
                    isChecked 
                      ? 'border-verified-teal/30 bg-verified-teal/5 hover:bg-verified-teal/10' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      isChecked 
                        ? 'bg-verified-teal border-verified-teal text-white' 
                        : 'border-gray-400 bg-white'
                    }`}>
                      {isChecked && (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${isChecked ? 'text-ink-navy font-semibold' : 'text-slate-ink'}`}>
                      {doc.label} {doc.mandatory && <span className="text-seal-red text-xs">*mandatory</span>}
                    </span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    isChecked 
                      ? 'bg-verified-teal/20 text-verified-teal' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isChecked ? 'Ready for Verification' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            disabled={!mandatoryMatched || uploading}
            onClick={handleStartVerification}
            className={`px-8 py-3 rounded-lg font-semibold transition ${
              mandatoryMatched && !uploading
                ? 'bg-ink-navy text-white hover:bg-ink-navy/90 shadow-md' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Start Verification
          </button>
        </div>
      </div>
    </div>
  );
};

export default Upload;
