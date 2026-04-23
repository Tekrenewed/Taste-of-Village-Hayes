import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { useRealtimeSoldOut } from '../hooks/useRealtimeSoldOut';
import { getMenuItems } from '../services/menuService';
import { MenuItem } from '../types';
import { MENU_ITEMS } from '../constants';
import { ORDER_SOURCE } from '../lib/statusConstants';
import {
  ChefHat, LogOut, ShoppingBag, Minus, Plus, Trash2,
  Send, User, Check, X, Clock, Utensils, ArrowLeft, Gift
} from 'lucide-react';
import { useIdleTimeout } from '../hooks/useIdleTimeout';

/* â”€â”€â”€ Constants â”€â”€â”€ */
const NUM_TABLES = 12;
// Categories will be dynamically built inside the component

/* â”€â”€â”€ Modifier config (same as POS) â”€â”€â”€ */
const ITEM_MODIFIERS: Record<string, { name: string; options: string[]; default: string }[]> = {
  'Papdi Chaat': [
    { name: 'Tomato', options: ['With Tomato', 'No Tomato'], default: 'With Tomato' },
    { name: 'Spice', options: ['Mild', 'Spicy'], default: 'Mild' },
  ],
  'Samosa Chaat': [
    { name: 'Tomato', options: ['With Tomato', 'No Tomato'], default: 'With Tomato' },
    { name: 'Spice', options: ['Mild', 'Spicy'], default: 'Mild' },
  ],
  'Aloo Tikki Chaat': [
    { name: 'Tomato', options: ['With Tomato', 'No Tomato'], default: 'With Tomato' },
    { name: 'Spice', options: ['Mild', 'Spicy'], default: 'Mild' },
  ],
};

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  modifiers?: Record<string, string>;
  _cartKey: string;
}

