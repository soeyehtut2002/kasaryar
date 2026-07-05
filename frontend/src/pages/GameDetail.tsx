import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, ArrowLeft, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  diamonds: number;
}

interface Game {
  id: string;
  name: string;
  slug: string;
  category: string;
  thumbnailUrl: string;
  bannerUrl: string;
  description?: string;
  packages: Package[];
}

export const GameDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [gameUserId, setGameUserId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const isMLBB = slug === 'mobile-legends';

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const res = await fetch(`/api/games/${slug}`);
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          setGame(data.data.game);
        } else {
          setError(data.message || 'Game details not found');
        }
      } catch (err) {
        console.error(err);
        setError('Network error loading game details');
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [slug]);

  const handleBuyClick = () => {
    setFormError(null);
    if (!gameUserId) {
      setFormError('Please enter your Game User ID');
      return;
    }
    if (isMLBB && !zoneId) {
      setFormError('Please enter your Zone ID (Server ID)');
      return;
    }
    if (!selectedPackage) {
      setFormError('Please select a top-up package');
      return;
    }
    if (!selectedPayment) {
      setFormError('Please select a payment method');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          gameId: game?.id,
          packageId: selectedPackage?.id,
          gameUserId,
          zoneId: isMLBB ? zoneId : undefined,
          paymentMethod: selectedPayment
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setCheckoutSuccess(data.data.order);
        setShowConfirmModal(false);
      } else {
        setFormError(data.message || 'Checkout failed');
      }
    } catch (err) {
      console.error(err);
      setFormError('Network checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-64 bg-dark-800 rounded-3xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="h-8 bg-dark-800 rounded w-1/2" />
            <div className="h-24 bg-dark-800 rounded w-full" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-dark-800 rounded-2xl" />
            <div className="h-48 bg-dark-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="flex items-center justify-center p-8 glass-card rounded-2xl border-red-500/20 gap-4 mb-6">
          <AlertCircle className="text-red-400 shrink-0" size={32} />
          <div className="text-left">
            <h3 className="font-bold text-white">Oops! Error loading game</h3>
            <p className="text-sm text-slate-400 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-dark-800 hover:bg-dark-700 text-slate-200 hover:text-white rounded-xl transition-all"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative h-64 sm:h-80 rounded-3xl overflow-hidden mb-8 border border-dark-800 shadow-2xl">
        <img src={game.bannerUrl} alt={game.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 border-primary-500/50 shadow-lg bg-dark-900">
            <img src={game.thumbnailUrl} alt={game.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest text-primary-400 bg-primary-500/10 border border-primary-500/20 rounded uppercase">
              {game.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">{game.name}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-2xl border border-dark-800 p-6">
            <h3 className="font-bold text-lg text-slate-100 mb-3">About this game</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {game.description || 'Top-up your account easily and instantly. Fast, safe, and secure transaction.'}
            </p>
            <div className="space-y-4 pt-4 border-t border-dark-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-primary-500" size={14} />
                <span>Instant delivery to game account</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-primary-500" size={14} />
                <span>Official game top-up partner code</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-primary-500" size={14} />
                <span>24/7 client support assistance</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl border border-dark-800 p-6 relative">
            <div className="absolute top-6 left-6 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center font-bold text-sm text-white">
              1
            </div>
            <div className="pl-12">
              <h3 className="font-bold text-lg text-white mb-4">Enter User Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-2">User ID</label>
                  <input
                    type="text"
                    value={gameUserId}
                    onChange={(e) => setGameUserId(e.target.value)}
                    placeholder="Enter Game User ID"
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
                {isMLBB && (
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-2">Zone ID</label>
                    <input
                      type="text"
                      value={zoneId}
                      onChange={(e) => setZoneId(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full px-4 py-3 bg-dark-900 border border-dark-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                    />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
                To find your User ID, log into your game client, tap your profile icon at the top left. The User ID is displayed on the main profile dashboard.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-dark-800 p-6 relative">
            <div className="absolute top-6 left-6 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center font-bold text-sm text-white">
              2
            </div>
            <div className="pl-12">
              <h3 className="font-bold text-lg text-white mb-4">Select Recharge Item</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {game.packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between h-24 ${
                      selectedPackage?.id === pkg.id
                        ? 'bg-primary-500/10 border-primary-500 shadow-lg shadow-primary-500/5'
                        : 'bg-dark-900 border-dark-800 hover:border-dark-700'
                    }`}
                  >
                    <span className="font-bold text-sm text-slate-200 line-clamp-1">{pkg.name}</span>
                    <div className="mt-2 text-right">
                      {pkg.originalPrice && (
                        <span className="text-[10px] text-slate-500 line-through mr-1.5 block">
                          ${Number(pkg.originalPrice).toFixed(2)}
                        </span>
                      )}
                      <span className="font-extrabold text-sm text-primary-400">${Number(pkg.price).toFixed(2)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-dark-800 p-6 relative">
            <div className="absolute top-6 left-6 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center font-bold text-sm text-white">
              3
            </div>
            <div className="pl-12">
              <h3 className="font-bold text-lg text-white mb-4">Select Payment Method</h3>
              <div className="space-y-3">
                {[
                  { id: 'E-Wallet', name: 'WavePay / KBZPay / MytelPay', fee: 'No fee', icon: '📱' },
                  { id: 'Card', name: 'Visa / Mastercard / JCB', fee: '1.5% processing fee', icon: '💳' },
                  { id: 'Bank Transfer', name: 'KBZ Bank / CB Bank / AYA Bank Direct', fee: 'No fee', icon: '🏦' },
                ].map((payment) => (
                  <button
                    key={payment.id}
                    onClick={() => setSelectedPayment(payment.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedPayment === payment.id
                        ? 'bg-primary-500/10 border-primary-500'
                        : 'bg-dark-900 border-dark-800 hover:border-dark-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{payment.icon}</span>
                      <div className="text-left">
                        <span className="font-bold text-sm text-slate-200 block">{payment.name}</span>
                        <span className="text-[10px] text-slate-500">{payment.fee}</span>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border border-dark-700 flex items-center justify-center">
                      {selectedPayment === payment.id && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-dark-800 p-6 relative">
            <div className="absolute top-6 left-6 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center font-bold text-sm text-white">
              4
            </div>
            <div className="pl-12">
              <h3 className="font-bold text-lg text-white mb-4">Complete Purchase</h3>
              {formError && (
                <div className="flex items-center gap-3 p-4 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="shrink-0" size={16} />
                  <span>{formError}</span>
                </div>
              )}
              <button
                onClick={handleBuyClick}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-extrabold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all cursor-pointer text-center text-sm uppercase tracking-wider"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-dark-950/80 backdrop-blur-sm">
          <div className="glass-card rounded-3xl border border-dark-800 max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-dark-800 flex justify-between items-center bg-dark-900/50">
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <ShieldCheck className="text-primary-400" size={20} />
                Order Confirmation
              </h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm text-slate-300">
              <p className="text-xs text-slate-400 leading-relaxed mb-2">
                Please verify details below. Ensure Game User ID and server zone are correct. Top-up transfers are irreversible.
              </p>
              
              <div className="bg-dark-900 rounded-xl p-4 border border-dark-800 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Game Client</span>
                  <span className="font-semibold text-slate-200">{game.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">User ID</span>
                  <span className="font-mono font-bold text-primary-400">{gameUserId}</span>
                </div>
                {isMLBB && (
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Zone ID</span>
                    <span className="font-mono font-bold text-slate-200">({zoneId})</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Product Package</span>
                  <span className="font-semibold text-slate-200">{selectedPackage?.name}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-dark-800">
                  <span className="text-xs text-slate-500">Payment Gateway</span>
                  <span className="font-semibold text-slate-200">{selectedPayment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500 font-bold">Total Bill</span>
                  <span className="font-extrabold text-primary-500 text-base">${Number(selectedPackage?.price).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-dark-800 flex gap-3 bg-dark-900/20">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 border border-dark-800 hover:border-dark-700 text-slate-300 font-semibold rounded-xl transition-all cursor-pointer text-center text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={checkoutLoading}
                className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 transition-all cursor-pointer text-center text-xs flex items-center justify-center gap-1.5"
              >
                {checkoutLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Confirm & Buy'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {checkoutSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-dark-950/80 backdrop-blur-sm">
          <div className="glass-card rounded-3xl border border-dark-800 max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center border-b border-dark-800 bg-dark-900/50">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-extrabold text-white text-lg">Top-Up Successful!</h3>
              <p className="text-slate-400 text-xs mt-1">Your diamonds have been transferred</p>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-300">
              <div className="bg-dark-900 rounded-xl p-4 border border-dark-800 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Transaction ID</span>
                  <span className="font-mono text-slate-200 text-xs">{checkoutSuccess.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Recipient ID</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {checkoutSuccess.gameUserId} {checkoutSuccess.zoneId ? `(${checkoutSuccess.zoneId})` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Package Delivered</span>
                  <span className="font-semibold text-primary-400">{checkoutSuccess.itemPackage?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Payment Channel</span>
                  <span className="font-semibold text-slate-200">{checkoutSuccess.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500 font-bold">Total Paid</span>
                  <span className="font-extrabold text-emerald-400 text-base">${Number(checkoutSuccess.amountPaid).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Status</span>
                  <span className="px-2 py-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded uppercase">
                    {checkoutSuccess.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-dark-800 bg-dark-900/20 text-center">
              <button
                onClick={() => {
                  setCheckoutSuccess(null);
                  setSelectedPackage(null);
                  setSelectedPayment('');
                  setGameUserId('');
                  setZoneId('');
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
