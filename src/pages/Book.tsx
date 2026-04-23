import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, MessageCircle, Phone, ShoppingBag, Plus, Minus, X, ChevronDown, CreditCard, Store } from 'lucide-react';
import { buildWhatsAppLink, SHOP_CONFIG } from '../shopConfig';
import { SEOHead } from '../components/SEOHead';
import { MENU_ITEMS } from '../constants';
import { MenuItem } from '../types';
import { isValidUKMobile, getPhoneError, normaliseUKPhone } from '../lib/validation';

function buildBookingWhatsAppMessage(booking: { name: string; phone: string; email?: string; date: string; time: string; guests: number; id: string; preOrderItems?: any[]; preOrderTotal?: number; paymentMethod?: string }) {
  const lines = [
    `📋 *NEW TABLE BOOKING — ${booking.id}*`,
    ``,
    `👤 *Name:* ${booking.name}`,
    `📞 *Phone:* ${booking.phone}`
  ];
  if (booking.email) lines.push(`📧 *Email:* ${booking.email}`);
  
  lines.push(
    `📅 *Date:* ${booking.date}`,
    `🕐 *Time:* ${booking.time}`,
    `👥 *Guests:* ${booking.guests}`,
  );

  // Pre-order items
  if (booking.preOrderItems && booking.preOrderItems.length > 0) {
    lines.push(``, `🍽️ *PRE-ORDER (ready on arrival):*`);
    booking.preOrderItems.forEach(item => {
      lines.push(`  • ${item.quantity}x ${item.name} — £${(item.price * item.quantity).toFixed(2)}`);
    });
    lines.push(`  *Total: £${booking.preOrderTotal?.toFixed(2)}*`);
    lines.push(`  💳 *Payment: ${booking.paymentMethod === 'online' ? 'Paid Online' : 'Pay at Counter'}*`);
  }

  lines.push(``, `⏰ Booked at: ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`);
  return lines.join('\n');
}

interface PreOrderItem extends MenuItem {
  quantity: number;
}

