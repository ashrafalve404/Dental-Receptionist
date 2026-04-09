import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import BookingForm, { BookingFormData } from '../components/appointment/BookingForm';
import BookingSummaryCard from '../components/chat/BookingSummaryCard';
import SectionTitle from '../components/ui/SectionTitle';
import Loader from '../components/ui/Loader';
import { getAvailableSlots } from '../api/appointmentApi';
import { bookFromChat } from '../api/aiApi';
import { getClinicInfo } from '../api/clinicApi';
import { DEFAULT_SESSION_ID, SERVICES } from '../utils/constants';
import { getToday } from '../utils/formatDate';

export default function BookAppointment() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [clinicInfo, setClinicInfo] = useState<any>(null);

  useEffect(() => {
    getClinicInfo().then(setClinicInfo).catch(() => setClinicInfo(null));
  }, []);

  useEffect(() => {
    setSlotsLoading(true);
    getAvailableSlots(selectedDate)
      .then(res => setAvailableSlots(res.available_slots))
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate]);

  const handleSubmit = async (data: BookingFormData) => {
    setLoading(true);
    try {
      const sessionId = localStorage.getItem('chat_session_id') || DEFAULT_SESSION_ID;
      const response = await bookFromChat({
        session_id: sessionId,
        full_name: data.full_name,
        phone: data.phone,
        service_type: data.service_type,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        reason: data.reason,
      });

      if (response.success) {
        setBooking(response);
      } else {
        alert(response.message || 'Failed to book');
      }
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to book');
    } finally {
      setLoading(false);
    }
  };

  if (booking) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="pt-16 pb-12 px-4">
          <div className="max-w-md mx-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Appointment Confirmed!</h2>
                <p className="text-slate-500 text-sm mb-6">Your appointment has been successfully booked.</p>
                <BookingSummaryCard booking={booking} />
                <button onClick={() => navigate('/')} className="mt-6 text-teal-600 hover:text-teal-700 text-sm font-medium">
                  Return to Home
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      
      {/* Header */}
      <div className="pt-16 h-32 bg-slate-900 flex items-center justify-center">
        <h1 className="text-3xl font-bold text-white">Book an Appointment</h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <SectionTitle title="Appointment Form" align="left" />
                <div className="mt-6">
                  {slotsLoading ? (
                    <div className="py-12"><Loader text="Loading slots..." /></div>
                  ) : (
                    <BookingForm 
                      onSubmit={handleSubmit}
                      availableSlots={availableSlots}
                      onDateChange={setSelectedDate}
                      selectedDate={selectedDate}
                      loading={loading}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              {/* Clinic Image */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80" 
                  alt="Clinic interior" 
                  className="w-full h-40 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-base font-semibold text-slate-800 mb-4">Clinic Information</h3>
                  {clinicInfo ? (
                    <div className="space-y-3 text-sm">
                      <div><p className="text-slate-500 text-xs uppercase">Address</p><p className="text-slate-700">{clinicInfo.address || 'N/A'}</p></div>
                      <div><p className="text-slate-500 text-xs uppercase">Phone</p><p className="text-slate-700">{clinicInfo.phone || 'N/A'}</p></div>
                      <div><p className="text-slate-500 text-xs uppercase">Email</p><p className="text-slate-700">{clinicInfo.email || 'N/A'}</p></div>
                      <div><p className="text-slate-500 text-xs uppercase">Hours</p><p className="text-slate-700">{clinicInfo.opening_time || 'N/A'} - {clinicInfo.closing_time || 'N/A'}</p></div>
                    </div>
                  ) : <p className="text-sm text-slate-500">Loading...</p>}
                </div>
              </div>

              {/* Services */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
                <h3 className="text-base font-semibold text-slate-800 mb-3">Our Services</h3>
                <div className="space-y-2">
                  {SERVICES.slice(0, 5).map((service) => (
                    <div key={service.id} className="flex items-center gap-2 text-sm text-slate-600">
                      <service.icon className="w-4 h-4 text-teal-500" />
                      <span>{service.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}