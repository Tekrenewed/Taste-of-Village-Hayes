import React, { useState, useEffect } from 'react';
import { useRealtimeOrders } from '../hooks/useRealtimeOrders';
import { useRealtimeBookings } from '../hooks/useRealtimeBookings';
import { ChefHat, CheckCircle, Clock, AlertTriangle, Monitor, Utensils } from 'lucide-react';
import { Order, Booking } from '../types';

export const KitchenKDS = () => {
  const [filter, setFilter] = useState<'all' | 'dine-in' | 'takeaway'>('all');
  const [now, setNow] = useState(Date.now());
  const [pin, setPin] = useState('');
  const [staff, setStaff] = useState<any>(null);
  const [authError, setAuthError] = useState('');

  // ─── Decoupled Real-Time Data (no Firestore imports!) ───
  const { orders, updateOrder } = useRealtimeOrders({
    status: ['pending', 'preparing', 'ready'],
    sortDirection: 'asc',
  });

  const { todayBookings, updateBooking } = useRealtimeBookings({
    status: ['PENDING', 'CONFIRMED'],
    todayOnly: true,
  });

  // Force re-render every minute for timers
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleBump = async (orderId: string, currentStatus: string) => {
    try {
      await updateOrder(orderId, { status: 'ready' });
    } catch (err) {
      console.error("Failed to bump order:", err);
      alert("Error updating order.");
    }
  };

  const handleBumpBooking = async (bookingId: string) => {
    try {
      await updateBooking(bookingId, { status: 'READY' });
    } catch (err) {
      console.error("Failed to bump booking:", err);
    }
  };

  // Merge bookings into the order stream
  const activeBookings = (todayBookings || []).map(b => {
    const timeVal = b?.time || "00:00";
    const [hours, mins] = timeVal.split(':').map(Number);
    const bookingTime = new Date();
    bookingTime.setHours(hours, mins, 0, 0);
    const msUntilBooking = bookingTime.getTime() - now;
    const minsUntilBooking = Math.floor(msUntilBooking / 60000);

    return {
      _isBooking: true,
      data: b,
      minsUntilBooking,
      isActive: minsUntilBooking <= 15 // Slide in 15 mins prior
    };
  }).filter(b => b.isActive);

  // Combine
  // Combine with safety checks
  const combinedStream = [
    ...(orders?.map(o => ({ type: 'order', data: o, sortTime: o.timestamp?.seconds ? o.timestamp.seconds * 1000 : now })) || []),
    ...(activeBookings?.map(b => {
       const [h, m] = (b.data?.time || "00:00").split(':').map(Number);
       const t = new Date();
       t.setHours(h || 0, m || 0, 0, 0);
       return { type: 'booking', data: b.data, sortTime: t.getTime(), minsUntilBooking: b.minsUntilBooking };
    }) || [])
  ].sort((a, b) => (a.sortTime || 0) - (b.sortTime || 0));

  const filteredCombined = combinedStream.filter(item => {
    if (filter === 'all') return true;
    if (item.type === 'booking') return filter === 'dine-in'; // Bookings are dine-in (tables)
    const o = item.data as Order;
    if (filter === 'dine-in') return o.type === 'dine-in';
    return (o.type as string) === 'takeaway' || o.type === 'delivery' || o.type === 'collection';
  });

  const handleLogin = async () => {
    setAuthError('');
    const isDev = import.meta.env.DEV;
    const API_BASE = isDev ? (import.meta.env.VITE_API_URL || 'http://localhost:8080') : '';
    try {
      const res = await fetch(`${API_BASE}/api/v1/shifts/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        throw new Error('Unauthorized');
      }
      const staffData = await res.json();
      setStaff(staffData);
    } catch {
      setAuthError('Connection error or Invalid PIN');
      setPin('');
    }
  };

  if (!staff) {
    return (
      <div className="min-h-screen bg-[#090b10] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-pink rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ChefHat size={32} className="text-[#090b10]" />
            </div>
            <h1 className="text-3xl font-display font-black tracking-tighter text-white">Kitchen Display</h1>
            <p className="text-brand-electricPeach font-bold text-xs uppercase tracking-widest mt-1">Staff Access Only</p>
          </div>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold p-3 rounded-xl text-center mb-4">
              {authError}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((key, i) => (
              <button
                key={i}
                onClick={() => {
                  if (key === '⌫') setPin(p => p.slice(0, -1));
                  else if (key !== '') setPin(p => p.length < 6 ? p + key : p);
                }}
                disabled={key === ''}
                className={`h-16 rounded-2xl text-2xl font-bold transition-all active:scale-95 ${
                  key === '' ? 'invisible' :
                  key === '⌫' ? 'bg-white/5 text-gray-400' :
                  'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-2 mb-6">
            {[0,1,2,3].map(i => (
              <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < pin.length ? 'bg-brand-pink scale-110' : 'bg-white/10'}`} />
            ))}
          </div>

          <button
            onClick={handleLogin}
            disabled={pin.length < 4}
            className="w-full py-4 bg-brand-pink text-white font-black text-lg uppercase tracking-wider rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-pink/90 transition-all active:scale-[0.98]"
          >
            Access Kitchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090b10] text-[#F0E6D6] font-sans selection:bg-[#ffb703] selection:text-[#090b10] flex flex-col">
      {/* ─── Top Navbar ─── */}
      <div className="sticky top-0 z-50 bg-[#090b10]/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-pink to-brand-electricPeach rounded-xl flex items-center justify-center shadow-lg shadow-brand-pink/20">
            <Monitor size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl tracking-tighter text-white">Kitchen Display</h1>
            <p className="text-brand-electricPeach font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Orders ({filteredCombined.length})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl">
          {(['all', 'dine-in', 'takeaway'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${
                filter === f 
                ? 'bg-brand-pink text-white shadow-lg' 
                : 'text-gray-500 hover:text-white'
              }`}
            >
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ─── KDS Grid ─── */}
      <div className="flex-1 p-6 overflow-x-auto">
        <div className="flex gap-6 h-full min-h-[calc(100vh-120px)] items-start">
          {filteredCombined?.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center opacity-50 mt-32">
              <ChefHat size={120} className="mb-6 opacity-20" />
              <h2 className="text-3xl font-display font-black text-white">Kitchen is Clear</h2>
              <p className="text-xl text-gray-500 mt-2 font-bold uppercase tracking-widest">Waiting for orders...</p>
            </div>
          ) : (
            filteredCombined?.map((streamItem, idx) => {
              if (streamItem.type === 'booking') {
                const booking = streamItem.data as Booking;
                const mUntil = (streamItem as any).minsUntilBooking as number;
                
                // For bookings counting DOWN to arrival
                const isCritical = mUntil <= 5;
                const isWarning = mUntil <= 10 && mUntil > 5;

                return (
                  <div 
                    key={`b-${booking.id}-${idx}`} 
                    className={`flex-shrink-0 w-[340px] flex flex-col rounded-3xl overflow-hidden border-2 transition-colors ${
                      isCritical 
                      ? 'bg-red-950/40 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 
                      isWarning 
                      ? 'bg-orange-950/40 border-orange-500/50' : 
                      'bg-indigo-950/40 border-indigo-500/30'
                    }`}
                  >
                    <div className={`p-5 border-b ${
                      isCritical ? 'bg-red-500 border-red-600' :
                      isWarning ? 'bg-orange-500 border-orange-600' :
                      'bg-indigo-600 border-indigo-700'
                    }`}>
                       <div className="flex justify-between items-start mb-2">
                        <span className="font-black tracking-tighter text-3xl text-white">
                          Table Booking
                        </span>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-sm tracking-widest bg-black/30 text-white animate-pulse">
                          <Clock size={14} />
                          IN {mUntil}m
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <p className="font-bold text-sm tracking-wide text-white/90">
                           {booking.name || booking.customerName}
                         </p>
                         <p className="font-mono text-xs opacity-80 font-bold text-white">
                           {booking.id.split('-')[0]}
                         </p>
                      </div>
                    </div>

                    <div className="p-5 flex-1 overflow-y-auto flex flex-col justify-center items-center text-center">
                       <Utensils size={48} className={`mb-4 ${isCritical ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-indigo-400'}`} />
                       <h3 className="text-2xl font-black text-white">{booking.guests} Guests</h3>
                       <p className="text-xl font-bold mt-2 text-gray-300">Expected at {booking.time}</p>
                       <p className="text-sm font-semibold mt-4 text-[#ffb703] bg-[#ffb703]/10 px-4 py-2 rounded-full">
                          PREP TABLE // DRINKS
                       </p>
                    </div>

                    <div className="p-4 bg-black/40 border-t border-white/5">
                      <button
                        onClick={() => handleBumpBooking(booking.id)}
                        className={`w-full py-5 rounded-2xl font-black text-xl tracking-tighter uppercase transition-transform active:scale-95 flex items-center justify-center gap-3 ${
                          isCritical 
                          ? 'bg-white text-red-600 shadow-xl shadow-red-500/20' 
                          : 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-400'
                        }`}
                      >
                        <CheckCircle size={24} />
                        MARK READY
                      </button>
                    </div>
                  </div>
                )
              }

              // Normal Order
              const order = streamItem.data as Order;
              const orderTime = order.timestamp?.seconds ? order.timestamp.seconds * 1000 : now;
              const elapsedMins = Math.floor((now - orderTime) / 60000);
              const isWarning = elapsedMins >= 10 && elapsedMins < 15;
              const isCritical = elapsedMins >= 15;

              return (
                <div 
                  key={order.id} 
                  className={`flex-shrink-0 w-[340px] flex flex-col rounded-3xl overflow-hidden border-2 transition-colors ${
                    isCritical 
                    ? 'bg-red-950/40 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 
                    isWarning 
                    ? 'bg-orange-950/40 border-orange-500/50' : 
                    'bg-[#1a1d2a] border-white/5'
                  }`}
                >
                  {/* Ticket Header */}
                  <div className={`p-5 border-b ${
                    isCritical ? 'bg-red-500 border-red-600' :
                    isWarning ? 'bg-orange-500 border-orange-600' :
                    'bg-white/5 border-white/10'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`font-black tracking-tighter text-3xl ${isCritical || isWarning ? 'text-white' : 'text-[#ffb703]'}`}>
                        {order.type === 'dine-in' ? `Table ${order.table_number || (order as any).tableNumber || '?'}` : 'Takeaway'}
                      </span>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-sm tracking-widest ${
                        isCritical || isWarning ? 'bg-black/30 text-white' : 'bg-black/40 text-gray-300'
                      }`}>
                        <Clock size={14} className={isCritical ? 'animate-spin' : ''} />
                        {elapsedMins}m
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                       <p className={`font-bold text-sm tracking-wide ${isCritical || isWarning ? 'text-white/80' : 'text-gray-400'}`}>
                         {order.customerName || 'Walk-In'}
                       </p>
                       <p className={`font-mono text-xs opacity-50 font-bold ${isCritical || isWarning ? 'text-white' : 'text-gray-500'}`}>
                         {order.id.split('-')[0]}
                       </p>
                    </div>
                  </div>

                  {/* Payment Alert Banner if unpaid */}
                  {order.isPaid === false && (
                    <div className="bg-yellow-500 text-yellow-900 font-black text-xs uppercase tracking-widest text-center py-1.5">
                       NOT PAID YET - COLLECT AT TILL
                    </div>
                  )}

                  {/* Ticket Items */}
                  <div className="p-5 flex-1 overflow-y-auto">
                    {(order?.items || []).map((item, idx) => (
                      <div key={idx} className="mb-4 last:mb-0">
                        <div className="flex items-start gap-3">
                          <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg ${
                            isCritical ? 'bg-red-500/20 text-red-400' :
                            isWarning ? 'bg-orange-500/20 text-orange-400' :
                            'bg-white/10 text-white'
                          }`}>
                            {item.quantity}x
                          </span>
                          <div className="flex-1 mt-1">
                            <p className="font-bold text-xl leading-none text-white tracking-tight">{item.name}</p>
                            {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                              <div className="mt-2 space-y-1">
                                {Object.entries(item.modifiers).map(([key, val]) => (
                                  <p key={key} className="text-sm font-semibold text-[#ffb703] flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-[#ffb703]" />
                                    {String(val)}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {order.notes && (
                       <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                         <p className="text-red-400 text-sm font-bold flex items-center gap-2"><AlertTriangle size={14}/> {order.notes}</p>
                       </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-black/40 border-t border-white/5">
                    <button
                      onClick={() => handleBump(order.id, order.status)}
                      className={`w-full py-5 rounded-2xl font-black text-2xl tracking-tighter uppercase transition-transform active:scale-95 flex items-center justify-center gap-3 ${
                        isCritical 
                        ? 'bg-white text-red-600 hover:bg-gray-200 shadow-xl shadow-red-500/20' 
                        : 'bg-[#ffb703] text-[#090b10] hover:bg-[#ffb703]/90 shadow-xl shadow-[#ffb703]/10'
                      }`}
                    >
                      <CheckCircle size={28} />
                      MARK READY
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
