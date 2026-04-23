import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { streamSingleOrder } from '../services/orderService';
import { Order } from '../types';
import { Clock, CheckCircle2, ChefHat, Package, MapPin, ChevronLeft, Phone, MessageCircle, Sparkles, Timer, Bell } from 'lucide-react';
import { SHOP_CONFIG, buildWhatsAppLink } from '../shopConfig';
import { requestPushPermission } from '../utils/pushService';

// ─── Industry-standard preparation stages (UberEats / Deliveroo / DoorDash pattern) ───
const TRACKING_STEPS = [
  {
    id: 'web_holding',
    label: 'Order Received',
    description: 'We\'ve received your order and it\'s in our queue.',
    icon: Bell,
    emoji: '📋',
    color: 'from-amber-400 to-orange-500',
    animation: 'animate-pulse',
  },
  {
    id: 'pending',
    label: 'Order Confirmed',
    description: 'Our team has accepted your order and sent it to the kitchen.',
    icon: CheckCircle2,
    emoji: '✅',
    color: 'from-emerald-400 to-green-500',
    animation: '',
  },
  {
    id: 'preparing',
    label: 'Being Prepared',
    description: 'Our chefs are crafting your order with love and care.',
    icon: ChefHat,
    emoji: '👨‍🍳',
    color: 'from-violet-400 to-purple-500',
    animation: 'animate-bounce',
  },
  {
    id: 'ready',
    label: 'Ready for Pickup',
    description: 'Your order is ready! Head to the counter to collect it.',
    icon: Package,
    emoji: '🎉',
    color: 'from-brand-pink to-rose-500',
    animation: 'animate-bounce',
  },
];

