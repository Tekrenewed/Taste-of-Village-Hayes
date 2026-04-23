import React, { useState } from 'react';
import { Phone, History as HistoryIcon, Gift, X } from 'lucide-react';
import { Order } from '../../types';

interface CrmPanelProps {
  customers: any[];
  simulateIncomingCall: () => void;
  customerHistory: Order[];
  loadingHistory: boolean;
  fetchHistory: (phone: string) => void;
}

export const CrmPanel: React.FC<CrmPanelProps> = ({ 
  customers, 
  simulateIncomingCall, 
  customerHistory, 
  loadingHistory, 
  fetchHistory 
}) => {
  const [viewHistoryPhone, setViewHistoryPhone] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState(false);

  const openHistory = (phone: string) => {
    setViewHistoryPhone(phone);
    fetchHistory(phone);
  };

  const handleDispatch = async (cust: any, type: 'reward' | 'winback') => {
    const email = prompt(`Send ${type} to ${cust.name}. Note: We need their email address. Enter email below:`, cust.email || '');
    if (!email) return;

    setDispatching(true);
    try {
      const token = localStorage.getItem('curry_staff_token') || 'local-dev-token';
      const res = await fetch('/api/v1/crm/dispatch-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: email.trim(),
          name: cust.name,
          type: type
        })
      });
      if (res.ok) {
        alert(`${type.toUpperCase()} queued for ${cust.name}!`);
      } else {
        alert('Failed to dispatch. Ensure they have a valid email.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during dispatch.');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-4xl font-bold">Customer CRM</h2>
        <button 
          onClick={simulateIncomingCall} 
          className="bg-terracotta text-pine px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-[2px] warm-glow flex items-center gap-2 hover:scale-105 transition-all"
        >
          <Phone size={18} /> Simulate Call
        </button>
      </div>

      <div className="pine-card rounded-[3rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5">
            <tr>
              <th className="p-10 text-xs font-black text-cream/30 uppercase tracking-widest">Customer</th>
              <th className="p-10 text-xs font-black text-cream/30 uppercase tracking-widest">Phone</th>
              <th className="p-10 text-xs font-black text-cream/30 uppercase tracking-widest">Loyalty</th>
              <th className="p-10 text-xs font-black text-cream/30 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(cust => (
              <tr key={cust.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                <td className="p-10">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">{cust.name}</span>
                    {cust.points > 100 && (
                      <span className="text-[10px] bg-terracotta/20 text-terracotta px-2 py-0.5 rounded-full w-fit font-black mt-1 uppercase tracking-tighter">VIP FAN</span>
                    )}
                  </div>
                </td>
                <td className="p-10 text-creamMuted font-mono">{cust.phone}</td>
                <td className="p-10">
                  <div className="flex items-center gap-2">
                    <span className="text-terracotta font-black text-xl">{cust.points}</span> 
                    <span className="text-[10px] uppercase font-black opacity-30">pts</span>
                  </div>
                </td>
                <td className="p-10 text-right">
                  <div className="flex justify-end items-center gap-4">
                    <button 
                      onClick={() => handleDispatch(cust, 'reward')}
                      disabled={dispatching}
                      className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-terracotta hover:text-white transition-all bg-terracotta/10 px-4 py-2 rounded-full"
                    >
                      <Gift size={14} /> Send Reward
                    </button>
                    <button 
                      onClick={() => handleDispatch(cust, 'winback')}
                      disabled={dispatching}
                      className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#3b82f6] hover:text-white transition-all bg-[#3b82f6]/10 px-4 py-2 rounded-full"
                    >
                      <Gift size={14} /> Send Win-Back Nudge
                    </button>
                    <button 
                      onClick={() => openHistory(cust.phone)}
                      className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cream/40 hover:text-white transition-all ml-4"
                    >
                      <HistoryIcon size={14} /> History
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* History Modal */}
      {viewHistoryPhone && (
        <div className="fixed inset-0 bg-pine/90 backdrop-blur-xl z-[100] flex items-center justify-center p-10">
          <div className="w-full max-w-2xl pine-card rounded-[3rem] p-10 relative overflow-hidden">
            <button 
              onClick={() => setViewHistoryPhone(null)}
              className="absolute top-8 right-8 text-cream/40 hover:text-white transition-all"
            >
              <X size={32} />
            </button>

            <h3 className="font-display text-3xl font-bold mb-2">Order History</h3>
            <p className="text-creamMuted text-sm mb-8">Showing last 10 orders for {viewHistoryPhone}</p>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-4 scrollbar-thin">
              {loadingHistory ? (
                <div className="text-center py-20 animate-pulse text-terracotta font-black uppercase tracking-widest">Fetching Orders...</div>
              ) : customerHistory.length === 0 ? (
                <div className="text-center py-20 text-cream/30 italic">No orders found for this customer.</div>
              ) : (
                customerHistory.map(order => (
                  <div key={order.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-all">
                    <div>
                      <p className="font-bold text-terracotta">#{order.id.slice(-4)}</p>
                      <p className="text-xs text-cream/40 uppercase tracking-widest">{new Date(order.timestamp as any).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg">£{(order.total || 0).toFixed(2)}</p>
                      <p className="text-[10px] uppercase font-black opacity-40">{order.type}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
