import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Search, Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ question: '', answer: '', category: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: '' });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/faqs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFaqs(data);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newFaq.question || !newFaq.answer) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newFaq),
      });
      if (response.ok) {
        const created = await response.json();
        setFaqs([...faqs, created]);
        setNewFaq({ question: '', answer: '', category: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding FAQ:', error);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8000/api/faqs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setFaqs(faqs.map(faq => faq.id === id ? { ...faq, ...formData } : faq));
        setIsEditing(false);
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8000/api/faqs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setFaqs(faqs.filter(faq => faq.id !== id));
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const startEdit = (faq: FAQ) => {
    setFormData({ question: faq.question, answer: faq.answer, category: faq.category || '' });
    setIsEditing(true);
    setEditingId(faq.id);
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-medical-800">FAQs</h2>
          <p className="text-medical-500">Manage frequently asked questions for AI</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600"
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-medical-400" />
        <input
          type="text"
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-medical-200 rounded-xl text-medical-800 placeholder:text-medical-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
        />
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-medical-100"
        >
          <h3 className="text-lg font-semibold text-medical-800 mb-4">Add New FAQ</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-medical-700 mb-2">Question</label>
              <input
                type="text"
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                className="w-full px-4 py-3 bg-medical-50 border border-medical-200 rounded-xl text-medical-800"
                placeholder="Enter question"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-medical-700 mb-2">Answer</label>
              <textarea
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                className="w-full px-4 py-3 bg-medical-50 border border-medical-200 rounded-xl text-medical-800"
                placeholder="Enter answer"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-medical-600 hover:bg-medical-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* FAQs List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="p-8 text-center text-medical-500">Loading...</div>
        ) : filteredFaqs.length === 0 ? (
          <div className="p-8 text-center text-medical-500">No FAQs found</div>
        ) : (
          filteredFaqs.map((faq) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-medical-100 p-6"
            >
              {isEditing && editingId === faq.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-medical-700 mb-2">Question</label>
                    <input
                      type="text"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="w-full px-4 py-3 bg-medical-50 border border-medical-200 rounded-xl text-medical-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-medical-700 mb-2">Answer</label>
                    <textarea
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      className="w-full px-4 py-3 bg-medical-50 border border-medical-200 rounded-xl text-medical-800"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => { setIsEditing(false); setEditingId(null); }}
                      className="px-4 py-2 text-medical-600 hover:bg-medical-100 rounded-xl flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdate(faq.id)}
                      className="px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-medical-800">{faq.question}</h4>
                        <p className="mt-2 text-medical-600">{faq.answer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(faq)}
                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}