export const TrackOrder = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const prevStatus = useRef<string>('');

  useEffect(() => {
    if (orderId) {
      // Request push permissions and save token to order
      requestPushPermission(orderId);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      setError(true);
      setLoading(false);
      return;
    }

    const unsubscribe = streamSingleOrder(orderId, (fetchedOrder) => {
      setLoading(false);
      if (fetchedOrder) {
        // Play notification sound when status changes
        if (prevStatus.current && prevStatus.current !== fetchedOrder.status) {
          try {
            new Audio('/assets/notification.mp3').play();
          } catch (e) { }
          // Confetti burst when ready
          if (fetchedOrder.status === 'ready') {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
          }
        }
        prevStatus.current = fetchedOrder.status;
        setOrder(fetchedOrder);
        // Show review prompt once when order moves to completed
        if (prevStatus.current && prevStatus.current !== 'completed' && fetchedOrder.status === 'completed') {
          const alreadyShown = sessionStorage.getItem(`review_prompted_${orderId}`);
          if (!alreadyShown) {
            setTimeout(() => setShowReviewPrompt(true), 1500);
            sessionStorage.setItem(`review_prompted_${orderId}`, '1');
          }
        }
      } else {
        setError(true);
      }
    });

    return () => unsubscribe();
  }, [orderId]);

  // Live timer
  useEffect(() => {
    if (!order) return;
    const update = () => {
      const placed = new Date(order.timestamp).getTime();
      setElapsedMinutes(Math.floor((Date.now() - placed) / 60000));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-cream to-white pt-24 pb-12 flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-brand-pink/30 rounded-full animate-spin border-t-brand-pink"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🔍</span>
          </div>
        </div>
        <p className="mt-8 text-brand-text/70 font-bold font-display text-xl tracking-wider animate-pulse">Locating your order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-cream to-white pt-24 pb-12 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 border-4 border-gray-100">
          <span className="text-4xl">📦</span>
        </div>
        <h1 className="font-display text-4xl font-bold text-brand-text mb-4">Order Not Found</h1>
        <p className="text-gray-600 max-w-md mb-8 leading-relaxed">
          We couldn't locate order <strong className="text-brand-pink">{orderId}</strong>. It may still be processing, or the ID might be incorrect.
        </p>
        <div className="flex gap-4">
          <Link to="/menu" className="bg-brand-text text-white px-8 py-4 rounded-full font-bold hover:bg-brand-text/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Order Again
          </Link>
          <a href={`tel:${SHOP_CONFIG.phoneNumberRaw}`} className="bg-white text-brand-text px-8 py-4 rounded-full font-bold border-2 border-gray-200 hover:border-brand-pink transition-all">
            Call Store
          </a>
        </div>
      </div>
    );
  }

  const getCurrentStepIndex = () => {
    if (order.status === 'completed') return TRACKING_STEPS.length;
    if (order.status === 'no_show') return -1;
    const idx = TRACKING_STEPS.findIndex(s => s.id === order.status);
    return idx === -1 ? 0 : idx;
  };

  const currentIndex = getCurrentStepIndex();
  const currentStep = TRACKING_STEPS[Math.min(currentIndex, TRACKING_STEPS.length - 1)];
  const isCompleted = order.status === 'completed';
  const isNoShow = order.status === 'no_show';
  const progressPercent = isCompleted ? 100 : Math.min(100, (currentIndex / (TRACKING_STEPS.length - 1)) * 100);

  // Estimated time remaining (rough industry standard: 3-5 min per step)
  const stepsRemaining = TRACKING_STEPS.length - 1 - currentIndex;
  const estMinutesLeft = isCompleted ? 0 : Math.max(2, stepsRemaining * 4);

  const whatsappMessage = `Hi, I have a question about my order ${order.id}. My name is ${order.customerName}.`;
  const whatsappUrl = buildWhatsAppLink(whatsappMessage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-cream via-white to-brand-cream/50 pt-20 pb-20">
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                fontSize: `${14 + Math.random() * 16}px`,
              }}
            >
              {['🎉', '🎊', '✨', '⭐', '🌟', '🍨'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4">
        
        {/* Back link */}
        <Link to="/menu" className="inline-flex items-center gap-2 text-brand-text/50 hover:text-brand-pink mb-6 font-bold transition-colors text-sm">
          <ChevronLeft size={18} />
          Back to Menu
        </Link>

        {/* ─── Hero Status Card ─── */}
        <div className={`relative rounded-[2.5rem] p-8 md:p-10 mb-6 overflow-hidden shadow-2xl ${
          isCompleted ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white' :
          isNoShow ? 'bg-gradient-to-br from-gray-700 to-gray-900 text-white' :
          'bg-white border border-brand-rose/20'
        }`}>
          {/* Decorative gradient blob */}
          {!isCompleted && !isNoShow && (
            <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br ${currentStep.color} opacity-10 blur-3xl`}></div>
          )}

          <div className="relative z-10">
            {/* Order ID pill */}
            <div className="flex items-center justify-between mb-6">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-xs tracking-wider ${
                isCompleted ? 'bg-white/20 text-white' : 'bg-brand-cream text-brand-text border border-brand-rose/20'
              }`}>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {order.id}
              </span>
              {!isCompleted && !isNoShow && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${
                  'bg-brand-pink/10 text-brand-pink'
                }`}>
                  <Timer size={14} />
                  ~{estMinutesLeft} min
                </div>
              )}
            </div>

            {/* Main status message */}
            <div className="flex items-start gap-5">
              <div className={`text-5xl ${currentStep?.animation || ''}`}>
                {isCompleted ? '🎉' : isNoShow ? '😔' : currentStep.emoji}
              </div>
              <div className="flex-1">
                <h1 className={`font-display text-3xl md:text-4xl font-bold mb-2 ${
                  isCompleted || isNoShow ? 'text-white' : 'text-brand-text'
                }`}>
                  {isCompleted ? 'Order Collected!' : isNoShow ? 'Order Cancelled' : currentStep.label}
                </h1>
                <p className={`text-lg ${
                  isCompleted || isNoShow ? 'text-white/80' : 'text-brand-text/60'
                }`}>
                  {isCompleted 
                    ? `Thank you ${order.customerName}! Enjoy your treats 🍨` 
                    : isNoShow 
                      ? 'This order has been marked as not collected.'
                      : currentStep.description}
                </p>
              </div>
            </div>

            {/* Elapsed timer */}
            {!isCompleted && !isNoShow && elapsedMinutes > 0 && (
              <div className="mt-6 flex items-center gap-2 text-brand-text/40 text-sm font-medium">
                <Clock size={14} />
                Placed {elapsedMinutes} min ago · {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>

        {/* ─── Live Progress Stepper ─── */}
        {!isNoShow && (
          <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-brand-rose/10 mb-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-brand-text uppercase tracking-widest text-xs flex items-center gap-2">
                <Sparkles size={14} className="text-brand-pink" />
                Live Progress
              </h3>
              <span className="text-xs text-brand-text/40 font-medium">
                Step {Math.min(currentIndex + 1, TRACKING_STEPS.length)} of {TRACKING_STEPS.length}
              </span>
            </div>

            {/* Horizontal progress bar */}
            <div className="relative h-2 bg-gray-100 rounded-full mb-10 overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-brand-pink to-rose-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Step icons */}
            <div className="flex justify-between relative">
              {TRACKING_STEPS.map((step, idx) => {
                const isActive = idx === currentIndex;
                const isPast = idx < currentIndex || isCompleted;
                const Icon = step.icon;

                return (
                  <div key={step.id} className={`flex flex-col items-center gap-3 flex-1 transition-all duration-500 ${
                    !isPast && !isActive ? 'opacity-30' : ''
                  }`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${
                      isActive 
                        ? `bg-gradient-to-br ${step.color} text-white shadow-lg scale-110` 
                        : isPast 
                          ? 'bg-brand-text text-white' 
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isPast && !isActive ? (
                        <CheckCircle2 size={22} />
                      ) : (
                        <Icon size={22} className={isActive ? step.animation : ''} />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={`font-bold text-[13px] leading-tight ${
                        isActive ? 'text-brand-pink' : isPast ? 'text-brand-text' : 'text-gray-400'
                      }`}>{step.label}</p>
                      {isActive && (
                        <p className="text-[10px] text-brand-pink/60 font-medium mt-1 animate-pulse">NOW</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Order Summary + Collection Location ─── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          
          {/* Order items */}
          <div className="md:col-span-3 bg-white rounded-[2rem] p-7 shadow-sm border border-brand-rose/10">
            <h3 className="font-bold text-brand-text uppercase tracking-widest text-xs mb-6 pb-4 border-b border-gray-100">
              Your Order
            </h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="w-14 h-14 rounded-xl bg-brand-cream flex-shrink-0 relative overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                    <img src={item.image || '/assets/placeholder.png'} alt={item.name} className="w-full h-full object-cover" />
                    <span className="absolute -top-1 -right-1 bg-brand-text text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      x{item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brand-text leading-tight truncate">{item.name}</p>
                    <p className="text-xs text-brand-pink font-semibold">£{item.price.toFixed(2)} each</p>
                  </div>
                  <p className="font-bold text-brand-text whitespace-nowrap">£{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-brand-text/50 font-medium">Total</span>
              <span className="text-2xl font-black text-brand-text">£{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Collection location + actions */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="bg-brand-text text-white rounded-[2rem] p-7 shadow-xl flex-1 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <h3 className="font-bold text-white/40 uppercase tracking-widest text-xs mb-5">Collect From</h3>
                <p className="font-display text-xl font-bold mb-1">{SHOP_CONFIG.name}</p>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">
                  {SHOP_CONFIG.address}<br/>
                  {SHOP_CONFIG.postcode}
                </p>
              </div>
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(SHOP_CONFIG.name + ' ' + SHOP_CONFIG.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-white text-brand-text py-3.5 rounded-xl font-bold hover:bg-brand-cream transition-colors text-sm shadow-sm"
              >
                <MapPin size={16} />
                Get Directions
              </a>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <a 
                href={`tel:${SHOP_CONFIG.phoneNumberRaw}`}
                className="flex items-center justify-center gap-2 bg-white rounded-2xl py-4 font-bold text-sm text-brand-text border border-brand-rose/10 hover:border-brand-pink/30 transition-all shadow-sm"
              >
                <Phone size={16} />
                Call
              </a>
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 text-white rounded-2xl py-4 font-bold text-sm hover:bg-green-600 transition-all shadow-sm"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* ─── Google Review Prompt Modal ─── */}
      {showReviewPrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[300] flex items-center justify-center p-4" onClick={() => setShowReviewPrompt(false)}>
          <div
            className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl"
            onClick={e => e.stopPropagation()}
            style={{ animation: 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}
          >
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-4">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="text-4xl" style={{ animationDelay: `${i * 0.08}s`, animation: 'popIn 0.3s ease both' }}>⭐</span>
              ))}
            </div>
            <h2 className="font-display text-2xl font-bold text-brand-text mb-2">Enjoyed your food?</h2>
            <p className="text-brand-text/60 text-sm leading-relaxed mb-6">
              A quick review means the world to us — it takes <strong>10 seconds</strong> and helps other food lovers find us.
            </p>
            <a
              href={SHOP_CONFIG.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-brand-text text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest mb-3 hover:scale-[1.02] transition-all shadow-lg"
              onClick={() => setShowReviewPrompt(false)}
            >
              ⭐ Leave a Google Review
            </a>
            <button
              onClick={() => setShowReviewPrompt(false)}
              className="w-full py-3 text-brand-text/40 font-medium text-sm hover:text-brand-text/60 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Confetti animation styles */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall { animation: fall linear forwards; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(60px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
