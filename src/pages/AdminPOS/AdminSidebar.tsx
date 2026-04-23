import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ChefHat, 
  LayoutGrid, 
  Calendar, 
  BarChart3, 
  Users, 
  Settings as UserSettings, 
  Clock, 
  FileText,
  Lock,
  Sun,
  Moon,
  Zap,
  RefreshCcw,
  PackagePlus,
  Printer
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  posDarkMode: boolean;
  setPosDarkMode: (val: boolean) => void;
  activeStaff: { name: string; role: string } | null;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  posDarkMode,
  setPosDarkMode,
  activeStaff
}) => {
  const menuItemsRaw = [
    { id: 'home', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'pos', icon: ShoppingCart, label: 'Sell / POS' },
    { id: 'kds', icon: ChefHat, label: 'Kitchen' },
    { id: 'website', icon: FileText, label: 'Web Orders' },
    { id: 'refunds', icon: RefreshCcw, label: 'Refunds' },
    { id: 'tables', icon: LayoutGrid, label: 'Tables' },
    { id: 'bookings', icon: Calendar, label: 'Bookings' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'crm', icon: Users, label: 'Customers' },
    { id: 'marketing', icon: Zap, label: 'Marketing' },
    { id: 'menu',        icon: UserSettings,  label: 'Menu' },
    { id: 'itembuilder', icon: PackagePlus,   label: 'Item Builder' },
    { id: 'staff',       icon: Clock,         label: 'Staff' },
    { id: 'roadmap', icon: FileText, label: 'Roadmap' },
  ];

  const menuItems = menuItemsRaw.filter(item => {
    if (activeStaff?.role === 'admin' || activeStaff?.role === 'manager' || activeStaff?.role === 'owner') return true;
    if (activeStaff?.role === 'kitchen' || activeStaff?.role === 'system') return ['home', 'kds'].includes(item.id);
    // Default staff/cashier view
    return ['home', 'pos', 'tables', 'bookings', 'refunds'].includes(item.id);
  });

  return (
    <aside className="hidden md:flex flex-col w-72 p-8 glass-pine z-40 transition-all duration-500 border-r border-white/5">
      <div className="flex items-center gap-4 mb-16 animate-liquid">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center warm-glow transition-transform overflow-hidden p-1 shadow-lg">
          <img src="/favicon.png" alt="Taste of Village Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tighter">TASTE OF <span className="text-terracotta">VILLAGE</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 relative group ${
              activeTab === item.id 
                ? 'bg-terracotta text-pine shadow-[0_0_20px_rgba(138,61,42,0.6)]' 
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <item.icon size={20} className={activeTab === item.id ? '' : 'group-hover:scale-110 transition-transform'} />
            <span className="text-sm tracking-tight">{item.label}</span>
            {activeTab === item.id && (
              <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-current"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setPosDarkMode(!posDarkMode)}
            className="p-3 rounded-xl transition-all bg-white/5 text-white/50 hover:text-white shadow-inner hover:bg-white/10"
          >
            {posDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Pro</p>
            <p className="font-bold text-sm">{activeStaff?.name || 'Manager'}</p>
          </div>
        </div>
        {(activeStaff?.role === 'admin' || activeStaff?.role === 'manager' || activeStaff?.role === 'owner') && (
          <button 
            onClick={() => setActiveTab('eod')}
            className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
          >
            <Printer size={14} />
            Run Z-Report
          </button>
        )}
        
        <button 
          onClick={() => window.location.href = '/staff-portal'}
          className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(138,61,42,0.4)] bg-terracotta text-pine hover:bg-terracotta/90"
        >
          Staff Portal →
        </button>
      </div>
    </aside>
  );
};
