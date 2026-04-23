import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Package, Phone as PhoneIcon, MessageCircle, Sparkles, ArrowRight, MapPin, Star, Clock, ChevronRight } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { SHOP_CONFIG, buildWhatsAppLink } from '../shopConfig';
import { normaliseUKPhone, isValidUKMobile, getPhoneError } from '../lib/validation';
import { useRealtimeOrders } from '../hooks/useRealtimeOrders';

interface FoundOrder {
  id: string;
  customerName: string;
  status: string;
  total: number;
  timestamp: any;
  items: { name: string; quantity: number }[];
}

const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  web_holding: { label: 'Received', color: 'bg-amber-100 text-amber-700', emoji: '📋' },
  pending: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', emoji: '✅' },
  preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-700', emoji: '👨‍🍳' },
  ready: { label: 'Ready!', color: 'bg-green-100 text-green-700', emoji: '🎉' },
  completed: { label: 'Collected', color: 'bg-gray-100 text-gray-500', emoji: '✔️' },
  no_show: { label: 'Cancelled', color: 'bg-red-100 text-red-600', emoji: '❌' },
};

export const TrackLanding = () => {
  const [mode, setMode] = useState<'order' | 'phone'>('order');
  const [searchValue, setSearchValue] = useState('');
  const [shaking, setShaking] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [foundOrders, setFoundOrders] = useState<FoundOrder[] | null>(null);
  const [searchedPhone, setSearchedPhone] = useState('');
  const navigate = useNavigate();

  // Decoupled real-time orders from the adapter layer
  const { orders: allOrders } = useRealtimeOrders();

  const handleTrackByOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = searchValue.trim().replace('#', '');
    if (!cleaned) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }
    navigate(`/track/${cleaned}`);
  };

  const handleTrackByPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = normaliseUKPhone(searchValue);
    
    if (!isValidUKMobile(searchValue)) {
      setPhoneError(getPhoneError(searchValue) || 'Enter a valid UK mobile (07XXX XXXXXX)');
      return;
    }
    setPhoneError(null);
    setLoading(true);
    setFoundOrders(null);

    try {
      // Filter from the live order stream (decoupled from Firestore)
      const orders: FoundOrder[] = allOrders
        .filter((o) => {
          const oPhone = (o.customerPhone || '').replace(/\s+/g, '').replace(/^(\+44|0044)/, '0');
          return oPhone === cleaned;
        })
        .map((o) => ({
          id: o.id,
          customerName: o.customerName || '',
          status: o.status || 'pending',
          total: o.total || 0,
          timestamp: o.timestamp instanceof Date ? o.timestamp : new Date(o.timestamp),
          items: (o.items || []).map((i: any) => ({ name: i.name, quantity: i.quantity || 1 })),
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setFoundOrders(orders);
      setSearchedPhone(cleaned);
    } catch (err) {
      console.error('Phone lookup failed:', err);
      setFoundOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-cream via-white to-brand-cream/30 relative overflow-hidden">
      <SEOHead 
        title="Track Your Order"
        description="Track your Falooda & Co order in real-time. Enter your order number or phone number to see live preparation status and estimated pickup time."
        canonicalUrl="/track"
      />

      {/* Floating ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-[0.04]"
            style={{
              width: `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              background: i % 2 === 0 
                ? 'radial-gradient(circle, #e91e63, transparent)' 
                : 'radial-gradient(circle, #ff9800, transparent)',
              left: `${10 + i * 15}%`,
              top: `${15 + (i % 3) * 25}%`,
              animation: `float ${6 + i * 2}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-28 pb-20">

        {/* ─── Hero ─── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-pink to-rose-400 text-white rounded-[1.5rem] shadow-xl shadow-brand-pink/20 mb-6">
            <Package size={36} />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-text mb-4 leading-tight">
            Track Your Order
          </h1>
          <p className="text-brand-text/50 text-lg max-w-md mx-auto leading-relaxed">
            Look up your order by order number or phone number
          </p>
        </div>

        {/* ─── Mode Toggle ─── */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-1.5 shadow-md border border-brand-rose/10 flex gap-1">
            <button
              onClick={() => { setMode('order'); setFoundOrders(null); setSearchValue(''); setPhoneError(null); }}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                mode === 'order' 
                  ? 'bg-brand-text text-white shadow-sm' 
                  : 'text-brand-text/50 hover:text-brand-text'
              }`}
            >
              📋 Order Number
            </button>
            <button
              onClick={() => { setMode('phone'); setFoundOrders(null); setSearchValue(''); setPhoneError(null); }}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                mode === 'phone' 
                  ? 'bg-brand-text text-white shadow-sm' 
                  : 'text-brand-text/50 hover:text-brand-text'
              }`}
            >
              📱 Phone Number
            </button>
          </div>
        </div>

        {/* ─── Search Card ─── */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-brand-rose/10 mb-8">
          <form onSubmit={mode === 'order' ? handleTrackByOrder : handleTrackByPhone} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-brand-text/40 uppercase tracking-[0.2em] mb-3">
                {mode === 'order' ? 'Order Number' : 'Phone Number'}
              </label>
              <div className={`relative transition-all ${shaking ? 'animate-shake' : ''}`}>
                {mode === 'order' 
                  ? <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/25" />
                  : <PhoneIcon size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/25" />
                }
                <input
                  type={mode === 'phone' ? 'tel' : 'text'}
                  value={searchValue}
                  onChange={e => {
                    setSearchValue(mode === 'order' ? e.target.value.toUpperCase() : e.target.value);
                    if (phoneError) setPhoneError(getPhoneError(e.target.value));
                    setFoundOrders(null);
                  }}
                  onBlur={() => {
                    if (mode === 'phone' && searchValue.trim()) setPhoneError(getPhoneError(searchValue));
                  }}
                  placeholder={mode === 'order' ? 'e.g. D621 or ORD-A3F7' : '07XXX XXXXXX'}
                  className={`w-full pl-14 pr-6 py-5 bg-brand-cream/50 rounded-2xl border-2 outline-none text-brand-text font-mono font-bold text-xl tracking-wider transition-all placeholder:text-brand-text/20 placeholder:font-sans placeholder:text-base placeholder:tracking-normal ${
                    phoneError 
                      ? 'border-red-400 focus:border-red-500 focus:bg-white' 
                      : 'border-transparent focus:border-brand-pink focus:bg-white'
                  }`}
                  autoFocus
                  autoComplete="off"
                  maxLength={mode === 'phone' ? 15 : 30}
                />
              </div>
              {phoneError && (
                <p className="text-red-500 text-xs font-bold mt-2 ml-1">{phoneError}</p>
              )}
              <p className="text-brand-text/30 text-xs mt-3 ml-1">
                {mode === 'order' 
                  ? 'Find your order number on your receipt or WhatsApp confirmation'
                  : 'Enter the phone number you used when placing your order'
                }
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-brand-text text-white font-bold text-lg rounded-2xl hover:bg-brand-text/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-wait"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  {mode === 'order' ? 'Track My Order' : 'Find My Orders'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* ─── Phone Lookup Results ─── */}
        {foundOrders !== null && mode === 'phone' && (
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-lg border border-brand-rose/10 mb-8">
            {foundOrders.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-4">🔍</div>
                <p className="font-bold text-brand-text text-lg mb-2">No orders found</p>
                <p className="text-brand-text/50 text-sm">
                  No orders were found for this phone number. If you placed an order recently, it may still be processing.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-brand-text text-sm">
                    Found {foundOrders.length} order{foundOrders.length > 1 ? 's' : ''}
                  </h3>
                  <Link 
                    to={`/rewards`} 
                    className="flex items-center gap-1.5 text-xs font-bold text-brand-pink hover:text-brand-pink/80 transition-colors"
                  >
                    <Star size={14} />
                    Check Rewards
                    <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="space-y-3">
                  {foundOrders.map(order => {
                    const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                    const isActive = !['completed', 'no_show'].includes(order.status);
                    return (
                      <Link
                        key={order.id}
                        to={`/track/${order.id}`}
                        className={`block p-4 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 ${
                          isActive 
                            ? 'border-brand-pink/20 bg-brand-pink/[0.03]' 
                            : 'border-gray-100 bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-mono font-bold text-brand-text text-sm">{order.id}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusInfo.color}`}>
                                {statusInfo.emoji} {statusInfo.label}
                              </span>
                            </div>
                            <p className="text-brand-text/40 text-xs flex items-center gap-1.5">
                              <Clock size={12} />
                              {order.timestamp instanceof Date 
                                ? order.timestamp.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : 'Unknown date'
                              }
                            </p>
                            <p className="text-brand-text/50 text-xs mt-1 truncate">
                              {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-brand-text">£{order.total.toFixed(2)}</p>
                            {isActive && (
                              <p className="text-[10px] text-brand-pink font-bold mt-1 animate-pulse">LIVE →</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── Quick Links ─── */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <Link
            to="/rewards"
            className="bg-white rounded-2xl p-5 border border-brand-rose/10 hover:border-brand-pink/30 transition-all shadow-sm hover:shadow-md text-center group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">⭐</div>
            <p className="font-bold text-brand-text text-sm">Check Rewards</p>
            <p className="text-brand-text/40 text-[11px] mt-1">View your loyalty points</p>
          </Link>
          <Link
            to="/menu"
            className="bg-white rounded-2xl p-5 border border-brand-rose/10 hover:border-brand-pink/30 transition-all shadow-sm hover:shadow-md text-center group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🍨</div>
            <p className="font-bold text-brand-text text-sm">Order Again</p>
            <p className="text-brand-text/40 text-[11px] mt-1">Browse our full menu</p>
          </Link>
        </div>

        {/* ─── How it Works ─── */}
        <div className="bg-white/60 backdrop-blur-sm rounded-[2rem] p-8 border border-brand-rose/10 mb-10">
          <h3 className="font-bold text-xs text-brand-text/30 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Sparkles size={14} className="text-brand-pink" />
            How It Works
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { emoji: '📋', label: 'Order Received', desc: 'We\'ve got your order' },
              { emoji: '✅', label: 'Confirmed', desc: 'Accepted & sent to kitchen' },
              { emoji: '👨‍🍳', label: 'Preparing', desc: 'Chefs crafting your order' },
              { emoji: '🎉', label: 'Ready!', desc: 'Head to counter to collect' },
            ].map((step, i) => (
              <div key={i} className="text-center group">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{step.emoji}</div>
                <p className="font-bold text-brand-text text-sm">{step.label}</p>
                <p className="text-brand-text/40 text-xs mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Help Section ─── */}
        <div className="text-center">
          <p className="text-brand-text/30 text-sm font-bold mb-4">Need help?</p>
          <div className="flex justify-center gap-3">
            <a
              href={`tel:${SHOP_CONFIG.phoneNumberRaw}`}
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl font-bold text-sm text-brand-text border border-brand-rose/20 hover:border-brand-pink/40 transition-all shadow-sm"
            >
              <PhoneIcon size={16} className="text-brand-pink" />
              Call Us
            </a>
            <a
              href={buildWhatsAppLink('Hi, I need help tracking my order.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:bg-[#20BD5A] transition-colors shadow-sm"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>
        </div>

        {/* ─── Store Info Footer ─── */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-text/5 rounded-full">
            <MapPin size={14} className="text-brand-pink" />
            <span className="text-brand-text/40 text-xs font-bold">{SHOP_CONFIG.address}, {SHOP_CONFIG.postcode}</span>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-30px) scale(1.1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
};
