import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SHOP_CONFIG } from '../shopConfig';
import { Clock, LogIn, LogOut, Calendar, User, ChevronLeft, ChevronRight, AlertTriangle, Check, Download } from 'lucide-react';
import { getMenuItems } from '../services/menuService';
import { MenuItem } from '../types';
import { exportTimesheets } from '../services/staffService';
import { useIdleTimeout } from '../hooks/useIdleTimeout';

const getWeekId = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
};

const getWeekDates = (weekId: string) => {
  const [year, weekStr] = weekId.split('-W');
  const jan4 = new Date(parseInt(year), 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (parseInt(weekStr) - 1) * 7);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const StaffPortal = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [loggedInStaff, setLoggedInStaff] = useState<any>(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeShift, setActiveShift] = useState<any>(null);
  const [shiftHistory, setShiftHistory] = useState<any[]>([]);
  const [weeklyRota, setWeeklyRota] = useState<Record<string, string>>({});
  const [currentWeekId, setCurrentWeekId] = useState(getWeekId(new Date()));

  // 86 Board state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [soldOutItems, setSoldOutItems] = useState<string[]>([]);
  const [toggling, setToggling] = useState<string | null>(null);
  const [show86Board, setShow86Board] = useState(false);

  const TENANT_ID = SHOP_CONFIG.tenant_id;

  useIdleTimeout({
    onIdle: () => {
      if (loggedInStaff) {
        console.log('[IdleTimeout] Staff session expired. Logging out.');
        setLoggedInStaff(null);
        setPin('');
      }
    },
    idleTime: 180000, // 3 minutes
    isActive: !!loggedInStaff
  });

  // State polling function
  const fetchDashboardData = async () => {
    if (!loggedInStaff) return;
    try {
      // 1. Fetch Active Shift
      const activeRes = await fetch(`/api/v1/shifts/active`, {
        headers: { 'X-Store-ID': TENANT_ID }
      });
      if (activeRes.ok) {
        const shifts = await activeRes.json();
        const myActive = shifts.find((s: any) => s.staffId === loggedInStaff.id);
        setActiveShift(myActive || null);
      }

      // 2. Fetch Shift History
      const histRes = await fetch(`/api/v1/shifts/history?staffId=${loggedInStaff.id}&limit=14`, {
        headers: { 'X-Store-ID': TENANT_ID }
      });
      if (histRes.ok) {
        const history = await histRes.json();
        setShiftHistory(history || []);
      }

      // 3. Fetch Rota
      // Calculate start and end string for the current week
      const dates = getWeekDates(currentWeekId);
      const fromStr = dates[0].toISOString().split('T')[0];
      const toStr = dates[6].toISOString().split('T')[0];
      
      const rotaRes = await fetch(`/api/v1/rota?from=${fromStr}&to=${toStr}`, {
        headers: { 'X-Store-ID': TENANT_ID }
      });
      if (rotaRes.ok) {
        const rotaData = await rotaRes.json();
        const myShifts: Record<string, string> = {};
        rotaData.forEach((entry: any) => {
          if (entry.staff_id === loggedInStaff.id) {
            const dayName = new Date(entry.day).toLocaleDateString('en-GB', { weekday: 'short' }).toLowerCase();
            myShifts[dayName] = `${entry.start_time}-${entry.end_time}`;
          }
        });
        setWeeklyRota(myShifts);
      }

      // 4. Fetch 86 Board
      const menuRes = await fetch(`/api/v1/menu/sold-out`, {
        headers: { 'X-Store-ID': TENANT_ID }
      });
      if (menuRes.ok) {
        const soldOut = await menuRes.json();
        setSoldOutItems(soldOut || []);
      }

    } catch (e) {
      console.error('Failed to fetch dashboard data', e);
    }
  };

  useEffect(() => {
    if (!loggedInStaff) return;
    
    getMenuItems().then(items => setMenuItems(items));
    
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [loggedInStaff, currentWeekId, TENANT_ID]);

  const toggle86 = async (itemId: string, isCurrently86d: boolean) => {
    setToggling(itemId);
    try {
      await fetch(`/api/v1/menu/sold-out`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Store-ID': TENANT_ID
        },
        body: JSON.stringify({ itemId, is86d: !isCurrently86d })
      });
      await fetchDashboardData(); // Rapid refresh
    } catch (e) {
      console.error('86 toggle failed:', e);
    }
    setToggling(null);
  };

  const handleLogin = async () => {
    if (pin.length !== 4) return;
    setMessage({ text: 'Verifying...', type: 'info' });
    try {
      const res = await fetch('/api/v1/shifts/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, storeId: TENANT_ID }),
      });
      if (!res.ok) {
        setMessage({ text: 'Invalid PIN', type: 'error' });
        setPin('');
        return;
      }
      const staffData = await res.json();
      setLoggedInStaff(staffData);
      setMessage({ text: '', type: '' });
      setPin('');
    } catch (e) {
      setMessage({ text: 'Connection error', type: 'error' });
      setPin('');
    }
  };

  const handleClockIn = async () => {
    if (!loggedInStaff) return;
    try {
      const res = await fetch('/api/v1/shifts/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: loggedInStaff.pin, storeId: TENANT_ID }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('Clock in failed:', err.message);
      }
      // The real-time Firestore listener will update the UI automatically
    } catch (e) {
      console.error('Clock in failed:', e);
    }
  };

  const handleClockOut = async () => {
    if (!activeShift || !loggedInStaff) return;
    try {
      const res = await fetch('/api/v1/shifts/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: loggedInStaff.pin, storeId: TENANT_ID }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('Clock out failed:', err.message);
      }
      // The real-time Firestore listener will update the UI automatically
    } catch (e) {
      console.error('Clock out failed:', e);
    }
  };

  // ─── PIN Login Screen ───
  if (!loggedInStaff) {
    return (
      <div className="min-h-screen bg-pine flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10 relative">
            <button 
               onClick={() => navigate('/admin')}
               className="absolute -top-4 -left-4 flex items-center gap-2 text-white/50 hover:text-terracotta transition-colors font-bold text-sm bg-white/5 px-4 py-2 rounded-full"
            >
              <ChevronLeft size={16} /> POS
            </button>
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-terracotta to-terracotta-light rounded-3xl flex items-center justify-center shadow-lg">
              <User size={36} className="text-white" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-white mb-2">Staff Portal</h1>
            <p className="text-white/40 text-sm font-medium">Taste of Village</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10">
            <p className="text-white/50 text-xs uppercase tracking-widest text-center mb-6 font-bold">Enter Your 4-Digit PIN</p>
            
            <div className="flex gap-3 justify-center mb-8">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all ${
                  pin.length > i ? 'bg-terracotta text-white' : 'bg-white/5 border border-white/10'
                }`}>
                  {pin.length > i ? '•' : ''}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'GO'].map((btn, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (btn === 'C') setPin('');
                    else if (btn === 'GO') handleLogin();
                    else if (typeof btn === 'number' && pin.length < 4) setPin(p => p + btn);
                  }}
                  className={`h-14 rounded-2xl font-bold text-lg transition-all ${
                    btn === 'GO' ? 'bg-terracotta text-white' :
                    btn === 'C' ? 'bg-red-500/10 text-red-400' :
                    'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>

            {message.text && (
              <div className={`mt-6 text-center text-sm font-bold ${
                message.type === 'error' ? 'text-red-400' : 'text-white/60'
              }`}>
                {message.text}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Staff Dashboard ───
  const solveDate = (d: any) => {
    if (!d) return new Date();
    if (d.toDate) return d.toDate();
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const weekDates = getWeekDates(currentWeekId);
  const isThisWeek = currentWeekId === getWeekId(new Date());
  const shiftElapsed = activeShift ? Math.floor((Date.now() - solveDate(activeShift.clockIn).getTime()) / 60000) : 0;

  const sold86Count = (soldOutItems || []).length;

  return (
    <div className="min-h-screen bg-pine text-white px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center relative">
          <button 
             onClick={() => navigate('/admin')}
             className="absolute -top-8 -left-2 flex items-center gap-2 text-white/50 hover:text-terracotta transition-colors font-bold text-xs bg-white/5 px-3 py-1.5 rounded-full"
          >
            <ChevronLeft size={14} /> Back to POS
          </button>
          <div className="mt-4">
            <h1 className="text-2xl font-bold">Hey, {loggedInStaff?.name || 'Staff Member'} 👋</h1>
            <p className="text-white/40 text-sm capitalize">{loggedInStaff?.role || 'Staff'}</p>
          </div>
          <button onClick={() => setLoggedInStaff(null)} className="text-white/30 hover:text-white/60 text-sm font-bold transition-colors">
            Sign Out
          </button>
        </div>

        {/* Clock In/Out Card */}
        <div className={`rounded-[2rem] p-8 border transition-all ${
          activeShift ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                activeShift ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
              }`}>
                <Clock size={28} />
              </div>
              <div>
                <p className="font-bold text-lg">{activeShift ? 'On Shift' : 'Off Shift'}</p>
                {activeShift && (
                  <p className="text-green-400 text-sm font-bold">
                    {Math.floor(shiftElapsed / 60)}h {shiftElapsed % 60}m elapsed
                  </p>
                )}
              </div>
            </div>
          </div>

          {activeShift ? (
            <button
              onClick={handleClockOut}
              className="w-full py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3"
            >
              <LogOut size={20} /> Clock Out
            </button>
          ) : (
            <button
              onClick={handleClockIn}
              className="w-full py-4 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3"
            >
              <LogIn size={20} /> Clock In
            </button>
          )}
        </div>

        {/* ─── Manager Tools ─── */}
        {(loggedInStaff?.role === 'admin' || loggedInStaff?.role === 'manager') && (
          <div className="bg-terracotta/10 rounded-[2rem] p-6 border border-terracotta/30">
            <h2 className="font-bold text-lg mb-4 text-terracotta flex items-center gap-3">
              <User size={20} /> Manager Tools
            </h2>
            <button
              onClick={() => {
                const from = weekDates[0].toISOString().split('T')[0];
                const to = weekDates[6].toISOString().split('T')[0];
                exportTimesheets(from, to);
              }}
              className="w-full py-4 bg-terracotta text-white hover:bg-terracotta-light rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3"
            >
              <Download size={20} /> Download Weekly Payroll (CSV)
            </button>
          </div>
        )}

        {/* ─── 86 Board ─── */}
        <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10">
          <button
            onClick={() => setShow86Board(!show86Board)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sold86Count > 0 ? 'bg-red-500/20 text-red-400' : 'bg-terracotta/20 text-terracotta'}`}>
                <AlertTriangle size={20} />
              </div>
              <div className="text-left">
                <h2 className="font-bold text-lg">86 Board</h2>
                <p className="text-white/40 text-xs">
                  {sold86Count > 0 ? `${sold86Count} item${sold86Count > 1 ? 's' : ''} sold out` : 'All items available'}
                </p>
              </div>
            </div>
            <div className={`text-white/40 transition-transform ${show86Board ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </button>

          {show86Board && (
            <div className="mt-6 space-y-2">
              {(menuItems || []).length === 0 ? (
                <p className="text-white/30 text-sm italic text-center py-4">Loading menu...</p>
              ) : (
                menuItems.map(item => {
                  const is86d = (soldOutItems || []).includes(item.id);
                  const isToggling = toggling === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle86(item.id, is86d)}
                      disabled={isToggling}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                        is86d
                          ? 'bg-red-500/15 border border-red-500/30'
                          : 'bg-white/[0.03] border border-transparent hover:bg-white/[0.06]'
                      } ${isToggling ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <img
                          src={item.image || '/assets/placeholder.png'}
                          className={`w-10 h-10 rounded-xl object-cover ${is86d ? 'grayscale opacity-50' : ''}`}
                          alt=""
                        />
                        <div>
                          <p className={`font-bold text-sm ${is86d ? 'line-through text-white/40' : ''}`}>
                            {item.name}
                          </p>
                          <p className="text-white/30 text-[10px] uppercase tracking-widest">{item.category}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        is86d
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {isToggling ? '...' : is86d ? '✓ RESTORE' : '86 IT'}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Weekly Rota */}
        <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-terracotta" />
              <h2 className="font-bold text-lg">My Rota</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => {
                const d = weekDates[0];
                d.setDate(d.getDate() - 7);
                setCurrentWeekId(getWeekId(d));
              }} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-bold text-white/60 min-w-[80px] text-center">
                {isThisWeek ? 'This Week' : currentWeekId}
              </span>
              <button onClick={() => {
                const d = weekDates[0];
                d.setDate(d.getDate() + 7);
                setCurrentWeekId(getWeekId(d));
              }} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day, i) => {
              const date = weekDates[i];
              const shift = (weeklyRota || {})[day.toLowerCase()];
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div key={day} className={`text-center p-3 rounded-xl transition-colors ${
                  isToday ? 'bg-terracotta/20 border border-terracotta/30' : 'bg-white/[0.03]'
                }`}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{day}</p>
                  <p className="text-xs font-bold mb-2">{date.getDate()}</p>
                  {shift ? (
                    <p className="text-[10px] font-bold text-green-400 bg-green-500/10 rounded-lg py-1 px-1">{shift}</p>
                  ) : (
                    <p className="text-[10px] text-white/20">—</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Shift History */}
        <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-3">
            <Clock size={20} className="text-terracotta" /> Recent Shifts
          </h2>
          <div className="space-y-2">
            {(shiftHistory || []).length === 0 ? (
              <p className="text-white/30 text-sm italic text-center py-6">No shift history yet.</p>
            ) : (
              shiftHistory.filter(s => s.status === 'completed').slice(0, 10).map(shift => {
                const clockIn = solveDate(shift.clockIn);
                const clockOut = solveDate(shift.clockOut);
                const duration = Math.floor((clockOut.getTime() - clockIn.getTime()) / 60000);
                return (
                  <div key={shift.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                    <div>
                      <p className="font-bold text-sm">{clockIn.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}</p>
                      <p className="text-white/40 text-xs">
                        {clockIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {clockOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-terracotta font-black text-sm">{Math.floor(duration / 60)}h {duration % 60}m</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
