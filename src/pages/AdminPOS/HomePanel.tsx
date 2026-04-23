import React from 'react';
import { DollarSign, ShoppingCart, BarChart3, Star, Zap, Cloud, Sun, CloudRain } from 'lucide-react';
import { WeatherInsight } from './WeatherService';
import { StaffingRecommendation } from '../../services/GeminiService';

interface HomePanelProps {
  orders: any[];
  pendingOrders: any[];
  posDarkMode: boolean;
  setActiveTab: (tab: any) => void;
  weatherInsight: WeatherInsight | null;
  staffingInsight: StaffingRecommendation | null;
}

export const HomePanel: React.FC<HomePanelProps> = ({ 
  orders, 
  pendingOrders, 
  posDarkMode, 
  setActiveTab,
  weatherInsight,
  staffingInsight
}) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const safeOrders = (orders || []).filter(o => o != null);
  const todaysOrders = safeOrders.filter(o => {
    try { return o?.timestamp ? new Date(o.timestamp).setHours(0, 0, 0, 0) === today : false; } catch { return false; }
  });
  const todaysRevenue = todaysOrders.reduce((sum, o) => sum + (Number(o?.total) || 0), 0);
  const avgOrderValue = safeOrders.length ? safeOrders.reduce((sum, o) => sum + (Number(o?.total) || 0), 0) / safeOrders.length : 0;
  const itemCounts: Record<string, number> = {};
  
  safeOrders.forEach(o => (o?.items || []).forEach((i: any) => {
    if (i?.name) itemCounts[i.name] = (itemCounts[i.name] || 0) + (i?.quantity || 1);
  }));
  
  const topItem = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0] || ['None', 0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
  const cardClass = 'glass-premium rounded-[2.5rem] p-5 md:p-8 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300';

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-2 text-white">Welcome to Taste of Village</h2>
          <p className="text-white/60">Here is what's happening today.</p>
        </div>

        {weatherInsight && (
          <div className={`p-6 rounded-[2.5rem] border-2 flex items-center gap-6 animate-liquid max-w-lg ${staffingInsight?.impactScore && staffingInsight.impactScore > 7 ? 'border-terracotta bg-terracotta/10 shadow-[0_0_50px_rgba(232,160,191,0.2)]' : 'border-white/10 bg-white/5'}`}>
            <div className={`w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center ${weatherInsight.isHot ? 'bg-orange-500/20 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-terracotta/20 text-terracotta shadow-[0_0_20px_rgba(232,160,191,0.3)]'}`}>
               {weatherInsight.isHot ? <Sun size={32}/> : weatherInsight.isRaining ? <CloudRain size={32}/> : <Cloud size={32}/>}
               <span className="text-[10px] font-black mt-1 leading-none">{weatherInsight.temp}°</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1.5 bg-pine/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <Zap size={10} className="text-terracotta fill-terracotta"/>
                  <span className="text-[9px] font-black uppercase tracking-[2.5px] text-terracotta">Gemini Intel</span>
                </div>
                {staffingInsight && (
                  <span className={`text-[9px] font-bold px-3 py-1 rounded-full ${staffingInsight.impactScore > 7 ? 'bg-red-500 text-white animate-pulse' : 'bg-green-500/20 text-green-400'}`}>
                    IMPACT: {staffingInsight.impactScore}/10
                  </span>
                )}
              </div>
              <h4 className="text-base font-bold text-white mb-1">{staffingInsight?.recommendation || weatherInsight.recommendation}</h4>
              <p className="text-xs text-white/60 leading-snug italic">"{staffingInsight?.rationale || 'Calculating optimal staffing for current conditions...'}"</p>
              {staffingInsight && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-terracotta" style={{width: `${staffingInsight.impactScore * 10}%`}}></div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-terracotta">Staff Target: {staffingInsight.suggestedStaffCount}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className={cardClass}>
          <div className="absolute top-0 right-0 p-4 md:p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
            <DollarSign size={80} className="text-white" />
          </div>
          <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-terracotta mb-2">Today's Revenue</div>
          <div className="text-2xl md:text-4xl font-display font-bold text-white">£{todaysRevenue.toFixed(2)}</div>
          <div className="mt-2 md:mt-4 text-[10px] md:text-xs font-medium text-white/50">From {todaysOrders.length} total orders</div>
        </div>

        <div className={cardClass}>
          <div className="absolute top-0 right-0 p-4 md:p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
            <ShoppingCart size={80} className="text-white" />
          </div>
          <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-terracotta mb-2">Live Orders</div>
          <div className="text-2xl md:text-4xl font-display font-bold text-white">{pendingOrders.length}</div>
          <div className="mt-2 md:mt-4 text-[10px] md:text-xs font-medium text-white/70"><span className="text-red-400 font-bold">{orders.filter(o => o.status === 'web_holding').length}</span> waiting collection</div>
        </div>

        <div className={cardClass}>
          <div className="absolute top-0 right-0 p-4 md:p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
            <BarChart3 size={80} className="text-white" />
          </div>
          <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-terracotta mb-2">Avg Order Value</div>
          <div className="text-2xl md:text-4xl font-display font-bold text-white">£{avgOrderValue.toFixed(2)}</div>
          <div className="mt-2 md:mt-4 text-[10px] md:text-xs font-medium text-white/50">All-time average</div>
        </div>

        <div className={cardClass}>
          <div className="absolute top-0 right-0 p-4 md:p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
            <Star size={80} className="text-white" />
          </div>
          <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-terracotta mb-2">Top Item</div>
          <div className="text-xl md:text-3xl font-display font-bold leading-tight mt-1 truncate text-white">{topItem[0]}</div>
          <div className="mt-2 md:mt-4 text-[10px] md:text-xs font-medium text-white/50">Sold {topItem[1]} times</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="glass-premium p-6 md:p-8 rounded-[2rem] md:rounded-[3rem]">
          <h3 className="font-display text-xl md:text-2xl font-bold mb-6 text-white">Recent Activity</h3>
          <div className="space-y-4">
            {[...orders].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5).map(order => (
              <div key={order.id} className="flex justify-between items-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div>
                  <div className="font-bold flex items-center gap-2 text-white"><span className="px-2 py-0.5 rounded text-[10px] font-mono shadow-sm bg-white/10">#{order.id.slice(-4)}</span> {order.customerName || 'Guest'}</div>
                  <div className="text-xs mt-1 text-white/50">{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">£{order.total.toFixed(2)}</div>
                  <div className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${order.status === 'completed' ? 'text-green-500' : 'text-terracotta'}`}>{order.status === 'web_holding' ? 'WAITING' : order.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] glass-premium">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-terracotta rounded-2xl flex items-center justify-center warm-glow">
              <Zap className="text-pine fill-pine" size={20} />
            </div>
            <div>
              <h3 className="font-display text-xl md:text-2xl font-bold text-white">Taste of Village Active</h3>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-terracotta">System All Clear</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed mb-6 text-white/60">Database connected. POS module online. KDS tracking properly.</p>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('pos')} className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(138,61,42,0.4)] bg-terracotta text-pine hover:bg-terracotta/90">New Walk-in Order</button>
          </div>
        </div>
      </div>
    </div>
  );
};

