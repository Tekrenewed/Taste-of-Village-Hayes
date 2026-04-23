import React from 'react';
import { Phone } from 'lucide-react';

interface BookingsPanelProps {
  bookings: any[];
  posDarkMode: boolean;
  updateBookingStatus: (id: string, status: string) => void;
}

export const BookingsPanel: React.FC<BookingsPanelProps> = ({ 
  bookings, 
  posDarkMode, 
  updateBookingStatus 
}) => {
  const sortedBookings = [...bookings].sort((a,b) => {
    const da = new Date(`${a.date} ${a.time}`).getTime() || 0;
    const db2 = new Date(`${b.date} ${b.time}`).getTime() || 0;
    return db2 - da;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold">Table Reservations</h2>
        <div className="flex gap-4">
          <div className={`px-5 py-2 rounded-full text-xs font-bold ${posDarkMode ? 'glass-pine text-terracotta' : 'bg-pine/5 text-pine'}`}>
            Total: {bookings.length}
          </div>
          <div className={`px-5 py-2 rounded-full text-xs font-bold ${posDarkMode ? 'glass-pine text-terracotta' : 'bg-pine/5 text-pine'}`}>
            Pending: {bookings.filter(b => b.status === 'PENDING' || b.status === 'pending').length}
          </div>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-4">
        {sortedBookings.map(booking => (
          <div key={booking.id} className={`rounded-3xl p-5 space-y-4 ${posDarkMode ? 'pine-card' : 'bg-white border border-pine/5 shadow-sm'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg">{booking.customerName || (booking as any).name || 'Guest'}</p>
                <p className={`text-xs ${posDarkMode ? 'text-cream/40' : 'text-pine/40'}`}>{booking.customerPhone || (booking as any).phone}</p>
                {(booking.email || (booking as any).customerEmail) && (
                  <p className={`text-xs ${posDarkMode ? 'text-cream/40' : 'text-pine/40'}`}>{booking.email || (booking as any).customerEmail}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                (booking.status === 'CONFIRMED' || booking.status === 'confirmed') ? 'bg-green-500/10 border-green-500/30 text-green-500' :
                (booking.status === 'PENDING' || booking.status === 'pending') ? 'bg-terracotta/10 border-terracotta/30 text-terracotta' :
                (booking.status === 'CANCELLED' || booking.status === 'cancelled') ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}>{booking.status}</span>
            </div>
            <div className={`flex gap-4 text-sm ${posDarkMode ? 'text-cream/60' : 'text-pine/60'}`}>
              <span>{new Date(booking.date).toLocaleDateString()} • {booking.time}</span>
              <span className="font-bold">{booking.guests} covers</span>
            </div>
            <div className="flex gap-2">
              {(booking.status === 'PENDING' || booking.status === 'pending') && (
                <button onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')} className="flex-1 py-2.5 bg-green-500/10 text-green-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-500/20">Confirm</button>
              )}
              {(booking.status === 'CONFIRMED' || booking.status === 'confirmed') && (
                <button onClick={() => updateBookingStatus(booking.id, 'ARRIVED')} className="flex-1 py-2.5 bg-blue-500/10 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20">Seated</button>
              )}
              {booking.status !== 'CANCELLED' && booking.status !== 'cancelled' && booking.status !== 'ARRIVED' && (
                <button onClick={() => updateBookingStatus(booking.id, 'CANCELLED')} className="py-2.5 px-4 bg-red-500/10 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20">Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className={`hidden md:block rounded-[3rem] overflow-hidden border ${posDarkMode ? 'pine-card border-white/5' : 'bg-white border-pine/5 shadow-sm'}`}>
        <table className="w-full text-left">
          <thead className={`border-b ${posDarkMode ? 'bg-white/5 border-white/5' : 'bg-pine/[0.02] border-pine/5'}`}>
            <tr>
              <th className={`p-6 text-[10px] font-black uppercase tracking-widest ${posDarkMode ? 'text-cream/30' : 'text-pine/30'}`}>Guest</th>
              <th className={`p-6 text-[10px] font-black uppercase tracking-widest ${posDarkMode ? 'text-cream/30' : 'text-pine/30'}`}>Contact</th>
              <th className={`p-6 text-[10px] font-black uppercase tracking-widest ${posDarkMode ? 'text-cream/30' : 'text-pine/30'}`}>Date & Time</th>
              <th className={`p-6 text-[10px] font-black uppercase tracking-widest text-center ${posDarkMode ? 'text-cream/30' : 'text-pine/30'}`}>Covers</th>
              <th className={`p-6 text-[10px] font-black uppercase tracking-widest ${posDarkMode ? 'text-cream/30' : 'text-pine/30'}`}>Status</th>
              <th className={`p-6 text-[10px} font-black uppercase tracking-widest text-right ${posDarkMode ? 'text-cream/30' : 'text-pine/30'}`}>Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${posDarkMode ? 'divide-white/5' : 'divide-pine/5'}`}>
            {sortedBookings.map(booking => (
              <tr key={booking.id} className={`transition-colors group ${posDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-pine/[0.01]'}`}>
                <td className="p-6">
                  <p className="font-bold text-lg">{booking.customerName || (booking as any).name || 'Guest'}</p>
                </td>
                <td className="p-6">
                  <div className="space-y-1">
                    <p className={`text-sm font-medium flex items-center gap-2 ${posDarkMode ? 'text-cream/70' : 'text-pine/70'}`}>
                      <Phone size={12} className="shrink-0"/> {booking.customerPhone || (booking as any).phone || '--'}
                    </p>
                    {(booking.email || (booking as any).customerEmail) && (
                      <p className={`text-xs flex items-center gap-2 ${posDarkMode ? 'text-cream/40' : 'text-pine/40'}`}>
                        <span className="shrink-0">✉️</span> {booking.email || (booking as any).customerEmail}
                      </p>
                    )}
                  </div>
                </td>
                <td className="p-6">
                  <p className="font-bold text-sm">{new Date(booking.date).toLocaleDateString()}</p>
                  <p className="text-xs text-terracotta font-black tracking-widest">{booking.time}</p>
                </td>
                <td className={`p-6 text-center font-black text-xl ${posDarkMode ? 'text-cream/60' : 'text-pine/60'}`}>{booking.guests}</td>
                <td className="p-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    (booking.status === 'CONFIRMED' || booking.status === 'confirmed') ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                    (booking.status === 'PENDING' || booking.status === 'pending') ? 'bg-terracotta/10 border-terracotta/30 text-terracotta' :
                    (booking.status === 'CANCELLED' || booking.status === 'cancelled') ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                    'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="p-6 text-right space-x-2">
                  {(booking.status === 'PENDING' || booking.status === 'pending') && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${posDarkMode ? 'glass-pine hover:border-green-500/50' : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'}`}
                    >
                      Confirm
                    </button>
                  )}
                  {(booking.status === 'CONFIRMED' || booking.status === 'confirmed') && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'ARRIVED')}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${posDarkMode ? 'glass-pine hover:border-blue-500/50' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'}`}
                    >
                      Seated
                    </button>
                  )}
                  {booking.status !== 'CANCELLED' && booking.status !== 'cancelled' && booking.status !== 'ARRIVED' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400/50 hover:text-red-400 transition-all ${posDarkMode ? 'glass-pine hover:border-red-500/50' : 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'}`}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
