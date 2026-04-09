import api from './axios';

export interface ClinicInfo {
  id: number;
  clinic_name: string;
  address: string;
  phone: string;
  email: string;
  opening_time: string;
  closing_time: string;
  working_days: string;
  slot_duration_minutes: number;
  emergency_note: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export const getClinicInfo = async (): Promise<ClinicInfo> => {
  const response = await api.get('/api/clinic/info');
  return response.data;
};

export const getFAQs = async (): Promise<FAQ[]> => {
  const response = await api.get('/api/clinic/faqs');
  return response.data;
};
