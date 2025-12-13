import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export interface ComplaintType {
  id: number;
  name: string;
}

export interface Destination {
  id: number;
  name: string;
}

export interface Document {
  id: number;
  file: string;
}

export interface Complaint {
  id: number;
  identifier: string;
  description: string;
  status: string;
  lat: number;
  lng: number;
  address: string;
  locked_at: string | null;
  created_at: string;
  user: User;
  complaint_type: ComplaintType;
  destination: Destination;
  documents: Document[];
}

export interface ComplaintsResponse {
  success: boolean;
  message: string;
  data: Complaint[];
  status_code: number;
  timestamp: string;
}

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
  return response.data;
};

export const getComplaints = async (): Promise<ComplaintsResponse> => {
  const authToken = localStorage.getItem('auth_token');
  if (!authToken) {
    throw new Error('No authentication token found');
  }
  const response = await apiClient.get<ComplaintsResponse>('/api/employee/complaints', {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return response.data;
};

export interface UpdateComplaintStatusRequest {
  status: string;
}

export interface UpdateComplaintStatusResponse {
  success: boolean;
  message: string;
  data: Complaint;
  status_code: number;
  timestamp: string;
}

export const updateComplaintStatus = async (
  complaintId: number,
  status: string
): Promise<UpdateComplaintStatusResponse> => {
  const authToken = localStorage.getItem('auth_token');
  if (!authToken) {
    throw new Error('No authentication token found');
  }
  const response = await apiClient.put<UpdateComplaintStatusResponse>(
    `/api/employee/complaints/${complaintId}`,
    { status } as UpdateComplaintStatusRequest,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
  return response.data;
};

export default apiClient;

