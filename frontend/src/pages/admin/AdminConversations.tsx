import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search, User, Calendar, ChevronDown, ChevronUp, Trash2, X, AlertTriangle } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  message: string;
  created_at: string;
}

interface Conversation {
  id: number;
  session_id: string;
  patient_name: string;
  patient_phone: string;
  created_at: string;
  messages: Message[];
}

export default function AdminConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; sessionId: string; patientName: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8000/api/conversations/session/${deleteModal.sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setConversations(prev => prev.filter(c => c.session_id !== deleteModal.sessionId));
        setDeleteModal(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    } finally {
      setDeleting(false);
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.patient_phone.includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Conversations</h2>
          <p className="text-sm text-slate-500 hidden sm:block">View patient chat history with AI</p>
        </div>
        <div className="text-sm text-slate-500">
          Total: {filteredConversations.length} conversations
        </div>
      </div>

      {/* Search - Responsive */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-lg md:rounded-xl text-sm md:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
        />
      </div>

      {/* Conversations List - Responsive Grid */}
      <div className="grid gap-3 md:gap-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No conversations found</div>
        ) : (
          filteredConversations.map((conv) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg md:rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === conv.id ? null : conv.id)}
                className="w-full p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 md:w-6 md:h-6 text-teal-600" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-medium text-slate-800 truncate">{conv.patient_name}</p>
                    <p className="text-sm text-slate-500">{conv.patient_phone}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-xs md:text-sm text-slate-500">
                      <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">{formatDate(conv.created_at)}</span>
                      <span className="sm:hidden">{new Date(conv.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs md:text-sm text-teal-600">{conv.messages.length} msgs</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModal({ show: true, sessionId: conv.session_id, patientName: conv.patient_name });
                      }}
                      className="p-1.5 md:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    {expandedId === conv.id ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {expandedId === conv.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100"
                  >
                    <div className="p-3 md:p-4 max-h-64 md:max-h-96 overflow-y-auto space-y-3 md:space-y-4">
                      {conv.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] md:max-w-[80%] p-2.5 md:p-3 rounded-lg md:rounded-2xl ${
                              msg.role === 'user'
                                ? 'bg-teal-500 text-white'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                              <MessageSquare className="w-3 h-3 md:w-3.5 md:h-3.5" />
                              <span className="text-xs font-medium">
                                {msg.role === 'user' ? 'Patient' : 'AI'}
                              </span>
                            </div>
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {formatDate(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal?.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => !deleting && setDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl md:rounded-2xl p-5 md:p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Delete Conversation</h3>
              </div>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete all messages for <strong>{deleteModal.patientName}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConversation}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </button>
              </div>
              <button
                onClick={() => setDeleteModal(null)}
                className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}