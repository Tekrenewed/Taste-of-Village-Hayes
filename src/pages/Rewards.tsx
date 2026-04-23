import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Gift, Star, ChevronRight, Sparkles, Clock, Check, Phone, Trophy, TrendingUp, QrCode, Loader2, UserPlus, Cake } from 'lucide-react';
import { getCustomerProfile, getLoyaltyProgress, getSpendProgress, getAvailableRewards, getOrCreateCustomer, updateCustomerBirthday } from '../services/loyaltyService';
import { CustomerProfile, Reward } from '../types';
import { SEOHead } from '../components/SEOHead';

export const Rewards = () => {
  const [searchParams] = useSearchParams();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [error, setError] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinBirthMonth, setJoinBirthMonth] = useState('');
  const [joinBirthDay, setJoinBirthDay] = useState('');
  const [joining, setJoining] = useState(false);
  const [showBirthdayPrompt, setShowBirthdayPrompt] = useState(false);

  // Auto-fill phone from URL param (from receipt QR code)
  useEffect(() => {
    const urlPhone = searchParams.get('phone');
    if (urlPhone && urlPhone.length >= 10) {
      setPhone(urlPhone);
      // Auto-trigger lookup
      (async () => {
        setLoading(true);
        try {
          const p = await getCustomerProfile(urlPhone);
          if (p) {
            setProfile(p);
            if (!(p as any).birthday) setShowBirthdayPrompt(true);
          } else {
            setShowJoinForm(true);
          }
        } catch { setError('Something went wrong. Please try again.'); }
        setLoading(false);
      })();
    }
  }, [searchParams]);

  const handleLookup = async () => {
    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    setShowJoinForm(false);
    try {
      const p = await getCustomerProfile(phone);
      if (!p) {
        setShowJoinForm(true);
        setProfile(null);
      } else {
        setProfile(p);
        // Show birthday prompt if not set
        if (!(p as any).birthday) {
          setShowBirthdayPrompt(true);
        }
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!joinName.trim()) return;
    setJoining(true);
    try {
      const birthday = joinBirthMonth && joinBirthDay
        ? { month: parseInt(joinBirthMonth), day: parseInt(joinBirthDay) }
        : undefined;
      const newProfile = await getOrCreateCustomer(phone, joinName.trim(), joinEmail.trim() || undefined, birthday);
      setProfile(newProfile);
      setShowJoinForm(false);
    } catch (e) {
      setError('Failed to create account. Please try again.');
    }
    setJoining(false);
  };

  const handleAddBirthday = async () => {
    if (!profile || !joinBirthMonth || !joinBirthDay) return;
    try {
      await updateCustomerBirthday(profile.phone, {
        month: parseInt(joinBirthMonth),
        day: parseInt(joinBirthDay),
      });
      setShowBirthdayPrompt(false);
      // Refresh profile
      const updated = await getCustomerProfile(profile.phone);
      if (updated) setProfile(updated);
    } catch (e) {
      console.error('Failed to save birthday:', e);
    }
  };

  const loyaltyProgress = profile ? getLoyaltyProgress(profile) : [];
  const spendProgress = profile ? getSpendProgress(profile) : null;
  const availableRewards = profile
    ? profile.rewards.filter(r => r.status === 'available' && new Date(r.expiresAt) > new Date())
    : [];
  const redeemedRewards = profile
    ? profile.rewards.filter(r => r.status === 'redeemed').slice(0, 5)
    : [];

  const categoryEmoji: Record<string, string> = {
    taste-of-village: '🍨',
    chaat: '🥘',
    dessert: '🍰',
    drinks: '🥤',
  };

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Generate QR payload (phone number encrypted-ish for kiosk scanning)
  const qrPayload = profile ? `TASTE OF VILLAGE-REWARDS:${profile.phone}` : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-cream via-white to-brand-cream/50 pt-20 pb-20">
      <SEOHead
        title="Rewards | Taste of Village"
        description="Check your Taste of Village loyalty rewards. Every 5th taste-of-village and 5th chaat is free!"
        canonicalUrl="/rewards"
      />

      <div className="max-w-2xl mx-auto px-4">

        {/* ─── Header ─── */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-brand-pink to-brand-electricPeach rounded-3xl flex items-center justify-center shadow-xl">
            <Gift size={36} className="text-white" />
          </div>
          <h1 className="font-display text-5xl font-bold text-brand-text mb-3">
            Taste of Village Rewards
          </h1>
          <p className="text-brand-text/60 text-lg max-w-md mx-auto">
            Every 5th taste-of-village is free. Every 5th chaat is free. It's that simple.
          </p>
        </div>

        {/* ─── Phone Lookup (when not logged in) ─── */}
        {!profile && (
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-brand-rose/10 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Phone size={20} className="text-brand-pink" />
              <h2 className="font-bold text-lg text-brand-text">Check Your Rewards</h2>
            </div>
            <p className="text-brand-text/50 text-sm mb-6">
              Enter the phone number you use when ordering. Your rewards are linked to your number.
            </p>

            <div className="flex gap-3">
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
                placeholder="07XXX XXXXXX"
                className="flex-1 px-5 py-4 rounded-2xl border-2 border-brand-rose/20 focus:border-brand-pink outline-none text-lg font-bold text-brand-text transition-colors"
              />
              <button
                onClick={handleLookup}
                disabled={loading}
                className="px-8 py-4 bg-brand-text text-white rounded-2xl font-bold hover:bg-brand-text/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                {loading ? '' : 'Go'}
              </button>
            </div>

            {error && (
              <p className="mt-4 text-brand-pink text-sm font-bold">{error}</p>
            )}

            {/* ─── JOIN NOW FORM (shown when phone not found) ─── */}
            {showJoinForm && (
              <div className="mt-8 pt-8 border-t border-brand-rose/10 animate-fade-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-pink to-brand-electricPeach rounded-xl flex items-center justify-center">
                    <UserPlus size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text">Join Taste of Village Rewards — Free!</h3>
                    <p className="text-brand-text/40 text-xs">No purchase needed. Start tracking your progress now.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-brand-text/50 mb-1 block">Your Name *</label>
                    <input
                      type="text" value={joinName} onChange={e => setJoinName(e.target.value)}
                      placeholder="e.g. Ahmed"
                      className="w-full px-4 py-3 rounded-xl border-2 border-brand-rose/20 focus:border-brand-pink outline-none text-sm font-bold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-brand-text/50 mb-1 block">Email (for reward notifications)</label>
                    <input
                      type="email" value={joinEmail} onChange={e => setJoinEmail(e.target.value)}
                      placeholder="ahmed@email.com"
                      className="w-full px-4 py-3 rounded-xl border-2 border-brand-rose/20 focus:border-brand-pink outline-none text-sm font-bold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-brand-text/50 mb-1 block flex items-center gap-2">
                      <Cake size={14} className="text-brand-pink" /> Birthday (get a free taste-of-village! 🎂)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={joinBirthMonth} onChange={e => setJoinBirthMonth(e.target.value)}
                        className="px-4 py-3 rounded-xl border-2 border-brand-rose/20 focus:border-brand-pink outline-none text-sm font-bold transition-colors bg-white"
                      >
                        <option value="">Month</option>
                        {monthNames.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                      </select>
                      <select
                        value={joinBirthDay} onChange={e => setJoinBirthDay(e.target.value)}
                        className="px-4 py-3 rounded-xl border-2 border-brand-rose/20 focus:border-brand-pink outline-none text-sm font-bold transition-colors bg-white"
                      >
                        <option value="">Day</option>
                        {Array.from({ length: 31 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleJoin}
                    disabled={joining || !joinName.trim()}
                    className="w-full py-4 bg-gradient-to-r from-brand-pink to-brand-electricPeach text-white rounded-2xl font-bold text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {joining ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {joining ? 'Creating Account...' : 'Join & Start Earning Rewards'}
                  </button>
                </div>
              </div>
            )}

            {/* How it works (only show when no join form) */}
            {!showJoinForm && (
              <div className="mt-10 pt-8 border-t border-brand-rose/10">
                <h3 className="font-bold text-xs uppercase tracking-widest text-brand-text/40 mb-6">How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: '🛒', title: 'Order', desc: 'Place orders online or in-store with your phone number' },
                    { icon: '📊', title: 'Track', desc: 'We count every taste-of-village and chaat you buy' },
                    { icon: '🎁', title: 'Earn', desc: 'Every 5th item in a category is completely free' },
                  ].map((step, i) => (
                    <div key={i} className="text-center">
                      <div className="text-3xl mb-3">{step.icon}</div>
                      <p className="font-bold text-brand-text mb-1">{step.title}</p>
                      <p className="text-brand-text/50 text-sm">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Rewards Dashboard (after lookup) ─── */}
        {profile && (
          <div className="space-y-6">

            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-brand-text to-brand-obsidian text-white rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-brand-pink/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-electricPeach/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Welcome back</p>
                    <h2 className="font-display text-3xl font-bold">{profile.name} ✨</h2>
                  </div>
                  <button
                    onClick={() => { setProfile(null); setPhone(''); }}
                    className="text-white/30 hover:text-white/60 text-sm font-bold transition-colors"
                  >
                    Switch
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                    <p className="text-2xl font-black">{profile.totalOrders}</p>
                    <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold mt-1">Orders</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                    <p className="text-2xl font-black">£{profile.totalSpent.toFixed(0)}</p>
                    <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold mt-1">Total Spent</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                    <p className="text-2xl font-black">{availableRewards.length}</p>
                    <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold mt-1">Rewards</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Birthday Prompt (for existing members without birthday) ─── */}
            {showBirthdayPrompt && (
              <div className="bg-gradient-to-r from-brand-pink/5 to-brand-electricPeach/5 rounded-[2rem] p-6 border border-brand-pink/20 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Cake size={20} className="text-brand-pink" />
                  <div>
                    <p className="font-bold text-brand-text text-sm">Add your birthday — earn a free taste-of-village! 🎂</p>
                    <p className="text-brand-text/40 text-xs">We'll send you a free taste-of-village reward every year around your birthday.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <select
                    value={joinBirthMonth} onChange={e => setJoinBirthMonth(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl border-2 border-brand-rose/20 focus:border-brand-pink outline-none text-sm font-bold bg-white"
                  >
                    <option value="">Month</option>
                    {monthNames.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                  <select
                    value={joinBirthDay} onChange={e => setJoinBirthDay(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl border-2 border-brand-rose/20 focus:border-brand-pink outline-none text-sm font-bold bg-white"
                  >
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                  </select>
                  <button
                    onClick={handleAddBirthday}
                    disabled={!joinBirthMonth || !joinBirthDay}
                    className="px-5 py-2.5 bg-brand-pink text-white rounded-xl font-bold text-xs disabled:opacity-40 hover:shadow-lg transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
            {availableRewards.length > 0 && (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-brand-rose/10">
                <h3 className="font-bold text-xs uppercase tracking-widest text-brand-pink mb-6 flex items-center gap-2">
                  <Gift size={14} /> Your Rewards
                </h3>
                <div className="space-y-3">
                  {availableRewards.map(reward => (
                    <div
                      key={reward.id}
                      className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-brand-pink/5 to-brand-electricPeach/5 border border-brand-pink/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-pink/10 rounded-2xl flex items-center justify-center text-xl">
                          {reward.type === 'free_item' ? '🎁' : '💰'}
                        </div>
                        <div>
                          <p className="font-bold text-brand-text">{reward.reason}</p>
                          <p className="text-brand-text/40 text-xs mt-1">
                            Expires {new Date(reward.expiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-brand-pink text-white rounded-xl text-xs font-black uppercase tracking-widest">
                        Active
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-brand-text/30 text-xs mt-4 text-center">
                  Show this screen at checkout or mention your phone number to redeem
                </p>
              </div>
            )}

            {/* ─── Progress Trackers ─── */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-brand-rose/10">
              <h3 className="font-bold text-xs uppercase tracking-widest text-brand-text/40 mb-6 flex items-center gap-2">
                <TrendingUp size={14} className="text-brand-pink" /> Your Progress
              </h3>

              <div className="space-y-6">
                {loyaltyProgress.map(prog => (
                  <div key={prog.category}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{categoryEmoji[prog.category] || '🍽️'}</span>
                        <span className="font-bold text-brand-text capitalize">{prog.category}</span>
                      </div>
                      <span className="text-sm font-bold text-brand-pink">
                        {prog.remaining === 0 ? '🎉 EARNED!' : `${prog.remaining} more to go`}
                      </span>
                    </div>
                    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-brand-pink to-brand-electricPeach rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${prog.progressPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px] text-brand-text/30 font-bold">{prog.currentCount} / {prog.threshold}</span>
                      <span className="text-[10px] text-brand-text/30 font-bold">FREE {prog.category.toUpperCase()}</span>
                    </div>
                  </div>
                ))}

                {/* Spend progress */}
                {spendProgress && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">💰</span>
                        <span className="font-bold text-brand-text">Spend Milestone</span>
                      </div>
                      <span className="text-sm font-bold text-brand-pink">
                        £{spendProgress.remaining.toFixed(2)} to go
                      </span>
                    </div>
                    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${spendProgress.progressPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px] text-brand-text/30 font-bold">£{spendProgress.currentSpent.toFixed(2)} / £{spendProgress.threshold}</span>
                      <span className="text-[10px] text-brand-text/30 font-bold">£5 OFF</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─── QR Code for Kiosk ─── */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-brand-rose/10 text-center">
              <h3 className="font-bold text-xs uppercase tracking-widest text-brand-text/40 mb-2 flex items-center justify-center gap-2">
                <QrCode size={14} className="text-brand-pink" /> Your Kiosk QR Code
              </h3>
              <p className="text-brand-text/50 text-sm mb-6">
                Scan this at our in-store kiosk for instant rewards
              </p>
              <button
                onClick={() => setShowQr(!showQr)}
                className="px-6 py-3 bg-brand-text text-white rounded-2xl font-bold hover:bg-brand-text/90 transition-all shadow-lg inline-flex items-center gap-2"
              >
                <QrCode size={16} />
                {showQr ? 'Hide QR Code' : 'Show My QR Code'}
              </button>

              {showQr && (
                <div className="mt-6 inline-flex flex-col items-center">
                  <div className="w-48 h-48 bg-white border-4 border-brand-text rounded-2xl flex items-center justify-center p-2 shadow-xl">
                    {/* QR Code rendered via canvas API or img src */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrPayload)}&color=1a1025`}
                      alt="Your rewards QR code"
                      className="w-full h-full"
                    />
                  </div>
                  <p className="text-brand-text/30 text-xs mt-3 font-mono">{profile.phone}</p>
                </div>
              )}
            </div>

            {/* ─── Redeemed History ─── */}
            {redeemedRewards.length > 0 && (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-brand-rose/10">
                <h3 className="font-bold text-xs uppercase tracking-widest text-brand-text/40 mb-6 flex items-center gap-2">
                  <Check size={14} className="text-green-500" /> Redeemed Rewards
                </h3>
                <div className="space-y-2">
                  {redeemedRewards.map(reward => (
                    <div key={reward.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="text-lg opacity-40">✓</div>
                        <div>
                          <p className="font-bold text-brand-text/60 text-sm line-through">{reward.reason}</p>
                          <p className="text-brand-text/30 text-xs">
                            Redeemed {reward.redeemedAt ? new Date(reward.redeemedAt).toLocaleDateString('en-GB') : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Menu */}
            <div className="text-center pt-4">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-text text-white rounded-full font-bold hover:bg-brand-text/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <Sparkles size={16} /> Order & Earn More Points
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
