import React from 'react';
import { Clock, User, Users, Plus, Star, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface StaffPanelProps {
  staffPin: string;
  setStaffPin: (v: string) => void;
  staffMessage: { text: string; type: string };
  setStaffMessage: (v: { text: string; type: string }) => void;
  activeShifts: any[];
  staffList: any[];
  showStaffForm: boolean;
  setShowStaffForm: (v: boolean) => void;
  newStaffName: string;
  setNewStaffName: (v: string) => void;
  newStaffPin: string;
  setNewStaffPin: (v: string) => void;
  newStaffRole: string;
  setNewStaffRole: (v: string) => void;
  rotaData: Record<string, string>;
  rotaWeekId: string;
  setRotaWeekId: (v: string) => void;
  updateShift: (staffId: string, day: string, val: string) => void;
  downloadTimesheet: (range: { from: string; to: string }) => void;
  loadingRota?: boolean;
}

export const StaffPanel: React.FC<StaffPanelProps> = ({
  staffPin, setStaffPin, staffMessage, setStaffMessage,
  activeShifts, staffList, showStaffForm, setShowStaffForm,
  newStaffName, setNewStaffName, newStaffPin, setNewStaffPin,
  newStaffRole, setNewStaffRole, rotaWeekId, setRotaWeekId,
  rotaData, updateShift, downloadTimesheet, loadingRota,
}) => {
  return (
    <div className="space-y-10">
      <h2 className="font-display text-4xl font-bold">Staff Rota & Shift Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Clock IN/OUT Numpad */}
        <div className="pine-card p-8 rounded-[3rem] flex flex-col items-center">
          <h3 className="font-display text-2xl font-bold mb-2">Secure Terminal</h3>
          <p className="text-xs text-creamMuted uppercase tracking-widest mb-6">Enter 4-Digit Staff PIN</p>
          
          {/* PIN Display */}
          <div className="flex gap-3 mb-6">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold ${staffPin.length > i ? 'bg-terracotta text-pine' : 'bg-white/5 border border-white/10'}`}>
                {staffPin.length > i ? '•' : ''}
              </div>
            ))}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map((btn, i) => (
              <button
                key={i}
                onClick={async () => {
                  if (btn === 'C') setStaffPin('');
                  else if (btn === 'OK' && staffPin.length === 4) {
                    setStaffMessage({ text: 'Processing...', type: 'info' });
                    try {
                      const { clockShift } = await import('../../services/staffService');
                      const result = await clockShift(staffPin);
                      
                      if (result.action === 'clocked_in') {
                        setStaffMessage({ text: `Clocked IN: ${result.name}`, type: 'success' });
                      } else {
                        setStaffMessage({ text: `Clocked OUT: ${result.name}`, type: 'success' });
                      }
                      setStaffPin('');
                      setTimeout(() => setStaffMessage({ text: '', type: '' }), 5000);
                    } catch(e) {
                      console.error('Staff clock error:', e);
                      setStaffMessage({ text: 'Connection Error', type: 'error' });
                      setStaffPin('');
                    }
                  }
                  else if (typeof btn === 'number' && staffPin.length < 4) {
                    setStaffPin(staffPin + btn);
                  }
                }}
                className={`h-14 rounded-2xl font-bold text-xl transition-all ${
                  btn === 'OK' ? 'bg-terracotta text-pine disabled:opacity-30' : 
                  btn === 'C' ? 'bg-red-500/10 text-red-400' : 
                  'bg-white/5 hover:bg-white/10'
                }`}
              >
                {btn}
              </button>
            ))}
          </div>
          
          {staffMessage.text && (
            <div className={`mt-6 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest ${
              staffMessage.type === 'success' ? 'bg-green-500/20 text-green-400' :
              staffMessage.type === 'error' ? 'bg-red-500/20 text-red-400' :
              'bg-white/10 text-white'
            }`}>
              {staffMessage.text}
            </div>
          )}
        </div>

        {/* Live Rota */}
        <div className="pine-card p-8 rounded-[3rem] relative overflow-hidden">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 glass-pine text-terracotta rounded-2xl flex items-center justify-center warm-glow"><Clock size={22} /></div>
            <div>
              <h3 className="font-bold text-xl tracking-tighter">Live Rota</h3>
              <p className="text-[10px] font-black text-cream/30 uppercase tracking-[4px]">{activeShifts.length} on shift</p>
            </div>
          </div>
          <div className="space-y-3">
            {activeShifts.length === 0 ? (
              <p className="text-creamMuted text-sm font-semibold italic border-2 border-dashed border-white/5 p-6 rounded-2xl text-center">
                No staff currently clocked in.
              </p>
            ) : (
              activeShifts.map(shift => {
                const clockedIn = shift.clockIn?.toDate ? shift.clockIn.toDate() : new Date(shift.clockIn);
                const elapsed = Math.floor((Date.now() - clockedIn.getTime()) / 60000);
                const hrs = Math.floor(elapsed / 60);
                const mins = elapsed % 60;
                return (
                  <div key={shift.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <User size={18} className="text-green-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{shift.name}</p>
                        <p className="text-[10px] text-creamMuted">Clocked in {clockedIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-terracotta font-black text-sm">{hrs}h {mins}m</p>
                      <p className="text-[9px] text-green-400 font-black uppercase tracking-widest">Active</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Staff Registry */}
        <div className="pine-card p-8 rounded-[3rem]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 glass-pine text-terracotta rounded-2xl flex items-center justify-center"><Users size={22} /></div>
              <div>
                <h3 className="font-bold text-xl tracking-tighter">Team Registry</h3>
                <p className="text-[10px] font-black text-cream/30 uppercase tracking-[4px]">{staffList.length} members</p>
              </div>
            </div>
            <button 
              onClick={() => setShowStaffForm(!showStaffForm)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showStaffForm ? 'bg-red-500/20 text-red-400 rotate-45' : 'bg-terracotta/20 text-terracotta'}`}
            >
              <Plus size={20} />
            </button>
          </div>

          {showStaffForm && (
            <div className="mb-6 p-5 rounded-2xl bg-white/5 space-y-3">
              <input type="text" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} placeholder="Full Name"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-terracotta outline-none transition-colors" />
              <input type="text" value={newStaffPin} onChange={e => { if (/^\d{0,4}$/.test(e.target.value)) setNewStaffPin(e.target.value); }} placeholder="4-Digit PIN" maxLength={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-mono tracking-[8px] text-center focus:border-terracotta outline-none transition-colors" />
              <select value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-terracotta outline-none transition-colors">
                <option value="staff">Staff</option>
                <option value="supervisor">Supervisor</option>
                <option value="manager">Manager</option>
              </select>
              <button
                disabled={!newStaffName.trim() || newStaffPin.length !== 4}
                onClick={async () => {
                  try {
                    const res = await fetch('/api/v1/staff', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: newStaffName.trim(), pin: newStaffPin, role: newStaffRole }),
                    });
                    if (!res.ok) {
                      const err = await res.json().catch(() => ({ message: 'Failed to add staff' }));
                      alert(err.message || 'Failed to add staff member.');
                      return;
                    }
                    setNewStaffName(''); setNewStaffPin(''); setNewStaffRole('staff'); setShowStaffForm(false);
                  } catch (e) { console.error('Failed to add staff:', e); alert('Failed to add staff member.'); }
                }}
                className="w-full py-3 bg-terracotta text-pine rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-30 hover:scale-[1.02] transition-all"
              >
                Register Staff Member
              </button>
            </div>
          )}

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {staffList.length === 0 ? (
              <p className="text-creamMuted text-sm italic text-center p-6 border-2 border-dashed border-white/5 rounded-2xl">
                No staff registered. Tap + to add your first team member.
              </p>
            ) : (
              staffList.map(member => {
                const isOnShift = activeShifts.some(s => s.staffId === member.id);
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isOnShift ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-creamMuted'}`}>
                        {member.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{member.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-creamMuted uppercase tracking-widest">{member.role}</span>
                          {isOnShift && <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">ON SHIFT</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={async () => { if (!confirm(`Remove ${member.name} from the team?`)) return; try { await fetch(`/api/v1/staff/${member.id}`, { method: 'DELETE' }); } catch (e) { console.error('Failed to remove staff:', e); } }}
                      className="opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400 transition-all p-2">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Gamification Leaderboard */}
        <div className="pine-card p-8 rounded-[3rem] bg-gradient-to-br from-[#1a1d2a] to-terracotta/5 relative overflow-hidden border border-terracotta/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg rounded-2xl flex items-center justify-center">
                <Star className="text-white fill-white" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-xl tracking-tighter text-terracotta">Leaderboard</h3>
                <p className="text-[10px] font-black text-cream/50 uppercase tracking-[2px]">VIP Club Signups</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {staffList.filter(s => s.points > 0).sort((a: any, b: any) => (b.points || 0) - (a.points || 0)).length === 0 ? (
              <p className="text-terracotta/50 text-sm font-semibold italic border-2 border-dashed border-terracotta/10 p-6 rounded-2xl text-center">
                No points earned yet. Tell your team to capture VIP emails!
              </p>
            ) : (
              staffList.filter(s => s.points > 0).sort((a: any, b: any) => (b.points || 0) - (a.points || 0)).slice(0, 5).map((member: any, idx: number) => {
                const isFirst = idx === 0;
                const isSecond = idx === 1;
                const isThird = idx === 2;
                return (
                  <div key={member.id} className={`flex items-center justify-between p-4 rounded-2xl transition-all ${isFirst ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-white/5 border border-transparent hover:border-white/10'}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-black opacity-80">
                        {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : <span className="text-white/20 text-base ml-2">#{idx + 1}</span>}
                      </span>
                      <div>
                        <p className={`font-bold ${isFirst ? 'text-yellow-400 text-base' : 'text-sm'}`}>{member.name}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-1">
                      <span className={`font-black tracking-widest ${isFirst ? 'text-yellow-400 text-xl' : 'text-terracotta text-lg'}`}>{member.points || 0}</span>
                      <span className="text-[9px] uppercase tracking-widest text-[#F0E6D6]/30 font-bold">pts</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
      </div>

      {/* Weekly Rota Planner */}
      <div className="pine-card p-8 rounded-[3rem] mt-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 glass-pine text-terracotta rounded-2xl flex items-center justify-center"><Calendar size={22} /></div>
            <div>
              <h3 className="font-bold text-xl tracking-tighter">Weekly Rota Planner</h3>
              <p className="text-[10px] font-black text-cream/30 uppercase tracking-[4px]">Manager & Owner Only</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
               onClick={() => {
                 const from = prompt("Enter Start Date (YYYY-MM-DD)", new Date().toISOString().split('T')[0]);
                 const to = prompt("Enter End Date (YYYY-MM-DD)", new Date().toISOString().split('T')[0]);
                 if (from && to) downloadTimesheet({ from, to });
               }}
               className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mr-2"
            >
              Export Payroll
            </button>
            <button onClick={() => {
              const [yr, wk] = rotaWeekId.split('-W').map(Number);
              let newWk = wk - 1;
              let newYr = yr;
              if (newWk < 1) { newYr--; newWk = 52; }
              setRotaWeekId(`${newYr}-W${String(newWk).padStart(2, '0')}`);
            }} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ChevronLeft size={18} /></button>
            <span className="text-sm font-bold text-white/60 min-w-[90px] text-center">{rotaWeekId}</span>
            <button onClick={() => {
              const [yr, wk] = rotaWeekId.split('-W').map(Number);
              let newWk = wk + 1;
              let newYr = yr;
              if (newWk > 52) { newYr++; newWk = 1; }
              setRotaWeekId(`${newYr}-W${String(newWk).padStart(2, '0')}`);
            }} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ChevronRight size={18} /></button>
          </div>
        </div>

        {staffList.length === 0 ? (
          <p className="text-creamMuted text-sm italic text-center p-6 border-2 border-dashed border-white/5 rounded-2xl">Register staff members above to start planning shifts.</p>
        ) : (
          <div className="overflow-x-auto relative">
            {loadingRota && (
              <div className="absolute inset-0 bg-pine/40 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
                <div className="w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-3 text-creamMuted text-[10px] font-black uppercase tracking-widest w-[140px]">Staff</th>
                  {['mon','tue','wed','thu','fri','sat','sun'].map(day => (
                    <th key={day} className="p-3 text-center text-creamMuted text-[10px] font-black uppercase tracking-widest">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffList.map((member: any) => (
                  <tr key={member.id} className="border-t border-white/5">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-xs font-bold">{member.name?.charAt(0)?.toUpperCase()}</div>
                        <span className="font-bold text-sm truncate max-w-[100px]">{member.name}</span>
                      </div>
                    </td>
                    {['mon','tue','wed','thu','fri','sat','sun'].map(day => {
                      const key = `${member.id}_${day}`;
                      const val = rotaData[key] || '';
                      return (
                        <td key={day} className="p-1">
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              updateShift(member.id, day, newVal);
                            }}
                            placeholder="—"
                            className="w-full px-2 py-2 text-center text-xs bg-white/[0.03] border border-white/5 rounded-lg focus:border-terracotta outline-none transition-colors hover:bg-white/5"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-white/20 text-[10px] mt-4 text-center">Type shift times (e.g. "9-5", "OFF", "12-8") — saves automatically on blur</p>
          </div>
        )}
      </div>
    </div>
  );
};
