import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getEmployees } from '../utils/api';
import type { Employee } from '../utils/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import CreateEmployeeForm from '../components/CreateEmployeeForm';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  const fetchEmployees = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getEmployees();
      if (response.success) {
        setEmployees(response.data);
      } else {
        setError(response.message || 'Failed to fetch employees');
        toast.error(response.message || 'Failed to fetch employees');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch employees. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
        if (err.response?.status === 401) {
          logout();
        }
      } else {
        setError('An unexpected error occurred');
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEmployeeCreated = (): void => {
    setShowCreateForm(false);
    fetchEmployees();
  };

  return (
    <div className="admin-dashboard-container">
      <header className="admin-dashboard-header">
        <div className="header-content">
          <h1>لوحة تحكم المسؤول</h1>
          <div className="header-actions">
            <span className="welcome-text">مرحباً، {user?.name || 'المسؤول'}</span>
            <button onClick={logout} className="logout-button">
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>
      <main className="admin-dashboard-main">
        <div className="dashboard-section-header">
          <h2>موظفو الحكومة</h2>
          <button onClick={() => setShowCreateForm(true)} className="create-button">
            إضافة موظف جديد
          </button>
        </div>
        {showCreateForm && (
          <div className="create-form-overlay">
            <div className="create-form-container">
              <div className="form-header">
                <h3>إضافة موظف جديد</h3>
                <button onClick={() => setShowCreateForm(false)} className="close-button">
                  ×
                </button>
              </div>
              <CreateEmployeeForm onSuccess={handleEmployeeCreated} onCancel={() => setShowCreateForm(false)} />
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="loading-container">
            <div className="loading">جاري تحميل الموظفين...</div>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-message">{error}</div>
            <button onClick={fetchEmployees} className="retry-button">
              إعادة المحاولة
            </button>
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-container">
            <div className="empty-message">لا يوجد موظفون</div>
          </div>
        ) : (
          <div className="employees-table-container">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>الرقم</th>
                  <th>الاسم</th>
                  <th>الهوية الوطنية</th>
                  <th>المعرف</th>
                  <th>الجهة</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td>{employee.name}</td>
                    <td>{employee.national_id}</td>
                    <td>{employee.identifier}</td>
                    <td>{employee.destination?.name || `ID: ${employee.destination_id}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

