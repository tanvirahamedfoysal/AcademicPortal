'use client';

import { useState, useEffect } from 'react';
import { Loader2, Search, Inbox, Trash2, Mail, MailOpen, X, Reply } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  uuid: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function ModeratorMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
        setMessages(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (message: Message) => {
    setSelectedMessage(message);
    
    if (message.is_read) return;

    try {
      const res = await fetch(`/api/v1/messages/${message.uuid}/read`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true })
      });
      
      if (res.ok) {
        setMessages(prev => 
          prev.map(m => m.uuid === message.uuid ? { ...m, is_read: true } : m)
        );
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, uuid: string) => {
    e.stopPropagation(); 
    if (!confirm("Are you sure you want to delete this message?")) return;

    setActionLoading(uuid);
    try {
      const res = await fetch(`/api/v1/messages/${uuid}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.uuid !== uuid));
        if (selectedMessage?.uuid === uuid) setSelectedMessage(null);
      } else {
        alert("Failed to delete message.");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredMessages = messages.filter(m => {
    const query = searchQuery.toLowerCase();
    return (
      (m.name || '').toLowerCase().includes(query) ||
      (m.email || '').toLowerCase().includes(query) ||
      (m.subject || '').toLowerCase().includes(query)
    );
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Inbox className="h-6 w-6 text-sky-500" />
            Messages
            {unreadCount > 0 && (
              <span className="bg-sky-100 text-sky-700 text-xs font-bold px-2.5 py-0.5 rounded-full ml-2">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review and manage incoming contact inquiries.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {isLoading ? (
            <li className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </li>
          ) : filteredMessages.length === 0 ? (
            <li className="py-12 text-center text-slate-500 text-sm">
              <Inbox className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              Your inbox is empty.
            </li>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredMessages.map((msg) => (
                <motion.li
                  key={msg.uuid}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => markAsRead(msg)}
                  className={`p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer ${
                    !msg.is_read ? 'bg-sky-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-4 overflow-hidden">
                    <div className="mt-1 shrink-0">
                      {!msg.is_read ? (
                        <Mail className="h-5 w-5 text-sky-600 fill-sky-100" />
                      ) : (
                        <MailOpen className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${!msg.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {msg.name}
                        </p>
                        <span className="text-xs text-slate-400">&bull; {new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className={`text-sm truncate mt-0.5 ${!msg.is_read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                        {msg.subject}
                      </p>
                      <p className="text-sm text-slate-500 truncate mt-1">
                        {msg.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end shrink-0">
                    <button
                      onClick={(e) => handleDelete(e, msg.uuid)}
                      disabled={actionLoading === msg.uuid}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                      title="Delete Message"
                    >
                      {actionLoading === msg.uuid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          )}
        </ul>
      </div>

      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-semibold text-slate-900 line-clamp-1 pr-4">
                  {selectedMessage.subject}
                </h3>
                <button onClick={() => setSelectedMessage(null)} className="text-slate-400 hover:text-slate-600 shrink-0">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="font-semibold text-slate-900">{selectedMessage.name}</p>
                    <p className="text-sm text-slate-500">{selectedMessage.email}</p>
                  </div>
                  <div className="text-sm text-slate-400 text-right">
                    <p>{new Date(selectedMessage.created_at).toLocaleDateString()}</p>
                    <p>{new Date(selectedMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                <div className="prose prose-sm sm:prose-base max-w-none text-slate-700 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium"
                >
                  <Reply className="h-4 w-4" />
                  Reply via Email
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}