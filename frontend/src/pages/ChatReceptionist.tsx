import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import TypingIndicator from '../components/chat/TypingIndicator';
import { sendChatMessage } from '../api/aiApi';
import { WELCOME_MESSAGE } from '../utils/constants';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function ChatReceptionist() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('chat_session_id');
    return stored || `session-${Date.now()}`;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem('chat_session_id', sessionId);
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: WELCOME_MESSAGE.content }]);
    }
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setShowSuccessAlert(false);

    try {
      const response = await sendChatMessage({
        session_id: sessionId,
        message: content,
      });

      const cleanResponse = response.response.replace(/\*\*/g, '').trim();

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: cleanResponse,
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (response.quick_replies && response.quick_replies.length > 0) {
        setQuickReplies(response.quick_replies);
      } else {
        setQuickReplies([]);
      }

      if (response.booking_confirmed) {
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 5000);
      }
    } catch (error) {
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Something went wrong. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      
      <div className="pt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Chat Header Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6 overflow-hidden">
            <div className="h-24 bg-slate-900 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-xl font-bold text-white">AS Clinic Assistant</h1>
                <p className="text-slate-400 text-sm">Online Booking Service</p>
              </div>
            </div>
            <div className="px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">AS</span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">Virtual Receptionist</h2>
                <p className="text-sm text-slate-500">Available 24/7 for appointments</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-slate-500">Online</span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-[500px] overflow-y-auto p-4 space-y-3">
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} isLatest={index === messages.length - 1} />
              ))}
              
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {quickReplies.length > 0 && (
              <div className="px-4 pb-3 flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(reply)}
                    className="px-3 py-1.5 bg-teal-50 text-teal-700 text-sm rounded-full border border-teal-200 
                             hover:bg-teal-100 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <ChatInput 
              onSendMessage={handleSendMessage} 
              disabled={isLoading}
              inputRef={inputRef}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Appointment booked successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}