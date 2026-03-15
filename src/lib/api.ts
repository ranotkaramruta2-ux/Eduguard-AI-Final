/**
 * API Service Layer
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://eduguard-ai-1.onrender.com/api';

/**
 * Get stored auth token from localStorage
 */
function getToken(): string | null {
  try {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      return parsed.token || null;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Core fetch wrapper with auth headers
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle token expiration/invalid token
    if (response.status === 401) {
      // Clear auth data and reload to trigger logout
      localStorage.removeItem('auth');
      window.location.href = '/login';
    }
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

// ─── AUTH API ────────────────────────────────────────────────────────────────

export interface LoginResponse {
  success: boolean;
  data: {
    user: { id: string; name: string; email: string; role: string };
    token: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user: { id: string; name: string; email: string; role: string };
    token: string;
  };
}

export const authAPI = {
  login: (email: string, password: string) =>
    apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role: string, phoneNumber?: string) =>
    apiFetch<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, phoneNumber }),
    }),

  logout: () =>
    apiFetch<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  getMe: () =>
    apiFetch<{ success: boolean; data: any }>('/auth/me'),

  getCounselors: () =>
    apiFetch<{ success: boolean; data: CounselorUser[] }>('/auth/counselors'),

  getStudentUsers: () =>
    apiFetch<{ success: boolean; data: StudentUserSummary[]; count: number }>('/auth/students'),
};

// ─── STUDENT API ─────────────────────────────────────────────────────────────

export interface StudentData {
  _id: string;
  name: string;
  rollNumber: string;
  email?: string;
  phoneNumber?: string;
  attendancePercentage: number;
  internalMarks: number;
  assignmentCompletion: number;
  familyIncome: number;
  travelDistance: number;
  previousFailures: number;
  engagementScore: number;
  riskScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  recommendation?: string;
  teacherId?: any;
  userId?: any;
  counselorId?: any;
  counselingStatus?: 'pending' | 'in_progress' | 'resolved';
  createdAt?: string;
}

export interface CounselorUser {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
}

export interface StudentUserSummary {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  hasStudentData: boolean;
}

export const studentAPI = {
  getAll: () =>
    apiFetch<{ success: boolean; data: StudentData[]; count: number }>('/students'),

  getById: (id: string) =>
    apiFetch<{ success: boolean; data: StudentData }>(`/students/${id}`),

  add: (studentData: {
    name: string;
    rollNumber: string;
    email?: string;
    phoneNumber?: string;
    attendancePercentage: number;
    internalMarks: number;
    assignmentCompletion: number;
    familyIncome: number;
    travelDistance: number;
    previousFailures: number;
    engagementScore: number;
    userId?: string;
  }) =>
    apiFetch<{ success: boolean; data: StudentData }>('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    }),

  update: (id: string, data: Partial<StudentData>) =>
    apiFetch<{ success: boolean; data: StudentData }>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/students/${id}`, { method: 'DELETE' }),

  uploadCSV: (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE_URL}/students/upload-csv`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      return data as { success: boolean; data: StudentData[]; message: string };
    });
  },
};

// ─── PREDICTION API ──────────────────────────────────────────────────────────

export interface PredictionResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
  source: string;
}

export const predictionAPI = {
  runForStudent: (studentId: string) =>
    apiFetch<{ success: boolean; data: { student: StudentData; prediction: PredictionResult } }>(
      `/predict/${studentId}`,
      { method: 'POST' }
    ),

  getAll: () =>
    apiFetch<{ success: boolean; data: any[]; count: number }>('/predict'),

  getForStudent: (studentId: string) =>
    apiFetch<{ success: boolean; data: any[]; count: number }>(
      `/predict/student/${studentId}`
    ),
};

// ─── COUNSELING API ──────────────────────────────────────────────────────────

export interface CounselingRecord {
  _id: string;
  studentId: StudentData | string;
  counselorId: any;
  status: 'pending' | 'in_progress' | 'resolved';
  notes: Array<{
    _id: string;
    content: string;
    addedBy: any;
    addedAt: string;
  }>;
  sessionCount: number;
  lastSessionDate?: string;
  assignedDate: string;
  createdAt: string;
}

