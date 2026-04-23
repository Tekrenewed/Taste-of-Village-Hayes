import React, { useState } from 'react';
import { RefreshCcw, Search, User, Phone, Check } from 'lucide-react';

interface RefundsPanelProps {
  orders: any[];
  posDarkMode: boolean;
  updateOrderStatus: (id: string, status: any) => void;
}

export const RefundsPanel: React.FC<RefundsPanelProps> = ({ orders, posDarkMode, updateOrderStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Show only completed or refunded orders
  const validOrders = (orders || []).filter(o => o?.status === 'completed' || o?.status === 'refunded');

  const filteredOrders = validOrders.filter(o => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return o.id?.toLowerCase().includes(term) || 
           o.customerName?.toLowerCase().includes(term) || 
           o.customerPhone?.toLowerCase().includes(term);
  }).sort((a,b) => {
    const timeA = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA; // newest first
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <RefreshCcw className="text-terracotta" size={28} />
            Refunds & Exchanges
          </h2>
          <p className={`text-sm mt-1 ${posDarkMode ? 'text-white/60' : 'text-pine/60'}`}>
            Process refunds for completed orders. Refunded amounts are automatically deducted from the daily Z-Report.
          </p>
        </div>

        <div className="w-full md:w-auto relative">
          <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${posDarkMode ? 'text-white/40' : 'text-pine/40'}`} />
          <input 
            type="text"
            placeholder="Search by ID, Name or Phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full md:w-80 pl-12 pr-4 py-3 rounded-xl border-2 font-bold focus:outline-none transition-all ${
              posDarkMode 
                ? 'bg-white/5 border-white/10 text-white focus:border-terracotta' 
                : 'bg-white border-pine/10 text-pine focus:border-pine'
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.length === 0 ? (
          <div className={`col-span-full p-12 text-center rounded-3xl border-2 border-dashed ${posDarkMode ? 'border-white/10 text-white/40' : 'border-pine/10 text-pine/40'}`}>
            <p className="font-bold text-lg">No matching orders found.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className={`${posDarkMode ? 'pine-card' : 'bg-white shadow-xl border border-pine/5'} rounded-[2rem] p-6 flex flex-col gap-4 relative overflow-hidden transition-all hover:scale-[1.02]`}>
              {order.status === 'refunded' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-bl-[100px] flex items-start justify-end p-4 pointer-events-none">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500 rotate-12 drop-shadow-md">Refunded</span>
                </div>
              )}

              <div className="flex justify-between items-start z-10">
                <div>
                  <span className="font-mono font-black text-lg text-terracotta tracking-tighter">
                    #{order.id?.split('-')[1] || order.id?.slice(-4) || '??'}
                  </span>
                  <div className={`text-xs mt-1 ${posDarkMode ? 'text-white/40' : 'text-pine/40'} font-bold uppercase tracking-wider`}>
                    {order.timestamp ? new Date(order.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Unknown Time'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 z-10 mt-2">
                <div className="font-bold flex items-center gap-3"><User size={16} className={posDarkMode ? 'text-terracotta' : 'text-pine/40'}/> {order.customerName || 'Walk-in Customer'}</div>
                {order.customerPhone && (
                  <div className={`text-sm flex items-center gap-3 ${posDarkMode ? 'text-white/80' : 'text-pine/80'}`}><Phone size={16} className={posDarkMode ? 'text-terracotta' : 'text-pine/40'}/> {order.customerPhone}</div>
                )}
              </div>

              <div className={`flex justify-between items-end mt-4 pt-4 border-t z-10 ${posDarkMode ? 'border-white/5' : 'border-pine/5'}`}>
                <div className={`${posDarkMode ? 'text-white/50' : 'text-pine/50'} text-[10px] font-black uppercase tracking-[0.2em]`}>Total Paid</div>
                <div className={`font-black text-2xl ${order.status === 'refunded' ? 'text-red-400 line-through opacity-70' : 'text-cream'}`}>
                  £{(Number(order?.total) || 0).toFixed(2)}
                </div>
              </div>

              {order.status === 'completed' && (
                <div className="flex gap-3 mt-4 z-10">
                  <button 
                    onClick={async () => {
                      if (window.confirm('Are you strictly sure you want to refund this order? This will subtract from todays Z-Report.')) {
                        try {
                          const res = await fetch(`/api/v1/orders/${order.id}/refund`, {
                            method: 'POST'
                          });
                          if (!res.ok) throw new Error('Failed to refund');
                          alert('Order successfully refunded and Z-Report updated.');
                          updateOrderStatus(order.id, 'refunded');
                        } catch (e) {
                          alert('Refund failed on backend. Please try again.');
                        }
                      }
                    }}
                    className={`flex-1 py-4 ${posDarkMode ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'} rounded-xl text-[11px] font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 border ${posDarkMode ? 'border-red-500/20' : 'border-red-200'}`}
                  >
                    <RefreshCcw size={16} /> Issue Refund
                  </button>
                  <button 
                    onClick={() => {
                      alert('To exchange items, please issue a Refund for the original order and ring up the new items through the POS.');
                    }}
                    className={`px-4 ${posDarkMode ? 'bg-white/5 hover:bg-white/10 text-white/70' : 'bg-pine/5 hover:bg-pine/10 text-pine/70'} rounded-xl text-[11px] font-black uppercase tracking-[0.1em] transition-all border border-transparent`}
                  >
                    Exchange
                  </button>
                </div>
              )}
              {order.status === 'refunded' && (
                <div className="mt-4 py-3 bg-red-500/10 rounded-xl text-center text-red-500 text-[10px] font-black uppercase tracking-widest z-10">
                  Refund Processed
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
