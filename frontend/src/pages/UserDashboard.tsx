import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, Mail, ShieldAlert, Calendar, History, ShoppingBag, Loader2 } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  amountPaid: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  gameUserId: string;
  zoneId?: string;
  game: {
    name: string;
    thumbnailUrl: string;
  };
  itemPackage: {
    name: string;
    diamonds: number;
  };
}

export const UserDashboard: React.FC = () => {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/orders/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          setOrders(data.data.orders);
        } else {
          setError(data.message || 'Failed to fetch transaction history');
        }
      } catch (err) {
        console.error(err);
        setError('Network error loading history');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyOrders();
    }
  }, [user, authLoading, token, navigate]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="glass-card rounded-3xl border border-dark-800 p-6 sm:p-8 mb-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Hello, {user?.username}</h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5">
              <Mail size={14} /> {user?.email}
            </p>
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/10 border border-primary-500/20 text-primary-400 capitalize">
              {user?.role} Account
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <History className="text-primary-500" size={20} />
          <h2 className="text-xl font-bold text-white">Transaction History</h2>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <ShieldAlert className="shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="glass-card rounded-2xl border border-dark-800 p-12 text-center max-w-md mx-auto">
            <ShoppingBag className="text-slate-600 mx-auto mb-4" size={48} />
            <h3 className="font-bold text-white text-lg">No transactions yet</h3>
            <p className="text-slate-400 text-sm mt-1 mb-6">
              You haven't made any game top-ups yet. Go to the catalog to choose your games!
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              Browse Games
            </button>
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-dark-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-dark-900/60 border-b border-dark-800 text-slate-400 font-semibold">
                    <th className="p-4">Game</th>
                    <th className="p-4">Order Details</th>
                    <th className="p-4">Recipient ID</th>
                    <th className="p-4">Total Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800 text-slate-300">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-dark-900/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={order.game.thumbnailUrl}
                            alt={order.game.name}
                            className="w-10 h-10 rounded-lg object-cover bg-dark-900"
                          />
                          <span className="font-bold text-slate-200">{order.game.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-100">{order.itemPackage.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">{order.orderNumber}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs">
                        {order.gameUserId} {order.zoneId ? `(${order.zoneId})` : ''}
                      </td>
                      <td className="p-4 font-bold text-primary-400">
                        ${Number(order.amountPaid).toFixed(2)}
                        <span className="block text-[10px] text-slate-500 font-normal mt-0.5">{order.paymentMethod}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded uppercase">
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(order.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
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
  );
};
