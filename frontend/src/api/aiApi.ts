import api from './axios';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIChatRequest {
  session_id: string;
  patient_id?: number;
  message: string;
}

export interface AIChatResponse {
  response: string;
  intent?: string;
  extracted_data?: {
    full_name?: string;
    phone?: string;
    service_type?: string;
    preferred_date?: string;
    preferred_time?: string;
    reason?: string;
  };
  booking_confirmed?: boolean;
}

export interface AIBookingRequest {
  session_id: string;
  patient_id?: number;
  full_name: string;
  phone: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
}

export interface AIBookingResponse {
  success: boolean;
  appointment_id?: number;
  patient_name?: string;
  service_type?: string;
  appointment_date?: string;
  appointment_time?: string;
  message: string;
  error?: string;
  suggestions?: { date: string; time: string }[];
}

export interface AIRescheduleRequest {
  session_id: string;
  appointment_id: number;
  new_date: string;
  new_time: string;
}

export interface AICancelRequest {
  session_id: string;
  appointment_id: number;
  reason?: string;
}

export const sendChatMessage = async (data: AIChatRequest): Promise<AIChatResponse> => {
  const response = await api.post('/api/ai/chat', data);
  return response.data;
};

export const bookFromChat = async (data: AIBookingRequest): Promise<AIBookingResponse> => {
  try {
    const response = await api.post('/api/ai/book-from-chat', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const rescheduleFromChat = async (data: AIRescheduleRequest): Promise<AIBookingResponse> => {
  const response = await api.post('/api/ai/reschedule-from-chat', data);
  return response.data;
};

export const cancelFromChat = async (data: AICancelRequest): Promise<AIBookingResponse> => {
  const response = await api.post('/api/ai/cancel-from-chat', data);
  return response.data;
};
