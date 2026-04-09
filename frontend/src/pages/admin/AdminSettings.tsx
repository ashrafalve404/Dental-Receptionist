import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Building, Clock, Phone, Mail, MapPin } from 'lucide-react';

interface ClinicSettings {
  clinic_name: string;
  address: string;
  phone: string;
  email: string;
  opening_time: string;
  closing_time: string;
  working_days: string;
  emergency_note: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<ClinicSettings>({
    clinic_name: 'AS Clinic',
    address: '',
    phone: '',
    email: '',
    opening_time: '09:00',
    closing_time: '20:00',
    working_days: 'Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday',
    emergency_note: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/clinic/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSettings({
          clinic_name: data.clinic_name || 'AS Clinic',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          opening_time: data.opening_time || '09:00',
          closing_time: data.closing_time || '20:00',
          working_days: data.working_days || 'Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday',
          emergency_note: data.emergency_note || '',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/clinic/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-medical-800">Clinic Settings</h2>
          <p className="text-medical-500">Manage clinic information and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700"
        >
          Settings saved successfully!
        </motion.div>
      )}

      {loading ? (
        <div className="p-8 text-center text-medical-500">Loading...</div>
      ) : (
        <div className="grid gap-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-medical-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                <Building className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-medical-800">Basic Information</h3>
            </div>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-medical-700 mb-2">Clinic Name</label>
                <input
                  type="text"
                  value={settings.clinic_name}
                  onChange={(e) => setSettings({ ...settings, clinic_name: e.target.value })}
                  className="w-full px-4 py-3 bg-medical-50 border border-medical-200 rounded-xl text-medical-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-medical-700 mb-2">Emergency Contact Note</label>
                <textarea
                  value={settings.emergency_note}
                  onChange={(e) => setSettings({ ...settings, emergency_note: e.target.value })}
                  className="w-full px-4 py-3 bg-medical-50 border border-medical-200 rounded-xl text-medical-800"
                  rows={2}
                  placeholder="e.g., For emergencies call 0123456789"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-medical-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-medical-800">Contact Information</h3>
            </div>
            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-medical-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-medical-50 border border-medical-200 rounded-xl text-medical-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-medical-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full px-4 py-3 bg-medical-50 border border-medical-200 rounded-xl text-medical-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-medical-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Address
                </label>
                <textarea
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-4 py-3 bg-medical-50 border border-medical-200 rounded-xl text-medical-800"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-medical-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-medical-800">Business Hours</h3>
            </div>
            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-medical-700 mb-2">Opening Time</label>
                  <input
                    type="time"
                    value={settings.opening_time}
                    onChange={(e) => setSettings({ ...settings, opening_time: e.target.value })}
                    className="w-full px-4 py-3 bg-medical-50 border border-medical-200 rounded-xl text-medical-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-medical-700 mb-2">Closing Time</label>
                  <input
                    type="time"
                    value={settings.closing_time}
                    onChange={(e) => setSettings({ ...settings, closing_time: e.target.value })}
                    className="w-full px-4 py-3 bg-medical-50 border border-medical-200 rounded-xl text-medical-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-medical-700 mb-2">Working Days (comma separated)</label>
                <input
                  type="text"
                  value={settings.working_days}
                  onChange={(e) => setSettings({ ...settings, working_days: e.target.value })}
                  className="w-full px-4 py-3 bg-medical-50 border border-medical-200 rounded-xl text-medical-800"
                  placeholder="Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}