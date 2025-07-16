import React, { useState, useEffect } from 'react';
import { exportRequestService } from '../services/api';
import { ExportRequest } from '../types';

const ExportRequests: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedRequests, setReceivedRequests] = useState<ExportRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ExportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  

  useEffect(() => {
    fetchExportRequests();
  }, []);

  const fetchExportRequests = async () => {
    try {
      const [receivedResponse, sentResponse] = await Promise.all([
        exportRequestService.getReceived(),
        exportRequestService.getSent(),
      ]);
      setReceivedRequests(receivedResponse.data);
      setSentRequests(sentResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch export requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string, message?: string) => {
    try {
      await exportRequestService.accept(requestId, message);
      fetchExportRequests(); // Refresh the list
      alert('Export request accepted successfully! The product has been added to your inventory.');
      // Redirect to MyProducts page to see the newly added product
      window.location.href = '/my-products';
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await exportRequestService.reject(requestId);
      fetchExportRequests(); // Refresh the list
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'ACCEPTED': return 'status-accepted';
      case 'REJECTED': return 'status-rejected';
      case 'COMPLETED': return 'status-completed';
      default: return '';
    }
  };

  if (loading) return <div className="loading">Loading export requests...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Export Requests</h1>
        <p className="subtitle">Manage your product transfer requests</p>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            Received ({receivedRequests.length})
          </button>
          <button
            className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            Sent ({sentRequests.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'received' ? (
            <div className="requests-list">
              {receivedRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">📭</div>
                  <p>No export requests received yet.</p>
                </div>
              ) : (
                receivedRequests.map((request) => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <h3>{request.product?.name}</h3>
                      <span className={`status-badge ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="request-details">
                      <p><strong>From:</strong> {request.fromShop?.shopName} ({request.fromShop?.name})</p>
                      <p><strong>Product Owner:</strong> {request.product?.shopkeeper?.shopName} ({request.product?.shopkeeper?.name})</p>
                      <p><strong>Quantity:</strong> {request.quantity} units</p>
                      <p><strong>Price:</strong> ₹{request.product?.price}</p>
                      {request.message && (
                        <div className="message">
                          <strong>Message:</strong>
                          <p>{request.message}</p>
                        </div>
                      )}
                    </div>

                    {request.status === 'PENDING' && (
                      <div className="request-actions">
                        <button
                          className="btn btn-success"
                          onClick={() => {
                            const message = prompt('Optional: Add a message for the sender');
                            handleAccept(request.id, message || undefined);
                          }}
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleReject(request.id)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="requests-list">
              {sentRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">📤</div>
                  <p>No export requests sent yet.</p>
                </div>
              ) : (
                sentRequests.map((request) => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <h3>{request.product?.name}</h3>
                      <span className={`status-badge ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="request-details">
                      <p><strong>To:</strong> {request.toShop?.shopName} ({request.toShop?.name})</p>
                      <p><strong>Product Owner:</strong> {request.product?.shopkeeper?.shopName} ({request.product?.shopkeeper?.name})</p>
                      <p><strong>Quantity:</strong> {request.quantity} units</p>
                      <p><strong>Price:</strong> ₹{request.product?.price}</p>
                      {request.message && (
                        <div className="message">
                          <strong>Message:</strong>
                          <p>{request.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportRequests;