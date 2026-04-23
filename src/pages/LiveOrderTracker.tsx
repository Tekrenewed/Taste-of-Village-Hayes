import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, ChefHat, Utensils, Receipt, PlusCircle } from 'lucide-react';
import { Order } from '../types';
import { streamSingleOrder } from '../services/orderService';
import { setTableActiveOrder } from '../services/tableService';

interface Props {
  initialOrder: Order;
  tableId: string;
  onAddToTab: () => void;
}

export default function LiveOrderTracker({ initialOrder, tableId, onAddToTab }: Props) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [splitWays, setSplitWays] = useState(1);
  const [previousStatus, setPreviousStatus] = useState<Order['status']>(initialOrder.status);

  useEffect(() => {
    // Link this order to the table session so we can append to it later
    setTableActiveOrder(tableId, order.id);

    // Stream live updates from the kitchen
    const unsub = streamSingleOrder(order.id, (updatedOrder) => {
      if (updatedOrder) setOrder(updatedOrder);
    });

    return () => unsub();
  }, [order.id, tableId]);

  // Sound and vibration notification when food is ready
  useEffect(() => {
    if (order.status === 'ready' && previousStatus !== 'ready') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const playTone = (freq: number, startTime: number, vol = 0.5) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);
            osc.start(startTime);
            osc.stop(startTime + 1.5);
          };
          // Happy chord for "Food Ready"
          playTone(523.25, ctx.currentTime); // C5
          playTone(659.25, ctx.currentTime + 0.1); // E5
          playTone(783.99, ctx.currentTime + 0.2); // G5
          playTone(1046.50, ctx.currentTime + 0.3); // C6
        }
      } catch (e) {
        console.warn("Audio playback failed", e);
      }
      
      // Trigger a vibration sequence on mobile devices
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200, 100, 500]);
        } catch (e) {
          // ignore
        }
      }
    }
    setPreviousStatus(order.status);
  }, [order.status, previousStatus]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-400 text-amber-900';
      case 'preparing': return 'bg-brand-electricPeach text-white';
      case 'ready': return 'bg-brand-pistachio text-white';
      default: return 'bg-gray-200 text-gray-500';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock size={32} />;
      case 'preparing': return <ChefHat size={32} />;
      case 'ready': return <Utensils size={32} />;
      default: return <CheckCircle size={32} />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Waiting for Kitchen';
      case 'preparing': return 'Chef is Preparing';
      case 'ready': return 'On its way to Table ' + tableId;
      default: return 'Completed';
    }
  };

  const isReady = order.status === 'ready' || order.status === 'completed';

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl text-center relative overflow-hidden">
        {/* Cinematic Background Glow */}
        <div className={`absolute -inset-4 opacity-10 blur-2xl transition-colors duration-1000 ${getStatusColor(order.status)}`} />
        
        <div className="relative z-10">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl transition-colors duration-500 ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
          </div>
          
          <h2 className="font-display text-4xl font-bold text-brand-obsidian mb-2 tracking-tight">
            {getStatusText(order.status)}
          </h2>
          <p className="text-brand-text/60 font-medium mb-8">
            Order #{order.id.slice(-4)} • Table {tableId}
          </p>

          {/* Progress Bar */}
          <div className="flex justify-between items-center mb-2 px-4 relative">
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-100 -z-10 rounded-full" />
            <div className={`absolute top-1/2 left-8 h-1 transition-all duration-1000 -z-10 rounded-full ${order.status === 'preparing' ? 'w-1/2 bg-brand-electricPeach' : order.status === 'ready' || order.status === 'completed' ? 'w-[80%] bg-brand-pistachio' : 'w-0'}`} />
            
            {['pending', 'preparing', 'ready'].map((step, idx) => {
              const isActive = order.status === step || (order.status === 'ready' && idx < 2) || (order.status === 'completed');
              return (
                <div key={step} className={`w-4 h-4 rounded-full transition-colors duration-500 shadow-md ${isActive ? getStatusColor(step as any) : 'bg-gray-200'}`} />
              );
            })}
          </div>
          <div className="flex justify-between px-2 text-[10px] uppercase tracking-widest font-bold text-brand-text/40 mb-10">
            <span>Sent</span>
            <span>Prep</span>
            <span>Ready</span>
          </div>

          <div className="space-y-4">
            <button 
              onClick={onAddToTab}
              disabled={isReady}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isReady ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-brand-electricPeach text-brand-obsidian hover:scale-[1.02] shadow-xl'}`}
            >
              <PlusCircle size={20} />
              {isReady ? 'Order Ready - Cannot Add' : 'Add to Tab'}
            </button>
            {!isReady && <p className="text-xs text-brand-text/50 font-medium">Changed your mind? Add drinks or dessert straight to this order.</p>}
          </div>
        </div>
      </div>

      {/* Split Bill Calculator */}
      <div className="bg-brand-obsidian p-8 rounded-[2rem] shadow-xl text-white">
        <div className="flex items-center gap-3 mb-6">
          <Receipt size={24} className="text-brand-electricPeach" />
          <h3 className="font-display text-2xl font-bold tracking-tight">Split the Bill</h3>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium text-white/70">How many people?</span>
            <span className="font-display text-2xl font-bold text-brand-gold">{splitWays}</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={splitWays} 
            onChange={(e) => setSplitWays(parseInt(e.target.value))}
            className="w-full accent-brand-electricPeach"
          />
          <div className="flex justify-between text-xs text-white/40 mt-2 font-bold">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 flex items-center justify-between border border-white/5">
          <span className="font-black uppercase tracking-widest text-xs text-white/70">Each Pays</span>
          <span className="font-display text-4xl font-bold text-brand-electricPeach">
            £{(order.total / splitWays).toFixed(2)}
          </span>
        </div>
        <p className="text-center text-[10px] uppercase tracking-widest text-white/40 mt-4 font-bold">
          Wait for the waiter to bring the Dojo machine
        </p>
      </div>
    </div>
  );
}
