const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('attendsync_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function handleResponse(response: Response) {
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('attendsync_token');
        localStorage.removeItem('attendsync_user');
        window.location.href = '/login';
      }
    }
    throw new Error(data.message || 'Something went wrong.');
  }
  return data;
}

export const api = {
  // Auth API
  async login(body: any) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async register(body: any) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async forgotPassword(body: any) {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateProfile(body: any) {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async deleteAccount() {
    const res = await fetch(`${API_BASE_URL}/auth/delete-account`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Subjects API
  async getSubjects() {
    const res = await fetch(`${API_BASE_URL}/subjects`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createSubject(body: any) {
    const res = await fetch(`${API_BASE_URL}/subjects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async updateSubject(id: string, body: any) {
    const res = await fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async deleteSubject(id: string) {
    const res = await fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Attendance Log API
  async getLogs() {
    const res = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createLog(body: any) {
    const res = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async quickUpdateLog(body: { subjectId: string; status: 'present' | 'absent' }) {
    const res = await fetch(`${API_BASE_URL}/attendance/quick`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async deleteLog(id: string) {
    const res = await fetch(`${API_BASE_URL}/attendance/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Timetable API
  async getTimetable() {
    const res = await fetch(`${API_BASE_URL}/timetable`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createTimetableSlot(body: any) {
    const res = await fetch(`${API_BASE_URL}/timetable`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async deleteTimetableSlot(id: string) {
    const res = await fetch(`${API_BASE_URL}/timetable/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Planner API
  async getPlannerItems() {
    const res = await fetch(`${API_BASE_URL}/planner`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createPlannerItem(body: any) {
    const res = await fetch(`${API_BASE_URL}/planner`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async updatePlannerItem(id: string, body: any) {
    const res = await fetch(`${API_BASE_URL}/planner/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async deletePlannerItem(id: string) {
    const res = await fetch(`${API_BASE_URL}/planner/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Analytics API
  async getAnalytics() {
    const res = await fetch(`${API_BASE_URL}/analytics`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Seeder API
  async seedMockData() {
    const res = await fetch(`${API_BASE_URL}/seed`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
