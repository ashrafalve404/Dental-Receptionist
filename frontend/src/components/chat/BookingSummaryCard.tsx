import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, User, Scissors } from 'lucide-react';
import { formatDateShort, formatTime } from '../../utils/formatDate';
import Button from '../ui/Button';

interface BookingSummaryCardProps {
  booking: {
    appointment_id?: number;
    patient_name?: string;
    service_type?: string;
    appointment_date?: string;
    appointment_time?: string;
    message: string;
  };
  onClose?: () => void;
}

export default function BookingSummaryCard({ booking, onClose }: BookingSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-gradient-to-br from-teal-50 to-white border border-teal-200 rounded-2xl p-6 shadow-lg shadow-teal-100/50 max-w-md mx-auto"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-teal-800">Appointment Confirmed!</h3>
          <p className="text-sm text-teal-600">ID: #{booking.appointment_id || 'N/A'}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-medical-700">
          <User className="w-5 h-5 text-teal-500" />
          <span>{booking.patient_name || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-3 text-medical-700">
          <Scissors className="w-5 h-5 text-teal-500" />
          <span>{booking.service_type || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-3 text-medical-700">
          <Calendar className="w-5 h-5 text-teal-500" />
          <span>{booking.appointment_date ? formatDateShort(booking.appointment_date) : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-3 text-medical-700">
          <Clock className="w-5 h-5 text-teal-500" />
          <span>{booking.appointment_time ? formatTime(booking.appointment_time) : 'N/A'}</span>
        </div>
      </div>

      <p className="text-sm text-teal-700 bg-teal-50 rounded-xl p-3 mb-4">
        {booking.message}
      </p>

      {onClose && (
        <Button variant="secondary" size="sm" onClick={onClose} className="w-full">
          Continue Chatting
        </Button>
      )}
    </motion.div>
  );
}
