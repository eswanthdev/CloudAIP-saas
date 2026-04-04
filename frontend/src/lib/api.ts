import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export const api = {
  get: <T,>(url: string, config?: any) => apiClient.get<T>(url, config),
  post: <T,>(url: string, data?: any, config?: any) => apiClient.post<T>(url, data, config),
  put: <T,>(url: string, data?: any, config?: any) => apiClient.put<T>(url, data, config),
  patch: <T,>(url: string, data?: any, config?: any) => apiClient.patch<T>(url, data, config),
  delete: <T,>(url: string, config?: any) => apiClient.delete<T>(url, config),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: any }>('/auth/login', { email, password }),
  signup: (email: string, password: string, name: string) =>
    api.post<{ token: string; user: any }>('/auth/signup', { email, password, name }),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post<{ token: string }>('/auth/refresh-token'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
};

export const courseApi = {
  getAllCourses: () => api.get<any[]>('/courses'),
  getCourseById: (id: string) => api.get<any>(`/courses/${id}`),
  getEnrolledCourses: () => api.get<any[]>('/courses/enrolled'),
  enrollCourse: (courseId: string, tier: string) =>
    api.post(`/courses/${courseId}/enroll`, { tier }),
  getProgress: (courseId: string) => api.get<any>(`/courses/${courseId}/progress`),
  updateProgress: (courseId: string, lessonId: string, completed: boolean) =>
    api.patch(`/courses/${courseId}/progress`, { lessonId, completed }),
};

export const adminApi = {
  createCourse: (data: any) => api.post('/admin/courses', data),
  updateCourse: (courseId: string, data: any) => api.put(`/admin/courses/${courseId}`, data),
  deleteCourse: (courseId: string) => api.delete(`/admin/courses/${courseId}`),
  addModule: (courseId: string, data: any) => api.post(`/admin/courses/${courseId}/modules`, data),
  addLesson: (courseId: string, moduleId: string, data: any) =>
    api.post(`/admin/courses/${courseId}/modules/${moduleId}/lessons`, data),
  getLeads: () => api.get<any[]>('/admin/leads'),
  getEnrollments: () => api.get<any[]>('/admin/enrollments'),
  getMentorshipSessions: () => api.get<any[]>('/admin/mentorship-sessions'),
  updateMentorshipSession: (sessionId: string, data: any) =>
    api.put(`/admin/mentorship-sessions/${sessionId}`, data),
};

export const careerApi = {
  getMockInterviews: () => api.get<any[]>('/career/mock-interviews'),
  scheduleMockInterview: (data: any) => api.post('/career/mock-interviews', data),
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/career/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getResume: () => api.get<any>('/career/resume'),
  getPlacements: () => api.get<any[]>('/career/placements'),
  getMentorshipBookings: () => api.get<any[]>('/career/mentorship-bookings'),
  bookMentorship: (data: any) => api.post('/career/mentorship-bookings', data),
};

export const paymentApi = {
  createOrder: (courseId: string, tier: string) =>
    api.post<{ orderId: string; amount: number }>('/payments/create-order', { courseId, tier }),
  verifyPayment: (orderId: string, paymentId: string, signature: string) =>
    api.post('/payments/verify', { orderId, paymentId, signature }),
};

export const servicesApi = {
  submitLead: (data: any) => api.post('/services/leads', data),
};

export default apiClient;
