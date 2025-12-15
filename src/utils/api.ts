import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem('auth_token');
    const isLoginRequest = config.url?.includes('/api/auth/login');
    if (authToken && config.headers && !isLoginRequest) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  identifier: string;
  password: string;
  device_token: string;
}

export interface User {
  id: number;
  name: string;
  national_id: string;
  identifier: string;
  role: string;
  fcm_token?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
  status_code: number;
  timestamp: string;
}

export interface Employee {
  id: number;
  name: string;
  national_id: string;
  identifier: string;
  destination_id: number;
  destination?: {
    id: number;
    name: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface EmployeesResponse {
  success: boolean;
  message: string;
  data: Employee[];
  status_code: number;
  timestamp: string;
}

export interface CreateEmployeeRequest {
  name: string;
  national_id: string;
  identifier: string;
  password: string;
  destination_id: number;
}

export interface CreateEmployeeResponse {
  success: boolean;
  message: string;
  data: Employee;
  status_code: number;
  timestamp: string;
}

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
  return response.data;
};

export const getEmployees = async (): Promise<EmployeesResponse> => {
  const response = await apiClient.get<EmployeesResponse>('/api/admin/employees');
  return response.data;
};

export const createEmployee = async (employeeData: CreateEmployeeRequest): Promise<CreateEmployeeResponse> => {
  const response = await apiClient.post<CreateEmployeeResponse>('/api/admin/employees', employeeData);
  return response.data;
};

export default apiClient;
