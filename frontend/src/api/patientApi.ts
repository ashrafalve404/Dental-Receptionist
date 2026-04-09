import api from './axios';

export interface Patient {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: string;
  notes?: string;
  created_at: string;
}

export interface CreatePatientData {
  full_name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: string;
  notes?: string;
}

export const getPatients = async (): Promise<Patient[]> => {
  const response = await api.get('/api/patients');
  return response.data;
};

export const getPatient = async (id: number): Promise<Patient> => {
  const response = await api.get(`/api/patients/${id}`);
  return response.data;
};

export const createPatient = async (data: CreatePatientData): Promise<Patient> => {
  const response = await api.post('/api/patients', data);
  return response.data;
};

export const updatePatient = async (id: number, data: Partial<CreatePatientData>): Promise<Patient> => {
  const response = await api.put(`/api/patients/${id}`, data);
  return response.data;
};

export const deletePatient = async (id: number): Promise<void> => {
  await api.delete(`/api/patients/${id}`);
};
