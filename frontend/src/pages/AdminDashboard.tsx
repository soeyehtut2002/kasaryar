import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Users,
  Gamepad2,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Layers,
  ShoppingBag,
  Loader2,
  AlertCircle,
  MessageSquare,
  Send,
  LayoutTemplate,
  Upload
} from 'lucide-react';
import { AdminCMS } from '../components/admin/AdminCMS';
import { useFileUpload } from '../hooks/useFileUpload';

interface Order {
  id: string;
  orderNumber: string;
  amountPaid: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  gameUserId: string;
  user?: { username: string; email: string };
  game: { name: string };
  itemPackage: { name: string };
}

interface Game {
  id: string;
  name: string;
  slug: string;
  category: string;
  thumbnailUrl: string;
  bannerUrl: string;
  description?: string;
  isActive: boolean;
  _count?: { packages: number };
}

interface DashboardData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalGames: number;
  };
  latestOrders: Order[];
  salesHistory: any[];
}

export const AdminDashboard: React.FC = () => {
  const { user, token, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'packages' | 'chat' | 'cms'>('overview');
  const [data, setData] = useState<DashboardData | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { uploadFile, isUploading } = useFileUpload();

  // Support Chat States
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [adminChatInput, setAdminChatInput] = useState('');
  const [sendingAdminMsg, setSendingAdminMsg] = useState(false);

  const adminMessagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChatRooms = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/chat/rooms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok && resData.status === 'success') {
        setChatRooms(resData.data.rooms);
      }
    } catch (err) {
      console.error('Error fetching admin chat rooms:', err);
    }
  };

  const fetchChatMessages = async (roomId: string) => {
    try {
      const res = await fetch(`/api/chat/messages/${roomId}`);
      const resData = await res.json();
      if (res.ok && resData.status === 'success') {
        setChatMessages(resData.data.messages);
      }
    } catch (err) {
      console.error('Error fetching admin room messages:', err);
    }
  };

  const handleAdminSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminChatInput.trim() || !selectedRoomId || !token || sendingAdminMsg) return;

    const textToSend = adminChatInput.trim();
    setAdminChatInput('');
    setSendingAdminMsg(true);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId: selectedRoomId,
          message: textToSend
        })
      });

      const resData = await res.json();
      if (res.ok && resData.status === 'success') {
        setChatMessages(prev => [...prev, resData.data.message]);
        fetchChatRooms();
      }
    } catch (err) {
      console.error('Error admin sending chat message:', err);
    } finally {
      setSendingAdminMsg(false);
    }
  };

  // Chat Polling
  useEffect(() => {
    if (activeTab !== 'chat' || !token) return;
    fetchChatRooms();
    const roomsInterval = setInterval(fetchChatRooms, 6000);
    return () => clearInterval(roomsInterval);
  }, [activeTab, token]);

  useEffect(() => {
    if (activeTab !== 'chat' || !selectedRoomId) return;
    fetchChatMessages(selectedRoomId);
    const messagesInterval = setInterval(() => {
      fetchChatMessages(selectedRoomId);
    }, 3000);
    return () => clearInterval(messagesInterval);
  }, [activeTab, selectedRoomId]);

  // Scroll Chat to Bottom
  useEffect(() => {
    if (activeTab === 'chat') {
      adminMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // Forms states
  const [gameForm, setGameForm] = useState({
    id: '',
    name: '',
    slug: '',
    category: 'Mobile',
    thumbnailUrl: '',
    bannerUrl: '',
    description: '',
    isActive: true
  });
  const [isEditingGame, setIsEditingGame] = useState(false);
  const [showGameForm, setShowGameForm] = useState(false);

  const [packageForm, setPackageForm] = useState({
    id: '',
    gameId: '',
    name: '',
    price: '',
    originalPrice: '',
    diamonds: ''
  });
  const [showPackageForm, setShowPackageForm] = useState(false);

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok && resData.status === 'success') {
        setData(resData.data);
      } else {
        setError(resData.message || 'Failed to load dashboard metrics');
      }
    } catch (err) {
      console.error(err);
      setError('Network error loading admin metrics');
    }
  };

  const fetchGames = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/games', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok && resData.status === 'success') {
        setGames(resData.data.games);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      navigate('/login');
      return;
    }

    const initDashboard = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardData(), fetchGames()]);
      setLoading(false);
    };

    if (user && user.role === 'ADMIN') {
      initDashboard();
    }
  }, [user, authLoading, token, navigate]);

  // --- CRUD Handlers ---
  const handleGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const method = isEditingGame ? 'PUT' : 'POST';
      const path = isEditingGame ? `/api/admin/games/${gameForm.id}` : '/api/admin/games';
      
      const res = await fetch(path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(gameForm)
      });
      const resData = await res.json();

      if (res.ok) {
        setShowGameForm(false);
        setIsEditingGame(false);
        setGameForm({
          id: '',
          name: '',
          slug: '',
          category: 'Mobile',
          thumbnailUrl: '',
          bannerUrl: '',
          description: '',
          isActive: true
        });
        await fetchGames();
        await fetchDashboardData();
      } else {
        alert(resData.message || 'Action failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error submitting game details');
    }
  };

  const handleEditGameClick = (game: Game) => {
    setGameForm({
      id: game.id,
      name: game.name,
      slug: game.slug,
      category: game.category,
      thumbnailUrl: game.thumbnailUrl,
      bannerUrl: game.bannerUrl,
      description: game.description || '',
      isActive: game.isActive
    });
    setIsEditingGame(true);
    setShowGameForm(true);
  };

  const handleDeleteGame = async (id: string) => {
    if (!confirm('Are you sure you want to delete this game? This will remove all associated packages.')) return;
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/games/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchGames();
        await fetchDashboardData();
      } else {
        alert('Failed to delete game');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gameId: packageForm.gameId,
          name: packageForm.name,
          price: parseFloat(packageForm.price),
          originalPrice: packageForm.originalPrice ? parseFloat(packageForm.originalPrice) : undefined,
          diamonds: parseInt(packageForm.diamonds, 10)
        })
      });
      const resData = await res.json();

      if (res.ok) {
        setShowPackageForm(false);
        setPackageForm({
          id: '',
          gameId: '',
          name: '',
          price: '',
          originalPrice: '',
          diamonds: ''
        });
        await fetchGames();
        await fetchDashboardData();
      } else {
        alert(resData.message || 'Failed to add package');
      }
    } catch (err) {
      console.error(err);
      alert('Network error adding package');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            {t('adminControlCenter')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('adminControlDesc')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsEditingGame(false);
              setShowGameForm(true);
              setActiveTab('games');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-primary-500/10 hover:shadow-primary-500/25"
          >
            <Plus size={14} /> {t('addNewGame')}
          </button>
          <button
            onClick={() => {
              setShowPackageForm(true);
              setActiveTab('packages');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-accent-500/10"
          >
            <Plus size={14} /> {t('addPackage')}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm">
          <AlertCircle className="shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 dark:border-dark-800 gap-4 mb-8">
        {[
          { id: 'overview', name: t('overviewStats'), icon: TrendingUp },
          { id: 'games', name: t('manageGames'), icon: Gamepad2 },
          { id: 'packages', name: t('managePackages'), icon: Layers },
          { id: 'chat', name: 'Live Support Chat', icon: MessageSquare },
          { id: 'cms', name: 'Landing Page CMS', icon: LayoutTemplate }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-500 dark:text-primary-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={16} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Overview Dashboard Tab */}
      {activeTab === 'overview' && data && (
        <div className="space-y-8">
          {/* Stats Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: t('totalRevenue'), val: formatPrice(data.stats.totalRevenue), desc: 'Completed checkouts', icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { label: t('totalTxns'), val: data.stats.totalOrders, desc: 'Guest + Member checkout orders', icon: ShoppingBag, color: 'text-primary-500 dark:text-primary-400 bg-primary-500/10 border-primary-500/20' },
              { label: t('registeredCustomers'), val: data.stats.totalUsers, desc: 'Excluding admin profiles', icon: Users, color: 'text-accent-600 dark:text-accent-400 bg-accent-500/10 border-accent-500/20' },
              { label: t('activeGames'), val: data.stats.totalGames, desc: 'Games listing in catalog', icon: Gamepad2, color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20' }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="glass-card rounded-2xl border border-slate-200 dark:border-dark-800 p-5 flex items-center gap-4 bg-white/40 dark:bg-transparent">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${stat.color}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">{stat.label}</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">{stat.val}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">{stat.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Latest Orders Table */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {t('recentTransactions')}
            </h2>
            {data.latestOrders.length === 0 ? (
              <div className="glass-card rounded-2xl border border-slate-200 dark:border-dark-800 p-8 text-center text-slate-500 text-sm bg-white/40 dark:bg-transparent">
                No transactions recorded yet.
              </div>
            ) : (
              <div className="glass-card rounded-2xl border border-slate-200 dark:border-dark-800 overflow-hidden bg-white/40 dark:bg-transparent">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-dark-900/60 border-b border-slate-200 dark:border-dark-800 text-slate-500 dark:text-slate-400 font-bold">
                        <th className="p-4">Txn Number</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Game Client</th>
                        <th className="p-4">Package</th>
                        <th className="p-4">Game ID</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-dark-800 text-slate-700 dark:text-slate-300">
                      {data.latestOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-100/50 dark:hover:bg-dark-900/20 transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-200">{order.orderNumber}</td>
                          <td className="p-4">
                            {order.user ? (
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{order.user.username}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">{order.user.email}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 italic">Guest Purchaser</span>
                            )}
                          </td>
                          <td className="p-4 font-semibold">{order.game.name}</td>
                          <td className="p-4">{order.itemPackage.name}</td>
                          <td className="p-4 font-mono">{order.gameUserId}</td>
                          <td className="p-4 font-bold text-primary-600 dark:text-primary-400">
                            {formatPrice(order.amountPaid)}
                            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-normal">{order.paymentMethod}</span>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded uppercase">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Games Catalog Manager Tab */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          {showGameForm && (
            <div className="glass-card rounded-2xl border border-slate-200 dark:border-dark-800 p-6 bg-slate-100 dark:bg-dark-900/30">
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-200 dark:border-dark-800">
                <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
                  {isEditingGame ? t('editGameListing') : t('registerNewGame')}
                </h3>
                <button
                  onClick={() => {
                    setShowGameForm(false);
                    setIsEditingGame(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleGameSubmit} className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                      {t('gameTitle')}
                    </label>
                    <input
                      type="text"
                      required
                      value={gameForm.name}
                      onChange={(e) => setGameForm({ ...gameForm, name: e.target.value })}
                      placeholder="e.g. PUBG Mobile"
                      className="w-full px-4 py-2.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                      {t('slugUrl')}
                    </label>
                    <input
                      type="text"
                      required
                      value={gameForm.slug}
                      onChange={(e) => setGameForm({ ...gameForm, slug: e.target.value })}
                      placeholder="e.g. pubg-mobile"
                      className="w-full px-4 py-2.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                      {t('category')}
                    </label>
                    <select
                      value={gameForm.category}
                      onChange={(e) => setGameForm({ ...gameForm, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-500 text-xs"
                    >
                      <option value="Mobile">Mobile</option>
                      <option value="PC">PC</option>
                      <option value="Console">Console</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                      {t('thumbnailUrl')}
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="url"
                        required
                        value={gameForm.thumbnailUrl}
                        onChange={(e) => setGameForm({ ...gameForm, thumbnailUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-4 py-2.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                      />
                      <label className="cursor-pointer bg-slate-200 dark:bg-dark-800 p-2.5 rounded-xl hover:bg-slate-300 dark:hover:bg-dark-700 flex items-center justify-center">
                        <Upload size={18} />
                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await uploadFile(file);
                            if (url) setGameForm({...gameForm, thumbnailUrl: url});
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                    {t('bannerUrl')}
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="url"
                      required
                      value={gameForm.bannerUrl}
                      onChange={(e) => setGameForm({ ...gameForm, bannerUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                    />
                    <label className="cursor-pointer bg-slate-200 dark:bg-dark-800 p-2.5 rounded-xl hover:bg-slate-300 dark:hover:bg-dark-700 flex items-center justify-center">
                      <Upload size={18} />
                      <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadFile(file);
                          if (url) setGameForm({...gameForm, bannerUrl: url});
                        }
                      }} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                    {t('description')}
                  </label>
                  <textarea
                    rows={3}
                    value={gameForm.description}
                    onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })}
                    placeholder="Provide short details about game store..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={gameForm.isActive}
                    onChange={(e) => setGameForm({ ...gameForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-primary-500 bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-800 focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('activeCatalog')}
                  </label>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-slate-200 dark:border-dark-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGameForm(false);
                      setIsEditingGame(false);
                    }}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs cursor-pointer"
                  >
                    {t('cancelBtn')}
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-xs cursor-pointer disabled:opacity-50"
                  >
                    <Save size={14} /> {isUploading ? 'Uploading...' : (isEditingGame ? t('saveChanges') : t('publishGame'))}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {games.map((game) => (
              <div key={game.id} className="glass-card rounded-2xl border border-slate-200 dark:border-dark-800 overflow-hidden shadow flex bg-white/40 dark:bg-transparent">
                <img src={game.thumbnailUrl} alt={game.name} className="w-24 object-cover bg-slate-100 dark:bg-dark-900 shrink-0" />
                <div className="p-4 flex flex-col justify-between w-full">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm sm:text-base line-clamp-1">{game.name}</h3>
                      <span className={`px-2 py-0.5 text-[8px] font-bold rounded uppercase shrink-0 ${
                        game.isActive ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-red-500 dark:text-red-400 bg-red-500/10'
                      }`}>
                        {game.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <span className="text-[10px] text-accent-600 dark:text-accent-400 uppercase tracking-widest font-semibold block mt-0.5">
                      {game.category}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {game.description || 'No store description.'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-dark-800/50 mt-4">
                    <span className="text-[10px] text-slate-400">
                      Packages count: <strong>{game._count?.packages || 0}</strong>
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditGameClick(game)}
                        className="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded transition-colors cursor-pointer"
                        title="Edit Game"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 hover:text-red-300 rounded transition-colors cursor-pointer"
                        title="Delete Game"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CMS Tab */}
      {activeTab === 'cms' && (
        <AdminCMS />
      )}

      {/* Packages Manager Tab */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          {showPackageForm && (
            <div className="glass-card rounded-2xl border border-slate-200 dark:border-dark-800 p-6 bg-slate-100 dark:bg-dark-900/30 max-w-xl mx-auto">
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-200 dark:border-dark-800">
                <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
                  {t('addPackageTier')}
                </h3>
                <button 
                  onClick={() => setShowPackageForm(false)} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handlePackageSubmit} className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                    {t('selectGame')}
                  </label>
                  <select
                    required
                    value={packageForm.gameId}
                    onChange={(e) => setPackageForm({ ...packageForm, gameId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-500 text-xs"
                  >
                    <option value="">-- Choose game listing --</option>
                    {games.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                      {t('packageName')}
                    </label>
                    <input
                      type="text"
                      required
                      value={packageForm.name}
                      onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                      placeholder="e.g. 325 + 25 UC"
                      className="w-full px-4 py-2.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                      {t('numericValue')}
                    </label>
                    <input
                      type="number"
                      required
                      value={packageForm.diamonds}
                      onChange={(e) => setPackageForm({ ...packageForm, diamonds: e.target.value })}
                      placeholder="e.g. 350"
                      className="w-full px-4 py-2.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                      {t('sellingPrice')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={packageForm.price}
                      onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                      placeholder="e.g. 4.99"
                      className="w-full px-4 py-2.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                      {t('originalPrice')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={packageForm.originalPrice}
                      onChange={(e) => setPackageForm({ ...packageForm, originalPrice: e.target.value })}
                      placeholder="e.g. 5.99"
                      className="w-full px-4 py-2.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-slate-200 dark:border-dark-800">
                  <button
                    type="button"
                    onClick={() => setShowPackageForm(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs cursor-pointer"
                  >
                    {t('cancelBtn')}
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    <Save size={14} /> {t('addPackageTier')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Info Card */}
          <div className="glass-card rounded-2xl border border-slate-200 dark:border-dark-800 p-5 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-transparent animate-pulse">
            <AlertCircle className="text-accent-500 dark:text-accent-400 shrink-0" size={16} />
            <span>
              {t('packageNote')}
            </span>
          </div>
        </div>
      )}

      {/* Live Support Chat Tab */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px] border border-slate-200 dark:border-dark-800 rounded-2xl overflow-hidden glass-card bg-white/40 dark:bg-transparent">
          {/* Rooms Sidebar */}
          <div className="md:col-span-1 border-r border-slate-200 dark:border-dark-800 flex flex-col h-full bg-slate-50/50 dark:bg-dark-900/30">
            <div className="p-4 border-b border-slate-200 dark:border-dark-800 font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <MessageSquare size={16} /> Active Conversations
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-800 custom-scrollbar">
              {chatRooms.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  No active customer sessions.
                </div>
              ) : (
                chatRooms.map((room) => {
                  const latestMsg = room.messages?.[0]?.message || 'No messages yet';
                  const isSelected = selectedRoomId === room.id;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`w-full text-left p-3.5 flex flex-col gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary-500/10 dark:bg-primary-500/5 border-l-4 border-primary-500'
                          : 'hover:bg-slate-100/50 dark:hover:bg-dark-900/10'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold text-xs text-slate-850 dark:text-slate-200 line-clamp-1">{room.clientName}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500">
                          {new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-550 dark:text-slate-450 line-clamp-1 italic">
                        {latestMsg}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Messages Pane */}
          <div className="md:col-span-2 flex flex-col h-full bg-white dark:bg-dark-950/20">
            {selectedRoomId ? (
              <>
                {/* Messages Log */}
                <div className="flex-grow p-4 overflow-y-auto space-y-3 custom-scrollbar">
                  {chatMessages.map((msg) => {
                    const activeRoom = chatRooms.find((r) => r.id === selectedRoomId);
                    const clientName = activeRoom?.clientName || 'Customer';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${
                          msg.isAdmin ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 mb-0.5 px-1 font-semibold">
                          {msg.isAdmin ? 'You (Admin)' : clientName}
                        </span>
                        <div
                          className={`flex gap-1.5 items-start ${
                            msg.isAdmin ? 'flex-row-reverse' : ''
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                              msg.isAdmin
                                ? 'bg-primary-500/10 text-primary-500 border-primary-500/20'
                                : 'bg-slate-200 dark:bg-dark-800 text-slate-550 dark:text-slate-400 border-slate-350 dark:border-dark-700'
                            }`}
                          >
                            {msg.isAdmin ? 'A' : 'U'}
                          </div>
                          <div
                            className={`p-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                              msg.isAdmin
                                ? 'bg-primary-500 text-white rounded-tr-none'
                                : 'bg-slate-100 dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800/80 rounded-tl-none text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={adminMessagesEndRef} />
                </div>

                {/* Input form */}
                <form
                  onSubmit={handleAdminSendMessage}
                  className="p-3 border-t border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900 flex gap-2 items-center"
                >
                  <input
                    type="text"
                    required
                    value={adminChatInput}
                    onChange={(e) => setAdminChatInput(e.target.value)}
                    placeholder="Type your response..."
                    disabled={sendingAdminMsg}
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-dark-950 border border-slate-250 dark:border-dark-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={!adminChatInput.trim() || sendingAdminMsg}
                    className="p-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:bg-slate-200 dark:disabled:bg-dark-850 text-white disabled:text-slate-400 dark:disabled:text-slate-600 shadow-md cursor-pointer flex items-center justify-center shrink-0"
                  >
                    {sendingAdminMsg ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2 p-8">
                <MessageSquare size={36} className="text-slate-300 dark:text-slate-700 animate-pulse" />
                <span className="text-xs font-semibold">Select a customer conversation to start live assistance</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
