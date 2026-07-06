import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
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
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
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
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse transition-colors duration-300">
        <div className="h-64 bg-slate-200 dark:bg-dark-800 rounded-3xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-dark-800 rounded w-1/2" />
            <div className="h-24 bg-slate-200 dark:bg-dark-800 rounded w-full" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-slate-200 dark:bg-dark-800 rounded-2xl" />
            <div className="h-48 bg-slate-200 dark:bg-dark-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="flex items-center justify-center p-8 glass-card rounded-2xl border-red-500/20 gap-4 mb-6">
          <AlertCircle className="text-red-500 dark:text-red-400 shrink-0" size={32} />
          <div className="text-left">
            <h3 className="font-extrabold text-slate-800 dark:text-white">Oops! Error loading game</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-transparent font-bold text-sm"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      {/* Banner Cover */}
      <div className="relative h-64 sm:h-80 rounded-3xl overflow-hidden mb-8 border border-slate-200 dark:border-dark-800 shadow-2xl transition-colors duration-300">
        <img src={game.bannerUrl} alt={game.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 dark:from-dark-950 via-slate-900/20 dark:via-dark-950/40 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 border-primary-500/50 shadow-lg bg-slate-100 dark:bg-dark-900">
            <img src={game.thumbnailUrl} alt={game.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-widest text-primary-600 dark:text-primary-400 bg-primary-500/10 border border-primary-500/20 rounded uppercase">
              {game.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">{game.name}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* About Game Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-2xl border border-slate-200 dark:border-dark-800 p-6 bg-white/40 dark:bg-transparent">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 mb-3">
              {t('aboutGame')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
              {game.description || 'Top-up your account easily and instantly. Fast, safe, and secure transaction.'}
            </p>
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-dark-800 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-primary-500" size={14} />
                <span>{t('instantDelivery')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-primary-500" size={14} />
                <span>{t('officialPartner')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-primary-500" size={14} />
                <span>{t('support247')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top-up Form Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Step 1: User ID */}
          <div className="glass-card rounded-2xl border border-slate-200 dark:border-dark-800 p-4 relative bg-white/40 dark:bg-transparent">
            <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center font-black text-xs text-white">
              1
            </div>
            <div className="pl-8">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white mb-3">
                {t('enterDetails')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1.5 uppercase tracking-wide">
                    {t('userId')}
                  </label>
                  <input
                    type="text"
                    value={gameUserId}
                    onChange={(e) => setGameUserId(e.target.value)}
                    placeholder="Enter Game User ID"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
                {isMLBB && (
                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1.5 uppercase tracking-wide">
                      {t('zoneId')}
                    </label>
                    <input
                      type="text"
                      value={zoneId}
                      onChange={(e) => setZoneId(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                    />
                  </div>
                )}
              </div>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
                To find your User ID, log into your game client, tap your profile icon at the top left. The User ID is displayed on the main profile dashboard.
              </p>
            </div>
          </div>

          {/* Step 2: Select Package */}
          <div className="glass-card rounded-2xl border border-slate-200 dark:border-dark-800 p-4 relative bg-white/40 dark:bg-transparent">
            <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center font-black text-xs text-white">
              2
            </div>
            <div className="pl-8">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white mb-3">
                {t('selectPackage')}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {game.packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-2.5 rounded-lg text-left border transition-all cursor-pointer flex flex-col justify-between h-20 ${
                      selectedPackage?.id === pkg.id
                        ? 'bg-primary-500/10 border-primary-500 shadow-md shadow-primary-500/5'
                        : 'bg-slate-50 dark:bg-dark-900 border-slate-200 dark:border-dark-800 hover:border-slate-300 dark:hover:border-dark-700'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                      {pkg.name}
                    </span>
                    <div className="mt-1 text-right">
                        {pkg.originalPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatPrice(pkg.originalPrice)}
                          </span>
                        )}
                        <span className="font-extrabold text-primary-500 text-sm">
                          {formatPrice(pkg.price)}
                        </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="glass-card rounded-2xl border border-slate-200 dark:border-dark-800 p-4 relative bg-white/40 dark:bg-transparent">
            <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center font-black text-xs text-white">
              3
            </div>
            <div className="pl-8">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white mb-3">
                {t('selectPayment')}
              </h3>
              <div className="space-y-2">
                {[
                  { id: 'E-Wallet', name: 'WavePay / KBZPay / MytelPay', fee: 'No fee', icon: '📱' },
                  { id: 'Card', name: 'Visa / Mastercard / JCB', fee: '1.5% fee', icon: '💳' },
                  { id: 'Bank Transfer', name: 'KBZ / CB / AYA Direct', fee: 'No fee', icon: '🏦' },
                ].map((payment) => (
                  <button
                    key={payment.id}
                    onClick={() => setSelectedPayment(payment.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                      selectedPayment === payment.id
                        ? 'bg-primary-500/10 border-primary-500'
                        : 'bg-slate-50 dark:bg-dark-900 border-slate-200 dark:border-dark-800 hover:border-slate-300 dark:hover:border-dark-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{payment.icon}</span>
                      <div className="text-left">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                          {payment.name}
                        </span>
                        <span className="text-[9px] text-slate-450 dark:text-slate-550">{payment.fee}</span>
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-dark-700 flex items-center justify-center">
                      {selectedPayment === payment.id && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 4: Complete */}
          <div className="glass-card rounded-2xl border border-slate-200 dark:border-dark-800 p-4 relative bg-white/40 dark:bg-transparent">
            <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center font-black text-xs text-white">
              4
            </div>
            <div className="pl-8">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white mb-3">
                {t('payNow')}
              </h3>
              {formError && (
                <div className="flex items-center gap-2 p-3 mb-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs">
                  <AlertCircle className="shrink-0" size={14} />
                  <span>{formError}</span>
                </div>
              )}
              <button
                onClick={handleBuyClick}
                className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-extrabold rounded-lg shadow-md transition-all cursor-pointer text-center text-xs uppercase tracking-wider"
              >
                {t('payNow')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 dark:bg-dark-950/80 backdrop-blur-sm">
          <div className="glass-card rounded-2xl border border-slate-200 dark:border-dark-800 max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 bg-white dark:bg-dark-900/95">
            <div className="p-4 border-b border-slate-200 dark:border-dark-800 flex justify-between items-center bg-slate-50 dark:bg-dark-900/50">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
                <ShieldCheck className="text-primary-500 dark:text-primary-400" size={16} />
                {t('confirmDetails')}
              </h3>
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed mb-1">
                {t('confirmPrompt')}
              </p>
              
              <div className="bg-slate-50 dark:bg-dark-900 rounded-lg p-3 border border-slate-200 dark:border-dark-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{t('gameLabel')}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{game.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{t('userId')}</span>
                  <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{gameUserId}</span>
                </div>
                {isMLBB && (
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{t('zoneId')}</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">({zoneId})</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{t('packageLabel')}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedPackage?.name}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-dark-800">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{t('paymentMethod')}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedPayment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{t('totalPrice')}</span>
                  <span className="font-extrabold text-primary-500 text-sm">{formatPrice(selectedPackage?.price)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-dark-800 flex gap-2 bg-slate-50 dark:bg-dark-900/20">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-600 dark:text-slate-300 font-semibold rounded-lg transition-all cursor-pointer text-center text-xs"
              >
                {t('cancelBtn')}
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={checkoutLoading}
                className="flex-1 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer text-center text-xs flex items-center justify-center gap-1"
              >
                {checkoutLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  t('confirmBtn')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal (Receipt) */}
      {checkoutSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 dark:bg-dark-950/80 backdrop-blur-sm">
          <div className="glass-card rounded-2xl border border-slate-200 dark:border-dark-800 max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 bg-white dark:bg-dark-900/95">
            <div className="p-4 text-center border-b border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900/50">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-500 dark:text-emerald-400">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">
                {t('paymentSuccess')}
              </h3>
              <p className="text-slate-550 dark:text-slate-400 text-[10px] mt-0.5">
                {t('receiptPrompt')}
              </p>
            </div>

            <div className="p-4 space-y-3 text-xs text-slate-650 dark:text-slate-350">
              <div className="bg-slate-50 dark:bg-dark-900 rounded-lg p-3 border border-slate-200 dark:border-dark-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{t('receiptNo')}</span>
                  <span className="font-mono text-slate-700 dark:text-slate-200 text-[10px]">{checkoutSuccess.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{t('recipientId')}</span>
                  <span className="font-mono font-semibold text-slate-850 dark:text-slate-250">
                    {checkoutSuccess.gameUserId} {checkoutSuccess.zoneId ? `(${checkoutSuccess.zoneId})` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{t('packageLabel')}</span>
                  <span className="font-semibold text-primary-600 dark:text-primary-400">{checkoutSuccess.itemPackage?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{t('paymentMethod')}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{checkoutSuccess.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{t('totalPrice')}</span>
                  <span className="font-extrabold text-emerald-500 dark:text-emerald-400 text-sm">${Number(checkoutSuccess.amountPaid).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{t('statusLabel')}</span>
                  <span className="px-2 py-0.5 text-[8px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded uppercase">
                    {checkoutSuccess.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900/20 text-center">
              <button
                onClick={() => {
                  setCheckoutSuccess(null);
                  setSelectedPackage(null);
                  setSelectedPayment('');
                  setGameUserId('');
                  setZoneId('');
                }}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-lg transition-all cursor-pointer text-xs uppercase tracking-wider"
              >
                {t('doneBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
