import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  IconButton,
  Box,
  Alert,
  Typography
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  AccountBalance as GovernmentIcon,
  LocalPolice as PoliceIcon,
  Gavel as LegalIcon,
  Support as SocialIcon,
  Help as OtherIcon
} from '@mui/icons-material';

const ReportForm = () => {
  const [description, setDescription] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState({});
  const fileInputRef = useRef(null);
  const reportIdRef = useRef(null);
  const [authorities, setAuthorities] = useState([]);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [searchingAuthorities, setSearchingAuthorities] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push(`${file.name} has an invalid file type. Only images are allowed.`);
        return;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file)
      });
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Add function to hash files before upload
  const hashFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
        const hash = CryptoJS.SHA256(wordArray).toString();
        resolve(hash);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Function to poll for blockchain verification status
  const pollVerificationStatus = async (fileId, attempts = 0, maxAttempts = 20) => {
    if (attempts >= maxAttempts) return;

    try {
      const response = await axios.get(`/api/files/verification-status/${fileId}`);
      
      if (response.data.verified) {
        setVerificationStatus(prev => ({
          ...prev,
          [fileId]: {
            verified: true,
            transactionHash: response.data.transactionHash,
            blockNumber: response.data.blockNumber,
            timestamp: response.data.timestamp
          }
        }));
        return;
      } else if (response.data.status === 'pending') {
        // If still pending, wait and try again
        setTimeout(() => {
          pollVerificationStatus(fileId, attempts + 1, maxAttempts);
        }, 3000); // Poll every 3 seconds
      }
    } catch (err) {
      console.error('Error polling verification status:', err);
    }
  };

  // Get blockchain explorer URL based on network
  const getBlockchainExplorerUrl = (transactionHash) => {
    // Using Sepolia testnet explorer by default - change this based on your deployment network
    return `https://sepolia.etherscan.io/tx/${transactionHash}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setUploadProgress({});
    setUploadedFiles([]);
    setVerificationStatus({});

    try {
      // Create the report
      const reportResponse = await axios.post('/api/reports', {
        description,
        jurisdiction
      });

      const reportId = reportResponse.data.reportId;
      reportIdRef.current = reportId;

      // Upload each file with its hash
      const uploadedFilesData = [];
      for (const fileData of files) {
        const fileHash = await hashFile(fileData.file);
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('fileHash', fileHash);

        const response = await axios.post(`/api/files/upload/${reportId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(prev => ({
              ...prev,
              [fileData.file.name]: progress
            }));
          }
        });

        uploadedFilesData.push({
          id: response.data.file.id,
          filename: response.data.file.filename,
          url: response.data.file.url,
          fileHash: fileHash
        });

        // Start polling for blockchain verification
        pollVerificationStatus(response.data.file.id);
      }

      setUploadedFiles(uploadedFilesData);
      setSuccess(`Report submitted successfully! Reference ID: ${reportId}`);
      
      // Reset form fields but keep uploaded files visible
      setDescription('');
      setJurisdiction('');
      // Don't reset files here to keep them visible with verification status
    } catch (err) {
      console.error('Error submitting report:', err);
      setError(err.response?.data?.message || 'An error occurred while submitting your report');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup function for file previews
  useEffect(() => {
    return () => {
      files.forEach(fileData => {
        URL.revokeObjectURL(fileData.preview);
      });
    };
  }, [files]);

  const resetForm = () => {
    setDescription('');
    setJurisdiction('');
    setFiles([]);
    setError('');
    setSuccess('');
    setUploadProgress({});
    setUploadedFiles([]);
    setVerificationStatus({});
  };

  const getIcon = (category) => {
    switch (category) {
      case 'Government':
        return <GovernmentIcon color="primary" />;
      case 'Police':
        return <PoliceIcon color="primary" />;
      case 'Legal':
        return <LegalIcon color="primary" />;
      case 'Social Services':
        return <SocialIcon color="primary" />;
      default:
        return <OtherIcon color="primary" />;
    }
  };

  const handleSearchAuthorities = async () => {
    if (!description.trim() || !jurisdiction.trim()) {
      setError('Please describe your problem and provide your location');
      return;
    }

    try {
      setSearchingAuthorities(true);
      setError('');

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/authorities/search`, {
        problem: description,
        jurisdiction
      });

      setAuthorities(response.data);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || 'Failed to find authorities. Please try again.');
    } finally {
      setSearchingAuthorities(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedAuthority || !emailSubject.trim() || !emailBody.trim()) {
      setError('Please fill in all email fields');
      return;
    }

    try {
      setSendingEmail(true);
      setError('');

      await axios.post(`${import.meta.env.VITE_API_URL}/api/authorities/send-email`, {
        to: selectedAuthority.email,
        subject: emailSubject,
        body: emailBody,
        userEmail
      });

      setEmailDialogOpen(false);
      setEmailSubject('');
      setEmailBody('');
      setSelectedAuthority(null);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || 'Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-100 mt-10">
      <div className="mb-8 text-center">
        <div className="inline-block p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
          Submit Your Report
        </h2>
        <p className="text-gray-600 mt-2">
          Your voice matters. Share your experience in a safe, confidential space.
        </p>
      </div>
      
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-pink-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 resize-none"
              rows="5"
              placeholder="Please describe what happened in as much detail as you feel comfortable sharing..."
              required
              aria-required="true"
            />
            <p className="text-xs text-gray-500">
              Your description helps us understand the situation better. All information is kept confidential.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700">
              Jurisdiction <span className="text-pink-500">*</span>
            </label>
            <input
              id="jurisdiction"
              type="text"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
              placeholder="City, state, or country where this occurred"
              required
              aria-required="true"
            />
            <p className="text-xs text-gray-500">
              This helps us identify the relevant laws and regulations that apply to your case.
            </p>
          </div>

          <div className="space-y-3">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
              Evidence Files (Optional)
            </label>
            <div className="relative">
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                accept="image/*"
                multiple
                aria-label="Upload evidence files"
              />
              <div className="flex items-center justify-center border-2 border-dashed border-purple-200 rounded-lg py-8 px-4 transition-all duration-200 hover:border-purple-400 hover:bg-purple-50/50">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-3 text-sm font-medium text-gray-700">
                    Drag and drop images or click to browse
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Supporting evidence can strengthen your case. All files are encrypted and securely stored.
                  </p>
                  <p className="mt-1 text-xs text-purple-600">
                    Maximum file size: 10MB. Allowed types: JPG, PNG, GIF
                  </p>
                </div>
              </div>
            </div>
            
            {files.length > 0 && (
              <div className="mt-6 bg-white p-5 rounded-xl border border-purple-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-purple-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Selected Images ({files.length})
                  </h3>
                  {files.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setFiles([])}
                      className="text-xs text-pink-500 hover:text-pink-700 transition-colors duration-200 flex items-center"
                      aria-label="Remove all images"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove all
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {files.map((fileData, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden bg-white border border-purple-100 shadow-sm transition-all duration-200 hover:shadow-md">
                      <div className="aspect-w-3 aspect-h-2">
                        <img
                          src={fileData.preview}
                          alt={`Preview ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200"></div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-pink-500 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="Remove image"
                        aria-label={`Remove image ${fileData.file.name}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <div className="p-2">
                        <p className="text-xs text-gray-600 truncate">{fileData.file.name}</p>
                        {uploadProgress[fileData.file.name] !== undefined && (
                          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress[fileData.file.name]}%` }}
                              aria-valuemin="0"
                              aria-valuemax="100"
                              aria-valuenow={uploadProgress[fileData.file.name]}
                              role="progressbar"
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {files.length > 0 && (
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">Blockchain-Secured Evidence</h4>
                    <p className="text-xs text-blue-600 mt-1">
                      Your evidence files will be cryptographically hashed and verified on blockchain for tamper-proof storage.
                      This provides an immutable record of when and how evidence was submitted.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {files.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                No images selected yet. Visual evidence can be helpful but is not required.
              </p>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md animate-fadeIn" role="alert" aria-live="assertive">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting your report...
                </div>
              ) : (
                'Submit Report'
              )}
            </button>
            <p className="text-xs text-center text-gray-500 mt-4">
              By submitting this report, you're taking an important step toward justice. 
              Your information is protected and will be handled with care.
            </p>
          </div>
        </form>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-md" role="alert" aria-live="polite">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700 font-medium">{success}</p>
                <p className="text-xs text-green-600 mt-1">
                  Please save your report ID for future reference.
                </p>
                <div className="mt-2 flex items-center">
                  <span className="font-mono text-sm bg-green-100 px-2 py-1 rounded mr-2">{reportIdRef.current}</span>
                  <button 
                    onClick={() => {navigator.clipboard.writeText(reportIdRef.current)}}
                    className="text-green-600 hover:text-green-800 transition-colors"
                    title="Copy to clipboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
              <div className="p-5">
                <h4 className="text-sm font-semibold text-purple-600 uppercase mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Submitted Evidence Files
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="border border-purple-100 rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                        <img 
                          src={file.url} 
                          alt={file.filename}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 truncate" title={file.filename}>
                            {file.filename}
                          </span>
                        </div>
                        
                        {/* Blockchain verification section */}
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span className="text-xs font-medium text-gray-700">Blockchain Verification</span>
                            </div>
                            {verificationStatus[file.id]?.verified && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                <svg className="mr-1 h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Verified
                              </span>
                            )}
                          </div>
                          
                          {file.fileHash && (
                            <div className="mt-1.5">
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-1">Hash:</span>
                                <span className="text-xs font-mono text-gray-600 truncate" title={file.fileHash}>
                                  {file.fileHash.substring(0, 8)}...{file.fileHash.substring(file.fileHash.length - 8)}
                                </span>
                                <button 
                                  onClick={() => {navigator.clipboard.writeText(file.fileHash)}}
                                  className="ml-1 text-purple-400 hover:text-purple-600 transition-colors"
                                  title="Copy hash"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {/* Blockchain transaction details */}
                          {verificationStatus[file.id]?.transactionHash ? (
                            <div className="mt-1.5">
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-1">TX:</span>
                                <span className="text-xs font-mono text-gray-600 truncate" title={verificationStatus[file.id].transactionHash}>
                                  {verificationStatus[file.id].transactionHash.substring(0, 8)}...
                                  {verificationStatus[file.id].transactionHash.substring(verificationStatus[file.id].transactionHash.length - 8)}
                                </span>
                                <a 
                                  href={getBlockchainExplorerUrl(verificationStatus[file.id].transactionHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-1 text-blue-500 hover:text-blue-700"
                                  title="View on blockchain explorer"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </div>
                              
                              {verificationStatus[file.id].blockNumber && (
                                <div className="flex items-center mt-1">
                                  <span className="text-xs text-gray-500 mr-1">Block:</span>
                                  <span className="text-xs font-mono text-gray-600">
                                    {verificationStatus[file.id].blockNumber}
                                  </span>
                                  <a 
                                    href={`https://sepolia.etherscan.io/block/${verificationStatus[file.id].blockNumber}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-1 text-blue-500 hover:text-blue-700"
                                    title="View block on blockchain explorer"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                </div>
                              )}
                              
                              {verificationStatus[file.id].timestamp && (
                                <div className="text-gray-500 mt-1 text-[10px] flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Verified at: {new Date(verificationStatus[file.id].timestamp).toLocaleString()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="mt-2 w-full py-1.5 px-3 bg-yellow-50 text-yellow-700 text-xs font-medium rounded flex items-center justify-center">
                              <div className="animate-pulse rounded-full h-3 w-3 bg-yellow-500 mr-2"></div>
                              Waiting for blockchain confirmation...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden p-5">
            <h4 className="text-sm font-semibold text-purple-600 uppercase mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What's Next?
            </h4>
            <p className="text-gray-600 mb-4">
              Your report has been securely submitted and all evidence has been cryptographically verified on the blockchain. 
              You can track the status of your report using the Report ID provided above.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href={`/report/tracker`}
                className="py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Track Your Report
              </a>
              <button 
                onClick={resetForm}
                className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 text-sm flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit Another Report
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Last updated: April 25, 2025 at 1:24 PM</p>
        <p className="mt-1">Your privacy and security are our top priorities. All information is encrypted and confidential.</p>
      </div>

      {!success && (
        <div className="mt-8">
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSearchAuthorities}
            disabled={searchingAuthorities}
            startIcon={searchingAuthorities ? <CircularProgress size={24} /> : null}
          >
            {searchingAuthorities ? 'Searching Authorities...' : 'Find Relevant Authorities'}
          </Button>
        </div>
      )}

      {authorities.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
          <div className="p-5">
            <h4 className="text-sm font-semibold text-purple-600 uppercase mb-3">
              Relevant Authorities
            </h4>
            <List>
              {authorities.map((authority, index) => (
                <ListItem
                  key={index}
                  sx={{
                    borderBottom: index < authorities.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none',
                    py: 2
                  }}
                >
                  <ListItemText
                    primary={authority.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {authority.department}
                        </Typography>
                        <br />
                        {authority.description}
                        <br />
                        <Chip
                          size="small"
                          label={authority.category}
                          sx={{ mt: 1, mr: 1 }}
                        />
                        <Chip
                          size="small"
                          label={authority.jurisdiction}
                          sx={{ mt: 1 }}
                        />
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="contained"
                      startIcon={<SendIcon />}
                      onClick={() => {
                        setSelectedAuthority(authority);
                        setEmailSubject(`Regarding: ${description.substring(0, 50)}...`);
                        setEmailDialogOpen(true);
                      }}
                    >
                      Contact
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </div>
        </div>
      )}

      <Dialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Send Email to {selectedAuthority?.name}
          <IconButton
            aria-label="close"
            onClick={() => setEmailDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Your Email (optional)"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={6}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSendEmail}
            disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
            startIcon={sendingEmail ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {sendingEmail ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ReportForm;
