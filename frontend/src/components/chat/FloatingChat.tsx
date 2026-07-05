import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
}

export const FloatingChat: React.FC = () => {
  const { token } = useAuth();
  const { language } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Custom translations for Chat inside component (keeps it self-contained)
  const chatT = {
    en: {
      header: 'KasarYar Live Support',
      welcome: 'Hello! How can we assist you today?',
      placeholder: 'Type a message...',
      send: 'Send',
      connecting: 'Connecting to support...'
    },
    mm: {
      header: 'KasarYar တိုက်ရိုက်အကူအညီ',
      welcome: 'မင်္ဂလာပါခင်ဗျာ၊ ဒီနေ့ ဘာများကူညီပေးရမလဲ။',
      placeholder: 'မက်ဆေ့ခ်ျရေးရန်...',
      send: 'ပို့ရန်',
      connecting: 'အကူအညီစနစ် ချိတ်ဆက်နေသည်...'
    }
  };

  const getT = (key: keyof typeof chatT['en']) => {
    return chatT[language === 'mm' ? 'mm' : 'en'][key];
  };

  // Initialize or resume chat room
  const initChatRoom = async () => {
    setLoading(true);
    try {
      const storedRoomId = localStorage.getItem('kasaryar_chat_room_id');
      const body: any = {};
      if (storedRoomId) {
        body.roomId = storedRoomId;
      }
      
      // If client is guest, allow generating unique room.
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/chat/initiate', {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      
      const resData = await res.json();
      if (res.ok && resData.status === 'success') {
        const room = resData.data.room;
        setRoomId(room.id);
        localStorage.setItem('kasaryar_chat_room_id', room.id);
        setMessages(room.messages || []);
      }
    } catch (err) {
      console.error('Failed to initialize chat room:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages from room
  const fetchMessages = async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/chat/messages/${roomId}`);
      const resData = await res.json();
      if (res.ok && resData.status === 'success') {
        const newMsgs = resData.data.messages;
        
        // If chat widget is closed and new messages arrive, increase badge count
        if (!isOpen && messages.length > 0 && newMsgs.length > messages.length) {
          const addedCount = newMsgs.length - messages.length;
          setUnreadCount(prev => prev + addedCount);
        }
        
        setMessages(newMsgs);
      }
    } catch (err) {
      console.error('Error polling chat messages:', err);
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !roomId || sending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          roomId,
          message: textToSend
        })
      });

      const resData = await res.json();
      if (res.ok && resData.status === 'success') {
        // Append sent message immediately to feel fast
        setMessages(prev => [...prev, resData.data.message]);
      }
    } catch (err) {
      console.error('Error sending support chat message:', err);
    } finally {
      setSending(false);
    }
  };

  // On mount: Listen to custom footer event 'open-support-chat'
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
    };

    window.addEventListener('open-support-chat', handleOpenEvent);
    
    // Auto initiate chat room
    initChatRoom();

    return () => {
      window.removeEventListener('open-support-chat', handleOpenEvent);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [token]);

  // Handle polling when roomId is active
  useEffect(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    if (roomId) {
      // Poll every 3 seconds
      pollingIntervalRef.current = setInterval(() => {
        fetchMessages();
      }, 3000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [roomId, isOpen, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0); // clear unread count when chat opens
    }
  }, [messages, isOpen]);

  // Prevent background scroll when interacting with open chat on mobile
  const handleWidgetToggle = () => {
    setIsOpen(!isOpen);
    setUnreadCount(0);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={handleWidgetToggle}
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-primary-400/20"
        >
          <MessageCircle size={22} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-dark-950 animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[450px] rounded-2xl border border-slate-200 dark:border-dark-800 bg-white/95 dark:bg-dark-900/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse border border-white/20" />
              <div>
                <h4 className="font-extrabold text-xs tracking-wide">
                  {getT('header')}
                </h4>
                <span className="text-[9px] text-primary-100 block">Agent Live Online</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-white/80 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Logs Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50/50 dark:bg-dark-950/20 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 gap-2">
                <Loader2 className="animate-spin text-primary-500" size={20} />
                <span className="text-[10px] font-semibold">{getT('connecting')}</span>
              </div>
            ) : (
              <>
                {/* Auto Greeting */}
                <div className="flex gap-2 max-w-[85%] items-start">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-dark-800 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0 border border-slate-350 dark:border-dark-700">
                    K
                  </div>
                  <div className="bg-slate-100 dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800/80 p-2.5 rounded-2xl rounded-tl-none text-xs text-slate-800 dark:text-slate-200 leading-relaxed shadow-sm">
                    {getT('welcome')}
                  </div>
                </div>

                {/* Messages mapping */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 max-w-[85%] items-start ${
                      msg.isAdmin ? 'mr-auto' : 'ml-auto flex-row-reverse'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                        msg.isAdmin
                          ? 'bg-slate-200 dark:bg-dark-800 text-slate-550 dark:text-slate-400 border-slate-350 dark:border-dark-700'
                          : 'bg-primary-500/10 text-primary-500 border-primary-500/20'
                      }`}
                    >
                      {msg.isAdmin ? 'A' : 'U'}
                    </div>
                    <div
                      className={`p-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        msg.isAdmin
                          ? 'bg-slate-100 dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800/80 rounded-tl-none text-slate-800 dark:text-slate-200'
                          : 'bg-primary-500 text-white rounded-tr-none'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Form Input Footer */}
          <form
            onSubmit={handleSendMessage}
            className="p-2 border-t border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 flex gap-1.5 items-center"
          >
            <input
              type="text"
              required
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={getT('placeholder')}
              disabled={loading || sending}
              className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-dark-950 border border-slate-250 dark:border-dark-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:border-primary-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading || sending}
              className="p-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:bg-slate-200 dark:disabled:bg-dark-800 text-white disabled:text-slate-400 dark:disabled:text-slate-600 shadow-md shadow-primary-500/10 cursor-pointer flex items-center justify-center shrink-0 transition-colors"
            >
              {sending ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