export const WaiterPad = () => {
  /* â”€â”€â”€ Auth State â”€â”€â”€ */
  const [pin, setPin] = useState('');
  const [staff, setStaff] = useState<any>(null);
  const [authError, setAuthError] = useState('');

  /* â”€â”€â”€ Order State â”€â”€â”€ */
  const [screen, setScreen] = useState<'tables' | 'menu' | 'confirm'>('tables');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('popular');
  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  /* ─── Decoupled Sold-Out Data (no direct Firestore subscription!) ─── */
  const { soldOutItems } = useRealtimeSoldOut();

  /* â”€â”€â”€ Modifier Picker â”€â”€â”€ */
  const [modPicker, setModPicker] = useState<MenuItem | null>(null);
  const [modSelections, setModSelections] = useState<Record<string, string>>({});

  /* â”€â”€â”€ Active table orders (from Firestore) â”€â”€â”€ */
  const [tableOrders, setTableOrders] = useState<Record<number, any[]>>({});

  /* â”€â”€â”€ Gamification / CRM State â”€â”€â”€ */
  const [showVipModal, setShowVipModal] = useState(false);
  const [vipForm, setVipForm] = useState({ name: '', phone: '', email: '' });
  const [vipSubmitting, setVipSubmitting] = useState(false);

  const { addOrder, orders } = useStore();
  const cartRef = useRef<HTMLDivElement>(null);

  useIdleTimeout({
    onIdle: () => {
      if (staff) {
        console.log('[IdleTimeout] Waiter session expired. Logging out.');
        setStaff(null);
        setPin('');
      }
    },
    idleTime: 180000,
    isActive: !!staff
  });

  const handleVipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipForm.email && !vipForm.phone) {
      alert("Please provide at least an email or phone number.");
      return;
    }
    setVipSubmitting(true);
    try {
      // 1. Save customer to CRM via Go API
      await fetch('/api/v1/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...vipForm,
          source: 'Order Taking Tab',
          waiterId: staff?.id || 'unknown',
        }),
      });

      // 2. Increment Waiter's Gamification Points via Go API
      if (staff?.id) {
        await fetch(`/api/v1/staff/${staff.id}/points`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 1 }),
        });
        // Update local staff context to reflect new points
        setStaff((prev: any) => ({ ...prev, points: (prev?.points || 0) + 1 }));
      }

      // 3. Trigger welcome email via Go API (if email provided)
      if (vipForm.email) {
        await fetch('/api/v1/mail/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: vipForm.email,
            subject: 'Welcome to the Falooda & Co VIP Club! 🎁',
            html: `
              <div style="font-family: Arial, sans-serif; color: #1a1d2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
                <h2 style="color: #e91e63;">Welcome to the Club, ${vipForm.name}!</h2>
                <p style="font-size: 16px;">Thank you for joining our VIP list today. As promised, here is your secret code for <strong>50% off your first online order</strong>:</p>
                <div style="background: #ffb703; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">VIP50OFF</span>
                </div>
                <p style="font-size: 16px;">Plus, don't forget: Every 5th order through our Web App is completely FREE. Keep an eye on your inbox for early access to our seasonal menu item drops.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="color: #666; font-size: 14px;">- The Falooda & Co Team<br/>268 Farnham Rd, Slough</p>
              </div>
            `
          }),
        });
      }

      setVipForm({ name: '', phone: '', email: '' });
      setShowVipModal(false);
      alert('Success! Customer added to VIP Club. You earned 1 Point! \uD83C\uDF89');
    } catch (err) {
      console.error(err);
      alert('Error saving VIP sign up.');
    } finally {
      setVipSubmitting(false);
    }
  };

  // Load menu
  useEffect(() => {
    getMenuItems().then(items => {
      if (items.length > 0) setMenuItems(items);
      else setMenuItems(MENU_ITEMS);
    }).catch(() => setMenuItems(MENU_ITEMS));
  }, []);

  // Track active dine-in orders per table
  useEffect(() => {
    const map: Record<number, any[]> = {};
    orders.forEach(o => {
      if (o.type === 'dine-in' && o.table_number && !['completed', 'no_show'].includes(o.status)) {
        if (!map[o.table_number]) map[o.table_number] = [];
        map[o.table_number].push(o);
      }
    });
    setTableOrders(map);
  }, [orders]);

  /* ─── Dynamic Categories ─── */
  const dynamicCategories = [
    { id: 'popular', label: '⭐ Popular', filter: (i: MenuItem) => i.popular },
    ...[...new Set((menuItems || []).map(i => i?.category || 'General'))].map(cat => {
      const safeCat = String(cat || 'General');
      return {
        id: safeCat,
        label: safeCat.charAt(0).toUpperCase() + safeCat.slice(1).replace(/_/g, ' '),
        filter: (i: MenuItem) => (i?.category || 'General') === safeCat
      };
    })
  ];

  /* ─── PIN Login ─── */
  const handleLogin = async () => {
    setAuthError('');
    try {
      const isDev = import.meta.env.DEV;
      const API_BASE = isDev ? (import.meta.env.VITE_API_URL || 'http://localhost:8080') : '';
      
      const res = await fetch(`${API_BASE}/api/v1/shifts/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      
      if (!res.ok) {
        setAuthError('Invalid PIN');
        setPin('');
        return;
      }
      
      const staffData = await res.json();
      setStaff(staffData);
    } catch {
      setAuthError('Connection error or Invalid PIN');
      setPin('');
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      handleLogin();
    }
  }, [pin]);

  /* â”€â”€â”€ Menu Filtering â”€â”€â”€ */
  const filteredItems = menuItems.filter(item => {
    if (soldOutItems.includes(item.id)) return false;
    const cat = dynamicCategories.find(c => c.id === activeCategory);
    if (!cat) return false;
    if (cat.filter) return cat.filter(item);
    return item.category === cat.id;
  });

  /* â”€â”€â”€ Cart Actions â”€â”€â”€ */
  const addToCart = (item: MenuItem, modifiers?: Record<string, string>) => {
    const modKey = modifiers ? JSON.stringify(modifiers) : '';
    const cartKey = `${item.id}_${modKey}`;
    
    setCart(prev => {
      const existing = prev.find(i => i._cartKey === cartKey);
      if (existing) {
        return prev.map(i => i._cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, {
        id: item.id,
        name: item.name,
        price: item.price,
        qty: 1,
        modifiers,
        _cartKey: cartKey,
      }];
    });
    
    // Scroll cart into view on mobile
    setTimeout(() => cartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  };

  const updateQty = (cartKey: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i._cartKey !== cartKey) return i;
      const newQty = i.qty + delta;
      return newQty <= 0 ? null : { ...i, qty: newQty };
    }).filter(Boolean) as CartItem[]);
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  /* â”€â”€â”€ Handle item tap (check for modifiers) â”€â”€â”€ */
  const handleItemTap = (item: MenuItem) => {
    const mods = ITEM_MODIFIERS[item.name];
    if (mods) {
      const defaults: Record<string, string> = {};
      mods.forEach(m => { defaults[m.name] = m.default; });
      setModSelections(defaults);
      setModPicker(item);
    } else {
      addToCart(item);
    }
  };

  /* â”€â”€â”€ Submit Order â”€â”€â”€ */
  const submitOrder = async (isPaid: boolean, method: string = '') => {
    if (cart.length === 0 || !selectedTable) return;
    setSubmitting(true);

    const orderId = `TBL${selectedTable}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
    const newOrder: any = {
      id: orderId,
      customerName: `Table ${selectedTable}`,
      customerPhone: '',
      type: 'dine-in',
      table_number: selectedTable,
      items: cart.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.qty,
        modifiers: i.modifiers || {},
      })),
      total: cartTotal,
      status: 'pending',
      source: ORDER_SOURCE.POS,
      waiter: staff?.name || 'Unknown',
      timestamp: new Date(),
      isPaid,
      payment_method: method
    };

    try {
      await addOrder(newOrder);
      setLastOrder(newOrder);
      setCart([]);
      setScreen('confirm');
      setTimeout(() => {
        setLastOrder(null);
        setScreen('tables');
      }, 4000);
    } catch (err) {
      alert('Failed to send order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  /*  RENDER: PIN LOGIN                                         */
  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  if (!staff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1025] to-[#0f1117] flex items-center justify-center p-4">
        <div className="w-full max-w-xs">
          {/* ooD Brand Logo */}
          <div className="text-center mb-8">
            <div className="relative w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ood-badge shadow-[0_0_30px_rgba(255,172,172,0.5)] ring-4 ring-brand-pink/30">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent"></div>
              <div className="relative flex items-center gap-1.5 translate-x-1">
                <div className="flex flex-col gap-0.5">
                  <div className="w-3 h-4 border-[2.5px] border-white rounded-full"></div>
                  <div className="w-3 h-4 border-[2.5px] border-white rounded-full"></div>
                </div>
                <span className="text-white font-black text-4xl leading-none">D</span>
              </div>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              <span>FAL</span>
              <span className="brand-shimmer">OO</span>
              <span>DA</span>
              <span className="text-brand-salmon font-black"> & CO</span>
            </h1>
            <p className="text-white/40 text-sm mt-1 font-medium">Order Taking Tab</p>
          </div>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold p-3 rounded-xl text-center mb-4 animate-pulse">
              {authError}
            </div>
          )}

          {/* PIN Dots â€” above numpad */}
          <div className="flex justify-center gap-4 mb-6">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full transition-all duration-200 ${
                i < pin.length
                  ? 'bg-brand-pink scale-110 shadow-[0_0_10px_rgba(255,192,203,0.8)]'
                  : 'bg-white/10 border border-white/20'
              }`} />
            ))}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((key, i) => (
              <button
                key={i}
                onClick={() => {
                  if (key === '⌫') setPin(p => p.slice(0, -1));
                  else if (key !== '') setPin(p => p.length < 4 ? p + key : p);
                }}
                disabled={key === ''}
                className={`h-[72px] rounded-2xl text-2xl font-bold transition-all active:scale-90 ${
                  key === '' ? 'invisible' :
                  key === '⌫' ? 'bg-white/5 text-white/50 border border-white/10' :
                  'bg-white/8 text-white hover:bg-white/15 border border-white/10 active:bg-brand-pink/30'
                }`}
                style={key !== '' && key !== '⌫' ? { background: 'rgba(255,255,255,0.06)' } : {}}
              >
                {key}
              </button>
            ))}
          </div>

          <p className="text-center text-white/25 text-xs">PIN auto-submits after 4 digits</p>
        </div>
      </div>
    );
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  /*  RENDER: ORDER CONFIRMED                                   */
  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  if (screen === 'confirm' && lastOrder) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Check size={48} className="text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Sent to Kitchen!</h2>
          <p className="text-gray-400 text-lg mb-2">Table {lastOrder.table_number} â€¢ {lastOrder.items.length} items</p>
          <p className="text-brand-pink font-mono font-bold text-xl mb-6">{lastOrder.id}</p>
          <p className="text-gray-600 text-sm">Returning to tables...</p>
        </div>
      </div>
    );
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  /*  RENDER: TABLE SELECTOR                                    */
  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  if (screen === 'tables') {
    return (
      <div className="min-h-screen bg-[#0f1117] pb-6">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0f1117]/95 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-pink/20 rounded-xl flex items-center justify-center">
              <Utensils size={18} className="text-brand-pink" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">{staff.name}</p>
              <p className="text-gray-500 text-[11px]">Order Taking Tab</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowVipModal(true)} className="flex items-center gap-1 bg-gradient-to-r from-brand-pink to-brand-electricPeach text-brand-obsidian px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-lg active:scale-95 transition-transform">
              <Gift size={14} /> VIP Sign Up
            </button>
            <button onClick={() => setStaff(null)} className="text-gray-500 hover:text-red-400 transition-colors p-2">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Table Grid */}
        <div className="px-4 pt-6">
          <h2 className="text-white font-bold text-lg mb-4">Select Table</h2>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: NUM_TABLES }, (_, i) => i + 1).map(num => {
              const activeOrders = tableOrders[num] || [];
              const isOccupied = activeOrders.length > 0;
              const totalItems = activeOrders.reduce((s, o) => s + (o.items?.length || 0), 0);

              return (
                <button
                  key={num}
                  onClick={() => { setSelectedTable(num); setScreen('menu'); }}
                  className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 font-bold transition-all active:scale-95 border-2 ${
                    isOccupied
                      ? 'bg-brand-pink/10 border-brand-pink/40 text-brand-pink'
                      : 'bg-gray-800/60 border-transparent text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <span className="text-2xl font-black">{num}</span>
                  {isOccupied ? (
                    <span className="text-[10px] text-brand-pink/60 font-bold">{totalItems} items</span>
                  ) : (
                    <span className="text-[10px] text-gray-600">Available</span>
                  )}
                  {isOccupied && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-pink rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active orders summary */}
        {Object.keys(tableOrders).length > 0 && (
          <div className="px-4 mt-8">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Active Tables</h3>
            <div className="space-y-2">
              {Object.entries(tableOrders).map(([table, orders]) => (
                <div key={table} className="bg-gray-800/40 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-pink/20 rounded-lg flex items-center justify-center text-brand-pink font-bold text-sm">{table}</div>
                    <div>
                      <p className="text-white text-sm font-bold">{orders.length} order{orders.length > 1 ? 's' : ''}</p>
                      <p className="text-gray-500 text-[11px]">{orders.map(o => o.status).join(', ')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedTable(parseInt(table)); setScreen('menu'); }}
                    className="text-brand-pink text-xs font-bold"
                  >
                    Add â†’
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  /*  RENDER: MENU + CART (Order-taking screen)                 */
  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      {/* â”€â”€â”€ Top Bar â”€â”€â”€ */}
      <div className="sticky top-0 z-50 bg-[#0f1117]/95 backdrop-blur-xl border-b border-white/5 px-3 py-2.5 flex items-center justify-between">
        <button onClick={() => { setScreen('tables'); setCart([]); }} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-bold">Tables</span>
        </button>
        <div className="flex items-center gap-2 bg-brand-pink/10 px-3 py-1.5 rounded-full">
          <Utensils size={14} className="text-brand-pink" />
          <span className="text-brand-pink font-bold text-sm">Table {selectedTable}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowVipModal(true)} className="flex items-center gap-1 bg-gradient-to-r from-brand-pink to-brand-electricPeach text-brand-obsidian px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-lg active:scale-95 transition-transform">
            <Gift size={14} /> VIP Sign Up
          </button>
          <button onClick={() => setStaff(null)} className="text-gray-500 p-2">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* â”€â”€â”€ Category Tabs â”€â”€â”€ */}
      <div className="flex gap-2 px-3 py-3 overflow-x-auto no-scrollbar">
        {dynamicCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 flex-shrink-0 ${
              activeCategory === cat.id
                ? 'bg-brand-pink text-white'
                : 'bg-gray-800/60 text-gray-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* â”€â”€â”€ Menu Items Grid â”€â”€â”€ */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="grid grid-cols-2 gap-2.5">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleItemTap(item)}
              className="bg-gray-800/50 rounded-2xl p-3 text-left transition-all active:scale-[0.97] hover:bg-gray-800/80 border border-transparent hover:border-gray-700/50"
            >
              {item.image && (
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-gray-900">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy"  onError={(e: any) => { e.target.onerror = null; e.target.src = '/assets/placeholder.png'; }} />
                </div>
              )}
              <p className="text-white font-bold text-sm leading-snug mb-1">{item.name}</p>
              <p className="text-brand-pink font-bold text-base">Â£{item.price.toFixed(2)}</p>
            </button>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-2 py-12 text-center text-gray-600 text-sm">No items in this category</div>
          )}
        </div>
      </div>

      {/* â”€â”€â”€ Cart Summary (fixed bottom) â”€â”€â”€ */}
      {cart.length > 0 && (
        <div ref={cartRef} className="sticky bottom-0 bg-[#151821] border-t border-white/5 px-3 pt-3 pb-4 safe-area-bottom">
          {/* Cart items (scrollable if many) */}
          <div className="max-h-40 overflow-y-auto mb-3 space-y-1.5">
            {cart.map(item => (
              <div key={item._cartKey} className="flex items-center justify-between bg-gray-800/40 rounded-xl px-3 py-2">
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-white text-sm font-bold truncate">{item.name}</p>
                  {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                    <p className="text-gray-500 text-[10px] truncate">{Object.values(item.modifiers).join(' Â· ')}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => updateQty(item._cartKey, -1)} className="w-7 h-7 rounded-lg bg-gray-700 text-white flex items-center justify-center active:scale-90">
                    <Minus size={14} />
                  </button>
                  <span className="text-white font-bold text-sm w-5 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item._cartKey, 1)} className="w-7 h-7 rounded-lg bg-gray-700 text-white flex items-center justify-center active:scale-90">
                    <Plus size={14} />
                  </button>
                  <span className="text-gray-400 text-sm font-bold w-14 text-right">Â£{(item.price * item.qty).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1 mb-1">
              <span className="text-gray-400 text-sm font-bold">Total:</span>
              <span className="text-white text-lg font-black tracking-wider">Â£{cartTotal.toFixed(2)}</span>
            </div>
            
            <button
              onClick={() => submitOrder(false)}
              disabled={submitting}
              className="w-full py-3 bg-brand-pink hover:bg-brand-pink/80 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  Send Unpaid
                </>
              )}
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => submitOrder(true, 'Cash')}
                disabled={submitting}
                className="w-full py-3 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 font-bold text-sm rounded-xl flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Paid (Cash)
              </button>
              <button
                onClick={() => submitOrder(true, 'Card')}
                disabled={submitting}
                className="w-full py-3 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 font-bold text-sm rounded-xl flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Paid (Card)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€â”€ Modifier Picker Modal â”€â”€â”€ */}
      {modPicker && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-end justify-center p-0 sm:items-center sm:p-4" onClick={() => setModPicker(null)}>
          <div className="bg-[#1a1d2a] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">{modPicker.name}</h3>
              <button onClick={() => setModPicker(null)} className="text-gray-500 p-1"><X size={20} /></button>
            </div>

            {ITEM_MODIFIERS[modPicker.name]?.map(mod => (
              <div key={mod.name} className="mb-4">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{mod.name}</p>
                <div className="flex gap-2">
                  {mod.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setModSelections(prev => ({ ...prev, [mod.name]: opt }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                        modSelections[mod.name] === opt
                          ? 'bg-brand-pink text-white'
                          : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                addToCart(modPicker, modSelections);
                setModPicker(null);
              }}
              className="w-full mt-2 py-4 bg-green-500 text-white font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add to Order â€¢ Â£{modPicker.price.toFixed(2)}
            </button>
          </div>
        </div>
      )}

      {/* â”€â”€â”€ VIP Signup Modal â”€â”€â”€ */}
      {showVipModal && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowVipModal(false)}>
          <div className="bg-[#1a1d2a] w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl safe-area-bottom" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-2xl font-bold flex items-center gap-2"><Gift className="text-brand-electricPeach"/> VIP Club</h3>
              <button onClick={() => setShowVipModal(false)} className="text-gray-500 p-1"><X size={24} /></button>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Earn <span className="text-brand-electricPeach font-bold">1 Point</span> for this signup! Offer the customer early access & 50% off new items.
            </p>

            <form onSubmit={handleVipSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">Full Name</label>
                <input
                  autoFocus
                  type="text"
                  required
                  value={vipForm.name}
                  onChange={e => setVipForm({...vipForm, name: e.target.value})}
                  placeholder="e.g. Sarah J."
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-brand-electricPeach transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">Email Address <span className="text-brand-electricPeach">*</span></label>
                <input
                  type="email"
                  value={vipForm.email}
                  onChange={e => setVipForm({...vipForm, email: e.target.value})}
                  placeholder="sarah@example.com"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-brand-electricPeach transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={vipForm.phone}
                  onChange={e => setVipForm({...vipForm, phone: e.target.value})}
                  placeholder="07..."
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-brand-electricPeach transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={vipSubmitting || (!vipForm.email && !vipForm.phone) || !vipForm.name}
                className="w-full py-4 mt-2 bg-brand-pink hover:bg-brand-pink/90 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {vipSubmitting ? 'Saving...' : 'Save Customer & Earn Point'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Utility styles */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .safe-area-bottom { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
      `}</style>
    </div>
  );
};
