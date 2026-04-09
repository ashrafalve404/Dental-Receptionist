import { Smile, Sparkles, Wrench, Building2, Ruler, Gem, Stethoscope, Calendar, Clock, X, RotateCcw } from 'lucide-react';

export const SERVICES = [
  { id: 'dental-checkup', name: 'Dental Checkup', icon: Smile, description: 'Regular dental examination and assessment' },
  { id: 'teeth-cleaning', name: 'Teeth Cleaning', icon: Sparkles, description: 'Professional scaling and polishing' },
  { id: 'tooth-extraction', name: 'Tooth Extraction', icon: Wrench, description: 'Safe and painless tooth removal' },
  { id: 'root-canal', name: 'Root Canal', icon: Building2, description: 'Treatment for infected tooth pulp' },
  { id: 'braces-consultation', name: 'Braces Consultation', icon: Ruler, description: 'Orthodontic assessment and treatment' },
  { id: 'teeth-whitening', name: 'Teeth Whitening', icon: Gem, description: 'Professional teeth whitening treatment' },
  { id: 'gum-treatment', name: 'Gum Treatment', icon: Stethoscope, description: 'Treatment for gum diseases' },
];

export const STATUS_COLORS = {
  booked: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  rescheduled: 'bg-amber-100 text-amber-700 border-amber-200',
};

export const STATUS_LABELS = {
  booked: 'Booked',
  cancelled: 'Cancelled',
  completed: 'Completed',
  rescheduled: 'Rescheduled',
};

export const CHAT_SUGGESTIONS = [
  { id: 'book', label: 'Book appointment', icon: Calendar },
  { id: 'timings', label: 'Clinic timings', icon: Clock },
  { id: 'cleaning', label: 'Teeth cleaning', icon: Sparkles },
  { id: 'root-canal', label: 'Root canal', icon: Building2 },
  { id: 'cancel', label: 'Cancel appointment', icon: X },
  { id: 'reschedule', label: 'Reschedule', icon: RotateCcw },
];

export const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hello! Welcome to AS Clinic. I'm your virtual receptionist. How may I help you today?",
};

export const DEFAULT_SESSION_ID = 'chat-session-default';

export const API_BASE_URL = 'http://localhost:8000';