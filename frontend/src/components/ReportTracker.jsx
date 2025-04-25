import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportTracker = () => {
  const [reportId, setReportId] = useState('');
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({});
  const [verifyingFile, setVerifyingFile] = useState(null);
  const [pollingFiles, setPollingFiles] = useState({});

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!reportId) return;

    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/reports/${reportId}`);
      console.log('Report data:', response);
      setReport(response.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      if (err.response?.status === 404) {
        setError('Report not found. Please check the ID and try again.');
      } else {
        setError('An error occurred while fetching the report. Please try again later.');
      }
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to poll for blockchain verification status
  const pollVerificationStatus = async (fileId, attempts = 0, maxAttempts = 10) => {
    if (attempts >= maxAttempts) {
      setPollingFiles(prev => ({
        ...prev,
        [fileId]: false
      }));
      setVerificationStatus(prev => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          pending: false,
          error: 'Verification timed out. Please try again later.'
        }
      }));
      return;
    }

    try {
      const response = await axios.get(`/api/files/verify/${fileId}`);
      
      // Check if verification failed due to tampering
      if (response.data.error && response.data.error.includes('tampering detected')) {
        setVerificationStatus(prev => ({
          ...prev,
          [fileId]: {
            verified: false,
            pending: false,
            tampered: true,
            error: 'Evidence tampering detected! The file hash exists on blockchain but for a different report.',
            timestamp: new Date().toISOString()
          }
        }));
        setPollingFiles(prev => ({
          ...prev,
          [fileId]: false
        }));
        return;
      }
      
      // Handle regular verification success
      if (response.data.verified) {
        setVerificationStatus(prev => ({
          ...prev,
          [fileId]: {
            verified: true,
            pending: false,
            details: response.data.blockchainVerification || {},
            timestamp: new Date().toISOString()
          }
        }));
        setPollingFiles(prev => ({
          ...prev,
          [fileId]: false
        }));
      } else if (response.data.error) {
        // Handle other verification errors
        setVerificationStatus(prev => ({
          ...prev,
          [fileId]: {
            verified: false,
            pending: false,
            error: response.data.error,
            timestamp: new Date().toISOString()
          }
        }));
        setPollingFiles(prev => ({
          ...prev,
          [fileId]: false
        }));
      } else {
        // If not verified yet, wait and try again
        setTimeout(() => {
          pollVerificationStatus(fileId, attempts + 1, maxAttempts);
        }, 5000); // Poll every 5 seconds
      }
    } catch (err) {
      console.error('Error polling verification status:', err);
      setPollingFiles(prev => ({
        ...prev,
        [fileId]: false
      }));
      setVerificationStatus(prev => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          pending: false,
          error: 'Verification failed. Please try again.'
        }
      }));
    }
  };

  const verifyFileIntegrity = async (fileId, fileHash) => {
    if (!fileId) return;
    
    setVerifyingFile(fileId);
    try {
      const response = await axios.get(`/api/files/verify/${fileId}`);
      
      // Check if verification failed due to tampering
      if (response.data.error && response.data.error.includes('tampering detected')) {
        setVerificationStatus(prev => ({
          ...prev,
          [fileId]: {
            verified: false,
            tampered: true,
            error: 'Evidence tampering detected! The file hash exists on blockchain but for a different report.',
            timestamp: new Date().toISOString()
          }
        }));
      } else if (response.data.verified) {
        // If already verified, update state immediately
        setVerificationStatus(prev => ({
          ...prev,
          [fileId]: {
            verified: true,
            details: response.data.blockchainVerification || {},
            timestamp: new Date().toISOString()
          }
        }));
      } else if (response.data.error) {
        // Handle other verification errors
        setVerificationStatus(prev => ({
          ...prev,
          [fileId]: {
            verified: false,
            error: response.data.error,
            timestamp: new Date().toISOString()
          }
        }));
      } else {
        // If not verified yet, show pending state and start polling
        setVerificationStatus(prev => ({
          ...prev,
          [fileId]: {
            verified: false,
            pending: true,
            message: 'Waiting for blockchain confirmation...',
            timestamp: new Date().toISOString()
          }
        }));
        
        setPollingFiles(prev => ({
          ...prev,
          [fileId]: true
        }));
        
        // Start polling for verification status
        pollVerificationStatus(fileId);
      }
    } catch (err) {
      console.error('Error verifying file:', err);
      setVerificationStatus(prev => ({
        ...prev,
        [fileId]: {
          verified: false,
          error: 'Failed to verify file integrity',
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setVerifyingFile(null);
    }
  };

  // Get blockchain explorer URL based on network
  const getBlockchainExplorerUrl = (transactionHash) => {
    // Using Sepolia testnet explorer by default - change this based on your deployment network
    return `https://sepolia.etherscan.io/tx/${transactionHash}`;
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in progress':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Effect to check if any files are already verified when report loads
  useEffect(() => {
    if (report && report.files && report.files.length > 0) {
      report.files.forEach(file => {
        if (file.blockchainVerification && file.blockchainVerification.verified) {
          verifyFileIntegrity(file.id, file.fileHash);
        }
      });
    }
  }, [report]);

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-lg border border-purple-100 mt-10">
      <div className="flex items-center justify-center mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold ml-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Report Tracker</h2>
      </div>
      
      <p className="text-center text-gray-600 mb-8">
        Track the status of your report and stay informed about its progress
      </p>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <label htmlFor="report-id" className="block text-sm font-medium text-gray-700 mb-1">
              Report ID
            </label>
            <div className="relative">
              <input
                id="report-id"
                type="text"
                value={reportId}
                onChange={(e) => setReportId(e.target.value)}
                placeholder="Enter your report ID number"
                className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 pl-10 overflow-hidden text-ellipsis"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="sm:self-end">
            <button 
              type="submit" 
              className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={!reportId.trim() || loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Searching...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Track Report
                </div>
              )}
            </button>
          </div>
        </div>
      </form>

      {loading && !report && !error && (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-purple-100 p-8 animate-pulse">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching for your report...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-md animate-fadeIn">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <p className="text-xs text-red-600 mt-1">
                If you continue to experience issues, please contact our support team for assistance.
              </p>
            </div>
          </div>
        </div>
      )}

      {report && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h3 className="text-xl font-bold text-purple-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Report Details
            </h3>
            <div className={`px-4 py-1.5 rounded-full text-sm font-medium mt-2 sm:mt-0 border ${getStatusBadgeClass(report.status)} flex items-center`}>
              {report.status === 'in progress' || report.status === 'in-progress' ? (
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              ) : report.status === 'resolved' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : report.status === 'rejected' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {report.status}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-purple-100">
              <div className="p-5">
                <h4 className="text-sm font-semibold text-purple-600 uppercase mb-2">Report ID</h4>
                <p className="font-mono text-lg text-gray-800 flex items-center break-all">
                  {reportId}
                  <button 
                    onClick={() => {navigator.clipboard.writeText(reportId)}}
                    className="ml-2 text-purple-400 hover:text-purple-600 transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </p>
              </div>
              <div className="p-5">
                <h4 className="text-sm font-semibold text-purple-600 uppercase mb-2">Jurisdiction</h4>
                <p className="text-lg text-gray-800 break-words">{report.jurisdiction || 'Not specified'}</p>
              </div>
              <div className="p-5">
                <h4 className="text-sm font-semibold text-purple-600 uppercase mb-2">Submitted On</h4>
                <p className="text-lg text-gray-800 flex items-center flex-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="break-words">{formatDate(report.createdAt)}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
            <div className="p-5">
              <h4 className="text-sm font-semibold text-purple-600 uppercase mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Description
              </h4>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-lg border border-purple-100">
                <p className="text-gray-700 whitespace-pre-line break-words">{report.description}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
            <div className="p-5">
              <h4 className="text-sm font-semibold text-purple-600 uppercase mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Evidence Files
              </h4>
              {report.files && report.files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {report.files.map((file) => (
                    <div key={file.id} className="border border-purple-100 rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md group">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                        <img 
                          src={file.url} 
                          alt={file.filename}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end justify-center">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-4 px-3 py-1.5 bg-white/90 text-purple-700 rounded-full text-sm font-medium flex items-center hover:bg-white transition-colors duration-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Full Image
                          </a>
                        </div>
                      </div>
                      <div className="p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 truncate" title={file.filename}>
                            {file.filename}
                          </span>
                          <a
                            href={file.url}
                            download
                            className="ml-2 text-purple-600 hover:text-pink-600 text-sm font-medium flex items-center transition-colors duration-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Save
                          </a>
                        </div>
                        
                        {/* Enhanced blockchain verification section */}
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span className="text-xs font-medium text-gray-700">Blockchain Verification</span>
                            </div>
                            {file.blockchainVerification?.verified && !verificationStatus[file.id]?.tampered && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                <svg className="mr-1 h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Verified
                              </span>
                            )}
                            {verificationStatus[file.id]?.tampered && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                <svg className="mr-1 h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Tampered
                              </span>
                            )}
                          </div>
                          
                          {file.fileHash && (
                            <div className="mt-1.5">
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-1">Hash:</span>
                                <span className="text-xs font-mono text-gray-600 truncate" title={file.fileHash}>
                                  {file.fileHash?.substring(0, 8)}...{file.fileHash?.substring(file.fileHash.length - 8)}
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
                          {file.blockchainVerification?.transactionHash && !verificationStatus[file.id]?.tampered && (
                            <div className="mt-1.5">
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-1">TX:</span>
                                <span className="text-xs font-mono text-gray-600 truncate" title={file.blockchainVerification.transactionHash}>
                                  {file.blockchainVerification.transactionHash.substring(0, 8)}...{file.blockchainVerification.transactionHash.substring(file.blockchainVerification.transactionHash.length - 8)}
                                </span>
                                <a 
                                  href={getBlockchainExplorerUrl(file.blockchainVerification.transactionHash)}
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
                            </div>
                          )}
                          
                          {/* Verification button with states */}
                          {verifyingFile === file.id ? (
                            <div className="mt-2 w-full py-1.5 px-3 bg-gray-50 text-gray-500 text-xs font-medium rounded flex items-center justify-center">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                              Verifying...
                            </div>
                          ) : pollingFiles[file.id] ? (
                            <div className="mt-2 w-full py-1.5 px-3 bg-yellow-50 text-yellow-700 text-xs font-medium rounded flex items-center justify-center">
                              <div className="animate-pulse rounded-full h-3 w-3 bg-yellow-500 mr-2"></div>
                              Waiting for blockchain confirmation...
                            </div>
                          ) : verificationStatus[file.id] ? (
                            <div className={`mt-2 w-full py-1.5 px-3 ${
                              verificationStatus[file.id].verified ? 'bg-green-50 text-green-700' : 
                              verificationStatus[file.id].tampered ? 'bg-red-50 text-red-700' :
                              verificationStatus[file.id].pending ? 'bg-yellow-50 text-yellow-700' : 
                              'bg-red-50 text-red-700'
                            } text-xs font-medium rounded flex items-center justify-center`}>
                              {verificationStatus[file.id].verified ? (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Verified on Blockchain
                                </>
                              ) : verificationStatus[file.id].tampered ? (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  {verificationStatus[file.id].error || "Evidence Tampering Detected!"}
                                </>
                              ) : verificationStatus[file.id].pending ? (
                                <>
                                  <div className="animate-pulse rounded-full h-3 w-3 bg-yellow-500 mr-2"></div>
                                  {verificationStatus[file.id].message}
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  {verificationStatus[file.id].error || "Verification Failed"}
                                </>
                              )}
                            </div>
                          ) : (
                            <button 
                              onClick={() => verifyFileIntegrity(file.id, file.fileHash)}
                              className="mt-2 w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded transition-colors duration-200 flex items-center justify-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              Verify Integrity
                            </button>
                          )}
                          
                          {/* Detailed verification information */}
                          {verificationStatus[file.id] && verificationStatus[file.id].verified && !verificationStatus[file.id].tampered && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <div className="text-xs text-gray-600">
                                {verificationStatus[file.id].details.blockNumber && (
                                  <div className="flex items-center mb-1">
                                    <span className="text-gray-500 mr-1">Block:</span>
                                    <span className="font-mono">{verificationStatus[file.id].details.blockNumber}</span>
                                    <a 
                                      href={`https://sepolia.etherscan.io/block/${verificationStatus[file.id].details.blockNumber}`}
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
                                <div className="text-gray-500 mt-1 text-[10px] flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Verified at: {new Date(verificationStatus[file.id].timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Tampering alert information */}
                          {verificationStatus[file.id] && verificationStatus[file.id].tampered && (
                            <div className="mt-2 pt-2 border-t border-red-100">
                              <div className="bg-red-50 p-2 rounded-md">
                                <p className="text-xs text-red-700 font-medium">
                                  Warning: This evidence appears to have been tampered with. The file hash exists on the blockchain but is associated with a different report.
                                </p>
                                <p className="text-xs text-red-600 mt-1">
                                  This could indicate unauthorized modification of evidence.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-purple-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-600">No files were attached to this report</p>
                  <p className="text-sm text-gray-500 mt-1">Visual evidence is optional and not required for processing your report</p>
                </div>
              )}
            </div>
          </div>

          {report.updates && report.updates.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
              <div className="p-5">
                <h4 className="text-sm font-semibold text-purple-600 uppercase mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status Updates
                </h4>
                <div className="relative pl-6 before:content-[''] before:absolute before:left-2 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-purple-300 before:to-pink-300">
                  {report.updates.map((update, index) => (
                    <div key={index} className={`relative mb-6 ${index === report.updates.length - 1 ? 'pb-0' : 'pb-6'}`}>
                      <div className="absolute left-[-1.625rem] w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                        <p className="text-gray-700 break-words">{update.message}</p>
                        <p className="text-xs text-gray-500 mt-2 flex items-center flex-wrap">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="break-words">{formatDate(update.timestamp)}</span>
                        </p>
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
              Need Help?
            </h4>
            <p className="text-gray-600 mb-4">
              If you have questions about your report or need additional assistance, our support team is here to help.
            </p>
            <button className="py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Contact Support
            </button>
          </div>
        </div>
      )}

      {!report && !loading && reportId.trim() && !error && (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-purple-100 p-8">
          <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Track Your Report</h3>
          <p className="text-gray-600 mb-6">Enter your report ID and click "Track Report" to view the status and details</p>
          <div className="text-sm text-gray-500 bg-purple-50 p-4 rounded-lg inline-block">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Your report ID was provided when you submitted your report
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Last updated: April 25, 2025 at 4:42 PM</p>
        <p className="mt-1">Your privacy and security are our top priorities. All information is encrypted and confidential.</p>
      </div>
    </div>
  );
};

export default ReportTracker;
