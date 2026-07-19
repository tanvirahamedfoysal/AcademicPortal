'use client';

import { useState, useEffect } from 'react';
import { Loader2, Search, Trash2, Mail, MailOpen, X, Reply, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/messages/${id}/read`, { method: 'PATCH' });
      if (res.ok) {
        setMessages(prev => prev.map(msg => 
          msg.id === id ? { ...msg, is_read: true } : msg
        ));
      }
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/v1/messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null); // Close modal if open
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenMessage = (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      markAsRead(msg.id);
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    msg.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.sender_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="max-w-5xl mx-auto pb-12 relative">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Inbox 
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-sm py-0.5 px-2.5 rounded-full font-medium">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage incoming inquiries and contact form submissions.</p>
        </div>
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search sender or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-500 text-sm">Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <MailOpen className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">No messages found</p>
            <p className="text-slate-400 text-sm mt-1">Your inbox is looking clean.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            <AnimatePresence>
              {filteredMessages.map((msg) => (
                <motion.li 
                  key={msg.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  onClick={() => handleOpenMessage(msg)}
                  className={`flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-slate-50 ${!msg.is_read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {!msg.is_read ? (
                      <Mail className="h-5 w-5 text-blue-600 fill-blue-100" />
                    ) : (
                      <MailOpen className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className={`text-sm truncate pr-4 ${!msg.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {msg.sender_name}
                      </p>
                      <span className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm truncate mb-1 ${!msg.is_read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                      {msg.subject}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {msg.content}
                    </p>
                  </div>

                  <div className="flex-shrink-0 ml-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                      disabled={actionLoading === msg.id}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {actionLoading === msg.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {}
      <AnimatePresence>
        {selectedMessage && (
          <>
            {}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedMessage(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            
            {}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Message Details</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setSelectedMessage(null)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {}
              <div className="p-6 overflow-y-auto">
                <h2 className="text-xl font-bold text-slate-900 mb-4">{selectedMessage.subject}</h2>
                
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                      {selectedMessage.sender_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{selectedMessage.sender_name}</p>
                      <p className="text-sm text-slate-500">{selectedMessage.sender_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap text-slate-700">
                  {selectedMessage.content}
                </div>
              </div>

              {}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <a 
                  href={`mailto:${selectedMessage.sender_email}?subject=Re: ${selectedMessage.subject}`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Reply className="h-4 w-4" />
                  Reply via Email
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}