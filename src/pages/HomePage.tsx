import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getComplaints } from '../utils/api';
import type { User, Complaint } from '../utils/api';
import { toast } from 'react-toastify';
import './HomePage.css';

const getUserFromStorage = (): User | null => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    return JSON.parse(userData) as User;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

const HomePage = () => {
  const navigate = useNavigate();
  const [user] = useState<User | null>(getUserFromStorage);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getComplaints();
      if (response.success) {
        setComplaints(response.data);
      } else {
        setError(response.message || 'Failed to fetch complaints');
        toast.error(response.message || 'Failed to fetch complaints');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch complaints. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
        if (err.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } else {
        const errorMessage = 'An unexpected error occurred';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    if (!authToken || !user) {
      navigate('/login');
      return;
    }
    fetchComplaints();
  }, [navigate, user, fetchComplaints]);

  const handleLogout = (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusClass = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending')) return 'status-pending';
    if (statusLower.includes('resolved') || statusLower.includes('completed')) return 'status-resolved';
    if (statusLower.includes('in_progress') || statusLower.includes('processing')) return 'status-in-progress';
    return 'status-default';
  };

  if (!user) {
    return (
      <div className="homepage-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="user-info">
            <span className="welcome-text">Welcome, {user.name}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="homepage-main">
        <div className="complaints-header">
          <h2>Employee Complaints</h2>
          <button onClick={fetchComplaints} className="refresh-button" disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {isLoading ? (
          <div className="loading-container">
            <div className="loading">Loading complaints...</div>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-message">{error}</div>
            <button onClick={fetchComplaints} className="retry-button">
              Retry
            </button>
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-container">
            <div className="empty-message">No complaints found</div>
          </div>
        ) : (
          <div className="complaints-grid">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="complaint-card">
                <div className="complaint-header">
                  <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
                <div className="complaint-body">
                  <div className="complaint-field">
                    <span className="field-label">الوصف:</span>
                    <p className="field-value">{complaint.description}</p>
                  </div>
                  <div className="complaint-details">
                    <div className="complaint-detail-item">
                      <span className="detail-label">النوع:</span>
                      <span className="detail-value">{complaint.complaint_type.name}</span>
                    </div>
                    <div className="complaint-detail-item">
                      <span className="detail-label">الجهة:</span>
                      <span className="detail-value">{complaint.destination.name}</span>
                    </div>
                    <div className="complaint-detail-item">
                      <span className="detail-label">اسم المستخدم:</span>
                      <span className="detail-value">{complaint.user.name}</span>
                    </div>
                    <div className="complaint-detail-item">
                      <span className="detail-label">العنوان:</span>
                      <span className="detail-value">{complaint.address}</span>
                    </div>
                    <div className="complaint-detail-item">
                      <span className="detail-label">تاريخ الإنشاء:</span>
                      <span className="detail-value">{formatDate(complaint.created_at)}</span>
                    </div>
                    {complaint.locked_at && (
                      <div className="complaint-detail-item">
                        <span className="detail-label">تاريخ القفل:</span>
                        <span className="detail-value">{formatDate(complaint.locked_at)}</span>
                      </div>
                    )}
                    {complaint.documents.length > 0 && (
                      <div className="complaint-detail-item">
                        <span className="detail-label">المستندات:</span>
                        <span className="detail-value">{complaint.documents.length} ملف</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;


