import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { SERVICES } from '../../utils/constants';
import { formatTime } from '../../utils/formatDate';
import { getToday, getNextWeek } from '../../utils/formatDate';

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  availableSlots: string[];
  onDateChange: (date: string) => void;
  selectedDate: string;
  loading?: boolean;
}

export interface BookingFormData {
  full_name: string;
  phone: string;
  email?: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
}

export default function BookingForm({ onSubmit, availableSlots, onDateChange, selectedDate, loading }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    full_name: '',
    phone: '',
    email: '',
    service_type: '',
    appointment_date: selectedDate || getToday(),
    appointment_time: '',
    reason: '',
  });

  const [errors, setErrors] = useState<Partial<BookingFormData>>({});

  const validate = () => {
    const newErrors: Partial<BookingFormData> = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.service_type) newErrors.service_type = 'Service is required';
    if (!formData.appointment_time) newErrors.appointment_time = 'Time is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const handleChange = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          placeholder="Enter your name"
          value={formData.full_name}
          onChange={(e) => handleChange('full_name', e.target.value)}
          error={errors.full_name}
        />

        <Input
          label="Phone Number *"
          placeholder="01XXXXXXXXX"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
        />
      </div>

      <Input
        label="Email (Optional)"
        placeholder="your@email.com"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Service Type *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SERVICES.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => handleChange('service_type', service.name)}
              className={`p-3 rounded-md border text-left text-sm transition-colors ${
                formData.service_type === service.name
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <service.icon className="w-4 h-4 mr-2" />
              {service.name}
            </button>
          ))}
        </div>
        {errors.service_type && <p className="text-red-500 text-xs mt-1">{errors.service_type}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
          <input
            type="date"
            value={formData.appointment_date}
            min={getToday()}
            max={getNextWeek()}
            onChange={(e) => { handleChange('appointment_date', e.target.value); onDateChange(e.target.value); }}
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Time Slot *</label>
          {availableSlots.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleChange('appointment_time', slot)}
                  className={`py-2 px-2 rounded-md text-xs font-medium transition-colors ${
                    formData.appointment_time === slot
                      ? 'bg-teal-500 text-white'
                      : 'border border-slate-200 text-slate-600 hover:border-teal-300'
                  }`}
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-2">No slots available</p>
          )}
          {errors.appointment_time && <p className="text-red-500 text-xs mt-1">{errors.appointment_time}</p>}
        </div>
      </div>

      <Input
        label="Reason for Visit (Optional)"
        placeholder="Brief description of your concern..."
        value={formData.reason}
        onChange={(e) => handleChange('reason', e.target.value)}
      />

      <Button type="submit" loading={loading} className="w-full">
        Book Appointment
      </Button>
    </form>
  );
}