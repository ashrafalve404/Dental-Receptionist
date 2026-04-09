import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatTime, getToday, getNextWeek } from '../../utils/formatDate';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string, time: string) => void;
  availableSlots: string[];
  loading?: boolean;
  appointmentId?: number;
}

export default function RescheduleModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  availableSlots,
  loading
}: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(getToday());
      setSelectedTime('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (selectedDate && selectedTime) {
      onSubmit(selectedDate, selectedTime);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reschedule Appointment" size="md">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-medical-700 mb-2">Select New Date</label>
          <input
            type="date"
            value={selectedDate}
            min={getToday()}
            max={getNextWeek()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-medical-700 mb-2">Select New Time</label>
          {availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedTime === slot
                      ? 'border-teal-500 bg-teal-500 text-white'
                      : 'border-medical-200 hover:border-teal-300 text-medical-700'
                  }`}
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-medical-500 text-sm">No slots available for this date.</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            loading={loading}
            disabled={!selectedDate || !selectedTime}
            className="flex-1"
          >
            Confirm Reschedule
          </Button>
        </div>
      </div>
    </Modal>
  );
}
