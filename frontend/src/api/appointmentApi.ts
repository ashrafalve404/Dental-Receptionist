import api from './axios';

export interface Appointment {
  id: number;
  patient_id: number;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentData {
  patient_id: number;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
  notes?: string;
}

export interface AvailableSlots {
  date: string;
  available_slots: string[];
}

export const getAppointments = async (status?: string): Promise<Appointment[]> => {
  const params = status ? { status } : {};
  const response = await api.get('/api/appointments', { params });
  return response.data;
};

export const getAppointment = async (id: number): Promise<Appointment> => {
  const response = await api.get(`/api/appointments/${id}`);
  return response.data;
};

export const createAppointment = async (data: CreateAppointmentData): Promise<Appointment> => {
  const response = await api.post('/api/appointments', data);
  return response.data;
};

export const updateAppointment = async (id: number, data: Partial<CreateAppointmentData>): Promise<Appointment> => {
  const response = await api.put(`/api/appointments/${id}`, data);
  return response.data;
};

export const deleteAppointment = async (id: number): Promise<void> => {
  await api.delete(`/api/appointments/${id}`);
};

export const getAvailableSlots = async (date: string): Promise<AvailableSlots> => {
  const response = await api.get('/api/appointments/available-slots', { params: { date } });
  return response.data;
};
