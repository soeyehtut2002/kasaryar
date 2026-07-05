import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { MessageCircle, X, Send, Loader2, MessageSquare, ArrowLeft, Plus } from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
}

interface ChatRoom {
  id: string;
  clientName: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export const FloatingChat: React.FC = () => {
  const { token } = useAuth();
  const { language } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'chat' | 'start'>('list');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<ChatRoom[]>([]);
  const [inputText, setInputText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Translations
  const chatT = {
    en: {
      header: 'KasarYar Support',
      welcome: 'Hello! How can we assist you today?',
      placeholder: 'Type a message...',
      send: 'Send',
      connecting: 'Connecting to support...',
      chatListTitle: 'Your Support Chats',
      newChatBtn: 'New Conversation',
      noChats: 'No active conversations. Start one below!',
      startChatHeader: 'Start Conversation',
      startChatBtn: 'Start Chat',
      nameLabel: 'Your Name (Optional)',
      namePlaceholder: 'e.g. Guest Customer'
    },
    mm: {
      header: 'KasarYar အကူအညီ',
      welcome: 'မင်္ဂလာပါခင်ဗျာ၊ ဒီနေ့ ဘာများကူညီပေးရမလဲ။',
      placeholder: 'မက်ဆေ့ခ်ျရေးရန်...',
      send: 'ပို့ရန်',
      connecting: 'ချိတ်ဆက်နေသည်...',
      chatListTitle: 'သင်၏စကားပြောခန်းများ',
      newChatBtn: 'စကားပြောခန်းသစ်စတင်ရန်',
      noChats: 'မက်ဆေ့ခ်ျမှတ်တမ်းမရှိသေးပါ။ စကားပြောခန်းအသစ်စတင်ပါ။',
      startChatHeader: 'စကားပြောခန်း စတင်ရန်',
      startChatBtn: 'စတင်ပြောဆိုမည်',
      nameLabel: 'သင့်အမည် (ထည့်ရန်မလိုပါ)',
      namePlaceholder: 'ဥပမာ - Guest Customer'
    }
  };

  const getT = (key: keyof typeof chatT['en']) => {
    return chatT[language === 'mm' ? 'mm' : 'en'][key];
  };

  // Fetch client rooms/conversations
  const fetchConversations = async () => {
    try {
      const storedIdsStr = localStorage.getItem('kasaryar_guest_room_ids');
      const roomIds = storedIdsStr ? JSON.parse(storedIdsStr) : [];
      
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/chat/my-rooms', {
        method: 'POST',
        headers,
        body: JSON.stringify({ roomIds })
      });
      const resData = await res.json();
      if (res.ok && resData.status === 'success') {
        setConversations(resData.data.rooms);
        
        // If there are existing conversations and we are in list mode on startup, show them.
        if (resData.data.rooms.length > 0 && viewMode === 'list' && !roomId) {
          setViewMode('list');
        } else if (resData.data.rooms.length === 0 && viewMode === 'list' && !roomId) {
          setViewMode('start');
        }
      }
    } catch (err) {
      console.error('Error fetching support conversations:', err);
    }
  };

  // Initiate a new chat room
  const handleStartNewChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const body: any = {};
      if (guestName.trim()) {
        body.clientName = guestName.trim();
      }

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
        
        // Save to room ids list
        const storedIdsStr = localStorage.getItem('kasaryar_guest_room_ids');
        const storedIds = storedIdsStr ? JSON.parse(storedIdsStr) : [];
        if (!storedIds.includes(room.id)) {
          storedIds.push(room.id);
          localStorage.setItem('kasaryar_guest_room_ids', JSON.stringify(storedIds));
        }

        setMessages(room.messages || []);
        setViewMode('chat');
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to initiate chat room:', err);
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
        
