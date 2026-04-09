import { motion } from 'framer-motion';
import { Calendar, Clock, User, Edit, X } from 'lucide-react';
import { formatDateShort, formatTime } from '../../utils/formatDate';
import Badge from '../ui/Badge';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';

interface AppointmentCardProps {
  appointment: {
    id: number;
    patient_id: number;
    service_type: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    reason?: string;
  };
  patientName?: string;
  onReschedule?: (id: number) => void;
  onCancel?: (id: number) => void;
  showActions?: boolean;
}

export default function AppointmentCard({ 
  appointment, 
  patientName, 
  onReschedule, 
  onCancel,
  showActions = true 
}: AppointmentCardProps) {
  const statusKey = appointment.status as keyof typeof STATUS_COLORS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-medical-100 p-4 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-medical-800">{appointment.service_type}</h4>
          {patientName && (
            <p className="text-sm text-medical-500 flex items-center gap-1">
              <User className="w-4 h-4" />
              {patientName}
            </p>
          )}
        </div>
        <Badge variant={statusKey === 'booked' ? 'info' : statusKey === 'cancelled' ? 'danger' : statusKey === 'completed' ? 'success' : 'warning'}>
          {STATUS_LABELS[statusKey] || appointment.status}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-sm text-medical-600 mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {formatDateShort(appointment.appointment_date)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatTime(appointment.appointment_time)}
        </span>
      </div>

      {appointment.reason && (
        <p className="text-sm text-medical-500 mb-3 bg-medical-50 rounded-lg p-2">
          {appointment.reason}
        </p>
      )}

      {showActions && appointment.status === 'booked' && (
        <div className="flex gap-2 pt-2 border-t border-medical-100">
          {onReschedule && (
            <button
              onClick={() => onReschedule(appointment.id)}
              className="flex-1 px-3 py-2 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors flex items-center justify-center gap-1"
            >
              <Edit className="w-4 h-4" />
              Reschedule
            </button>
          )}
          {onCancel && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
