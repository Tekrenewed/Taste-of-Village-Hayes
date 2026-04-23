import React from 'react';
import { User, Phone, Check, X } from 'lucide-react';

interface WebsitePanelProps {
  orders: any[];
  posDarkMode: boolean;
  updateOrderStatus: (orderId: string, status: any) => Promise<void>;
  setActiveTab: (tab: any) => void;
}

export const WebsitePanel: React.FC<WebsitePanelProps> = ({ 
  orders, 
  posDarkMode, 
  updateOrderStatus,
  setActiveTab
}) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-4xl font-bold">Website Collections</h2>
          <p className="text-cream/60">Full historical log of every single order coming from the Taste of Village website.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-5 py-2 glass-pine rounded-full text-xs font-bold text-terracotta">
             Total Revenue: £{(orders || []).reduce((acc, order) => acc + (Number(order?.total) || 0), 0).toFixed(2)}
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <h3 className="font-display text-2xl font-bold border-b border-white/10 pb-2">Waiting in Store</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {orders.filter(o => o.status === 'web_holding').map(order => (
            <div key={order.id} className={`${posDarkMode ? 'pine-card bg-terracotta/5' : 'bg-white'} rounded-[2.5rem] overflow-hidden relative border-terracotta border-2 shadow-[0_0_15px_rgba(255,165,115,0.2)]`}>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-lg text-terracotta">#{order.id?.split('-')[1] || order.id?.slice(-4) || '??'}</span>
                    <span className={`text-xs ${posDarkMode ? 'text-white/40' : 'text-pine/40'} font-medium`}>
                      {order.timestamp ? new Date(order.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }) : 'N/A'} · {order.timestamp ? new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter bg-terracotta text-pine animate-pulse">
                    WAITING IN STORE
                  </span>
                </div>
                <div className="text-sm">
                  <div className="font-bold text-lg">{order.customerName || 'Guest'}</div>
                  <div className={posDarkMode ? 'text-cream/50' : 'text-pine/50'}>{order.customerPhone || ''}</div>
                </div>
                <div className="font-black text-xl">£{(Number(order?.total) || 0).toFixed(2)}</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'pending')}
                    className="flex-1 py-4 bg-terracotta text-pine font-black rounded-xl outline-none hover:scale-105 transition-all text-sm uppercase tracking-widest shadow-lg"
                  >
                    Send to Kitchen
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'no_show' as any)}
                    className="py-4 px-4 bg-red-500/10 text-red-400 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all hover:bg-red-500/20"
                  >
                    No-Show
                  </button>
                </div>
              </div>
            </div>
          ))}
          {orders.filter(o => o.status === 'web_holding').length === 0 && (
            <div className="col-span-full py-8 text-center text-cream/40 font-bold border-2 border-dashed border-white/10 rounded-3xl">
              No customers currently waiting.
            </div>
          )}
        </div>

        <h3 className="font-display text-2xl font-bold border-b border-cream/10 pb-2 mt-12">Actioned / Completed</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-90">
          {(orders || []).filter(o => o.status !== 'web_holding').sort((a,b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeB - timeA;
          }).map(order => (
            <div key={order.id} className={`${posDarkMode ? 'pine-card border flex flex-col border-white/5 bg-transparent' : 'bg-white shadow-sm border border-pine/5'} hover:-translate-y-1 transition-all duration-300 rounded-[2.5rem] overflow-hidden relative`}>
              <div className="p-6 flex flex-col gap-4 h-full">
                <div className={`flex justify-between items-center border-b ${posDarkMode ? 'border-white/5' : 'border-pine/5'} pb-3`}>
                  <div className="flex items-center gap-3">
                    <span className={`${posDarkMode ? 'bg-white/10 text-white' : 'bg-pine/5 text-pine'} px-3 py-1 rounded-lg font-mono font-bold text-sm`}>#{order.id.split('-')[1] || order.id.slice(-4)}</span>
                    <span className={`text-xs ${posDarkMode ? 'text-white/40' : 'text-pine/40'} font-medium`}>
                      {new Date(order.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })} · {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    order.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                    order.status === 'no_show' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    (order.status === 'pending' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/50' : 'bg-green-600/20 text-cream border border-green-600/50')
                  }`}>
                    {order.status === 'pending' ? 'IN KITCHEN' : order.status === 'no_show' ? 'NO SHOW' : order.status}
                  </span>
                </div>
                <div className="flex flex-col gap-2 mt-1 flex-1">
                  <div className="font-bold flex items-center gap-2"><User size={14} className={posDarkMode ? 'text-white/40' : 'text-pine/40'}/> {order.customerName || 'Guest'}</div>
                  <div className={`text-sm flex items-center gap-2 ${posDarkMode ? 'text-white/60' : 'text-pine/60'}`}><Phone size={14} className={posDarkMode ? 'text-white/40' : 'text-pine/40'}/> {order.customerPhone || 'Walk-in'}</div>
                </div>
                <div className={`flex justify-between items-end mt-4 pt-4 border-t ${posDarkMode ? 'border-white/5' : 'border-pine/5'}`}>
                  <div className={`${posDarkMode ? 'text-white/50' : 'text-pine/50'} text-[10px] font-black uppercase tracking-widest`}>Total Value</div>
                  <div className="font-black text-2xl text-cream">£{(Number(order?.total) || 0).toFixed(2)}</div>
                </div>

                {/* Action buttons for completed orders */}
                {order.status === 'completed' && (
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you strictly sure you want to refund this order? This will subtract from todays Z-Report.')) {
                          updateOrderStatus(order.id, 'refunded' as any);
                        }
                      }}
                      className={`w-full py-3 ${posDarkMode ? 'bg-white/5 hover:bg-white/10 text-terracotta border-white/10' : 'bg-pine/5 hover:bg-pine/10 text-pine border-pine/10'} rounded-xl text-[10px] font-black uppercase tracking-widest transition-all`}
                    >
                      Issue Refund
                    </button>
                  </div>
                )}

                {/* Action buttons for non-completed orders */}
                {(order.status === 'pending' || order.status === 'preparing' || order.status === 'ready') && (
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={14} /> Collected
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'no_show' as any)}
                      className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <X size={14} /> No-Show
                    </button>
                  </div>
                )}

                {order.status === 'pending' && (
                  <button 
                    onClick={() => setActiveTab('kds')}
                    className="mt-1 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center text-[10px] font-black uppercase tracking-widest text-terracotta transition-all"
                  >
                    View in KDS Queue → 
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
