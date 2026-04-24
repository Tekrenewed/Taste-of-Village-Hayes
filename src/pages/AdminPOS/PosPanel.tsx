import React, { useState, useEffect, useRef } from 'react';
import {
  ChefHat, Plus, Minus, Trash2, ShoppingCart, Check, X,
  Sun, Moon, Printer, Gift, Star
} from 'lucide-react';
import { CustomisationModal } from '../../components/CustomisationModal';
import type { FullMenuItem } from '../../components/CustomisationModal';

import { SIZE_VARIATIONS, ITEM_MODIFIERS } from './PosConstants';

interface PosPanelProps {
  posMenu: any[];
  posCart: any[];
  setPosCart: React.Dispatch<React.SetStateAction<any[]>>;
  posCategory: string;
  setPosCategory: (c: string) => void;
  posCustomerName: string;
  setPosCustomerName: (v: string) => void;
  posCustomerPhone: string;
  setPosCustomerPhone: (v: string) => void;
  posCustomerEmail: string;
  setPosCustomerEmail: (v: string) => void;
  posOrderType: string;
  setPosOrderType: (v: any) => void;
  posTable: number | null;
  setPosTable: (v: number | null) => void;
  posGuestCount: number | null;
  setPosGuestCount: (v: number | null) => void;
  posSplitBill: boolean;
  setPosSplitBill: (v: boolean) => void;
  posSubtotal: number;
  posTotal: number;
  posDiscountAmount: number;
  posLoyaltyProfile: any;
  posAvailableRewards: any[];
  posAppliedReward: any;
  onApplyReward: (reward: any) => void;
  posSubmitting: boolean;
  posLastOrder: any;
  posDarkMode: boolean;
  setPosDarkMode: (v: boolean) => void;
  sizePickerItem: any;
  setSizePickerItem: (v: any) => void;
  modifierPickerItem: any;
  setModifierPickerItem: (v: any) => void;
  modifierSelections: Record<string, string>;
  setModifierSelections: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  tables: any[];
  isOffline: boolean;
  offlineQueueCount: number;
  mobileCartOpen: boolean;
  setMobileCartOpen: (v: boolean) => void;
  addToPosCart: (item: any) => void;
  addSizedItemToCart: (item: any, size: 'regular' | 'large') => void;
  addModifiedItemToCart: () => void;
  updatePosQty: (id: string, delta: number) => void;
  submitPosOrder: (method: 'cash' | 'card' | 'unpaid') => void;
  printTicket: (order: any) => void;
  POS_SECTIONS: { key: string; label: string; filter: (i: any) => boolean }[];
}