        // Unread badge notifications count logic
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
        setMessages(prev => [...prev, resData.data.message]);
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending support chat message:', err);
    } finally {
      setSending(false);
    }
  };

  // Select conversation from list
  const selectConversation = (id: string) => {
    setRoomId(id);
    const room = conversations.find(r => r.id === id);
    if (room) {
      setMessages(room.messages || []);
    }
    setViewMode('chat');
  };

  // On mount: Listen to custom events and fetch conversations list
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
    };

    window.addEventListener('open-support-chat', handleOpenEvent);
    fetchConversations();

    return () => {
      window.removeEventListener('open-support-chat', handleOpenEvent);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [token]);

  // Handle messages polling when active chat room is selected
  useEffect(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    if (roomId && isOpen && viewMode === 'chat') {
      pollingIntervalRef.current = setInterval(fetchMessages, 3000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [roomId, isOpen, viewMode]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && viewMode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
    }
  }, [messages, isOpen, viewMode]);

  const handleWidgetToggle = () => {
    setIsOpen(!isOpen);
    setUnreadCount(0);
    fetchConversations();
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
              {viewMode !== 'list' && conversations.length > 0 && (
                <button
                  onClick={() => {
                    setViewMode('list');
                    setRoomId(null);
                    fetchConversations();
                  }}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-white mr-1"
                  title="Back to Conversations"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
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

          {/* VIEW MODE: List Conversations */}
          {viewMode === 'list' && (
            <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-dark-950/20">
              <div className="p-3 font-extrabold text-xs text-slate-700 dark:text-slate-200 border-b border-slate-200/50 dark:border-dark-800 flex justify-between items-center">
                <span>{getT('chatListTitle')}</span>
                <button
                  onClick={() => setViewMode('start')}
                  className="flex items-center gap-1 text-[10px] text-primary-500 hover:text-primary-600 font-bold uppercase tracking-wider cursor-pointer"
                >
                  <Plus size={10} /> {getT('newChatBtn')}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-850 custom-scrollbar">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    {getT('noChats')}
                  </div>
                ) : (
                  conversations.map((room) => {
                    const latestMsg = room.messages?.[0]?.message || 'No messages yet';
                    return (
                      <button
                        key={room.id}
                        onClick={() => selectConversation(room.id)}
                        className="w-full text-left p-3.5 flex flex-col gap-1 hover:bg-slate-100/50 dark:hover:bg-dark-900/10 transition-colors border-0 bg-transparent cursor-pointer"
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                            {room.clientName}
                          </span>
                          <span className="text-[9px] text-slate-450 dark:text-slate-500">
                            {new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-450 line-clamp-1 italic">
                          {latestMsg}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* VIEW MODE: Start Conversation Screen */}
          {viewMode === 'start' && (
            <div className="flex-grow p-5 flex flex-col justify-between bg-slate-50/50 dark:bg-dark-950/20">
              <div className="space-y-4 text-center mt-4">
                <div className="w-12 h-12 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto text-primary-500">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
                    {getT('startChatHeader')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-[240px] mx-auto">
                    {getT('welcome')}
                  </p>
                </div>

                {!token && (
                  <div className="text-left max-w-[250px] mx-auto pt-1">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      {getT('nameLabel')}
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder={getT('namePlaceholder')}
                      className="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-primary-500"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleStartNewChat}
                  disabled={loading}
                  className="w-full py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-lg shadow-md text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : getT('startChatBtn')}
                </button>
                {conversations.length > 0 && (
                  <button
                    onClick={() => setViewMode('list')}
                    className="w-full py-2 bg-slate-200 hover:bg-slate-300 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-350 font-bold rounded-lg text-xs cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VIEW MODE: Message Thread Chat */}
          {viewMode === 'chat' && (
            <>
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
                        className={`flex flex-col max-w-[85%] ${
                          msg.isAdmin ? 'mr-auto items-start' : 'ml-auto items-end'
                        }`}
                      >
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 mb-0.5 px-1 font-semibold">
                          {msg.isAdmin ? 'KasarYar Support' : 'You'}
                        </span>
                        <div
                          className={`flex gap-1.5 items-start ${
                            msg.isAdmin ? '' : 'flex-row-reverse'
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
            </>
          )}
        </div>
      )}
    </div>
  );
};
