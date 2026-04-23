import React, { useState, useEffect, useRef } from 'react';
import { useRealtimeBookings } from '../../hooks/useRealtimeBookings';
import { useStore } from '../../context/StoreContext';
import { streamActiveAlerts, dismissTableAlert } from '../../services/tableService';
import { TableAlert } from '../../types';

interface TablesPanelProps {
  tables: any[];
  pendingOrders: any[];
  onTableClick?: (tableNumber: number) => void;
}

export const TablesPanel: React.FC<TablesPanelProps> = ({ tables, pendingOrders, onTableClick }) => {
  const { todayBookings } = useRealtimeBookings();
  const { playChime } = useStore();
  const [now, setNow] = useState(new Date());
  const [alerts, setAlerts] = useState<TableAlert[]>([]);
  const prevAlertCount = useRef(0);

  // Stream active table alerts
  useEffect(() => {
    const unsubscribe = streamActiveAlerts((newAlerts) => {
      setAlerts(newAlerts);
      
      // Play alarm if a new alert comes in
      if (newAlerts.length > prevAlertCount.current) {
        playChime(true); // Urgent chime
      }
      prevAlertCount.current = newAlerts.length;
    });
    return () => unsubscribe();
  }, [playChime]);

  // Update time every minute to keep "Arriving in X mins" fresh
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Helper to get minutes until booking (returns null if not relevant)
  const getBookingStatus = (timeStr: string) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const bookingTime = new Date();
    bookingTime.setHours(hours, minutes, 0, 0);
    
    const diffMs = bookingTime.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    // Relevant if within next 60 mins, or late by up to 30 mins
    if (diffMins <= 60 && diffMins > 0) return { status: 'upcoming', mins: diffMins };
    if (diffMins <= 0 && diffMins >= -30) return { status: 'late', mins: Math.abs(diffMins) };
    
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-display text-4xl font-bold tracking-tight">Live Floorplan</h2>
          <p className="text-xs font-bold text-creamMuted uppercase tracking-widest mt-1">Real-Time Table Status</p>
        </div>
        <div className="flex gap-4">
          <div className="px-5 py-2 glass-pine rounded-full text-xs font-bold text-terracotta shadow-lg border border-terracotta/20">
            <span className="animate-pulse inline-block w-2 h-2 rounded-full bg-terracotta mr-2"></span>
            {tables.length} Tables Active
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {tables.map(table => {
          // Find if this table has an active order
          const activeOrder = pendingOrders.find(
            o => o.table_number === table.table_number || o.tableNumber === String(table.table_number)
          );

          // Find if this table has an upcoming reservation
          const upcomingBooking = todayBookings.find(
            b => (b.tableId === String(table.table_number)) && getBookingStatus(b.time) !== null && b.status !== 'CANCELLED'
          );
          
          let borderColor = 'border-cream/5';
          let bgColor = 'bg-cream/40';
          let ringColor = 'bg-cream/10 text-cream/50';
          let glowEffect = '';
          
          const bookingInfo = upcomingBooking ? getBookingStatus(upcomingBooking.time) : null;

          const tableAlerts = alerts.filter(a => a.tableId === String(table.table_number) && a.status === 'active');
          const hasWaiterAlert = tableAlerts.some(a => a.type === 'waiter');
          const hasBillAlert = tableAlerts.some(a => a.type === 'bill');

          if (tableAlerts.length > 0) {
            borderColor = 'border-red-500';
            bgColor = 'bg-red-500/10 animate-pulse';
            ringColor = 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)]';
            glowEffect = 'shadow-[0_0_30px_rgba(239,68,68,0.3)] scale-[1.05] z-10';
          } else if (activeOrder) {
            borderColor = 'border-terracotta';
            bgColor = 'bg-gradient-to-br from-brand-pinkLight/30 to-cream/50';
            ringColor = 'bg-terracotta text-pine shadow-[0_0_15px_rgba(255,165,115,0.4)]';
            glowEffect = 'shadow-[0_8px_30px_rgba(255,165,115,0.15)] scale-[1.02]';
          } else if (bookingInfo) {
            if (bookingInfo.status === 'late') {
              borderColor = 'border-red-500';
              bgColor = 'bg-gradient-to-br from-red-100/40 to-cream/50';
              ringColor = 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]';
              glowEffect = 'shadow-[0_8px_30px_rgba(239,68,68,0.15)] scale-[1.02]';
            } else {
              borderColor = 'border-amber-400';
              bgColor = 'bg-gradient-to-br from-amber-100/40 to-cream/50';
              ringColor = 'bg-amber-400 text-pine shadow-[0_0_15px_rgba(251,191,36,0.4)]';
              glowEffect = 'shadow-[0_8px_30px_rgba(251,191,36,0.15)] scale-[1.02]';
            }
          }

          return (
            <div 
              key={table.id} 
              onClick={() => onTableClick?.(table.table_number)}
              className={`pine-card rounded-[2rem] p-5 relative transition-all duration-500 border-2 cursor-pointer group ${borderColor} ${bgColor} ${glowEffect} ${!activeOrder && !upcomingBooking ? 'opacity-70 hover:opacity-100 hover:scale-[1.01]' : 'hover:scale-[1.03]'}`}
            >
              {tableAlerts.length > 0 && (
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
                  {hasWaiterAlert && <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg animate-bounce">🛎️ WAITER</span>}
                  {hasBillAlert && <span className="bg-pine text-white text-[10px] font-black px-2 py-1 rounded shadow-lg animate-bounce">🧾 BILL</span>}
                  <button 
                    onClick={() => tableAlerts.forEach(a => dismissTableAlert(a.id))}
                    className="mt-1 bg-white text-red-600 text-[9px] font-bold px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                  >
                    DISMISS
                  </button>
                </div>
              )}
              {activeOrder && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-wider ${activeOrder.status === 'ready' ? 'text-green-600' : 'text-terracotta'}`}>
                    {activeOrder.status}
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full flex ${activeOrder.status === 'ready' ? 'bg-green-600 shadow-[0_0_8px_#81B29A]' : 'bg-terracotta animate-pulse shadow-[0_0_8px_#FFA573]'}`}></span>
                </div>
              )}
              {bookingInfo && !activeOrder && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                   <span className={`text-[9px] font-black uppercase tracking-wider ${bookingInfo.status === 'late' ? 'text-red-500' : 'text-amber-500'}`}>
                    {bookingInfo.status === 'late' ? 'LATE' : 'RESERVED'}
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full flex animate-pulse ${bookingInfo.status === 'late' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'}`}></span>
                </div>
              )}
              
              <div className="text-center space-y-4 mt-2">
                <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center font-display text-2xl font-bold transition-all ${ringColor}`}>
                  {table.table_number}
                </div>
                
                <div className="h-[90px] flex flex-col justify-center">
                  {activeOrder ? (
                    <>
                      <p className="font-bold text-lg text-terracotta mb-1 tracking-tight leading-none">Occupied</p>
                      <p className="text-[10px] font-black text-cream/60 uppercase tracking-widest bg-cream/5 py-1 px-2 rounded-md inline-block mx-auto mb-1">
                        Order #{String(activeOrder.id).substring(0,4)}
                      </p>
                      {activeOrder.payment_status === 'unpaid' && (
                        <p className="text-[9px] font-black text-white uppercase tracking-widest bg-red-500 py-0.5 px-2 rounded-md inline-block mx-auto mb-1 shadow-md animate-pulse">
                          UNPAID - £{activeOrder.total.toFixed(2)}
                        </p>
                      )}
                      <div className="flex justify-center items-center gap-1">
                        <span className="text-xs text-cream/60 uppercase tracking-widest font-black">Items:</span>
                        <span className="text-xs font-bold text-cream">{activeOrder.items?.length || 0}</span>
                      </div>
                    </>
                  ) : bookingInfo ? (
                    <>
                      <p className={`font-bold text-lg mb-1 tracking-tight leading-none ${bookingInfo.status === 'late' ? 'text-red-500' : 'text-amber-500'}`}>
                        {upcomingBooking?.time}
                      </p>
                      <p className="text-[10px] font-black text-cream/60 uppercase tracking-widest bg-cream/5 py-1 px-2 rounded-md inline-block mx-auto mb-2">
                        {upcomingBooking?.guests} pax
                      </p>
                      <p className="text-[11px] font-bold mt-1 text-cream truncate px-2">
                        {upcomingBooking?.customerName || upcomingBooking?.name}
                      </p>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${bookingInfo.status === 'late' ? 'text-red-500' : 'text-amber-600'}`}>
                        {bookingInfo.status === 'late' ? `${bookingInfo.mins}m Late` : `In ${bookingInfo.mins}m`}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-lg text-cream/40 tracking-tight leading-none">Available</p>
                      <p className="text-[10px] font-black text-cream/30 uppercase tracking-widest mt-2">Ready to seat</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
