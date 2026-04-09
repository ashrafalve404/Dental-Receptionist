import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Edit, Trash2, CheckSquare, Square } from 'lucide-react';

interface Patient {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  age: number;
  gender: string;
  created_at: string;
}

export default function AdminPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    age: '',
    gender: '',
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/patients');
      const data = await res.json();
      setPatients(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingPatient ? 'PUT' : 'POST';
    const url = editingPatient 
      ? `http://localhost:8000/api/patients/${editingPatient.id}`
      : 'http://localhost:8000/api/patients';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
        }),
      });
      fetchPatients();
      setShowModal(false);
      setEditingPatient(null);
      setFormData({ full_name: '', phone: '', email: '', age: '', gender: '' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      await fetch(`http://localhost:8000/api/patients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPatients();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPatients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPatients.map(p => p.id));
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
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} patient(s)?`)) return;
    const token = localStorage.getItem('adminToken');
    try {
      for (const id of selectedIds) {
        await fetch(`http://localhost:8000/api/patients/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setSelectedIds([]);
      fetchPatients();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      full_name: patient.full_name,
      phone: patient.phone,
      email: patient.email || '',
      age: patient.age?.toString() || '',
      gender: patient.gender || '',
    });
    setShowModal(true);
  };

  const filteredPatients = patients.filter(p => 
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-medical-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-medical-200 rounded-xl text-medical-800 placeholder:text-medical-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          />
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={deleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedIds.length})
            </button>
          )}
          <button
            onClick={() => { setEditingPatient(null); setFormData({ full_name: '', phone: '', email: '', age: '', gender: '' }); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Patient
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-medical-100 overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-medical-50 border-b border-medical-100">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button onClick={toggleSelectAll} className="text-teal-600 hover:text-teal-700">
                      {selectedIds.length === filteredPatients.length && filteredPatients.length > 0 ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-medical-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-medical-700">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-medical-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-medical-700">Age</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-medical-700">Gender</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-medical-700">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-medical-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-medical-100">
                {filteredPatients.map((patient) => (
                  <motion.tr
                    key={patient.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-medical-50/50"
                  >
                    <td className="px-6 py-4">
                      <button onClick={() => toggleSelect(patient.id)} className="text-teal-600 hover:text-teal-700">
                        {selectedIds.includes(patient.id) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-teal-600" />
                        </div>
                        <span className="font-medium text-medical-800">{patient.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-medical-600">{patient.phone}</td>
                    <td className="px-6 py-4 text-medical-600">{patient.email || '-'}</td>
                    <td className="px-6 py-4 text-medical-600">{patient.age || '-'}</td>
                    <td className="px-6 py-4 text-medical-600">{patient.gender || '-'}</td>
                    <td className="px-6 py-4 text-medical-500 text-sm">{formatDate(patient.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(patient)} className="p-2 text-medical-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(patient.id)} className="p-2 text-medical-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
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
      </motion.div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-medical-800 mb-4">
              {editingPatient ? 'Edit Patient' : 'Add New Patient'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-medical-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 bg-medical-50 border border-medical-200 rounded-xl text-medical-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-medical-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-medical-50 border border-medical-200 rounded-xl text-medical-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-medical-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-medical-50 border border-medical-200 rounded-xl text-medical-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-medical-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 bg-medical-50 border border-medical-200 rounded-xl text-medical-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-medical-700 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 bg-medical-50 border border-medical-200 rounded-xl text-medical-800"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingPatient(null); }}
                  className="px-4 py-2 text-medical-600 hover:bg-medical-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600"
                >
                  {editingPatient ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}