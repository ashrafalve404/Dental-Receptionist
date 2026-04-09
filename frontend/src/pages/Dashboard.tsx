import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Loader from '../components/ui/Loader';
import AppointmentCard from '../components/appointment/AppointmentCard';
import { getAppointments } from '../api/appointmentApi';
import { getClinicInfo } from '../api/clinicApi';
import { getPatients } from '../api/patientApi';
import { Appointment } from '../api/appointmentApi';
import { ClinicInfo } from '../api/clinicApi';
import { Patient } from '../api/patientApi';

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAppointments(), getPatients(), getClinicInfo()])
      .then(([appts, pats, info]) => { setAppointments(appts); setPatients(pats); setClinicInfo(info); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-100"><Navbar /><div className="pt-16"><Loader text="Loading..." /></div></div>;

  const upcoming = appointments.filter(a => a.status === 'booked').slice(0, 5);
  const todayAppts = appointments.filter(a => a.status === 'booked').length;

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      
      {/* Header */}
      <div className="pt-16 h-32 bg-slate-900 flex items-center justify-center">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-8 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Appointments', value: appointments.length },
            { label: 'Booked Today', value: todayAppts },
            { label: 'Total Patients', value: patients.length },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <p className="text-xs text-slate-500 uppercase">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Upcoming Appointments</h3>
              {upcoming.length > 0 ? (
                <div className="space-y-2">
                  {upcoming.map(apt => <AppointmentCard key={apt.id} appointment={apt} showActions={false} />)}
                </div>
              ) : <p className="text-sm text-slate-500 py-4 text-center">No appointments</p>}
            </div>
          </div>

          <div>
            {clinicInfo && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
                <h3 className="text-base font-semibold text-slate-800 mb-3">Clinic Info</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>{clinicInfo.address}</p>
                  <p>{clinicInfo.phone}</p>
                  <p>{clinicInfo.opening_time} - {clinicInfo.closing_time}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}