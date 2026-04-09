import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import AppointmentCard from '../components/appointment/AppointmentCard';
import RescheduleModal from '../components/appointment/RescheduleModal';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import SectionTitle from '../components/ui/SectionTitle';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import { getAppointments, getAvailableSlots } from '../api/appointmentApi';
import { Appointment } from '../api/appointmentApi';
import { DEFAULT_SESSION_ID } from '../utils/constants';
import { rescheduleFromChat, cancelFromChat } from '../api/aiApi';

export default function ManageAppointment() {
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setSearched(true);
    
    try {
      const allAppointments = await getAppointments();
      const filtered = allAppointments.filter(apt => 
        apt.patient_id.toString() === searchQuery || 
        apt.id.toString() === searchQuery
      );
      setAppointments(filtered);
    } catch (error) {
      console.log('No appointments found');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (appointmentId: number) => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (apt) {
      setSelectedAppointment(apt);
      setRescheduleModalOpen(true);
      
      try {
        const date = apt.appointment_date.split('T')[0];
        const response = await getAvailableSlots(date);
        setAvailableSlots(response.available_slots);
      } catch (error) {
        console.log('No slots available');
        setAvailableSlots([]);
      }
    }
  };

  const handleCancel = async (appointmentId: number) => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (apt) {
      setSelectedAppointment(apt);
      setCancelModalOpen(true);
    }
  };

  const confirmReschedule = async (newDate: string, newTime: string) => {
    if (!selectedAppointment) return;
    
    setRescheduleLoading(true);
    try {
      const sessionId = localStorage.getItem('chat_session_id') || DEFAULT_SESSION_ID;
      
      await rescheduleFromChat({
        session_id: sessionId,
        appointment_id: selectedAppointment.id,
        new_date: newDate,
        new_time: newTime,
      });
      
      setAppointments(prev => prev.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, appointment_date: newDate, appointment_time: newTime, status: 'rescheduled' }
          : apt
      ));
      
      setRescheduleModalOpen(false);
    } catch (error) {
      console.error('Failed to reschedule:', error);
    } finally {
      setRescheduleLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!selectedAppointment) return;
    
    try {
      const sessionId = localStorage.getItem('chat_session_id') || DEFAULT_SESSION_ID;
      
      await cancelFromChat({
        session_id: sessionId,
        appointment_id: selectedAppointment.id,
      });
      
      setAppointments(prev => prev.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, status: 'cancelled' }
          : apt
      ));
      
      setCancelModalOpen(false);
    } catch (error) {
      console.error('Failed to cancel:', error);
    }
  };

  return (
    <div className="min-h-screen bg-medical-50">
      <Navbar />
      
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SectionTitle 
              title="Manage Appointment" 
              subtitle="Find & Manage"
              description="Enter your appointment ID or patient ID to find your appointment"
            />

            {/* Search */}
            <Card className="mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter appointment ID or patient ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={handleSearch} loading={loading}>
                  Search
                </Button>
              </div>
            </Card>

            {/* Results */}
            {loading ? (
              <div className="py-20">
                <Loader text="Searching..." />
              </div>
            ) : searched && appointments.length === 0 ? (
              <Card>
                <EmptyState
                  title="No appointments found"
                  description="Try searching with a different ID"
                />
              </Card>
            ) : appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map(appointment => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    showActions={appointment.status === 'booked'}
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <EmptyState
                  icon={<Calendar className="w-8 h-8" />}
                  title="Find Your Appointment"
                  description="Enter your appointment ID or patient ID above to manage your booking"
                />
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        onSubmit={confirmReschedule}
        availableSlots={availableSlots}
        loading={rescheduleLoading}
        appointmentId={selectedAppointment?.id || 0}
      />

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Appointment"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-medical-600">
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              onClick={() => setCancelModalOpen(false)}
              className="flex-1"
            >
              Keep Appointment
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
