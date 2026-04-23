import React, { useState } from 'react';
import { SHOP_CONFIG } from '../shopConfig';
import { Calendar, Users, Clock, Phone, Mail, User, CheckCircle2 } from 'lucide-react';

export const BookingPortal = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        guests: 2,
        date: '',
        time: '19:00',
        notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const apiBase = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://localhost:5000') : '';
            const response = await fetch(`${apiBase}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-tenant-id': SHOP_CONFIG.tenant_id },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to book');
            }

            setStep(3); // Success step
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="w-full max-w-2xl bg-white/60 backdrop-blur-3xl rounded-[3rem] p-12 relative overflow-hidden border border-brand-pink/10 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/5 blur-[100px] -mr-32 -mt-32" />

                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="text-center">
                            <h2 className="font-display text-5xl font-bold mb-4 text-brand-obsidian">Table Reservation</h2>
                            <p className="text-brand-obsidian/50 font-medium tracking-wide">Secure your spot at Falooda & Co</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[2px] text-brand-electricPeach flex items-center gap-2">
                                    <Calendar size={14} /> Reservation Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full bg-white/40 border border-brand-pink/20 rounded-2xl px-6 py-4 outline-none focus:border-brand-pink/50 transition-all font-bold text-brand-obsidian"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[2px] text-brand-electricPeach flex items-center gap-2">
                                    <Users size={14} /> Guests
                                </label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-electricPeach/50 transition-all font-bold"
                                    value={formData.guests}
                                    onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                        <option key={n} value={n}>{n} Guests</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-4 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-[2px] text-brand-electricPeach flex items-center gap-2">
                                    <Clock size={14} /> Preferred Time
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, time: t })}
                                            className={`py-3 rounded-xl border text-sm font-bold transition-all ${formData.time === t
                                                    ? 'bg-brand-pink border-brand-pink text-white'
                                                    : 'bg-white/40 border-brand-pink/10 text-brand-obsidian/40 hover:border-brand-pink/30'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!formData.date}
                            className="w-full py-5 bg-brand-obsidian text-white rounded-2xl font-black uppercase tracking-[2px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg"
                        >
                            Continue to Details
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                        <div className="text-center">
                            <h2 className="font-display text-4xl font-bold mb-2 text-brand-obsidian">Almost Done</h2>
                            <p className="text-brand-obsidian/50 font-medium tracking-wide">We just need a few more details</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-obsidian/20" size={18} />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full bg-white/40 border border-brand-pink/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-brand-pink/50 transition-all font-bold text-brand-obsidian placeholder:text-brand-obsidian/20"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-obsidian/20" size={18} />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full bg-white/40 border border-brand-pink/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-brand-pink/50 transition-all font-bold text-brand-obsidian placeholder:text-brand-obsidian/20"
                                    value={formData.customerEmail}
                                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-obsidian/20" size={18} />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    className="w-full bg-white/40 border border-brand-pink/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-brand-pink/50 transition-all font-bold text-brand-obsidian placeholder:text-brand-obsidian/20"
                                    value={formData.customerPhone}
                                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                    required
                                />
                            </div>
                            <textarea
                                placeholder="Special requests (optional)"
                                className="w-full bg-white/40 border border-brand-pink/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-pink/50 transition-all font-bold h-32 text-brand-obsidian placeholder:text-brand-obsidian/20"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 py-5 bg-black/5 text-brand-obsidian/40 rounded-2xl font-black uppercase tracking-[2px] border border-brand-pink/10 hover:bg-black/10 transition-all text-sm"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] py-5 bg-brand-pink text-white rounded-2xl font-black uppercase tracking-[2px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg"
                            >
                                {loading ? 'Processing...' : 'Confirm Reservation'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <div className="text-center py-12 space-y-8 animate-in zoom-in duration-700">
                        <div className="w-24 h-24 bg-brand-pink/10 text-brand-pink rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-brand-pink/20">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="font-display text-5xl font-bold text-brand-obsidian">Thank You!</h2>
                        <p className="text-xl text-brand-obsidian/70">Your reservation is being processed. You will receive a confirmation shortly.</p>
                        <div className="pt-8">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-12 py-4 bg-white/5 text-brand-electricPeach rounded-2xl font-black uppercase tracking-[2px] border border-brand-electricPeach/30 hover:bg-brand-electricPeach/10 transition-all"
                            >
                                Return Home
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
