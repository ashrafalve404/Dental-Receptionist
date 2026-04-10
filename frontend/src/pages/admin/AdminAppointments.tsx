import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Search, Filter, CheckCircle, XCircle, Eye, Trash2, CheckSquare, Square } from 'lucide-react';

interface Appointment {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason?: string;
  notes?: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  booked: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8000/api/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setAppointments(appointments.map(apt => 
          apt.id === id ? { ...apt, status } : apt
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`http://localhost:8000/api/appointments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(appointments.filter(apt => apt.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAppointments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAppointments.map(apt => apt.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const deleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} appointment(s)?`)) return;
    const token = localStorage.getItem('adminToken');
    try {
      for (const id of selectedIds) {
        await fetch(`http://localhost:8000/api/appointments/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setSelectedIds([]);
      fetchAppointments();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patient_phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Appointments</h2>
          <p className="text-sm text-slate-500 hidden sm:block">Manage patient appointments</p>
        </div>
        <div className="text-sm text-slate-500">
          Total: {filteredAppointments.length}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-lg md:rounded-xl text-sm md:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 md:pl-10 pr-8 md:pr-10 py-2.5 md:py-3 bg-white border border-slate-200 rounded-lg md:rounded-xl text-sm md:text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/50 appearance-none"
          >
            <option value="all">All</option>
            <option value="booked">Booked</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Delete Selected Button */}
      {selectedIds.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={deleteSelected}
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-red-500 text-white rounded-lg md:rounded-xl text-sm hover:bg-red-600 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete ({selectedIds.length})
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg md:rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-6 md:p-8 text-center text-slate-500">Loading...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-6 md:p-8 text-center text-slate-500">No appointments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left">
                    <button onClick={toggleSelectAll} className="text-teal-600 hover:text-teal-700">
                      {selectedIds.length === filteredAppointments.length && filteredAppointments.length > 0 ? (
                        <CheckSquare className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <Square className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700">Patient</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700 hidden sm:table-cell">Service</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700">Date & Time</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((apt) => (
                  <motion.tr
                    key={apt.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/50"
                  >
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <button onClick={() => toggleSelect(apt.id)} className="text-teal-600 hover:text-teal-700">
                        {selectedIds.includes(apt.id) ? (
                          <CheckSquare className="w-4 h-4 md:w-5 md:h-5" />
                        ) : (
                          <Square className="w-4 h-4 md:w-5 md:h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 md:w-5 md:h-5 text-teal-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 text-sm md:text-base truncate max-w-[100px] md:max-w-none">{apt.patient_name}</p>
                          <p className="text-xs md:text-sm text-slate-500 md:hidden">{apt.patient_phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-slate-600 text-sm hidden sm:table-cell">{apt.service_type}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-slate-600 text-xs md:text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span>{apt.appointment_date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span>{apt.appointment_time}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${statusColors[apt.status]}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-1 md:gap-2">
                        <button
                          onClick={() => setSelectedAppointment(apt)}
                          className="p-1.5 md:p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                        >
                          <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                        {apt.status === 'booked' && (
                          <button
                            onClick={() => updateStatus(apt.id, 'confirmed')}
                            className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                        )}
                        {(apt.status === 'booked' || apt.status === 'confirmed') && (
                          <button
                            onClick={() => updateStatus(apt.id, 'cancelled')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {apt.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(apt.id, 'completed')}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => deleteAppointment(apt.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-medical-800 mb-4">Appointment Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-medical-400" />
                <span className="text-medical-700">{selectedAppointment.patient_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-medical-400 w-5" />
                <span className="text-medical-700">{selectedAppointment.patient_phone}</span>
              </div>
              {selectedAppointment.patient_email && (
                <div className="flex items-center gap-3">
                  <span className="text-medical-400 w-5" />
                  <span className="text-medical-700">{selectedAppointment.patient_email}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-medical-400" />
                <span className="text-medical-700">{selectedAppointment.appointment_date}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-medical-400" />
                <span className="text-medical-700">{selectedAppointment.appointment_time}</span>
              </div>
              {selectedAppointment.notes && (
                <div className="p-3 bg-medical-50 rounded-xl">
                  <p className="text-sm text-medical-600">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 bg-medical-100 text-medical-700 rounded-xl hover:bg-medical-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}