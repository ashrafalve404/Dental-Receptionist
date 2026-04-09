import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, User, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  message: string;
  created_at: string;
}

interface Conversation {
  id: number;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-medical-800">Conversations</h2>
          <p className="text-medical-500">View patient chat history with AI</p>
        </div>
        <div className="text-sm text-medical-500">
          Total: {filteredConversations.length} conversations
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-medical-400" />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-medical-200 rounded-xl text-medical-800 placeholder:text-medical-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
        />
      </div>

      {/* Conversations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-medical-500">Loading...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-medical-500">No conversations found</div>
        ) : (
          filteredConversations.map((conv) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-medical-100 overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === conv.id ? null : conv.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-medical-50/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-medical-800">{conv.patient_name}</p>
                    <p className="text-sm text-medical-500">{conv.patient_phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-medical-500">
                      <Calendar className="w-4 h-4" />
                      {formatDate(conv.created_at)}
                    </div>
                    <p className="text-sm text-teal-600">{conv.messages.length} messages</p>
                  </div>
                  {expandedId === conv.id ? (
                    <ChevronUp className="w-5 h-5 text-medical-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-medical-400" />
                  )}
                </div>
              </button>

              {expandedId === conv.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="border-t border-medical-100"
                >
                  <div className="p-4 max-h-96 overflow-y-auto space-y-4">
                    {conv.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl ${
                            msg.role === 'user'
                              ? 'bg-teal-500 text-white'
                              : 'bg-medical-100 text-medical-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-3 h-3" />
                            <span className="text-xs font-medium">
                              {msg.role === 'user' ? 'Patient' : 'AI Assistant'}
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
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}