export const counselingAPI = {
  assign: (studentId: string, counselorId: string) =>
    apiFetch<{ success: boolean; data: CounselingRecord }>('/counseling/assign', {
      method: 'POST',
      body: JSON.stringify({ studentId, counselorId }),
    }),

  getAssigned: () =>
    apiFetch<{ success: boolean; data: CounselingRecord[]; count: number }>(
      '/counseling/assigned'
    ),

  getForStudent: (studentId: string) =>
    apiFetch<{ success: boolean; data: CounselingRecord[]; count: number }>(
      `/counseling/student/${studentId}`
    ),

  addNote: (counselingId: string, note: string) =>
    apiFetch<{ success: boolean; data: CounselingRecord }>('/counseling/notes', {
      method: 'POST',
      body: JSON.stringify({ counselingId, note }),
    }),

  updateStatus: (id: string, status: 'pending' | 'in_progress' | 'resolved') =>
    apiFetch<{ success: boolean; data: CounselingRecord }>(`/counseling/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// ─── NOTIFICATIONS API ───────────────────────────────────────────────────────

export interface NotificationData {
  _id: string;
  userId: string;
  message: string;
  type: 'risk' | 'counseling' | 'update' | 'system';
  status: 'unread' | 'read';
  priority: 'low' | 'medium' | 'high';
  relatedStudentId?: any;
  createdAt: string;
}

export const notificationAPI = {
  getAll: () =>
    apiFetch<{ success: boolean; data: NotificationData[]; count: number; unreadCount: number }>(
      '/notifications'
    ),

  getUnreadCount: () =>
    apiFetch<{ success: boolean; count: number }>('/notifications/unread-count'),

  markRead: (id: string) =>
    apiFetch<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),

  markAllRead: () =>
    apiFetch<{ success: boolean; count: number }>('/notifications/read-all', {
      method: 'PUT',
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/notifications/${id}`, { method: 'DELETE' }),
};

// ─── SCORE HISTORY API ───────────────────────────────────────────────────────

export interface ScoreSnapshot {
  _id?: string;
  term: string;
  attendancePercentage: number;
  internalMarks: number;
  assignmentCompletion: number;
  engagementScore: number;
  previousFailures: number;
  addedBy?: { _id: string; name: string; email: string };
  recordedAt: string;
}

export const scoreHistoryAPI = {
  add: (
    studentId: string,
    data: {
      term: string;
      attendancePercentage?: number;
      internalMarks?: number;
      assignmentCompletion?: number;
      engagementScore?: number;
      previousFailures?: number;
    }
  ) =>
    apiFetch<{ success: boolean; message: string; data: ScoreSnapshot[] }>(
      `/students/${studentId}/score-history`,
      { method: 'POST', body: JSON.stringify(data) }
    ),

  getForStudent: (studentId: string) =>
    apiFetch<{ success: boolean; count: number; data: ScoreSnapshot[] }>(
      `/students/${studentId}/score-history`
    ),
};

// ─── BEHAVIOURAL FEEDBACK API ─────────────────────────────────────────────────

export type FeedbackCategory =
  | 'attendance'
  | 'participation'
  | 'discipline'
  | 'attitude'
  | 'academic'
  | 'other';

export type FeedbackSeverity = 'positive' | 'minor_concern' | 'major_concern';

export interface BehaviouralFeedbackData {
  _id: string;
  studentId: any;
  teacherId: { _id: string; name: string; email: string };
  term?: string;
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  description: string;
  improvements: string[];
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export const behaviouralFeedbackAPI = {
  add: (data: {
    studentId: string;
    term?: string;
    category: FeedbackCategory;
    severity: FeedbackSeverity;
    description: string;
    improvements?: string[];
  }) =>
    apiFetch<{ success: boolean; message: string; data: BehaviouralFeedbackData }>(
      '/behavioural-feedback',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  getForStudent: (studentId: string) =>
    apiFetch<{ success: boolean; count: number; data: BehaviouralFeedbackData[] }>(
      `/behavioural-feedback/student/${studentId}`
    ),

  update: (id: string, data: Partial<Omit<BehaviouralFeedbackData, '_id' | 'studentId' | 'teacherId' | 'createdAt' | 'updatedAt'>>) =>
    apiFetch<{ success: boolean; message: string; data: BehaviouralFeedbackData }>(
      `/behavioural-feedback/${id}`,
      { method: 'PUT', body: JSON.stringify(data) }
    ),

  delete: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(
      `/behavioural-feedback/${id}`,
      { method: 'DELETE' }
    ),
};

