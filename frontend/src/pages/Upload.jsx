import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { documentsAPI } from '../services/api';

const Upload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialBidder = searchParams.get('bidder_id') || '1';
  const initialTender = searchParams.get('tender_id') || '1';
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error' | null
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const MAX_SIZE_MB = 10;

  const handleFileChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    setUploadStatus(null);
    setErrorMsg('');

    // Validate files
    for (const file of files) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setUploadStatus('error');
        setErrorMsg(`File "${file.name}" exceeds ${MAX_SIZE_MB}MB limit`);
        return;
      }
    }

    // Add to local state immediately for UI feedback
    const newFiles = files.map(file => ({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      file: file,
      status: 'uploading',
      type: guessDocType(file.name),
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setUploading(true);

    // Upload each file to backend
    let allSuccess = true;
    for (const fileInfo of newFiles) {
      try {
        const formData = new FormData();
        formData.append('file', fileInfo.file);
        formData.append('bidder_id', initialBidder);
        formData.append('tender_id', initialTender);
        formData.append('document_type', fileInfo.type);

        await documentsAPI.upload(formData);

        setUploadedFiles(prev => prev.map(f => 
          f.name === fileInfo.name ? { ...f, status: 'success' } : f
        ));
      } catch (err) {
        console.error('Upload failed for', fileInfo.name, err);
        allSuccess = false;
        setUploadedFiles(prev => prev.map(f => 
          f.name === fileInfo.name ? { ...f, status: 'error' } : f
        ));
      }
    }

    setUploading(false);
    if (allSuccess) {
      setUploadStatus('success');
    } else {
      setUploadStatus('error');
      setErrorMsg('Some files failed to upload. They will still work for the demo flow.');
    }
  };

  const guessDocType = (filename) => {
    const lower = filename.toLowerCase();
    if (lower.includes('gst')) return 'gst_certificate';
    if (lower.includes('udyam')) return 'udyam_certificate';
    if (lower.includes('pan')) return 'pan_card';
    if (lower.includes('auth')) return 'authorization_letter';
    if (lower.includes('decl')) return 'declaration';
    return 'gst_certificate'; // default
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fakeEvent = { target: { files: e.dataTransfer.files } };
      handleFileChange(fakeEvent);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const checkHasDoc = (keyword) => {
    return uploadedFiles.some(f => f.name.toLowerCase().includes(keyword.toLowerCase()));
  };

  const checklist = [
    { key: 'gst', label: 'GST Certificate', req: true, match: 'gst' },
    { key: 'udyam', label: 'Udyam Certificate', req: true, match: 'udyam' },
    { key: 'pan', label: 'PAN Card', req: true, match: 'pan' },
    { key: 'auth', label: 'Authorization Letter', req: false, match: 'auth' },
    { key: 'decl', label: 'Declaration', req: false, match: 'decl' },
  ];

  const isItemChecked = (item) => {
    if (checkedItems[item.key] !== undefined) {
      return checkedItems[item.key];
    }
    return checkHasDoc(item.match);
  };

  const toggleItem = (key, match) => {
    setCheckedItems(prev => {
      const currentState = prev[key] !== undefined ? prev[key] : checkHasDoc(match);
      return {
        ...prev,
        [key]: !currentState
      };
    });
  };

  const mandatoryMatched = checklist.filter(item => item.req).every(item => isItemChecked(item));

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-display text-2xl text-ink-navy mb-6">Upload Bid Documents</h1>
      
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-6">
        <div className="flex gap-6 mb-8">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-ink mb-1">Tender</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 outline-none text-sm">
              <option>TDR-2026-014 — Supply of IT Equipment</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-ink mb-1">Bidder</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 outline-none text-sm">
              <option>ABC Pvt Ltd — Vikram Mehta</option>
              <option>TechServe Solutions — Sunita Reddy</option>
              <option>Global Infra Corp — Amit Patel</option>
            </select>
          </div>
        </div>

        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-ink-navy transition cursor-pointer relative"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            multiple 
            onChange={handleFileChange} 
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          />
          <div className="flex flex-col items-center">
            {uploading ? (
              <>
                <svg className="w-12 h-12 text-ink-navy mb-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-ink-navy font-medium">Uploading files...</p>
              </>
            ) : (
              <>
                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-slate-ink font-medium">Drag and drop files here</p>
                <div className="flex items-center my-3 w-48">
                  <div className="flex-1 border-b border-gray-200"></div>
                  <span className="px-3 text-xs text-gray-400">or</span>
                  <div className="flex-1 border-b border-gray-200"></div>
                </div>
                <span className="bg-gray-100 text-slate-ink px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                  Browse Files
                </span>
                <p className="text-xs text-gray-400 mt-3">PDF, PNG, JPG, DOC — Max {MAX_SIZE_MB}MB per file</p>
              </>
            )}
          </div>
        </div>

        {/* Upload Status Messages */}
        {uploadStatus === 'success' && (
          <div className="mt-4 p-3 bg-verified-teal/10 text-verified-teal rounded-lg text-sm font-medium flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Files uploaded successfully!
          </div>
        )}
        {uploadStatus === 'error' && (
          <div className="mt-4 p-3 bg-seal-red/10 text-seal-red rounded-lg text-sm font-medium">
            {errorMsg || 'Upload failed. Please try again.'}
          </div>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-ink mb-3">Uploaded Files ({uploadedFiles.length})</h3>
            <div className="space-y-2">
              {uploadedFiles.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium text-slate-ink">{f.name}</span>
                    <span className="text-gray-400">({f.size})</span>
                  </div>
                  {f.status === 'uploading' && <span className="text-review-amber text-xs font-medium">Uploading...</span>}
                  {f.status === 'success' && <span className="text-verified-teal text-xs font-medium">✓ Uploaded</span>}
                  {f.status === 'error' && <span className="text-seal-red text-xs font-medium">✗ Failed</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-slate-ink mb-4">Document Checklist</h3>
        <div className="space-y-4">
          {checklist.map(item => {
            const isChecked = isItemChecked(item);
            const matchedFile = uploadedFiles.find(f => f.name.toLowerCase().includes(item.match.toLowerCase()));
            
            return (
              <div 
                key={item.key} 
                onClick={() => toggleItem(item.key, item.match)}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-100/70 transition cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  {isChecked ? (
                    <div className="w-6 h-6 rounded-full bg-verified-teal/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-verified-teal" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-300 rounded flex items-center justify-center bg-white flex-shrink-0" />
                  )}
                  <div>
                    <span className={`text-sm font-medium ${isChecked ? 'text-slate-ink' : 'text-gray-500'}`}>
                      {item.label} {item.req && <span className="text-seal-red">*</span>}
                    </span>
                    {isChecked && matchedFile && (
                      <p className="text-xs text-gray-500 mt-0.5">{matchedFile.name} ({matchedFile.size})</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            disabled={!mandatoryMatched || uploading}
            onClick={() => navigate('/processing?bid_id=BID003')}
            className={`px-8 py-3 rounded-lg font-semibold transition ${
              mandatoryMatched && !uploading
                ? 'bg-ink-navy text-white hover:bg-ink-navy/90' 
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
