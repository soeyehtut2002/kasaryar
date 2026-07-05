import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
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
  AlertCircle
} from 'lucide-react';

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
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'packages'>('overview');
  const [data, setData] = useState<DashboardData | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100">Admin Control Center</h1>
          <p className="text-sm text-slate-400 mt-1">Manage game listings, package tiers and monitor sales.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsEditingGame(false);
              setShowGameForm(true);
              setActiveTab('games');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            <Plus size={14} /> Add New Game
          </button>
          <button
            onClick={() => {
              setShowPackageForm(true);
              setActiveTab('packages');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-dark-950 font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            <Plus size={14} /> Add Package
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex border-b border-dark-800 gap-4 mb-8">
        {[
          { id: 'overview', name: 'Overview Stats', icon: TrendingUp },
          { id: 'games', name: 'Manage Games', icon: Gamepad2 },
          { id: 'packages', name: 'Manage Packages', icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
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
              { label: 'Total Revenue', val: `$${Number(data.stats.totalRevenue).toFixed(2)}`, desc: 'Completed checkouts', icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { label: 'Total Transactions', val: data.stats.totalOrders, desc: 'Guest + Member checkout orders', icon: ShoppingBag, color: 'text-primary-400 bg-primary-500/10 border-primary-500/20' },
              { label: 'Registered Customers', val: data.stats.totalUsers, desc: 'Excluding admin profiles', icon: Users, color: 'text-accent-400 bg-accent-500/10 border-accent-500/20' },
              { label: 'Active Games', val: data.stats.totalGames, desc: 'Games listing in catalog', icon: Gamepad2, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="glass-card rounded-2xl border border-dark-800 p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${stat.color}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">{stat.label}</span>
                    <span className="text-2xl font-black text-white mt-1 block">{stat.val}</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">{stat.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Latest Orders Table */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Recent Top-Up Transactions</h2>
            {data.latestOrders.length === 0 ? (
              <div className="glass-card rounded-2xl border border-dark-800 p-8 text-center text-slate-500 text-sm">
                No transactions recorded yet.
              </div>
            ) : (
              <div className="glass-card rounded-2xl border border-dark-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-dark-900/60 border-b border-dark-800 text-slate-400 font-semibold">
                        <th className="p-4">Txn Number</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Game Client</th>
                        <th className="p-4">Package</th>
                        <th className="p-4">Game ID</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-800 text-slate-300">
                      {data.latestOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-dark-900/20 transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-200">{order.orderNumber}</td>
                          <td className="p-4">
                            {order.user ? (
                              <div className="flex flex-col">
                                <span className="font-semibold">{order.user.username}</span>
                                <span className="text-[10px] text-slate-500">{order.user.email}</span>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">Guest Purchaser</span>
                            )}
                          </td>
                          <td className="p-4 font-semibold">{order.game.name}</td>
                          <td className="p-4">{order.itemPackage.name}</td>
                          <td className="p-4 font-mono">{order.gameUserId}</td>
                          <td className="p-4 font-bold text-primary-400">
                            ${Number(order.amountPaid).toFixed(2)}
                            <span className="block text-[10px] text-slate-500 font-normal">{order.paymentMethod}</span>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded uppercase">
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
            <div className="glass-card rounded-2xl border border-dark-800 p-6 bg-dark-900/30">
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-dark-800">
                <h3 className="font-extrabold text-white text-base">
                  {isEditingGame ? 'Edit Game Listing' : 'Register New Game Listing'}
                </h3>
                <button
                  onClick={() => {
                    setShowGameForm(false);
                    setIsEditingGame(false);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleGameSubmit} className="space-y-4 text-sm text-slate-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Game Title</label>
                    <input
                      type="text"
                      required
                      value={gameForm.name}
                      onChange={(e) => setGameForm({ ...gameForm, name: e.target.value })}
                      placeholder="e.g. PUBG Mobile"
                      className="w-full px-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Slug URL</label>
                    <input
                      type="text"
                      required
                      value={gameForm.slug}
                      onChange={(e) => setGameForm({ ...gameForm, slug: e.target.value })}
                      placeholder="e.g. pubg-mobile"
                      className="w-full px-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Category</label>
                    <select
                      value={gameForm.category}
                      onChange={(e) => setGameForm({ ...gameForm, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl text-slate-100 focus:outline-none focus:border-primary-500 text-xs"
                    >
                      <option value="Mobile">Mobile</option>
                      <option value="PC">PC</option>
                      <option value="Console">Console</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Thumbnail URL</label>
                    <input
                      type="url"
                      required
                      value={gameForm.thumbnailUrl}
                      onChange={(e) => setGameForm({ ...gameForm, thumbnailUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Banner Header URL</label>
                  <input
                    type="url"
                    required
                    value={gameForm.bannerUrl}
                    onChange={(e) => setGameForm({ ...gameForm, bannerUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Description</label>
                  <textarea
                    rows={3}
                    value={gameForm.description}
                    onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })}
                    placeholder="Provide short details about game store..."
                    className="w-full px-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={gameForm.isActive}
                    onChange={(e) => setGameForm({ ...gameForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-primary-500 bg-dark-900 border-dark-800 focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="text-xs font-semibold text-slate-300">
                    Active Catalog Listing (renders publicly)
                  </label>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-dark-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGameForm(false);
                      setIsEditingGame(false);
                    }}
                    className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    <Save size={14} /> {isEditingGame ? 'Save Changes' : 'Publish Game'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {games.map((game) => (
              <div key={game.id} className="glass-card rounded-2xl border border-dark-800 overflow-hidden shadow flex">
                <img src={game.thumbnailUrl} alt={game.name} className="w-24 object-cover bg-dark-900 shrink-0" />
                <div className="p-4 flex flex-col justify-between w-full">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-extrabold text-slate-200 text-sm sm:text-base line-clamp-1">{game.name}</h3>
                      <span className={`px-2 py-0.5 text-[8px] font-bold rounded uppercase shrink-0 ${
                        game.isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                      }`}>
                        {game.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <span className="text-[10px] text-accent-400 uppercase tracking-widest font-semibold block mt-0.5">
                      {game.category}
                    </span>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {game.description || 'No store description.'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-dark-800/50 mt-4">
                    <span className="text-[10px] text-slate-400">
                      Packages count: <strong>{game._count?.packages || 0}</strong>
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditGameClick(game)}
                        className="p-1.5 bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                        title="Edit Game"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition-colors cursor-pointer"
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

      {/* Packages Manager Tab */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          {showPackageForm && (
            <div className="glass-card rounded-2xl border border-dark-800 p-6 bg-dark-900/30 max-w-xl mx-auto">
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-dark-800">
                <h3 className="font-extrabold text-white text-base">Add New Package Tier</h3>
                <button onClick={() => setShowPackageForm(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handlePackageSubmit} className="space-y-4 text-sm text-slate-300">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Select Game</label>
                  <select
                    required
                    value={packageForm.gameId}
                    onChange={(e) => setPackageForm({ ...packageForm, gameId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl text-slate-100 focus:outline-none focus:border-primary-500 text-xs"
                  >
                    <option value="">-- Choose game listing --</option>
                    {games.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Package Name</label>
                    <input
                      type="text"
                      required
                      value={packageForm.name}
                      onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                      placeholder="e.g. 325 + 25 UC"
                      className="w-full px-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Numeric Value (Diamonds count)</label>
                    <input
                      type="number"
                      required
                      value={packageForm.diamonds}
                      onChange={(e) => setPackageForm({ ...packageForm, diamonds: e.target.value })}
                      placeholder="e.g. 350"
                      className="w-full px-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Selling Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={packageForm.price}
                      onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                      placeholder="e.g. 4.99"
                      className="w-full px-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Original Price ($ - Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={packageForm.originalPrice}
                      onChange={(e) => setPackageForm({ ...packageForm, originalPrice: e.target.value })}
                      placeholder="e.g. 5.99"
                      className="w-full px-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-dark-800">
                  <button
                    type="button"
                    onClick={() => setShowPackageForm(false)}
                    className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    <Save size={14} /> Add Package Tier
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Info Card */}
          <div className="glass-card rounded-2xl border border-dark-800 p-5 flex items-center gap-3 text-xs text-slate-400">
            <AlertCircle className="text-accent-400 shrink-0" size={16} />
            <span>
              To edit or remove existing package tiers, select a game from the <strong>Manage Games</strong> tab to perform modular adjustments.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