export const Book = () => {
  const { addBooking } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    guests: 2
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  
  // Pre-order state
  const [showPreOrder, setShowPreOrder] = useState(false);
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'store' | 'online'>('store');
  const [showMenuPicker, setShowMenuPicker] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const preOrderTotal = preOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addPreOrderItem = (item: MenuItem) => {
    setPreOrderItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removePreOrderItem = (id: string) => {
    setPreOrderItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item && item.quantity > 1) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const lastBookingTime = localStorage.getItem('last_booking_time');
    if (lastBookingTime && Date.now() - parseInt(lastBookingTime) < 60000) {
      alert('You are making requests too quickly. Please wait 60 seconds.');
      return;
    }

    // UK phone validation
    if (!isValidUKMobile(formData.phone)) {
      setPhoneError(getPhoneError(formData.phone) || 'Please enter a valid UK mobile number (07XXX XXXXXX)');
      setIsSubmitting(false);
      return;
    }
    setPhoneError(null);

    setIsSubmitting(true);
    try {
      const bookingId = `BK-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
      const booking: any = {
        id: bookingId,
        customerName: formData.name,
        customerPhone: normaliseUKPhone(formData.phone),
        email: formData.email || '',
        date: formData.date,
        time: formData.time,
        guests: formData.guests,
        status: 'PENDING' as const,
      };

      // Add pre-order if items selected
      if (preOrderItems.length > 0) {
        booking.preOrderItems = preOrderItems.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          category: i.category,
        }));
        booking.preOrderTotal = preOrderTotal;
        booking.paymentMethod = paymentMethod;
      }

      await addBooking(booking as any);
      setConfirmedBooking({ ...booking, ...formData, preOrderItems, preOrderTotal, paymentMethod });
      localStorage.setItem('last_booking_time', Date.now().toString());

      // WhatsApp notification
      const message = buildBookingWhatsAppMessage({
        ...formData,
        id: bookingId,
        preOrderItems: preOrderItems.length > 0 ? preOrderItems : undefined,
        preOrderTotal: preOrderTotal > 0 ? preOrderTotal : undefined,
        paymentMethod: paymentMethod,
      });
      const whatsappUrl = buildWhatsAppLink(message);
      window.open(whatsappUrl, '_blank');

      setFormData({ name: '', phone: '', email: '', date: '', time: '', guests: 2 });
      setPreOrderItems([]);
    } catch (e) {
      alert('Error booking table.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmed booking success screen
  if (confirmedBooking) {
    return (
      <div className="min-h-screen bg-brand-cacao flex items-center justify-center p-4">
        <SEOHead title="Booking Confirmed" description="Your table reservation has been submitted." />
        <div className="bg-white/90 backdrop-blur-md w-full max-w-lg p-8 rounded-3xl shadow-xl border border-brand-rose text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={40} />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-brand-text mb-2">Booking Sent!</h2>
            <p className="text-gray-600">Your reservation has been sent via WhatsApp. We'll confirm shortly.</p>
          </div>

          <div className="bg-brand-cacao p-4 rounded-2xl border border-brand-rose border-dashed space-y-1">
            <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Booking Reference</p>
            <p className="font-mono text-2xl font-black text-brand-text">{confirmedBooking.id}</p>
            <p className="text-sm text-brand-text/60 mt-2">
              {confirmedBooking.guests} guests • {confirmedBooking.date} • {confirmedBooking.time}
            </p>
          </div>

          {/* Pre-order summary */}
          {confirmedBooking.preOrderItems?.length > 0 && (
            <div className="bg-brand-cacao p-4 rounded-2xl border border-brand-rose/30 text-left">
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-3">🍽️ Pre-Order — Ready on Arrival</p>
              {confirmedBooking.preOrderItems.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span className="text-brand-text">{item.quantity}x {item.name}</span>
                  <span className="font-bold text-brand-text">£{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-brand-rose/30 mt-2 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>£{confirmedBooking.preOrderTotal?.toFixed(2)}</span>
              </div>
              <p className="text-xs text-brand-text/50 mt-2">
                {confirmedBooking.paymentMethod === 'online' ? '✅ Paid online' : '💳 Pay at counter on arrival'}
              </p>
            </div>
          )}

          <a
            href={buildWhatsAppLink(buildBookingWhatsAppMessage(confirmedBooking))}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-[#25D366] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:bg-[#20BD5A] transition-colors"
          >
            <MessageCircle size={24} /> Resend via WhatsApp
          </a>

          <button
            onClick={() => setConfirmedBooking(null)}
            className="w-full py-4 bg-brand-text text-white rounded-xl font-bold mt-2"
          >
            Book Another Table
          </button>
        </div>
      </div>
    );
  }

  // Available menu items for pre-ordering
  const preOrderMenuItems = MENU_ITEMS.filter(item => 
    ['taste-of-village', 'chaat', 'dessert'].includes(item.category)
  );

  return (
    <div className="min-h-screen bg-brand-cacao flex items-center justify-center p-4 py-24">
      <SEOHead 
        title="Book a Table" 
        description="Reserve your table at Taste of Village in Slough. Pre-order your food so it's ready when you arrive."
        canonicalUrl="/book"
      />
      <div className="bg-white/90 backdrop-blur-md w-full max-w-lg p-8 rounded-3xl shadow-xl border border-brand-rose">
        <h2 className="font-display text-3xl font-bold text-brand-text mb-2 text-center">Book a Table</h2>
        <p className="text-center text-brand-text/60 mb-8">Reserve your spot and optionally pre-order your food.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
            <input
              type="text" required
              className="w-full p-4 bg-white rounded-xl border border-brand-rose/30 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your Name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone (Required)</label>
              <input
                type="tel" required
                className={`w-full p-4 bg-white rounded-xl border focus:ring-2 outline-none transition-all ${
                  phoneError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                    : 'border-brand-rose/30 focus:border-brand-pink focus:ring-brand-pink/20'
                }`}
                value={formData.phone}
                onChange={e => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (phoneError) setPhoneError(getPhoneError(e.target.value));
                }}
                onBlur={() => {
                  if (formData.phone.trim()) setPhoneError(getPhoneError(formData.phone));
                }}
                placeholder="07XXX XXXXXX"
                maxLength={15}
              />
              {phoneError && (
                <p className="text-red-500 text-xs font-bold mt-1.5">{phoneError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email (Optional)</label>
              <input
                type="email"
                className="w-full p-4 bg-white rounded-xl border border-brand-rose/30 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email Address"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
              <input type="date" required
                className="w-full p-4 bg-white rounded-xl border border-brand-rose/30 focus:border-brand-pink outline-none"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
              <input type="time" required
                className="w-full p-4 bg-white rounded-xl border border-brand-rose/30 focus:border-brand-pink outline-none"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Guests</label>
            <select
              className="w-full p-4 bg-white rounded-xl border border-brand-rose/30 focus:border-brand-pink outline-none"
              value={formData.guests}
              onChange={e => setFormData({ ...formData, guests: parseInt(e.target.value) })}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <option key={n} value={n}>{n} People</option>
              ))}
            </select>
          </div>

          {/* ─── Pre-Order Toggle ─── */}
          <div className="border-t border-brand-rose/20 pt-6">
            <button
              type="button"
              onClick={() => setShowPreOrder(!showPreOrder)}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-brand-pink/5 to-brand-electricPeach/5 rounded-xl border border-brand-pink/20 hover:border-brand-pink/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-brand-pink" />
                <div className="text-left">
                  <p className="font-bold text-brand-text text-sm">Pre-Order Food</p>
                  <p className="text-brand-text/40 text-xs">Have your food ready when you arrive</p>
                </div>
              </div>
              <ChevronDown size={20} className={`text-brand-pink transition-transform ${showPreOrder ? 'rotate-180' : ''}`} />
            </button>

            {showPreOrder && (
              <div className="mt-4 space-y-4 animate-fade-in">
                {/* Selected items */}
                {preOrderItems.length > 0 && (
                  <div className="space-y-2">
                    {preOrderItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-brand-cacao p-3 rounded-xl">
                        <div>
                          <p className="font-bold text-brand-text text-sm">{item.name}</p>
                          <p className="text-brand-text/40 text-xs">£{item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => removePreOrderItem(item.id)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                            <Minus size={14} />
                          </button>
                          <span className="font-bold text-brand-text w-6 text-center">{item.quantity}</span>
                          <button type="button" onClick={() => addPreOrderItem(item)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-green-50 transition-colors">
                            <Plus size={14} />
                          </button>
                          <button type="button" onClick={() => setPreOrderItems(prev => prev.filter(i => i.id !== item.id))} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors ml-1">
                            <X size={14} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-brand-text p-2">
                      <span>Pre-Order Total</span>
                      <span>£{preOrderTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Add items button */}
                <button
                  type="button"
                  onClick={() => setShowMenuPicker(!showMenuPicker)}
                  className="w-full py-3 border-2 border-dashed border-brand-pink/30 rounded-xl text-brand-pink font-bold text-sm hover:border-brand-pink/60 hover:bg-brand-pink/5 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Items to Pre-Order
                </button>

                {/* Menu picker */}
                {showMenuPicker && (
                  <div className="max-h-60 overflow-y-auto space-y-2 border border-brand-rose/20 rounded-xl p-3 bg-white">
                    {preOrderMenuItems.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addPreOrderItem(item)}
                        className="w-full text-left p-3 rounded-xl hover:bg-brand-pink/5 transition-colors flex justify-between items-center group"
                      >
                        <div>
                          <p className="font-bold text-brand-text text-sm">{item.name}</p>
                          <p className="text-brand-text/40 text-xs capitalize">{item.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-brand-pink font-bold text-sm">£{item.price.toFixed(2)}</span>
                          <Plus size={16} className="text-brand-pink opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Payment method */}
                {preOrderItems.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-gray-700">Payment Method</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('store')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                          paymentMethod === 'store'
                            ? 'border-brand-pink bg-brand-pink/5'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <Store size={24} className={paymentMethod === 'store' ? 'text-brand-pink' : 'text-gray-400'} />
                        <span className="text-sm font-bold text-brand-text">Pay In Store</span>
                        <span className="text-[10px] text-brand-text/40">At the counter</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('online')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                          paymentMethod === 'online'
                            ? 'border-brand-pink bg-brand-pink/5'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <CreditCard size={24} className={paymentMethod === 'online' ? 'text-brand-pink' : 'text-gray-400'} />
                        <span className="text-sm font-bold text-brand-text">Pay Online</span>
                        <span className="text-[10px] text-brand-text/40">Coming soon</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-brand-pink text-white font-bold rounded-xl hover:bg-brand-pink/90 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isSubmitting ? 'Requesting...' : preOrderItems.length > 0 ? `Book & Pre-Order (£${preOrderTotal.toFixed(2)})` : 'Request Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
};