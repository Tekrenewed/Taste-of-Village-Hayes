import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Plus, Minus, ShoppingBag, X, CheckCircle2, MessageCircle, Phone, MapPin } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { getMenuItems } from '../services/menuService';
import { MenuItem } from '../types';
import QRCode from 'react-qr-code';
import { buildWhatsAppLink, buildOrderWhatsAppMessage, SHOP_CONFIG, ACTIVE_PROMO } from '../shopConfig';
import { isValidUKMobile, getPhoneError, normaliseUKPhone, captureClientMeta } from '../lib/validation';
import { CustomisationModal } from '../components/CustomisationModal';
import { logTableScan, logSessionDuration } from '../services/analyticsService';
import type { FullMenuItem } from '../components/CustomisationModal';
import LiveOrderTracker from './LiveOrderTracker';
import { sendTableAlert } from '../services/tableService';

/* ─── Size Variations for Website ─── */
const WEB_SIZE_ITEMS: Record<string, { regular: number; large: number }> = {};

// Categories that always have Regular / Large
const SIZE_CATEGORIES: string[] = [];

import { appendItemsToOrder } from '../services/orderService';

export const Menu = () => {
  const navigate = useNavigate();
  const { addToCart, cart, removeFromCart, addOrder, clearCart, soldOutItems, tableSession } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('starters');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '' });
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<FullMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sizePickerItem, setSizePickerItem] = useState<MenuItem | null>(null);
  const [customisationItem, setCustomisationItem] = useState<FullMenuItem | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);


  useEffect(() => {
    async function loadMenu() {
      try {
        const items = await getMenuItems();
        setMenuItems(items);
      } catch (error) {
        console.error("Failed to load menu items", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadMenu();
  }, []);

  const categories = [
    { id: 'starters', label: 'Tala\'a Hua Zaiqah' },
    { id: 'curries', label: 'Desi Handi & Curries' },
    { id: 'karahi', label: 'Karahi E Khaas' },
    { id: 'bread', label: 'Naan, Roti & Paratha' },
    { id: 'rice', label: 'Biryani & Rice' },
    { id: 'bbq', label: 'BBQ / Tandoori Se' },
    { id: 'platters', label: 'Special Platters' },
    { id: 'burgers_noodles', label: 'Burgers & Noodles' },
    { id: 'chaat', label: 'Chatkara Junction' },
    { id: 'rolls', label: 'Flavorful Rolls' },
    { id: 'brunch', label: 'Brunch Offers' },
    { id: 'specials', label: 'Weekend Specials' },
    { id: 'desserts', label: 'Desserts' }
  ];

  const groupedMenu = categories.map(cat => ({
    ...cat,
    items: menuItems.filter(item => item.category === cat.id).map(item => ({
      ...item,
      is86d: soldOutItems.includes(item.id) || item.is86d 
    }))
  })).filter(group => group.items.length > 0);

  // ScrollSpy Logic
  useEffect(() => {
    if (isLoading || groupedMenu.length === 0) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        // We want the most recently intersecting entry
        const intersecting = entries.filter(e => e.isIntersecting);
        if (intersecting.length > 0) {
          setActiveCategory(intersecting[0].target.id.replace('category-', ''));
        }
      },
      {
        rootMargin: '-200px 0px -40% 0px',
        threshold: 0
      }
    );

    document.querySelectorAll('section[id^="category-"]').forEach(el => observer.current?.observe(el));

    return () => observer.current?.disconnect();
  }, [isLoading, menuItems]);

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    const element = document.getElementById(`category-${id}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 180;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const tableParam = searchParams.get('table') || searchParams.get('t');

  // ─── Analytics Engine: Dwell Time Tracking ───
  useEffect(() => {
    if (!tableParam) return;
    
    // Log the initial NFC tap
    logTableScan(tableParam, navigator.userAgent);
    
    const startTime = Date.now();
    
    const handleVisibilityChange = () => {
      // If they put phone to sleep or switch tabs, log duration so far
      if (document.visibilityState === 'hidden') {
        const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
        logSessionDuration(tableParam, durationSeconds);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      logSessionDuration(tableParam, durationSeconds);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tableParam]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // ─── Smart Cart Upsell Engine ───
  const hasCurry = cart.some(i => i.category === 'curries');
  const hasDrink = cart.some(i => i.category === 'drinks');
  const hasNaan = cart.some(i => i.category === 'naan_breads');

  const upsellSuggestions = menuItems.filter(item => {
    if (hasCurry && !hasNaan) return item.category === 'naan_breads' && item.popular;
    if (hasCurry && !hasDrink) return item.category === 'drinks' && item.popular;
    return item.category === 'starters' && item.popular; // Fallback
  }).filter(item => !cart.some(cartItem => cartItem.id.startsWith(item.id))).slice(0, 1);

  const handleProceedToDetails = () => {
    setCheckoutStep('details');
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Security: Client-side rate limit (60 seconds)
    const lastOrderTime = localStorage.getItem('last_order_time');
    if (lastOrderTime && Date.now() - parseInt(lastOrderTime) < 60000) {
      alert('You are placing orders too quickly. Please wait 60 seconds.');
      return;
    }

    // UK phone validation
    if (!isValidUKMobile(customerInfo.phone)) {
      setPhoneError(getPhoneError(customerInfo.phone) || 'Please enter a valid UK mobile number (07XXX XXXXXX)');
      return;
    }
    setPhoneError(null);

    // Capture IP/geolocation (non-blocking)
    const clientMeta = await captureClientMeta();

    const orderId = `ORD-${crypto.randomUUID().split('-')[0].toUpperCase()}`; // Secure, short, unguessable ID

    try {
      if (tableSession?.activeOrderId) {
        // Appending to an existing tab
        await appendItemsToOrder(tableSession.activeOrderId, cart);
        
        // Use a mock order for success screen or refetch the actual order
        const mockOrder = {
          id: tableSession.activeOrderId,
          status: 'pending', // Assume pending since we appended
          items: [...cart], // This is just for the LiveTracker until it streams the real order
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          total: cartTotal,
          type: 'dine-in',
          source: 'NFC',
          table_number: parseInt(tableParam as string)
        };
        
        setCompletedOrder(mockOrder);
        setCheckoutStep('success');
        clearCart();
        localStorage.setItem('last_order_time', Date.now().toString());
        return;
      }

      const newOrder = {
        id: orderId,
        customerName: customerInfo.name.trim(),
        customerPhone: normaliseUKPhone(customerInfo.phone),
        type: (tableParam ? 'dine-in' : 'collection') as any,
        ...(tableParam ? { table_number: parseInt(tableParam), payment_status: 'unpaid', source: 'NFC' } : {}),
        items: [...cart],
        total: ACTIVE_PROMO.enabled ? cartTotal * ACTIVE_PROMO.multiplier : cartTotal,
        status: 'pending' as const,
        timestamp: new Date(),
        ...(clientMeta ? { clientMeta } : {}),
      };

      await addOrder(newOrder as any);
      setCompletedOrder(newOrder);
      setCheckoutStep('success');
      clearCart();
      localStorage.setItem('last_order_time', Date.now().toString());
  
      // For Dine-in NFC orders, skip the WhatsApp redirect as the POS receives it directly
      if (!tableParam) {
        const message = buildOrderWhatsAppMessage(newOrder as any);
        const whatsappUrl = buildWhatsAppLink(message);
        window.open(whatsappUrl, '_blank');
      }
    } catch (e) {
      alert('Payment Server Error: Could not place the order. Please make sure your internet is working or contact the shop.');
    }
  };

  const getWhatsAppOrderLink = () => {
    if (!completedOrder) return '#';
    const message = buildOrderWhatsAppMessage(completedOrder);
    return buildWhatsAppLink(message);
  };

  return (
    <div className="min-h-screen bg-brand-cream pb-20">
      <SEOHead 
        title="Full Menu" 
        description="View the official menu for Taste of Village in Slough. Treat yourself to our Signature Samosa Chaat, Royal Heritage Taste of Village, Karak Chai, and more."
        canonicalUrl="/menu"
        schema={JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Menu",
          "name": `${SHOP_CONFIG.name} Full Menu`,
          "url": `${SHOP_CONFIG.website}/menu`,
          "mainEntityOfPage": `${SHOP_CONFIG.website}/menu`,
          "hasMenuSection": [
            {
              "@type": "MenuSection",
              "name": "Signature Halal Desserts",
              "hasMenuItem": [
                {
                  "@type": "MenuItem",
                  "name": "The Royal Heritage Taste of Village",
                  "description": "Our namesake masterpiece. A traditional South Asian taste-of-village originating from the Mughal Empire, modernised for our Slough community. It blends authentic Rooh Afza syrup imported from the East, sweet basil seeds, and rich artisanal kulfi."
                },
                {
                  "@type": "MenuItem",
                  "name": "Pistachio Royale Taste of Village",
                  "description": "A luxuriously nutty take on the classic Taste of Village, featuring deep layers of pistachio kulfi and roasted nuts."
                }
              ]
            },
            {
              "@type": "MenuSection",
              "name": "Authentic Street Food & Chaat",
              "hasMenuItem": [
                {
                  "@type": "MenuItem",
                  "name": "Taste of Village Special Chaat",
                  "description": "A legendary fusion of traditional Indian street food and late night cravings. Crispy papdi, sweet yogurt, and high-heat spices crafted using authentic recipes."
                },
                {
                  "@type": "MenuItem",
                  "name": "Samosa Chaat",
                  "description": "Widely regarded as the best Samosa Chaat near London. We refuse to use tinned chickpeas; we use real traditional, slow-cooking preparation methods. Our papdi and bhallas are freshly made in-house, never store-bought, guaranteeing an authentic nostalgic flavor."
                }
              ]
            }
          ]
        })}
      />
      {/* Category Filter - Sticky UberEats Style */}
      <div 
        className="bg-brand-cream/95 backdrop-blur-md shadow-sm sticky z-40 py-3 border-b border-brand-pinkLight/40 animate-fade-in"
        style={{ top: '116px' }}
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* Category pills */}
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollBehavior: 'smooth' }}>
            <div className="flex space-x-4">
              {groupedMenu.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all duration-300 border-2 ${
                    activeCategory === cat.id
                    ? 'bg-brand-text text-white border-brand-text shadow-md'
                    : 'bg-white text-brand-text/70 border-brand-pinkLight/20 hover:border-brand-text hover:text-brand-text'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Sections Rendered Sequentially */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        


        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-20 font-bold text-brand-text/50 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-brand-pink border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading menu...
          </div>
        )}

        {/* Render Each Category as a ScrollSpy Section */}
        {!isLoading && groupedMenu.map((group) => (
          <section key={group.id} id={`category-${group.id}`} className="mb-16 scroll-mt-48">
            <h2 className="font-serif text-4xl font-bold text-brand-text mb-8 tracking-tight">{group.label}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {group.items.map((item, i) => (
                <motion.div
                  key={item.id}
                  whileHover={!item.is86d ? { y: ["0px", "-10px", "0px"], scale: 1.02 } : {}}
                  transition={!item.is86d ? { y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }, scale: { duration: 0.4, ease: "easeOut" } } : {}}
                  className="bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 ease-spring group border border-brand-pinkLight/20 animate-fade-up"
                  style={{ animationDelay: `${(i % 3) * 50}ms` }}
                >
                  <div className="relative h-64 overflow-hidden rounded-t-[3rem]">
                    <motion.img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      onError={(e: any) => { e.target.onerror = null; e.target.src = '/assets/placeholder.png'; }}
                      whileHover={!item.is86d ? { scale: 1.08 } : {}}
                      className={`w-full h-full object-cover transition-transform duration-700 ease-out ${item.is86d ? 'grayscale opacity-70' : ''}`}
                    />
                    {!item.is86d && <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>}

                    {item.popular && !item.is86d && (
                      <span className="absolute top-4 left-4 bg-brand-pink text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full shadow-md z-10">
                        POPULAR
                      </span>
                    )}
                    
                    {item.is86d && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20">
                        <span className="bg-red-500 text-white text-xs font-black tracking-[4px] uppercase px-6 py-2 rounded-full shadow-2xl rotate-[-10deg]">
                          SOLD OUT
                        </span>
                      </div>
                    )}

                    {!item.is86d ? (
                      <button
                        onClick={() => {
                          const fullItem = item as FullMenuItem;
                          const hasCustomisation =
                            (fullItem.variants && fullItem.variants.length > 1) ||
                            (fullItem.modifier_groups && fullItem.modifier_groups.length > 0);
                          if (hasCustomisation) {
                            setCustomisationItem(fullItem);
                          } else if (SIZE_CATEGORIES.includes(item.category)) {
                            setSizePickerItem(item);
                          } else {
                            addToCart(item);
                            setIsCartOpen(true);
                          }
                        }}
                        disabled={item.is86d}
                        title={`Add ${item.name} to order`}
                        className={`absolute bottom-4 right-4 bg-white text-brand-text p-4 rounded-full shadow-lg hover:bg-brand-blue hover:text-white transition-all transform hover:scale-110 active:scale-95 z-20 group-hover:shadow-[0_0_20px_rgba(191,214,120,0.5)]`}
                      >
                        <Plus size={24} />
                      </button>
                    ) : null}
                  </div>
                  <div className="p-6 space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-serif text-xl font-bold text-brand-text leading-tight">{item.name}</h3>
                      <div className="text-right">
                        {item.originalPrice && item.originalPrice > item.price ? (
                          <div className="flex flex-col items-end">
                            <span className="text-gray-400 line-through text-sm font-bold">£{item.originalPrice.toFixed(2)}</span>
                            <span className="font-black text-red-500 text-xl whitespace-nowrap">{item.price === 0 ? 'FREE' : `£${item.price.toFixed(2)}`}</span>
                          </div>
                        ) : (
                          <span className="font-bold text-brand-pink text-xl whitespace-nowrap">{item.price === 0 ? 'FREE' : `£${item.price.toFixed(2)}`}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-brand-text/80 font-medium text-sm leading-relaxed line-clamp-3">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Table Action Buttons */}
      {tableParam && (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 animate-fade-up">
          <button
            onClick={() => {
              sendTableAlert(tableParam, 'waiter');
              alert('A waiter has been called to your table.');
            }}
            className="bg-white text-brand-obsidian px-4 py-3 rounded-2xl font-bold shadow-xl border border-gray-100 flex items-center gap-2 hover:bg-brand-electricPeach hover:text-white transition-all"
          >
            🛎️ Call Waiter
          </button>
          <button
            onClick={() => {
              sendTableAlert(tableParam, 'bill');
              alert('Your bill is being prepared. A waiter will bring the card machine shortly.');
            }}
            className="bg-brand-obsidian text-white px-4 py-3 rounded-2xl font-bold shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
          >
            🧾 Bill Please
          </button>
        </div>
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-brand-text text-white px-6 py-4 rounded-full font-bold shadow-2xl hover:shadow-xl transition-all flex items-center gap-3 animate-fade-up"
        >
          <ShoppingBag size={22} />
          <span>{cart.reduce((s, i) => s + i.quantity, 0)} items — £{(ACTIVE_PROMO.enabled ? cartTotal * ACTIVE_PROMO.multiplier : cartTotal).toFixed(2)}{ACTIVE_PROMO.enabled ? ` (${ACTIVE_PROMO.floatingLabel})` : ''}</span>
        </button>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slideIn">
            <div className="p-6 border-b flex justify-between items-center bg-brand-pinkLight/20">
              <h2 className="font-serif text-2xl font-bold text-brand-text">
                {checkoutStep === 'cart' ? 'Your Order' : checkoutStep === 'details' ? 'Details' : 'Order Confirmed!'}
              </h2>
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  if (checkoutStep === 'success') {
                    setCheckoutStep('cart');
                    setCompletedOrder(null);
                  }
                }} 
                title="Close cart" 
                className="p-2 hover:bg-brand-pinkLight/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {checkoutStep === 'cart' && (
              <>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center text-brand-text/40 mt-10">
                  <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img src={item.image} alt="" onError={(e: any) => { e.target.onerror = null; e.target.src = '/assets/placeholder.png'; }} className="w-16 h-16 rounded-full shadow-sm object-cover border border-brand-pinkLight/30 cursor-pointer hover:rotate-6 transition-transform" />
                    <div className="flex-1">
                      <h4 className="font-bold text-brand-text">{item.name}</h4>
                      <p className="text-brand-pink text-sm">£{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-brand-cream rounded-full px-3 py-1">
                      <button className="text-brand-text/50 hover:text-brand-text" title="Decrease quantity" onClick={() => removeFromCart(item.id)}><Minus size={14} /></button>
                      <span className="font-bold text-sm text-brand-text">{item.quantity}</span>
                      <button className="text-brand-text/50 hover:text-brand-text" title="Increase quantity" onClick={() => addToCart(item)}><Plus size={14} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t bg-brand-cream">
              {/* ─── Cart Upsell Engine Render ─── */}
              {upsellSuggestions.length > 0 && cartTotal > 0 && (
                <div className="mb-4 bg-white p-4 rounded-[2rem] border border-brand-pinkLight shadow-md flex items-center justify-between animate-fade-in relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-brand-pinkLight/40 to-transparent rounded-bl-full group-hover:scale-150 transition-transform duration-700 ease-spring"></div>
                  <div className="flex items-center gap-3 relative z-10 w-2/3">
                    <img src={upsellSuggestions[0].image} className="w-12 h-12 rounded-full object-cover shadow-sm border border-brand-pinkLight/50 flex-shrink-0" alt=""  onError={(e: any) => { e.target.onerror = null; e.target.src = '/assets/placeholder.png'; }} />
                    <div className="truncate">
                      <p className="text-[10px] font-black text-brand-pink uppercase tracking-widest mb-0.5">Perfect Pairing</p>
                      <p className="font-bold text-brand-text text-sm leading-tight truncate">{upsellSuggestions[0].name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (SIZE_CATEGORIES.includes(upsellSuggestions[0].category)) {
                        setSizePickerItem(upsellSuggestions[0]);
                      } else {
                        addToCart(upsellSuggestions[0]);
                      }
                    }}
                    className="relative z-10 bg-brand-text text-white px-4 py-2 rounded-full font-bold text-xs shadow-md hover:scale-105 transition-transform"
                  >
                    + £{upsellSuggestions[0].price.toFixed(2)}
                  </button>
                </div>
              )}

              <div className="flex justify-between mb-4 text-lg font-bold text-brand-text">
                <span>Total {ACTIVE_PROMO.enabled && <span className="text-brand-pink text-xs bg-brand-pinkLight px-2 py-1 rounded-full uppercase ml-2">{ACTIVE_PROMO.cartLabel}</span>}</span>
                <div className="flex flex-col items-end">
                  {ACTIVE_PROMO.enabled && <span className="text-gray-400 line-through text-sm">£{cartTotal.toFixed(2)}</span>}
                  <span>£{(ACTIVE_PROMO.enabled ? cartTotal * ACTIVE_PROMO.multiplier : cartTotal).toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleProceedToDetails}
                disabled={cart.length === 0}
                className="w-full py-4 bg-brand-text text-white rounded-[1.5rem] font-bold hover:bg-brand-text/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Checkout
              </button>
            </div>
            </>
            )}

            {checkoutStep === 'details' && (
              <form onSubmit={submitOrder} className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="mb-4">
                    {tableParam ? (
                      <>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><MapPin size={16} /> Dine-In • Table {tableParam}</p>
                        <h3 className="font-serif text-2xl font-bold text-brand-text">Sent to Kitchen Instantly</h3>
                        <p className="text-gray-600 text-sm mt-2">Sit back and relax. Your order will be sent straight to the chef. You can pay with our staff before you leave.</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Collection Order</p>
                        <h3 className="font-serif text-2xl font-bold text-brand-text">Pay in Store</h3>
                        <p className="text-gray-600 text-sm mt-2">Skip the queue by ordering ahead. Provide your details below, and pay when you arrive to pick up your order.</p>
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        required
                        autoFocus
                        className="w-full p-4 bg-gray-50 rounded-[1.5rem] border border-brand-pinkLight/50 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all"
                        value={customerInfo.name}
                        onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        required
                        className={`w-full p-4 bg-gray-50 rounded-[1.5rem] border focus:ring-2 outline-none transition-all ${
                          phoneError
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                            : 'border-brand-pinkLight/50 focus:border-brand-pink focus:ring-brand-pink/20'
                        }`}
                        value={customerInfo.phone}
                        onChange={e => {
                          setCustomerInfo({ ...customerInfo, phone: e.target.value });
                          if (phoneError) setPhoneError(getPhoneError(e.target.value));
                        }}
                        onBlur={() => {
                          if (customerInfo.phone.trim()) setPhoneError(getPhoneError(customerInfo.phone));
                        }}
                        placeholder="07XXX XXXXXX"
                        maxLength={15}
                      />
                      {phoneError && (
                        <p className="text-red-500 text-xs font-bold mt-1.5">{phoneError}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email <span className="text-gray-400 font-normal">(optional — for loyalty rewards)</span></label>
                      <input
                        type="email"
                        className="w-full p-4 bg-gray-50 rounded-[1.5rem] border border-brand-pinkLight/50 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all"
                        value={customerInfo.email}
                        onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t bg-brand-cream space-y-4">
                  
                  <div className="bg-white p-4 rounded-[1.5rem] border border-brand-rose/20 flex flex-col gap-1 items-center mb-2">
                    <p className="text-xs text-brand-text/60 font-bold uppercase tracking-wider">Order Summary</p>
                    <p className="text-sm font-medium text-brand-text text-center text-balance">
                      You are about to place an order for <span className="font-bold">{cart.reduce((s, i) => s + i.quantity, 0)} items</span>.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={customerInfo.name.trim() === '' || customerInfo.phone.trim() === '' || !!phoneError}
                    className="w-full py-4 px-6 bg-brand-text text-white rounded-[1.5rem] font-extrabold text-lg flex items-center justify-center gap-3 transition-all luxury-shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none hover:bg-brand-text/90 hover:scale-[1.02]"
                  >
                    <span>Pay in-store</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">£{(ACTIVE_PROMO.enabled ? cartTotal * ACTIVE_PROMO.multiplier : cartTotal).toFixed(2)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="w-full py-3 border-2 border-brand-blue/50 text-brand-text/70 rounded-[1.5rem] font-bold hover:bg-brand-blue/20 hover:text-brand-text transition-colors"
                  >
                    ← Back to Cart
                  </button>
                </div>
              </form>
            )}

            {checkoutStep === 'success' && completedOrder && (
              tableParam ? (
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-brand-cream/50">
                  <LiveOrderTracker 
                    initialOrder={completedOrder} 
                    tableId={tableParam} 
                    onAddToTab={() => {
                      setIsCartOpen(false);
                      setCheckoutStep('cart');
                      // Clear local cart but keep order session alive
                    }} 
                  />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={40} />
                  </div>
                  
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-brand-text mb-2">Order Placed!</h3>
                    <p className="text-gray-600">Tap below to send your order to the shop via WhatsApp for fastest confirmation.</p>
                  </div>

                  {/* WhatsApp Send Button — the primary CTA (Only for non-table orders) */}
                  <a
                    href={getWhatsAppOrderLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-[#25D366] text-white rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:bg-[#20BD5A] transition-colors"
                  >
                    <MessageCircle size={24} />
                    Send Order via WhatsApp
                  </a>

                  {/* Or call */}
                  <a
                    href={`tel:${SHOP_CONFIG.phoneNumberRaw}`}
                    className="w-full py-3 bg-white text-brand-text rounded-[1.5rem] font-bold border-2 border-brand-pinkLight/50 flex items-center justify-center gap-3 hover:bg-brand-pinkLight/10 transition-colors"
                  >
                    <Phone size={20} />
                    Or Call to Confirm
                  </a>

                  <div className="bg-white p-6 rounded-3xl shadow-xl border border-brand-pinkLight/30 inline-block">
                    <QRCode 
                      value={`TASTE OF VILLAGE-ORDER:${completedOrder.id}`} 
                      size={140}
                      fgColor="#2B1A12"
                      level="Q"
                    />
                  </div>

                  <div className="bg-brand-cream w-full py-4 px-6 rounded-[2rem] border border-brand-pinkLight border-dashed">
                    <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Order Number</p>
                    <p className="font-mono text-3xl font-black text-brand-text tracking-tighter">{completedOrder.id}</p>
                  </div>

                  <p className="text-sm font-bold text-brand-blue mt-2">
                    📸 Screenshot this page or track your order live below.
                  </p>

                  <a
                    href={`/track/${completedOrder.id}`}
                    className="w-full py-4 bg-gradient-to-r from-brand-pink to-rose-400 text-white rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    📍 Track Your Order Live
                  </a>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setCheckoutStep('cart');
                      setCompletedOrder(null);
                    }}
                    className="w-full py-4 bg-brand-text text-white rounded-[1.5rem] font-bold mt-2"
                  >
                    Done
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* ─── Size Picker Modal ─── */}
      {sizePickerItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSizePickerItem(null)}></div>
          <div className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full mx-4 shadow-2xl animate-fade-up">
            <button onClick={() => setSizePickerItem(null)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <img src={sizePickerItem.image} alt={sizePickerItem.name} className="w-24 h-24 rounded-[2rem] object-cover mx-auto mb-4 shadow-md"  onError={(e: any) => { e.target.onerror = null; e.target.src = '/assets/placeholder.png'; }} />
              <h3 className="font-serif text-xl font-bold text-brand-text">{sizePickerItem.name}</h3>
              <p className="text-brand-text/50 text-sm mt-1">Choose your size</p>
            </div>

            <div className="space-y-3">
              {(() => {
                const sizes = WEB_SIZE_ITEMS[sizePickerItem.name];
                const regularPrice = sizes ? sizes.regular : sizePickerItem.price;
                const largePrice = sizes ? sizes.large : sizePickerItem.price + 1.50;
                return (
                  <>
                    <button
                      onClick={() => {
                        addToCart({ ...sizePickerItem, id: `${sizePickerItem.id}_regular`, name: `${sizePickerItem.name} (Regular)`, price: regularPrice });
                        setSizePickerItem(null);
                        setIsCartOpen(true);
                      }}
                      className="w-full flex items-center justify-between p-5 rounded-[2rem] border-2 border-brand-pinkLight/30 hover:border-brand-pink hover:bg-brand-pinkLight/10 transition-all group"
                    >
                      <div className="text-left">
                        <p className="font-bold text-brand-text group-hover:text-brand-pink transition-colors">Regular</p>
                        <p className="text-brand-text/40 text-xs">Standard serving</p>
                      </div>
                      <span className="font-black text-brand-pink text-lg">£{regularPrice.toFixed(2)}</span>
                    </button>
                    <button
                      onClick={() => {
                        addToCart({ ...sizePickerItem, id: `${sizePickerItem.id}_large`, name: `${sizePickerItem.name} (Large)`, price: largePrice });
                        setSizePickerItem(null);
                        setIsCartOpen(true);
                      }}
                      className="w-full flex items-center justify-between p-5 rounded-[2rem] border-2 border-brand-pink/30 bg-brand-pinkLight/10 hover:border-brand-pink hover:bg-brand-pinkLight/20 transition-all group"
                    >
                      <div className="text-left">
                        <p className="font-bold text-brand-text group-hover:text-brand-pink transition-colors">Large ⭐</p>
                        <p className="text-brand-text/40 text-xs">Extra generous portion</p>
                      </div>
                      <span className="font-black text-brand-pink text-lg">£{largePrice.toFixed(2)}</span>
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ─── Customisation Modal (DB variants + modifiers + allergens) ─── */}
      {customisationItem && (
        <CustomisationModal
          item={customisationItem}
          onClose={() => setCustomisationItem(null)}
          onAddToCart={(cartItem) => {
            addToCart(cartItem as any);
            setCustomisationItem(null);
            setIsCartOpen(true);
          }}
        />
      )}
    </div>
  );
};
