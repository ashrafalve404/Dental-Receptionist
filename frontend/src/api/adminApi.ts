import api from './axios';

export interface Admin {
  id: number;
  username: string;
  name: string;
  role: string;
  token?: string;
}

export const login = async (username: string, password: string): Promise<Admin> => {
  const response = await api.post('/api/admin/login', { username, password });
  return response.data;
};

export const verifyToken = async (): Promise<{ valid: boolean }> => {
  try {
    const response = await api.get('/api/admin/verify');
    return response.data;
  } catch {
    return { valid: false };
  }
};