export const PosPanel: React.FC<PosPanelProps> = ({
  posMenu, posCart, setPosCart, posCategory, setPosCategory,
  posCustomerName, setPosCustomerName,
  posCustomerPhone, setPosCustomerPhone,
  posCustomerEmail, setPosCustomerEmail,
  posOrderType, setPosOrderType,
  posTable, setPosTable,
  posGuestCount, setPosGuestCount,
  posSplitBill, setPosSplitBill,
  posSubtotal, posTotal, posDiscountAmount,
  posLoyaltyProfile, posAvailableRewards, posAppliedReward, onApplyReward,
  posSubmitting, posLastOrder,
  posDarkMode, setPosDarkMode,
  sizePickerItem, setSizePickerItem,
  modifierPickerItem, setModifierPickerItem,
  modifierSelections, setModifierSelections,
  tables, isOffline, offlineQueueCount,
  mobileCartOpen, setMobileCartOpen,
  addToPosCart, addSizedItemToCart, addModifiedItemToCart,
  updatePosQty, submitPosOrder, printTicket,
  POS_SECTIONS,
}) => {
  /* ── Theme Tokens (Cinematic Overhaul) ── */
  const t = {
    bg: 'transparent', surface: 'rgba(255,255,255,0.02)', surfaceHover: 'rgba(255,255,255,0.06)',
    card: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.1)',
    cardHover: 'rgba(255,255,255,0.1)', text: '#ffffff', textMuted: 'rgba(255,255,255,0.6)',
    accent: '#8a3d2a', accentSoft: 'rgba(138,61,42,0.2)',
    pistachio: '#f4e8c2', pistachioSoft: 'rgba(244,232,194,0.15)', // Cream
    gold: '#e6d5a1', goldSoft: 'rgba(230,213,161,0.2)', // Cream Dark
    sky: '#6b9080', skySoft: 'rgba(107,144,128,0.12)',
    danger: '#FF6B6B', success: '#6BCB77',
    sidebarBg: 'rgba(27,59,54,0.6)', scrollThumb: '#8a3d2a',
  };
  const activeSection = POS_SECTIONS.find(s => s.key === posCategory) || POS_SECTIONS[0];
  const filteredItems = posMenu.filter(activeSection.filter);

  // Quick Sale State
  const [quickSaleOpen, setQuickSaleOpen] = useState(false);
  const [qsName, setQsName] = useState('Quick Sale');
  const [qsPrice, setQsPrice] = useState('');
  const [qsQty, setQsQty] = useState(1);
  const [cardTapped, setCardTapped] = useState(false);

  // Reference to the Dojo checkout frame (if needed for Dojo web components)
  const dojoContainerRef = useRef<HTMLDivElement>(null);

  // ─── SYNC TO CFD (Customer Facing Display) ───
  useEffect(() => {
    const cleanCart = posCart.map(item => ({
      id: item.id || '',
      name: item.name || '',
      quantity: item.quantity || 1,
      totalPrice: (item.price || 0) * (item.quantity || 1)
    }));

    const payload = {
      cart: cleanCart,
      total: posTotal,
      paymentStatus: posSubmitting ? 'awaiting_payment' : 'idle',
      updatedAt: Date.now()
    };

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    // Use the hardcoded default curry store ID for now, or from context if available
    const storeId = localStorage.getItem('storeId') || 'f4100da2-1111-1111-1111-000000000001';

    fetch(`${apiUrl}/api/v1/cfd/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Store-ID': storeId,
      },
      body: JSON.stringify(payload)
    }).catch(err => console.error("CFD REST sync error:", err));
  }, [posCart, posTotal, posSubmitting]);

  const handleQuickSaleAdd = () => {
    const price = parseFloat(qsPrice);
    if (!price || price <= 0) { alert('Please enter a valid price'); return; }
    const cartItem = {
      id: `qs-${Date.now()}`,
      _cartKey: `qs-${Date.now()}`,
      name: qsName.trim() || 'Quick Sale',
      price,
      quantity: qsQty,
      category: 'quick_sale',
      isQuickSale: true,
    };
    setPosCart((prev: any[]) => [...prev, cartItem]);
    // Reset
    setQsName('Quick Sale');
    setQsPrice('');
    setQsQty(1);
    setQuickSaleOpen(false);
  };

  return (
    <>
    <div className="flex h-[calc(100vh-1rem)] md:h-[calc(100vh-6rem)] -mx-4 md:-mx-12 -my-4 md:-my-12 relative overflow-hidden bg-pine">
      {/* ── Cinematic Background ── */}
      <div className="absolute inset-0 z-0 bg-[url('/tov-cinematic-bg.png')] bg-cover bg-center opacity-60 mix-blend-screen"></div>
      <div className="absolute inset-0 z-0 cinematic-overlay"></div>

      {/* ••• LEFT: Menu Grid ••• */}
      <div className={`${mobileCartOpen ? 'hidden md:flex' : 'flex'} flex-1 flex-col overflow-hidden relative z-10 pb-16 md:pb-0`} style={{ padding:'28px 24px 20px 24px' }}>

        {/* ─── OFFLINE MODE BANNER ─── */}
        {isOffline && (
          <div style={{
            background: 'linear-gradient(135deg, #E84A5F, #FF6B6B)',
            padding: '12px 20px',
            borderRadius: '16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            <div style={{ width: '12px', height: '12px', background: '#fff', borderRadius: '50%', animation: 'pulse 1s ease-in-out infinite' }} />
            <div>
              <p style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: '14px', letterSpacing: '-0.3px' }}>⚡ OFFLINE MODE</p>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '11px', fontWeight: 600 }}>
                No internet connection. Orders will queue locally and auto-sync when you're back online.
              </p>
            </div>
          </div>
        )}
        {!isOffline && offlineQueueCount > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #F5C542, #E8A832)',
            padding: '10px 18px',
            borderRadius: '16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{ width: '10px', height: '10px', background: '#fff', borderRadius: '50%' }} />
            <p style={{ margin: 0, color: '#4A4036', fontWeight: 700, fontSize: '12px' }}>
              ⏳ Syncing {offlineQueueCount} queued order{offlineQueueCount > 1 ? 's' : ''}...
            </p>
          </div>
        )}
        {/* Header Row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <div>
            <h2 style={{ fontSize:'28px', fontWeight:800, color: t.text, letterSpacing:'-0.5px', margin:0 }}>Take Order</h2>
            <p style={{ fontSize:'11px', fontWeight:700, color: t.textMuted, textTransform:'uppercase', letterSpacing:'3px', marginTop:'2px' }}>Taste of Village POS</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            {posLastOrder && (
              <div className="flex gap-2">
                <div style={{ padding:'10px 18px', background: t.pistachioSoft, border:`1px solid ${t.pistachio}44`, borderRadius:'16px', color: t.pistachio, fontWeight:800, fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', display:'flex', alignItems:'center', gap:'6px' }}>
                  <Check size={14}/> #{posLastOrder.id.slice(-4)} Sent!
                </div>
                <button onClick={() => printTicket(posLastOrder)} className="px-4 py-2 bg-terracotta text-pine rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                  <Printer size={14}/> Print Ticket
                </button>
              </div>
            )}
            {/* Dark/Light Toggle */}
            <button
              onClick={() => setPosDarkMode(!posDarkMode)}
              style={{
                width:'44px', height:'44px', borderRadius:'14px', border:'none', cursor:'pointer',
                background: posDarkMode ? 'rgba(245,215,142,0.15)' : 'rgba(26,26,46,0.08)',
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.3s ease',
              }}
              title={posDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {posDarkMode ? <Sun size={18} color={t.gold} /> : <Moon size={18} color={t.text} />}
            </button>
            {/* View Cart Button (Mobile Only) */}
            <button
              className="md:hidden flex items-center justify-center gap-2 px-4 py-2 rounded-2xl font-black text-[11px] uppercase tracking-widest text-pine bg-terracotta shadow-lg"
              onClick={() => setMobileCartOpen(true)}
            >
              <ShoppingCart size={16} /> Cart {posCart.length > 0 && `(${posCart.length})`}
            </button>
          </div>
        </div>

        {/* ── Category Pills ── */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
          {POS_SECTIONS.map(sec => {
            const isActive = posCategory === sec.key;
            return (
              <button
                key={sec.key}
                onClick={() => setPosCategory(sec.key)}
                style={{
                  padding:'10px 20px', borderRadius:'24px', border:'none', cursor:'pointer',
                  fontWeight:800, fontSize:'12px', letterSpacing:'0.5px',
                  transition:'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                  background: isActive ? t.accent : t.card,
                  color: isActive ? '#FFFFFF' : t.textMuted,
                  boxShadow: isActive ? `0 4px 20px ${t.accent}60` : 'none',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  backdropFilter: isActive ? 'none' : 'blur(10px)',
                  ...(isActive ? {} : { border: `1px solid ${t.cardBorder}` }),
                }}
              >
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* ── Item Grid ── */}
        <div style={{
          flex:1, overflowY:'auto', paddingRight:'8px',
          display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(170px, 1fr))',
          gap:'12px', alignContent:'start',
        }}>
          {/* ⚡ Quick Sale Button — always first in the grid */}
          <button
            onClick={() => setQuickSaleOpen(true)}
            style={{
              padding:'20px 16px', borderRadius:'20px',
              border: `2px dashed ${t.gold}55`,
              background: `linear-gradient(135deg, ${t.goldSoft}, ${t.accentSoft})`,
              cursor:'pointer', textAlign:'center',
              transition:'all 0.2s cubic-bezier(0.4,0,0.2,1)',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              minHeight:'110px', position:'relative', overflow:'hidden',
              gap: '8px',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; e.currentTarget.style.boxShadow=`0 8px 25px ${t.gold}25`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow='none'; }}
          >
            <span style={{ fontSize:'28px' }}>⚡</span>
            <p style={{ fontWeight:800, fontSize:'14px', color: t.gold, margin:0 }}>Quick Sale</p>
            <p style={{ fontWeight:600, fontSize:'10px', color: t.textMuted, margin:0, textTransform:'uppercase', letterSpacing:'1px' }}>Custom Price</p>
          </button>
          {filteredItems.map(item => {
            // Phase 3: Dynamic Pricing Logic (Flash Sale)
            const now = new Date();
            const isHappyHour = now.getHours() >= 15 && now.getHours() < 17; // 3 PM - 5 PM
            const isFlashSaleEligible = item.category?.toLowerCase() === 'curry' || item.name?.toLowerCase().includes('curry');
            const flashSalePrice = isHappyHour && isFlashSaleEligible ? item.price * 0.85 : null; // 15% off

            return (
              <button
                key={item.id}
                onClick={() => !item.is86d && addToPosCart(flashSalePrice ? { ...item, price: flashSalePrice, originalPrice: item.price } : item)}
                disabled={item.is86d}
                style={{
                  padding:'20px 16px', borderRadius:'20px', border:`1.5px solid ${flashSalePrice ? t.gold : t.cardBorder}`,
                  background: flashSalePrice ? `${t.gold}15` : t.card, 
                  cursor: item.is86d ? 'not-allowed' : 'pointer', textAlign:'left',
                  transition:'all 0.2s cubic-bezier(0.4,0,0.2,1)', backdropFilter: 'blur(12px)',
                  display:'flex', flexDirection:'column', justifyContent:'space-between',
                  minHeight:'110px', position:'relative', overflow:'hidden',
                  opacity: item.is86d ? 0.5 : 1,
                  filter: item.is86d ? 'grayscale(100%)' : 'none'
                }}
                onMouseEnter={e => { if(!item.is86d) { e.currentTarget.style.background = t.cardHover; e.currentTarget.style.borderColor = t.accent + '55'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 25px ${t.accent}15`; } }}
                onMouseLeave={e => { if(!item.is86d) { e.currentTarget.style.background = flashSalePrice ? `${t.gold}05` : t.card; e.currentTarget.style.borderColor = flashSalePrice ? t.gold : t.cardBorder; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow='none'; } }}
              >
                {item.is86d && <div style={{ position:'absolute', top:'10px', right:'10px', background:'rgba(239,68,68,0.1)', color:'#EF4444', padding:'3px 6px', borderRadius:'6px', fontSize:'9px', fontWeight:900, letterSpacing:'1px' }}>SOLD OUT</div>}
                
                {flashSalePrice && !item.is86d && (
                  <div style={{ position:'absolute', top:'10px', right:'10px', background:t.gold, color:t.surface, padding:'3px 6px', borderRadius:'6px', fontSize:'8px', fontWeight:900, letterSpacing:'1px', animation: 'pulse 2s infinite' }}>FLASH SALE</div>
                )}

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <p style={{ fontWeight:700, fontSize:'14px', color: t.text, lineHeight:'1.3', margin:0, flex:1 }}>
                    {item.name}
                  </p>
                  {SIZE_VARIATIONS[item.name] && !item.is86d && (
                    <span style={{ fontSize:'9px', fontWeight:800, padding:'3px 7px', borderRadius:'6px', background: t.goldSoft, color: t.gold, textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap', marginLeft:'6px' }}>R / L</span>
                  )}
                </div>
                <div style={{ marginTop:'8px' }}>
                  {flashSalePrice ? (
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <span style={{ fontWeight:900, fontSize:'15px', color: t.gold }}>£{flashSalePrice.toFixed(2)}</span>
                      <span style={{ fontWeight:600, fontSize:'11px', color: t.textMuted, textDecoration:'line-through opacity-40' }}>£{item.price.toFixed(2)}</span>
                    </div>
                  ) : (
                    <p style={{ fontWeight:800, fontSize:'15px', color: t.pistachio, margin:0 }}>
                      {SIZE_VARIATIONS[item.name] ? `from £${SIZE_VARIATIONS[item.name].regular.toFixed(2)}` : `£${item.price?.toFixed(2)}`}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
          {filteredItems.length === 0 && (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 0', color: t.textMuted }}>
              <ShoppingCart size={40} style={{ opacity:0.3, marginBottom:'12px' }} />
              <p style={{ fontWeight:600 }}>No items in this section</p>
            </div>
          )}
        </div>
      </div>

      {/* ••• RIGHT: Premium Cart Section ••• */}
      <div className={`${mobileCartOpen ? 'flex w-full absolute inset-0 z-50 md:relative' : 'hidden'} md:flex flex-col md:w-[380px] h-[100dvh] md:h-full z-10 glass-panel border-l border-white/10`} style={{ background: t.sidebarBg }}>
        {/* Cart Header */}
        <div style={{ padding:'28px 24px 18px', borderBottom:`1px solid ${t.cardBorder}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <h3 style={{ fontSize:'20px', fontWeight:800, color: t.text, margin:0, letterSpacing:'-0.3px' }}>Current Order</h3>
              <p style={{ fontSize:'11px', fontWeight:700, color: t.textMuted, textTransform:'uppercase', letterSpacing:'2px', marginTop:'4px' }}>
                {posCart.reduce((s, i) => s + i.quantity, 0)} items
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="md:hidden flex items-center justify-center w-[36px] h-[36px] bg-terracotta text-pine rounded-[10px]" onClick={() => setMobileCartOpen(false)}>
                <X size={16} />
              </button>
              {posCart.length > 0 && (
                <button onClick={() => setPosCart([])} style={{
                  width:'36px', height:'36px', borderRadius:'10px', border:'none', cursor:'pointer',
                  background: 'rgba(255,107,107,0.12)', color: t.danger, display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order Type Tabs */}
        <div style={{ padding:'14px 24px', borderBottom:`1px solid ${t.cardBorder}` }}>
          <div style={{ display:'flex', gap:'6px', background: posDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', borderRadius:'14px', padding:'4px' }}>
            {(['dine-in', 'takeaway', 'collection'] as const).map(type => (
              <button
                key={type}
                onClick={() => setPosOrderType(type)}
                style={{
                  flex:1, padding:'10px 0', borderRadius:'11px', border:'none', cursor:'pointer',
                  fontWeight:800, fontSize:'10px', textTransform:'uppercase', letterSpacing:'1.5px',
                  transition:'all 0.2s ease',
                  background: posOrderType === type ? t.accent : 'transparent',
                  color: posOrderType === type ? '#fff' : t.textMuted,
                  boxShadow: posOrderType === type ? `0 2px 10px ${t.accent}60` : 'none',
                }}
              >
                {type.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Table Picker */}
          {posOrderType === 'dine-in' && (
            <>
            <div style={{ marginTop:'12px', display:'flex', gap:'6px', flexWrap:'wrap' }}>
              {tables.map((tbl: any) => (
                <button
                  key={tbl.table_number}
                  onClick={() => setPosTable(tbl.table_number)}
                  style={{
                    width:'40px', height:'40px', borderRadius:'12px', border:'none', cursor:'pointer',
                    fontWeight:800, fontSize:'13px',
                    transition:'all 0.2s ease',
                    background: posTable === tbl.table_number ? t.accent : 'rgba(255,255,255,0.06)',
                    color: posTable === tbl.table_number ? '#fff' : t.textMuted,
                    boxShadow: posTable === tbl.table_number ? `0 2px 12px ${t.accent}60` : 'none',
                  }}
                >
                  {tbl.table_number}
                </button>
              ))}
            </div>
            <div style={{ marginTop:'10px', display:'flex', flexDirection:'column', gap:'4px' }}>
              <input type="text" placeholder="Customer Name (optional)" value={posCustomerName} onChange={e => setPosCustomerName(e.target.value)} style={{ width:'100%', padding:'8px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:600, border:`1.5px solid ${t.cardBorder}`, background: posDarkMode ? 'rgba(255,255,255,0.05)' : '#fff', color: t.text, outline:'none', boxSizing:'border-box' }} />
              <input type="tel" placeholder="Phone (optional — for loyalty)" value={posCustomerPhone} onChange={e => setPosCustomerPhone(e.target.value)} style={{ width:'100%', padding:'8px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:600, border:`1.5px solid ${t.cardBorder}`, background: posDarkMode ? 'rgba(255,255,255,0.05)' : '#fff', color: t.text, outline:'none', boxSizing:'border-box' }} />
              <input type="email" placeholder="Email (optional — for loyalty)" value={posCustomerEmail} onChange={e => setPosCustomerEmail(e.target.value)} style={{ width:'100%', padding:'8px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:600, border:`1.5px solid ${t.cardBorder}`, background: posDarkMode ? 'rgba(255,255,255,0.05)' : '#fff', color: t.text, outline:'none', boxSizing:'border-box' }} />

              {/* Guest Count */}
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontSize:'12px', fontWeight:700, color: t.textMuted, whiteSpace:'nowrap' }}>Guests</span>
                <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <button key={n} onClick={() => setPosGuestCount(posGuestCount === n ? null : n)} style={{ width:'32px', height:'32px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight:800, fontSize:'12px', transition:'all 0.2s ease', background: posGuestCount === n ? t.accent : 'rgba(255,255,255,0.06)', color: posGuestCount === n ? '#fff' : t.textMuted, boxShadow: posGuestCount === n ? `0 2px 8px ${t.accent}60` : 'none' }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Bill Toggle */}
              <button onClick={() => setPosSplitBill(!posSplitBill)} style={{ width:'100%', padding:'8px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:700, border: `1.5px solid ${posSplitBill ? t.accent : t.cardBorder}`, background: posSplitBill ? `${t.accent}15` : (posDarkMode ? 'rgba(255,255,255,0.03)' : '#fff'), color: posSplitBill ? t.accent : t.textMuted, cursor:'pointer', transition:'all 0.2s ease', textAlign:'left', display:'flex', alignItems:'center', gap:'8px', boxSizing:'border-box' }}>
                <span style={{ fontSize:'14px' }}>{posSplitBill ? '✅' : '💳'}</span>
                <span>Split Bill{posSplitBill ? ' — ON' : ' (tap to enable)'}</span>
              </button>
            </div>
            </>
          )}

          {/* Customer Info for takeaway/collection */}
          {posOrderType !== 'dine-in' && (
            <div style={{ marginTop:'8px', display:'flex', flexDirection:'column', gap:'4px' }}>
              {/* CRM Quick Search */}
              <div style={{ display:'flex', gap:'4px', marginBottom:'2px' }}>
                <input type="text" placeholder="CRM ID / Phone Search..." style={{ flex:1, padding:'8px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:800, border:`1.5px solid ${t.accent}55`, background: posDarkMode ? 'rgba(212,130,155,0.08)' : '#FFF5F8', color: t.text, outline:'none', boxSizing:'border-box' }} onKeyDown={e => {
                  if(e.key === 'Enter') {
                    const val = e.currentTarget.value;
                    if(val) {
                      fetch(`/api/v1/customers/lookup?q=${val}`)
                        .then(async r => {
                           if (!r.ok) {
                             // 404 or not found
                             if (window.confirm(`Customer not found. Silently create account for ${val} to start earning points?`)) {
                               const createRes = await fetch('/api/v1/customers', {
                                 method: 'POST',
                                 headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ phone: val, name: "Valued Customer" })
                               });
                               if (createRes.ok) {
                                 setPosCustomerName("Valued Customer");
                                 setPosCustomerPhone(val);
                                 alert("Silent Capture Successful. Account created!");
                               }
                             }
                             throw new Error("404 handled");
                           }
                           return r.json();
                        })
                        .then(data => {
                           if(data && data.customer) {
                             setPosCustomerName(data.customer.name);
                             setPosCustomerPhone(data.customer.phone || '');
                             setPosCustomerEmail(data.customer.email || '');
                             alert(`Customer Found: ${data.customer.name} (ID: ${data.customer.short_id})`);
                           }
                        }).catch((err) => {
                           if (err.message !== "404 handled") {
                             // Fallback
                             setPosCustomerName("Loyal Customer");
                             setPosCustomerPhone(val);
                           }
                        });
                    }
                  }
                }} />
              </div>
              <input type="text" placeholder="Customer Name" value={posCustomerName} onChange={e => setPosCustomerName(e.target.value)} style={{ width:'100%', padding:'8px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:600, border:`1.5px solid ${t.cardBorder}`, background: posDarkMode ? 'rgba(255,255,255,0.05)' : '#fff', color: t.text, outline:'none', boxSizing:'border-box' }} />
              <input type="tel" placeholder="Phone (optional)" value={posCustomerPhone} onChange={e => setPosCustomerPhone(e.target.value)} style={{ width:'100%', padding:'8px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:600, border:`1.5px solid ${t.cardBorder}`, background: posDarkMode ? 'rgba(255,255,255,0.05)' : '#fff', color: t.text, outline:'none', boxSizing:'border-box' }} />
              <input type="email" placeholder="Email (optional — for loyalty)" value={posCustomerEmail} onChange={e => setPosCustomerEmail(e.target.value)} style={{ width:'100%', padding:'8px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:600, border:`1.5px solid ${t.cardBorder}`, background: posDarkMode ? 'rgba(255,255,255,0.05)' : '#fff', color: t.text, outline:'none', boxSizing:'border-box' }} />
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px 24px 80px 24px' }}>
          {posCart.length === 0 && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', opacity:0.2 }}>
              <ShoppingCart size={44} color={t.text} />
              <p style={{ fontSize:'13px', fontWeight:700, marginTop:'14px', color: t.text }}>Tap items to add</p>
            </div>
          )}
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {posCart.map(item => {
              const cartKey = item._cartKey || item.id;
              return (
              <div key={cartKey} style={{
                display:'flex', alignItems:'center', padding:'12px 14px', borderRadius:'16px',
                background: posDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${t.cardBorder}`,
              }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, fontSize:'13px', color: t.text, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                  {item.modifiers && Object.keys(item.modifiers || {}).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {Object.entries(item.modifiers || {}).map(([k, v]) => (
                        <span key={k} className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${posDarkMode ? 'bg-terracotta/20 text-terracotta' : 'bg-terracotta/10 text-pine'}`}>
                          {v as string}
                        </span>
                      ))}
                    </div>
                  )}
                  <p style={{ fontWeight:800, fontSize:'12px', color: t.pistachio, margin:'3px 0 0' }}>£{(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'6px', marginLeft:'12px' }}>
                  <button onClick={() => updatePosQty(cartKey, -1)} style={{ width:'32px', height:'32px', borderRadius:'10px', border:'none', cursor:'pointer', background: 'rgba(255,107,107,0.12)', color: t.danger, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Minus size={14}/>
                  </button>
                  <span style={{ fontWeight:800, fontSize:'14px', color: t.text, width:'24px', textAlign:'center' }}>{item.quantity}</span>
                  <button onClick={() => updatePosQty(cartKey, 1)} style={{ width:'32px', height:'32px', borderRadius:'10px', border:'none', cursor:'pointer', background: t.pistachioSoft, color: t.pistachio, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Plus size={14}/>
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* ── Loyalty Rewards Panel ── */}
        {posLoyaltyProfile && (
          <div style={{ padding:'12px 16px', borderTop:`1px solid ${t.cardBorder}`, background: posDarkMode ? 'rgba(232,160,191,0.06)' : 'rgba(232,160,191,0.08)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
              <Star size={14} style={{ color: t.accent }} />
              <span style={{ fontSize:'11px', fontWeight:800, color: t.accent, textTransform:'uppercase', letterSpacing:'2px' }}>
                {posLoyaltyProfile.name} · {posLoyaltyProfile.totalOrders} orders
              </span>
              {posAvailableRewards.length > 0 && (
                <span style={{ marginLeft:'auto', fontSize:'10px', fontWeight:800, background: t.accentSoft, color: t.accent, padding:'2px 8px', borderRadius:'20px' }}>
                  {posAvailableRewards.length} reward{posAvailableRewards.length !== 1 ? 's' : ''} available
                </span>
              )}
            </div>
            {posAvailableRewards.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {posAvailableRewards.slice(0, 3).map((reward: any) => {
                  const isApplied = posAppliedReward?.id === reward.id;
                  return (
                    <button
                      key={reward.id}
                      onClick={() => onApplyReward(reward)}
                      style={{
                        display:'flex', alignItems:'center', gap:'8px',
                        padding:'8px 12px', borderRadius:'12px', border:'none', cursor:'pointer',
                        background: isApplied ? t.accentSoft : (posDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                        outline: isApplied ? `1.5px solid ${t.accent}` : '1.5px solid transparent',
                        transition:'all 0.2s ease', width:'100%', textAlign:'left',
                      }}
                    >
                      <Gift size={14} style={{ color: isApplied ? t.accent : t.textMuted, flexShrink:0 }} />
                      <span style={{ fontSize:'12px', fontWeight:700, color: isApplied ? t.accent : t.text, flex:1 }}>{reward.reason}</span>
                      {isApplied && reward.type === 'discount_fixed' && (
                        <span style={{ fontSize:'12px', fontWeight:800, color: t.accent }}>-£{reward.value?.toFixed(2)}</span>
                      )}
                      {isApplied && reward.type === 'free_item' && (
                        <span style={{ fontSize:'10px', fontWeight:800, color: t.accent, background: t.accentSoft, padding:'2px 6px', borderRadius:'8px' }}>APPLIED</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {posAvailableRewards.length === 0 && (
              <p style={{ fontSize:'11px', color: t.textMuted, fontStyle:'italic', margin:0 }}>No active rewards at this time.</p>
            )}
          </div>
        )}

        {/* ── Total & Submit ── */}
        <div style={{ padding:'20px 24px', borderTop:`1px solid ${t.cardBorder}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: posDiscountAmount > 0 ? '4px' : '16px' }}>
            <span style={{ fontSize:'12px', fontWeight:800, color: t.textMuted, textTransform:'uppercase', letterSpacing:'2px' }}>Total</span>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end' }}>
              <span style={{ fontSize:'32px', fontWeight:800, color: t.text, letterSpacing:'-1px' }}>£{posTotal.toFixed(2)}</span>
              {posSplitBill && posGuestCount && posGuestCount > 1 && (
                <span style={{ fontSize:'14px', fontWeight:800, color: t.accent, marginTop: '2px' }}>£{(posTotal / posGuestCount).toFixed(2)} each</span>
              )}
            </div>
          </div>
          {posDiscountAmount > 0 && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <span style={{ fontSize:'11px', fontWeight:700, color: t.accent }}>🎁 Reward Applied</span>
              <span style={{ fontSize:'13px', fontWeight:800, color: t.accent }}>-£{posDiscountAmount.toFixed(2)} · Was £{posSubtotal.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display:'flex', gap:'8px', width:'100%' }}>
            <button
              onClick={() => submitPosOrder('cash')}
              disabled={posCart.length === 0 || posSubmitting || (posOrderType === 'dine-in' && !posTable)}
              style={{
                flex: 1, padding:'14px 20px', borderRadius:'16px', fontSize:'14px', fontWeight:800, border:'none', cursor:'pointer',
                background: t.accent, color: (posCart.length === 0 || posSubmitting || (posOrderType === 'dine-in' && !posTable)) ? t.textMuted : '#fff',
                boxShadow: (posCart.length > 0 && !posSubmitting) ? `0 6px 25px ${t.accent}60` : 'none',
                transition:'all 0.25s ease', opacity: (posCart.length === 0 || posSubmitting || (posOrderType === 'dine-in' && !posTable)) ? 0.4 : 1,
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
              }}
            >
              <ChefHat size={18} />
              {posSubmitting ? '...' : 'CASH'}
            </button>
            <button
              onClick={() => submitPosOrder('card')}
              disabled={posCart.length === 0 || posSubmitting || (posOrderType === 'dine-in' && !posTable)}
              style={{
                flex: 1, padding:'14px 20px', borderRadius:'16px', fontSize:'14px', fontWeight:800, border:'none', cursor:'pointer',
                background: t.accent, color: (posCart.length === 0 || posSubmitting || (posOrderType === 'dine-in' && !posTable)) ? t.textMuted : '#fff',
                boxShadow: (posCart.length > 0 && !posSubmitting) ? `0 6px 25px ${t.accent}60` : 'none',
                transition:'all 0.25s ease', opacity: (posCart.length === 0 || posSubmitting || (posOrderType === 'dine-in' && !posTable)) ? 0.4 : 1,
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
              }}
            >
              <ChefHat size={18} />
              {posSubmitting ? '...' : 'CARD'}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* ••• Size Picker / Customisation Modal ••• */}
    {sizePickerItem && (() => {
      const full = sizePickerItem as FullMenuItem;
      const hasDbCustomisation =
        (full.variants && full.variants.length > 1) ||
        (full.modifier_groups && full.modifier_groups.length > 0);

      // ── DB-backed items: use full CustomisationModal ──
      if (hasDbCustomisation) {
        return (
          <CustomisationModal
            item={full}
            onClose={() => setSizePickerItem(null)}
            onAddToCart={(cartItem) => {
              // Add fully-formed cart item (price already calculated by modal)
              setPosCart((prev: any[]) => {
                const key = cartItem._cartKey || cartItem.id;
                const existing = prev.find(i => (i._cartKey || i.id) === key);
                if (existing) {
                  return prev.map(i => (i._cartKey || i.id) === key
                    ? { ...i, quantity: i.quantity + (cartItem.quantity || 1) }
                    : i);
                }
                return [...prev, { ...cartItem, _cartKey: key }];
              });
              setSizePickerItem(null);
            }}
          />
        );
      }

      // ── Legacy: hardcoded SIZE_VARIATIONS ──
      let sizes = SIZE_VARIATIONS[sizePickerItem.name];
      if (!sizes && ['curries', 'karahi'].includes(sizePickerItem.category)) {
        sizes = { regular: sizePickerItem.price, large: sizePickerItem.price + 2.99 };
      }
      if (!sizes) return null;
      const isDark = posDarkMode;
      return (
        <div onClick={() => setSizePickerItem(null)} style={{ position:'fixed', inset:0, zIndex:9999, background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.35)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: isDark ? '#1A1A2E' : '#FFFFFF', borderRadius:'28px', padding:'36px 32px 28px', width:'380px', maxWidth:'90vw', boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.5)' : '0 25px 60px rgba(0,0,0,0.15)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'3px', color: isDark ? 'rgba(240,230,214,0.4)' : 'rgba(45,42,38,0.4)', margin:'0 0 6px', textAlign:'center' }}>Choose Size</p>
            <h3 style={{ fontSize:'22px', fontWeight:800, color: isDark ? '#F0E6D6' : '#2D2A26', margin:'0 0 16px', textAlign:'center', letterSpacing:'-0.3px' }}>{sizePickerItem.name}</h3>
            {['curries', 'karahi'].includes(sizePickerItem.category) && (
              <div className="mb-6 bg-terracotta/10 border border-terracotta/30 rounded-xl p-3 text-center animate-pulse shadow-inner">
                <p className="text-[9px] font-black text-terracotta uppercase tracking-[2px] mb-1">🗣️ Cashier Script</p>
                <p className="text-sm font-bold text-terracotta">"Would you like to Go Large for just £2.99 extra?"</p>
              </div>
            )}
            <div style={{ display:'flex', gap:'12px' }}>
              <button onClick={() => addSizedItemToCart(sizePickerItem, 'regular')} style={{ flex:1, padding:'24px 16px', borderRadius:'20px', cursor:'pointer', background: isDark ? 'rgba(255,255,255,0.05)' : '#FAF6F1', border: isDark ? '2px solid rgba(255,255,255,0.08)' : '2px solid rgba(0,0,0,0.06)', transition:'all 0.2s ease', textAlign:'center' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#A8D8A8'; e.currentTarget.style.transform='scale(1.03)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'; e.currentTarget.style.transform='scale(1)'; }}>
                <p style={{ fontSize:'28px', margin:'0 0 8px' }}>🥤</p>
                <p style={{ fontWeight:800, fontSize:'14px', color: isDark ? '#F0E6D6' : '#2D2A26', margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'1px' }}>Regular</p>
                <p style={{ fontWeight:900, fontSize:'20px', color: '#A8D8A8', margin:0 }}>£{sizes.regular.toFixed(2)}</p>
              </button>
              <button onClick={() => addSizedItemToCart(sizePickerItem, 'large')} style={{ flex:1, padding:'24px 16px', borderRadius:'20px', cursor:'pointer', background: isDark ? 'rgba(232,160,191,0.08)' : '#FFF5F8', border: isDark ? '2px solid rgba(232,160,191,0.2)' : '2px solid rgba(212,130,155,0.15)', transition:'all 0.2s ease', textAlign:'center' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8A0BF'; e.currentTarget.style.transform='scale(1.03)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(232,160,191,0.2)' : 'rgba(212,130,155,0.15)'; e.currentTarget.style.transform='scale(1)'; }}>
                <p style={{ fontSize:'28px', margin:'0 0 8px' }}>🍨</p>
                <p style={{ fontWeight:800, fontSize:'14px', color: isDark ? '#F0E6D6' : '#2D2A26', margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'1px' }}>Large</p>
                <p style={{ fontWeight:900, fontSize:'20px', color: '#E8A0BF', margin:0 }}>£{sizes.large.toFixed(2)}</p>
              </button>
            </div>
            <button onClick={() => setSizePickerItem(null)} style={{ width:'100%', padding:'14px', marginTop:'16px', borderRadius:'14px', border:'none', cursor:'pointer', background:'transparent', color: isDark ? 'rgba(240,230,214,0.3)' : 'rgba(45,42,38,0.3)', fontWeight:800, fontSize:'11px', textTransform:'uppercase', letterSpacing:'2px', transition:'all 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.color = isDark ? '#F0E6D6' : '#2D2A26'; }} onMouseLeave={e => { e.currentTarget.style.color = isDark ? 'rgba(240,230,214,0.3)' : 'rgba(45,42,38,0.3)'; }}>Cancel</button>
          </div>
        </div>
      );
    })()}


    {/* ••• Modifier Picker Popup ••• */}
    {modifierPickerItem && (() => {
      const mods = ITEM_MODIFIERS[modifierPickerItem.name];
      if (!mods) return null;
      const isDark = posDarkMode;
      return (
        <div onClick={() => setModifierPickerItem(null)} style={{ position:'fixed', inset:0, zIndex:9999, background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.35)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: isDark ? '#1A1A2E' : '#FFFFFF', borderRadius:'28px', padding:'36px 32px 28px', width:'480px', maxWidth:'100%', boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.5)' : '0 25px 60px rgba(0,0,0,0.15)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'3px', color: isDark ? 'rgba(240,230,214,0.4)' : 'rgba(45,42,38,0.4)', margin:'0 0 6px', textAlign:'center' }}>Customize</p>
            <h3 style={{ fontSize:'22px', fontWeight:800, color: isDark ? '#F0E6D6' : '#2D2A26', margin:'0 0 28px', textAlign:'center', letterSpacing:'-0.3px' }}>{modifierPickerItem.name}</h3>
            <div className="space-y-6">
              {mods.map(modGroup => (
                <div key={modGroup.name}>
                  <p className={`text-[11px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-white/40' : 'text-pine/40'}`}>{modGroup.name}</p>
                  <div className="flex gap-2 flex-wrap">
                    {modGroup.options.map(opt => {
                      const isSelected = modifierSelections[modGroup.name] === opt;
                      return (
                        <button key={opt} onClick={() => setModifierSelections(prev => ({ ...prev, [modGroup.name]: opt }))} className={`px-4 py-3 rounded-xl text-xs font-bold border-2 transition-all ${isSelected ? 'border-terracotta bg-terracotta/10 text-terracotta scale-105' : (isDark ? 'border-white/5 bg-white/5 text-white/60 hover:border-white/20' : 'border-pine/5 bg-pine/5 text-pine/60 hover:border-pine/20')}`}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addModifiedItemToCart} className="w-full py-4 mt-8 rounded-2xl bg-terracotta text-pine font-black uppercase tracking-widest hover:opacity-90 transition-opacity">Add to Cart</button>
            <button onClick={() => setModifierPickerItem(null)} style={{ width:'100%', padding:'14px', marginTop:'8px', borderRadius:'14px', border:'none', cursor:'pointer', background:'transparent', color: isDark ? 'rgba(240,230,214,0.3)' : 'rgba(45,42,38,0.3)', fontWeight:800, fontSize:'11px', textTransform:'uppercase', letterSpacing:'2px' }}>Cancel</button>
          </div>
        </div>
      );
    })()}

    {/* ••• Quick Sale Modal ••• */}
    {quickSaleOpen && (() => {
      const isDark = posDarkMode;
      return (
        <div onClick={() => setQuickSaleOpen(false)} style={{ position:'fixed', inset:0, zIndex:9999, background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.35)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: isDark ? '#1A1A2E' : '#FFFFFF', borderRadius:'28px', padding:'36px 32px 28px', width:'420px', maxWidth:'100%', boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.5)' : '0 25px 60px rgba(0,0,0,0.15)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ textAlign:'center', marginBottom:'24px' }}>
              <span style={{ fontSize:'40px', display:'block', marginBottom:'8px' }}>⚡</span>
              <p style={{ fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'3px', color: isDark ? 'rgba(240,230,214,0.4)' : 'rgba(45,42,38,0.4)', margin:'0 0 6px' }}>Quick Sale</p>
              <h3 style={{ fontSize:'22px', fontWeight:800, color: isDark ? '#F0E6D6' : '#2D2A26', margin:0, letterSpacing:'-0.3px' }}>Add Custom Item</h3>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'24px' }}>
              {/* Item Name */}
              <div>
                <label style={{ display:'block', fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'2px', color: isDark ? 'rgba(240,230,214,0.4)' : 'rgba(45,42,38,0.4)', marginBottom:'6px' }}>Item Name</label>
                <input
                  type="text"
                  value={qsName}
                  onChange={e => setQsName(e.target.value)}
                  placeholder="e.g. Special Combo, Cake Slice..."
                  style={{ width:'100%', padding:'14px 16px', borderRadius:'14px', fontSize:'15px', fontWeight:700, border: isDark ? '2px solid rgba(255,255,255,0.08)' : '2px solid rgba(0,0,0,0.06)', background: isDark ? 'rgba(255,255,255,0.05)' : '#FAF6F1', color: isDark ? '#F0E6D6' : '#2D2A26', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor = t.accent}
                  onBlur={e => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                />
              </div>

              {/* Price */}
              <div>
                <label style={{ display:'block', fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'2px', color: isDark ? 'rgba(240,230,214,0.4)' : 'rgba(45,42,38,0.4)', marginBottom:'6px' }}>Price (£)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  value={qsPrice}
                  onChange={e => setQsPrice(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                  style={{ width:'100%', padding:'14px 16px', borderRadius:'14px', fontSize:'24px', fontWeight:900, border: isDark ? '2px solid rgba(255,255,255,0.08)' : '2px solid rgba(0,0,0,0.06)', background: isDark ? 'rgba(255,255,255,0.05)' : '#FAF6F1', color: t.pistachio, outline:'none', boxSizing:'border-box', textAlign:'center', letterSpacing:'1px', transition:'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor = t.pistachio}
                  onBlur={e => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                  onKeyDown={e => { if (e.key === 'Enter') handleQuickSaleAdd(); }}
                />
              </div>

              {/* Quantity */}
              <div>
                <label style={{ display:'block', fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'2px', color: isDark ? 'rgba(240,230,214,0.4)' : 'rgba(45,42,38,0.4)', marginBottom:'6px' }}>Quantity</label>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', justifyContent:'center' }}>
                  <button
                    onClick={() => setQsQty(Math.max(1, qsQty - 1))}
                    style={{ width:'48px', height:'48px', borderRadius:'14px', border:'none', cursor:'pointer', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: isDark ? '#F0E6D6' : '#2D2A26', fontSize:'22px', fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}
                  >−</button>
                  <span style={{ fontSize:'28px', fontWeight:900, color: isDark ? '#F0E6D6' : '#2D2A26', minWidth:'48px', textAlign:'center' }}>{qsQty}</span>
                  <button
                    onClick={() => setQsQty(qsQty + 1)}
                    style={{ width:'48px', height:'48px', borderRadius:'14px', border:'none', cursor:'pointer', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: isDark ? '#F0E6D6' : '#2D2A26', fontSize:'22px', fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}
                  >+</button>
                </div>
              </div>
            </div>

            {/* Preview Total */}
            {qsPrice && parseFloat(qsPrice) > 0 && (
              <div style={{ textAlign:'center', marginBottom:'20px', padding:'14px', borderRadius:'14px', background: isDark ? 'rgba(168,216,168,0.08)' : 'rgba(109,160,109,0.08)', border: `1px solid ${t.pistachio}22` }}>
                <p style={{ fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'2px', color: t.textMuted, margin:'0 0 4px' }}>Line Total</p>
                <p style={{ fontSize:'28px', fontWeight:900, color: t.pistachio, margin:0 }}>£{(parseFloat(qsPrice) * qsQty).toFixed(2)}</p>
              </div>
            )}

            <button
              onClick={handleQuickSaleAdd}
              disabled={!qsPrice || parseFloat(qsPrice) <= 0}
              style={{ width:'100%', padding:'16px', borderRadius:'16px', border:'none', cursor:'pointer', background: t.accent, color: isDark ? '#1A1A2E' : '#fff', fontWeight:900, fontSize:'14px', textTransform:'uppercase', letterSpacing:'2px', transition:'all 0.2s', opacity: (!qsPrice || parseFloat(qsPrice) <= 0) ? 0.4 : 1, boxShadow: (qsPrice && parseFloat(qsPrice) > 0) ? `0 6px 25px ${t.accent}40` : 'none' }}
            >
              Add to Cart
            </button>
            <button onClick={() => setQuickSaleOpen(false)} style={{ width:'100%', padding:'14px', marginTop:'8px', borderRadius:'14px', border:'none', cursor:'pointer', background:'transparent', color: isDark ? 'rgba(240,230,214,0.3)' : 'rgba(45,42,38,0.3)', fontWeight:800, fontSize:'11px', textTransform:'uppercase', letterSpacing:'2px', transition:'all 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.color = isDark ? '#F0E6D6' : '#2D2A26'; }} onMouseLeave={e => { e.currentTarget.style.color = isDark ? 'rgba(240,230,214,0.3)' : 'rgba(45,42,38,0.3)'; }}>Cancel</button>
          </div>
        </div>
      );
    })()}
    </>
  );
};
