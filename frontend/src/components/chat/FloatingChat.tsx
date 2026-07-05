import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  ChevronLeft,
  Plus,
  Headphones,
  Zap,
  Clock
} from 'lucide-react';

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

type ViewMode = 'home' | 'list' | 'chat' | 'start';

export const FloatingChat: React.FC = () => {
  const { token } = useAuth();
  const { language } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<ChatRoom[]>([]);
  const [inputText, setInputText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = {
    en: {
      tagline: 'We typically reply in minutes',
      welcomeTitle: 'Hi there 👋',
      welcomeBody: 'Ask us anything, or share your feedback.',
      startChat: 'Start a conversation',
      viewAll: 'View all conversations',
      header: 'KasarYar Support',
      online: 'Online now',
      placeholder: 'Type your message...',
      send: 'Send',
      connecting: 'Connecting...',
      yourName: 'Your name (optional)',
      namePlaceholder: 'e.g. Alex',
      begin: 'Start Chatting',
      noChats: 'No conversations yet',
      prevChats: 'Previous conversations',
      newConv: 'New conversation',
    },
    mm: {
      tagline: 'ကျွန်ုပ်တို့ မိနစ်အနည်းငယ်အတွင်း ဖြေကြားပါမည်',
      welcomeTitle: 'မင်္ဂလာပါ 👋',
      welcomeBody: 'ဘာမဆို မေးမြန်းနိုင်ပါသည်။',
      startChat: 'စကားစတင်ပြောဆိုပါ',
      viewAll: 'စကားပြောမှတ်တမ်းများ',
      header: 'KasarYar ဝန်ဆောင်မှု',
      online: 'ယခု Online ရှိသည်',
      placeholder: 'မက်ဆေ့ခ်ျရေးပါ...',
      send: 'ပို့ပါ',
      connecting: 'ချိတ်ဆက်နေသည်...',
      yourName: 'သင့်အမည် (ထည့်ရန်မဖြစ်မနေမလို)',
      namePlaceholder: 'ဥပမာ - Alex',
      begin: 'စကားပြောရန်',
      noChats: 'စကားပြောခန်းမရှိသေးပါ',
      prevChats: 'ယခင်စကားပြောမှတ်တမ်းများ',
      newConv: 'စကားပြောခန်းသစ်',
    }
  };

  const tr = (key: keyof typeof t['en']) =>
    t[language === 'mm' ? 'mm' : 'en'][key];

  // ─── API helpers ─────────────────────────────────────────────────────────────

  const authHeaders = () => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  const loadConversations = async () => {
    try {
      const storedIds: string[] = JSON.parse(
        localStorage.getItem('kasaryar_guest_room_ids') || '[]'
      );
      const res = await fetch('/api/chat/my-rooms', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ roomIds: storedIds })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setConversations(data.data.rooms);
      }
    } catch {/* silent */}
  };

  const openRoom = async (id: string, existingMessages?: ChatMessage[]) => {
    setRoomId(id);
    setMessages(existingMessages || []);
    setViewMode('chat');

    if (!existingMessages) {
      try {
        const res = await fetch(`/api/chat/messages/${id}`);
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          setMessages(data.data.messages);
        }
      } catch {/* silent */}
    }
  };

  const startNewRoom = async () => {
    setLoading(true);
    try {
      const body: Record<string, string> = {};
      if (guestName.trim()) body.clientName = guestName.trim();

      const res = await fetch('/api/chat/initiate', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const room: ChatRoom = data.data.room;

        // Persist guest room id
        const storedIds: string[] = JSON.parse(
          localStorage.getItem('kasaryar_guest_room_ids') || '[]'
        );
        if (!storedIds.includes(room.id)) {
          storedIds.push(room.id);
          localStorage.setItem('kasaryar_guest_room_ids', JSON.stringify(storedIds));
        }

        await openRoom(room.id, room.messages);
        loadConversations();
      }
    } catch {/* silent */}
    setLoading(false);
  };

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !roomId || sending) return;

    setInputText('');
    setSending(true);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ roomId, message: text })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setMessages(prev => [...prev, data.data.message]);
        loadConversations();
      }
    } catch {/* silent */}
    setSending(false);
  };

  // ─── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const openHandler = () => { setIsOpen(true); };
    window.addEventListener('open-support-chat', openHandler);
    return () => window.removeEventListener('open-support-chat', openHandler);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen, token]);

  // polling
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (roomId && isOpen && viewMode === 'chat') {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/chat/messages/${roomId}`);
          const data = await res.json();
          if (res.ok && data.status === 'success') {
            const newMsgs: ChatMessage[] = data.data.messages;
            setMessages(prev => {
              if (newMsgs.length > prev.length && !isOpen) {
                setUnreadCount(c => c + (newMsgs.length - prev.length));
              }
              return newMsgs;
            });
          }
        } catch {/* silent */}
      }, 3000);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [roomId, isOpen, viewMode]);

  useEffect(() => {
    if (viewMode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
    }
  }, [messages, viewMode]);

  useEffect(() => {
    if (viewMode === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [viewMode]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const toggle = () => {
    setIsOpen(o => !o);
    setUnreadCount(0);
  };

  const activeRoomName =
    conversations.find(r => r.id === roomId)?.clientName || 'Support Chat';

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString();
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">

      {/* ── Chat Panel ────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="w-[360px] max-h-[560px] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/25 border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#111318] animate-in slide-in-from-bottom-4 fade-in duration-200">

          {/* ── Header ────────────────────────────────────────────────────────── */}
          <div className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-violet-500 p-5 pb-8 text-white flex-shrink-0">
            {/* Back / close row */}
            <div className="flex items-center justify-between mb-3">
              {(viewMode === 'chat' || viewMode === 'start' || viewMode === 'list') ? (
                <button
                  onClick={() => {
                    if (viewMode === 'chat' || viewMode === 'start') {
                      setViewMode(conversations.length > 0 ? 'home' : 'home');
                      setRoomId(null);
                      setMessages([]);
                    } else {
                      setViewMode('home');
                    }
                  }}
                  className="flex items-center gap-1 text-white/80 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <ChevronLeft size={15} />
                  Back
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-white/80 font-medium">{tr('online')}</span>
                </div>
              )}
              <button
                onClick={toggle}
                className="p-1 rounded-lg hover:bg-white/15 transition-colors cursor-pointer text-white/80 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Home header */}
            {viewMode === 'home' && (
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                    <Headphones size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">KasarYar Support</h3>
                    <p className="text-[11px] text-white/70">{tr('tagline')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Chat header */}
            {viewMode === 'chat' && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                  {activeRoomName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight">{tr('header')}</p>
                  <p className="text-[10px] text-white/70">{tr('online')}</p>
                </div>
              </div>
            )}

            {/* List / Start header */}
            {(viewMode === 'list' || viewMode === 'start') && (
              <p className="font-bold text-sm">
                {viewMode === 'list' ? tr('prevChats') : tr('startChat')}
              </p>
            )}

            {/* Decorative circles */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
            <div className="absolute -bottom-7 right-10 w-12 h-12 rounded-full bg-white/5" />
          </div>

          {/* ── Home View ─────────────────────────────────────────────────────── */}
          {viewMode === 'home' && (
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#111318]">
              {/* Hero welcome card */}
              <div className="mx-4 -mt-5 mb-4 bg-white dark:bg-slate-800/80 rounded-xl p-4 shadow-md shadow-black/10 border border-slate-100 dark:border-slate-700/50">
                <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">{tr('welcomeTitle')}</p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">{tr('welcomeBody')}</p>
              </div>

              {/* Quick actions */}
              <div className="px-4 space-y-2 pb-4">
                {/* Start chat CTA */}
                <button
                  onClick={() => {
                    if (conversations.length > 0) {
                      openRoom(conversations[0].id, conversations[0].messages);
                    } else {
                      setViewMode('start');
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3.5 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm shadow-black/5 transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0 group-hover:scale-110 transition-transform">
                    <MessageCircle size={17} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{tr('startChat')}</p>
                    <p className="text-[10px] text-slate-400">{tr('tagline')}</p>
                  </div>
                  <ChevronLeft size={14} className="rotate-180 text-slate-400" />
                </button>

                {/* View previous conversations */}
                {conversations.length > 0 && (
                  <button
                    onClick={() => setViewMode('list')}
                    className="w-full flex items-center gap-3 p-3.5 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm shadow-black/5 transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0 group-hover:scale-110 transition-transform">
                      <Clock size={16} />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{tr('viewAll')}</p>
                      <p className="text-[10px] text-slate-400">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
                    </div>
                    <ChevronLeft size={14} className="rotate-180 text-slate-400" />
                  </button>
                )}

                {/* Features row */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { icon: <Zap size={14} />, label: 'Fast Reply' },
                    { icon: <Headphones size={14} />, label: 'Live Agent' },
                    { icon: <MessageCircle size={14} />, label: '24/7 Chat' },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-1 p-2 bg-white dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-700/40">
                      <span className="text-primary-500">{item.icon}</span>
                      <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 text-center">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── List View ─────────────────────────────────────────────────────── */}
          {viewMode === 'list' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#111318]">
              <div className="px-4 pt-3 pb-2 -mt-3 flex justify-end">
                <button
                  onClick={() => setViewMode('start')}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-primary-500 hover:text-primary-600 cursor-pointer transition-colors"
                >
                  <Plus size={12} /> {tr('newConv')}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">{tr('noChats')}</div>
                ) : (
                  conversations.map(room => {
                    const lastMsg = room.messages?.[0];
                    return (
                      <button
                        key={room.id}
                        onClick={() => openRoom(room.id, room.messages)}
                        className="w-full text-left px-4 py-3.5 flex gap-3 items-start hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer border-0 bg-transparent"
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {room.clientName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">{room.clientName}</span>
                            <span className="text-[9px] text-slate-400 shrink-0">{formatDate(room.updatedAt)}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {lastMsg ? (lastMsg.isAdmin ? '🟢 ' : '👤 ') + lastMsg.message : 'No messages yet'}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ── Start / New Conversation View ─────────────────────────────────── */}
          {viewMode === 'start' && (
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#111318]">
              <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
                  <MessageCircle size={26} className="text-white" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{tr('startChat')}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mb-6 leading-relaxed">
                  {tr('welcomeBody')}
                </p>

                {!token && (
                  <div className="w-full mb-4">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      {tr('yourName')}
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      placeholder={tr('namePlaceholder')}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2">
                <button
                  onClick={startNewRoom}
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-violet-500 hover:from-primary-600 hover:to-violet-600 text-white font-bold rounded-xl shadow-md shadow-primary-500/25 text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="animate-spin" size={13} /> : <MessageCircle size={13} />}
                  {loading ? tr('connecting') : tr('begin')}
                </button>
                {conversations.length > 0 && (
                  <button
                    onClick={() => setViewMode('list')}
                    className="w-full py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
                  >
                    {tr('viewAll')} →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Chat Thread View ──────────────────────────────────────────────── */}
          {viewMode === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-[#111318] custom-scrollbar" style={{ minHeight: 0 }}>
                {/* Welcome message */}
                <div className="flex gap-2.5 max-w-[86%]">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm">
                    K
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-xs leading-relaxed shadow-sm">
                    Hi there! How can we help you today? 👋
                  </div>
                </div>

                {/* Messages */}
                {messages.map((msg, i) => {
                  const prevMsg = messages[i - 1];
                  const showTime = !prevMsg ||
                    new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 300000;

                  return (
                    <React.Fragment key={msg.id}>
                      {showTime && (
                        <div className="text-center">
                          <span className="text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-full">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                        <div className={`flex items-end gap-2 max-w-[82%] ${msg.isAdmin ? '' : 'flex-row-reverse'}`}>
                          {msg.isAdmin && (
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-[8px] font-bold shrink-0 mb-0.5">
                              S
                            </div>
                          )}
                          <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            msg.isAdmin
                              ? 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                              : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-tr-sm'
                          }`}>
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                <form onSubmit={sendMsg} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3 py-1.5 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-400/15 transition-all">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder={tr('placeholder')}
                    disabled={sending}
                    className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none py-1 min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="w-7 h-7 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white disabled:text-slate-400 flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-sm shadow-primary-500/20"
                  >
                    {sending
                      ? <Loader2 size={12} className="animate-spin" />
                      : <Send size={12} />
                    }
                  </button>
                </form>
                <p className="text-center text-[9px] text-slate-400 mt-1.5">
                  Powered by <span className="font-semibold text-primary-500">KasarYar</span>
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── FAB Button ──────────────────────────────────────────────────────── */}
      <button
        onClick={toggle}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl shadow-primary-500/40 cursor-pointer transition-all duration-300 border-2 border-white/20 ${
          isOpen
            ? 'bg-slate-600 hover:bg-slate-700 rotate-0'
            : 'bg-gradient-to-br from-primary-500 to-violet-600 hover:scale-110 hover:shadow-primary-500/60'
        }`}
      >
        {isOpen
          ? <X size={22} className="transition-transform" />
          : <MessageCircle size={22} className="transition-transform" />
        }
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-white text-[10px] font-bold text-white flex items-center justify-center animate-bounce shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {/* Pulse ring when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-primary-500/30 animate-ping pointer-events-none" style={{ animationDuration: '2.5s' }} />
        )}
      </button>
    </div>
  );
};
