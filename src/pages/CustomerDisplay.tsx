import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  totalPrice: number;
}

interface CFDState {
  cart: CartItem[];
  total: number;
  paymentStatus: 'idle' | 'awaiting_payment' | 'paid';
  updatedAt: number;
}

export const CustomerDisplay = () => {
  const [state, setState] = useState<CFDState>({
    cart: [],
    total: 0,
    paymentStatus: 'idle',
    updatedAt: 0,
  });

  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let attempt = 0;
    let isComponentMounted = true;

    const connect = () => {
      if (!isComponentMounted) return;
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const wsProto = apiUrl.startsWith('https') ? 'wss://' : 'ws://';
      const wsDomain = apiUrl.replace(/^https?:\/\//, '');
      const storeId = localStorage.getItem('storeId') || 'f4100da2-1111-1111-1111-000000000001';

      ws = new WebSocket(`${wsProto}${wsDomain}/ws/cfd?storeId=${storeId}`);

      ws.onopen = () => {
        console.log('CFD WebSocket connected');
        attempt = 0; // Reset backoff on successful connection
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          setState(payload);
        } catch (err) {
          console.error("CFD WebSocket parse error:", err);
        }
      };

      ws.onclose = () => {
        console.log('CFD WebSocket closed. Reconnecting...');
        if (!isComponentMounted) return;
        
        // Exponential backoff: min 1s, max 30s
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 30000);
        attempt++;
        reconnectTimeout = setTimeout(connect, backoffMs);
      };

      ws.onerror = (error) => {
        console.error('CFD WebSocket error:', error);
        ws?.close(); // Force trigger onclose
      };
    };

    connect();

    return () => {
      isComponentMounted = false;
      clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handleHiddenTap = () => {
    setTapCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        if (window.confirm("Staff Override: Close Customer Display?")) {
          window.location.href = '/admin';
        }
        return 0;
      }
      return newCount;
    });
    
    // Reset tap count after 2 seconds
    setTimeout(() => {
      setTapCount(prev => prev > 0 ? 0 : prev);
    }, 2000);
  };

  // Use a video loop for the left side (cinematic idle screen)
  return (
    <div className="min-h-screen bg-pine flex overflow-hidden font-sans relative select-none">
      {/* SECURITY LOCKDOWN OVERLAY: Prevents customer touches, requires 5 quick taps to exit */}
      <div 
        className="absolute inset-0 z-50 cursor-none" 
        onClick={handleHiddenTap}
        onContextMenu={(e) => e.preventDefault()}
      />
      
      {/* LEFT SIDE: Marketing / Cinematic Video Loop */}
      <div className="w-1/2 relative bg-black flex items-center justify-center border-r border-pine/50">
        <img 
          src="/assets/tov-cfd-bg.png"
          alt="Taste of Village"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12">
          <h1 className="text-5xl font-serif text-white mb-4">Taste of Village</h1>
          <p className="text-2xl text-white/80 font-light">Crafted with passion, served with love.</p>
        </div>
      </div>

      {/* RIGHT SIDE: Live Receipt */}
      <div className="w-1/2 bg-cream flex flex-col">
        <div className="p-8 border-b border-black/5 bg-white shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-serif text-pine">Your Order</h2>
            <p className="text-pine/50 font-medium mt-1">Please check your items below</p>
          </div>
          <img src="/logo192.png" alt="Logo" className="w-16 h-16 rounded-xl object-cover shadow-sm hidden" />
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          {state.cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-pine/40 space-y-4">
              <Clock size={48} className="opacity-20" />
              <p className="text-2xl font-light">Awaiting items...</p>
            </div>
          ) : (
            state.cart.map((item, i) => (
              <div key={i} className="flex justify-between items-center p-6 bg-white rounded-2xl shadow-sm border border-black/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center font-bold text-xl">
                    {item.quantity}
                  </div>
                  <span className="text-2xl font-medium text-pine">{item.name}</span>
                </div>
                <span className="text-2xl font-bold text-pine">£{item.totalPrice.toFixed(2)}</span>
              </div>
            ))
          )}
        </div>

        {/* Total & Payment Status Footer */}
        <div className="p-8 bg-white border-t border-black/10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-end mb-8">
            <span className="text-3xl font-medium text-pine/60">Total to Pay</span>
            <span className="text-6xl font-serif font-bold text-terracotta">
              £{state.total.toFixed(2)}
            </span>
          </div>

          {state.paymentStatus === 'idle' && (
            <div className="w-full py-4 bg-black/5 rounded-2xl text-center">
              <span className="text-xl font-medium text-pine/50">Preparing order...</span>
            </div>
          )}

          {state.paymentStatus === 'awaiting_payment' && (
            <div className="w-full py-6 bg-amber-400 rounded-2xl text-center flex flex-col items-center justify-center animate-pulse">
              <span className="text-2xl font-bold text-pine">Please Tap Card on Terminal</span>
              <span className="text-pine/70 font-medium mt-1">Awaiting Payment...</span>
            </div>
          )}

          {state.paymentStatus === 'paid' && (
            <div className="w-full py-6 bg-emerald-500 rounded-2xl text-center flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={40} className="text-white mb-2" />
              <span className="text-3xl font-bold text-white">Payment Successful!</span>
              <span className="text-white/90 font-medium mt-1">Thank you for visiting Taste of Village.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
