import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, CheckCircle, XCircle, TrendingUp, Clock, Activity } from 'lucide-react';

interface Stats {
  totalAppointments: number;
  todayAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalPatients: number;
  totalRevenue: number;
}

interface RecentAppointment {
  id: number;
  patient_name: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalPatients: 0,
    totalRevenue: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, patientsRes] = await Promise.all([
        fetch('http://localhost:8000/api/appointments'),
        fetch('http://localhost:8000/api/patients'),
      ]);

      const appointments = await appointmentsRes.json();
      const patients = await patientsRes.json();

      const today = new Date().toISOString().split('T')[0];
      const todayAppts = appointments.filter((a: any) => a.appointment_date?.startsWith(today));
      
      setStats({
        totalAppointments: appointments.length,
        todayAppointments: todayAppts.length,
        completedAppointments: appointments.filter((a: any) => a.status === 'completed').length,
        cancelledAppointments: appointments.filter((a: any) => a.status === 'cancelled').length,
        totalPatients: patients.length,
        totalRevenue: appointments.filter((a: any) => a.status !== 'cancelled').length * 500,
      });

      setRecentAppointments(appointments.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Appointments', value: stats.totalAppointments, icon: Calendar, color: 'bg-blue-500' },
    { label: 'Today\'s Appointments', value: stats.todayAppointments, icon: Activity, color: 'bg-green-500' },
    { label: 'Completed', value: stats.completedAppointments, icon: CheckCircle, color: 'bg-teal-500' },
    { label: 'Cancelled', value: stats.cancelledAppointments, icon: XCircle, color: 'bg-red-500' },
    { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'bg-purple-500' },
    { label: 'Estimated Revenue', value: `$${stats.totalRevenue}`, icon: TrendingUp, color: 'bg-amber-500' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'rescheduled': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-medical-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-medical-500">{stat.label}</p>
                <p className="text-2xl font-bold text-medical-800 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Appointments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-medical-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-medical-100">
          <h2 className="text-lg font-semibold text-medical-800">Recent Appointments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-medical-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-medical-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-medical-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-medical-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-medical-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-medical-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-medical-100">
              {recentAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-medical-50">
                  <td className="px-6 py-4 text-sm text-medical-600">#{apt.id}</td>
                  <td className="px-6 py-4 text-sm text-medical-800 font-medium">{apt.patient_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-medical-600">{apt.service_type}</td>
                  <td className="px-6 py-4 text-sm text-medical-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatDate(apt.appointment_date)} at {apt.appointment_time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
