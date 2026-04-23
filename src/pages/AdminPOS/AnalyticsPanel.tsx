import React from 'react';
import { BarChart3 } from 'lucide-react';

interface AnalyticsPanelProps {
  orders: any[];
  posDarkMode: boolean;
  printZReport: () => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  orders,
  posDarkMode,
  printZReport
}) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const todaysOrders = orders.filter(o => new Date(o.timestamp).setHours(0, 0, 0, 0) === today);
  
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const todaysRevenue = todaysOrders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length ? (totalRevenue / orders.length) : 0;
  
  const itemCounts: Record<string, number> = {};
  orders.forEach(o => o.items.forEach((i: any) => {
    itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity;
  }));
  const topCategories = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, itemCount: count as number }));

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="font-display text-4xl font-bold">Business Intelligence</h2>
        <button
          onClick={printZReport}
          className="px-6 py-3 bg-terracotta text-pine rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2"
        >
          <BarChart3 size={16} /> Print End of Day Z-Report
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Today's Revenue", value: `£${todaysRevenue.toFixed(2)}`, trend: 'Live Sync', color: 'text-terracotta' },
          { label: 'Total Revenue', value: `£${totalRevenue.toFixed(2)}`, trend: 'All-time', color: 'text-green-400' },
          { label: 'Orders Today', value: todaysOrders.length, trend: 'Consolidated', color: 'text-cream/50' },
          { label: 'Avg. Order Value', value: `£${avgOrderValue.toFixed(2)}`, trend: 'Efficiency', color: 'text-cream/50' },
        ].map((stat, i) => (stat.label && (
          <div key={i} className={`${posDarkMode ? 'pine-card' : 'bg-white shadow-sm border border-pine/5'} p-8 rounded-[2.5rem] relative group overflow-hidden`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-terracotta/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
            <p className={`text-[10px] font-black uppercase tracking-[3px] mb-2 ${posDarkMode ? 'text-cream/30' : 'text-pine/30'}`}>{stat.label}</p>
            <p className={`text-4xl font-bold tracking-tighter mb-2 ${posDarkMode ? 'text-cream' : 'text-pine'}`}>{stat.value}</p>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${stat.color}`}>{stat.trend}</p>
          </div>
        )))}
      </div>
      <div className={`${posDarkMode ? 'pine-card' : 'bg-white shadow-sm border border-pine/5'} p-10 rounded-[3rem] flex flex-col items-center justify-center relative group`}>
        <BarChart3 className={`${posDarkMode ? 'text-terracotta opacity-20' : 'text-pine/10'} mb-6`} size={64} />
        <h3 className={`font-bold text-xl mb-4 ${posDarkMode ? 'text-cream' : 'text-pine'}`}>Top Selling Items</h3>
        <div className="w-full max-w-2xl space-y-3">
          {topCategories.map((c, i) => (
            <div key={i} className={`flex justify-between items-center p-4 rounded-2xl ${posDarkMode ? 'bg-white/5' : 'bg-pine/5'}`}>
              <span className={`font-bold ${posDarkMode ? 'text-cream' : 'text-pine'}`}>{c.name}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${posDarkMode ? 'text-cream/40' : 'text-pine/40'}`}>{c.itemCount} Units Sold</span>
            </div>
          ))}
          {topCategories.length === 0 && <p className="text-cream/20 uppercase tracking-widest text-xs font-bold text-center py-4">No active orders found.</p>}
        </div>
      </div>
    </div>
  );
};
