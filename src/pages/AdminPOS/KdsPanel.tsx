import React from 'react';
import { Printer, Clock, MessageCircle, CreditCard, Banknote, Timer, AlertCircle, ChefHat, Zap } from 'lucide-react';
import { PredictivePrep } from '../../services/GeminiService';

interface KdsPanelProps {
  pendingOrders: any[];
  posDarkMode: boolean;
  currentTime: Date;
  formatKdsDate: (timestamp: string) => string;
  printTicket: (order: any) => Promise<void>;
  handleStatusUpdate: (orderId: string, newStatus: any) => Promise<void>;
  notifyCustomer: (order: any) => void;
  handlePayment: (orderId: string, method: 'card' | 'cash') => Promise<void>;
  handleVerifyPayment: (orderId: string) => Promise<void>;
  prepInsight?: PredictivePrep | null;
}

const QUICK_CATEGORIES = ['drinks', 'desserts', 'starters', 'naan_breads'];
const SLOW_CATEGORIES = ['curries', 'biryani', 'grills'];

export const KdsPanel: React.FC<KdsPanelProps> = ({
  pendingOrders,
  posDarkMode,
  currentTime,
  formatKdsDate,
  printTicket,
  handleStatusUpdate,
  notifyCustomer,
  handlePayment,
  handleVerifyPayment,
  prepInsight
}) => {

  const renderKdsCard = (order: any) => {
    const waitTime = Math.floor((currentTime.getTime() - new Date(order.timestamp).getTime()) / 60000) || 0;
    
    // Pillar 3: Gating Logic
    const hasSlowItems = order.items.some((i: any) => SLOW_CATEGORIES.includes(i.category?.toLowerCase()) || SLOW_CATEGORIES.some(c => i.name?.toLowerCase().includes(c)));
    const hasQuickItems = order.items.some((i: any) => QUICK_CATEGORIES.includes(i.category?.toLowerCase()) || QUICK_CATEGORIES.some(c => i.name?.toLowerCase().includes(c)));
    const isMixedOrder = hasSlowItems && hasQuickItems;
    const isEarlyPrep = order.status === 'preparing' && waitTime < 5;

    const getCardStyle = () => {
      if (order.status === 'ready') return "border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
      const hasNewAdditions = order.items.some((i: any) => i.isNewAddition);
      if (hasNewAdditions && order.status !== 'ready') return "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] bg-amber-500/10 animate-pulse";
      if (order.status === 'preparing') return "border-terracotta shadow-[0_0_15px_rgba(255,165,115,0.2)] bg-terracotta/5";
      if (waitTime >= 10) return "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-red-500/5";
      return posDarkMode ? "border-terracotta/30" : "border-pine/10";
    };

    return (
      <div key={order.id} className={`${posDarkMode ? 'pine-card' : 'bg-white shadow-sm'} rounded-[2.5rem] overflow-hidden border-t-2 relative transition-all duration-500 ${getCardStyle()}`}>
        
        {/* Pillar 3 Meta-Alert */}
        {isMixedOrder && order.status !== 'ready' && (
          <div className="bg-terracotta text-pine px-6 py-2 flex items-center gap-3 animate-pulse">
            <Timer size={14} className="font-black" />
            <span className="text-[10px] font-black uppercase tracking-widest">Mixed Order: Sequence Items</span>
          </div>
        )}

        {order.provider && (
          <div className="absolute top-12 right-4 px-3 py-1 bg-pine/80 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-[2px] border border-white/10 text-terracotta">
            {order.provider}
          </div>
        )}
        <div className={`p-6 ${posDarkMode ? 'bg-white/5' : 'bg-pine/5'} flex flex-col gap-4`}>
          <div className="flex justify-between items-center">
            <span className="font-mono font-bold text-lg text-terracotta">#{order.id.slice(-4)}</span>
            <div className="flex gap-2">
              <span className={`text-[10px] font-black px-3 py-1 ${posDarkMode ? 'text-white/40' : 'text-pine/40'} tracking-tighter uppercase`}>
                {formatKdsDate(order.timestamp)}
              </span>
              <button onClick={() => printTicket(order)} className={`p-1.5 rounded-lg ${posDarkMode ? 'bg-white/10 hover:bg-terracotta text-cream hover:text-pine' : 'bg-pine/10 hover:bg-pine hover:text-white'} transition-colors`} title="Print Ticket">
                <Printer size={12}/>
              </button>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter flex items-center gap-1 ${waitTime >= 10 && order.status === 'pending' ? 'bg-red-500/20 text-red-500 animate-pulse' : (posDarkMode ? 'bg-white/10' : 'bg-pine/10')}`}><Clock size={10}/> {waitTime}m</span>
            </div>
          </div>
          <div className="text-sm">
            <div className="font-bold">{order.customerName || 'Walk-in'}</div>
          </div>
          
          {(order as any).table_number || (order as any).tableNumber ? (
            <div className="bg-terracotta text-pine w-full text-center py-3 rounded-xl font-black text-3xl shadow-[0_0_15px_rgba(255,165,115,0.4)] animate-pulse">
              TABLE {(order as any).table_number || (order as any).tableNumber}
            </div>
          ) : null}
        </div>

        <div className="p-8 space-y-5">
          {order.items.map((item: any, i: number) => {
            const isQuickItem = QUICK_CATEGORIES.includes(item.category?.toLowerCase()) || QUICK_CATEGORIES.some(c => item.name?.toLowerCase().includes(c));
            const shouldHold = isMixedOrder && isQuickItem && isEarlyPrep;

            // Parse modifiers object into structured display
            const mods = item.modifiers || {};
            const size         = mods.size || '';
            const optionStr    = mods.options || '';
            const instructions = mods.instructions || item.notes || '';

            // Split comma-separated options into individual lines
            const optionLines: string[] = optionStr
              ? optionStr.split(',').map((s: string) => s.trim()).filter(Boolean)
              : [];

            return (
              <div key={i} className={`pb-5 relative ${i < order.items.length-1 ? `border-b ${posDarkMode ? 'border-white/8' : 'border-pine/6'}` : ''}`}>

                {/* ── Item name row ─────────────────────────── */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Quantity badge */}
                    <span className={`text-3xl font-black leading-none ${posDarkMode ? 'text-terracotta' : 'text-pine'}`}>
                      {item.quantity}×
                    </span>
                    {/* Item name */}
                    <span className={`font-black text-xl leading-tight ${shouldHold ? 'opacity-30 line-through' : ''} ${item.isNewAddition ? 'text-amber-400 animate-pulse' : ''}`}>
                      {item.name}
                    </span>
                    {/* Size pill */}
                    {size && (
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider
                        ${posDarkMode ? 'bg-terracotta/20 text-terracotta' : 'bg-amber-100 text-amber-700'}`}>
                        {size}
                      </span>
                    )}
                    {item.isNewAddition && (
                      <span className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                        New Addition
                      </span>
                    )}
                  </div>

                  {shouldHold && (
                    <span className="flex-shrink-0 bg-terracotta text-pine text-[9px] font-black px-2.5 py-1.5 rounded-lg tracking-widest flex items-center gap-1 animate-bounce">
                      <AlertCircle size={10}/> HOLD
                    </span>
                  )}
                </div>

                {/* ── Modifier lines ─────────────────────────── */}
                {optionLines.length > 0 && (
                  <div className={`mt-2 ml-10 space-y-1 pl-4 border-l-[3px] ${posDarkMode ? 'border-terracotta/40' : 'border-pine/15'}`}>
                    {optionLines.map((opt, oi) => {
                      const isRemoval = /^no\s|^without\s|^remove\s/i.test(opt);
                      return (
                        <div key={oi} className="flex items-center gap-2">
                          <span className={`font-black text-base ${isRemoval
                            ? 'text-red-500'
                            : posDarkMode ? 'text-terracotta' : 'text-pine/70'}`}>
                            —
                          </span>
                          <span className={`font-bold text-base ${isRemoval
                            ? 'text-red-500'
                            : posDarkMode ? 'text-white/80' : 'text-pine/80'}`}>
                            {opt}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Special instructions (callout box) ──────── */}
                {instructions && (
                  <div className={`mt-3 ml-10 flex items-start gap-2.5 px-4 py-3 rounded-xl
                    ${posDarkMode ? 'bg-yellow-400/10 border border-yellow-400/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <AlertCircle size={14} className="text-yellow-500 flex-shrink-0 mt-0.5"/>
                    <p className="text-yellow-600 font-bold text-sm leading-snug">{instructions}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-6 flex gap-3">
          {order.status === 'pending' && <button onClick={() => handleStatusUpdate(order.id, 'preparing')} className="flex-1 py-3 bg-terracotta text-pine rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">Start Prep</button>}
          {order.status === 'preparing' && <button onClick={() => handleStatusUpdate(order.id, 'ready')} className="flex-1 py-3 bg-green-600 text-pine rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">Mark Ready</button>}
          {order.status === 'ready' && <button onClick={() => handleStatusUpdate(order.id, 'completed')} className="flex-1 py-3 bg-white text-pine rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">Complete</button>}
          
          {order.customerPhone && (
            <button 
              onClick={() => notifyCustomer(order)} 
              className="py-3 px-4 bg-[#25D366]/10 text-[#25D366] rounded-2xl border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center"
              title="Send WhatsApp Update"
            >
              <MessageCircle size={18} />
            </button>
          )}

          {!order.isPaid && order.status !== 'pending' && (
            <div className="flex gap-2">
              <button onClick={() => handleVerifyPayment(order.id)} className="py-3 px-4 bg-terracotta text-pine rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-1" title="Verify Sync"><CreditCard size={14}/> Verify</button>
              <button onClick={() => handlePayment(order.id, 'card')} className="py-3 px-4 glass-pine rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-terracotta transition-all flex items-center gap-1" title="Card Payment"><CreditCard size={14}/></button>
              <button onClick={() => handlePayment(order.id, 'cash')} className="py-3 px-4 glass-pine rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-green-500 transition-all flex items-center gap-1" title="Cash Payment"><Banknote size={14}/></button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-4xl font-bold">Kitchen Display</h2>
        <div className="flex gap-4">
          <div className={`px-5 py-2 rounded-full text-xs font-bold ${posDarkMode ? 'glass-pine text-terracotta' : 'bg-terracotta/20 text-[#D17897] border border-terracotta/30'}`}>
            Live: {pendingOrders.length} Orders
          </div>
        </div>
      </div>

      {/* Predictive Prep Bar */}
      {prepInsight && prepInsight.itemsToPrepped.length > 0 && (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed ${
          prepInsight.alertLevel === 'high' ? 'border-red-500 bg-red-500/5' : 
          prepInsight.alertLevel === 'medium' ? 'border-amber-400 bg-amber-400/5' : 
          'border-terracotta/30 bg-white/5'
        } flex flex-col md:flex-row items-center gap-6 shadow-xl`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
            prepInsight.alertLevel === 'high' ? 'bg-red-500 text-white' : 'bg-terracotta text-pine'
          }`}>
            <ChefHat size={30} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
              <Zap size={14} className="text-terracotta" />
              <span className="text-[10px] font-black uppercase tracking-widest text-creamMuted">AI Kitchen Assistant</span>
            </div>
            <h3 className="text-xl font-display font-black leading-tight">
              Predictive Demand: <span className="text-terracotta">{prepInsight.itemsToPrepped.join(', ')}</span>
            </h3>
            <p className="text-xs text-cream/60 font-medium mt-1 italic">"{prepInsight.reasoning}"</p>
          </div>
          <div className="flex gap-2">
            {prepInsight.itemsToPrepped.map(item => (
              <div key={item} className="px-4 py-2 bg-pine text-terracotta rounded-xl text-[10px] font-black uppercase border border-terracotta/20">
                Pre-Prep: {item}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
        <div className="flex flex-col gap-6 w-[350px] min-w-[350px] snap-center">
          <div className={`flex items-center justify-between border-b-2 ${posDarkMode ? 'border-terracotta/30' : 'border-terracotta/60'} pb-4 mb-2`}>
            <h3 className={`font-display font-bold text-xl ${posDarkMode ? 'text-terracotta' : 'text-[#D17897]'} flex items-center gap-2`}>
              <div className="w-3 h-3 rounded-full bg-terracotta animate-pulse"></div> Awaiting Prep
            </h3>
            <span className={`${posDarkMode ? 'glass-pine text-white' : 'bg-pine/10 text-pine'} px-3 py-1 rounded-full text-xs font-black`}>
              {pendingOrders.filter(o => o.status === 'pending').length}
            </span>
          </div>
          {pendingOrders.filter(o => o.status === 'pending').map(order => renderKdsCard(order))}
        </div>

        <div className="flex flex-col gap-6 w-[350px] min-w-[350px] snap-center">
          <div className={`flex items-center justify-between border-b-2 ${posDarkMode ? 'border-[#A8D8A8]/30' : 'border-[#427D42]/30'} pb-4 mb-2`}>
            <h3 className={`font-display font-bold text-xl ${posDarkMode ? 'text-[#A8D8A8]' : 'text-[#2D5A27]'} flex items-center gap-2`}>
              <div className={`w-3 h-3 rounded-full ${posDarkMode ? 'bg-[#A8D8A8]' : 'bg-[#2D5A27]'} animate-pulse`}></div> In Kitchen
            </h3>
            <span className={`${posDarkMode ? 'glass-pine text-white' : 'bg-pine/10 text-pine'} px-3 py-1 rounded-full text-xs font-black`}>
              {pendingOrders.filter(o => o.status === 'preparing').length}
            </span>
          </div>
          {pendingOrders.filter(o => o.status === 'preparing').map(order => renderKdsCard(order))}
        </div>

        <div className="flex flex-col gap-6 w-[350px] min-w-[350px] snap-center">
          <div className={`flex items-center justify-between border-b-2 ${posDarkMode ? 'border-white/30' : 'border-[#134E4A]/30'} pb-4 mb-2`}>
            <h3 className={`font-display font-bold text-xl ${posDarkMode ? 'text-white' : 'text-[#134E4A]'} flex items-center gap-2`}>
              <div className={`w-3 h-3 rounded-full ${posDarkMode ? 'bg-white shadow-[0_0_10px_white]' : 'bg-[#134E4A]'} animate-pulse`}></div> Ready
            </h3>
            <span className={`${posDarkMode ? 'glass-pine text-white' : 'bg-pine/10 text-pine'} px-3 py-1 rounded-full text-xs font-black`}>
              {pendingOrders.filter(o => o.status === 'ready').length}
            </span>
          </div>
          {pendingOrders.filter(o => o.status === 'ready').map(order => renderKdsCard(order))}
        </div>
      </div>
    </div>
  );
};
