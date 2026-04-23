import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Plus, Minus, ShoppingBag, X, CheckCircle2, AlertCircle, Clock, ChefHat, Check } from 'lucide-react';
import { MenuItem } from '../types';
import { getMenuItems } from '../services/menuService';
import { useRealtimeContext } from '../context/RealtimeProvider';

export const Order = () => {
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get('table');
  const storeParam = searchParams.get('store');
  const isCollection = !tableParam;

  const { addToCart, cart, removeFromCart, clearCart, soldOutItems } = useStore();
  const { adapter, orders } = useRealtimeContext();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>('pending');
  const [activeQueueLength, setActiveQueueLength] = useState<number>(0);

  const observer = useRef<IntersectionObserver | null>(null);

  // Fallback store ID if not provided in URL
  const activeStoreId = storeParam || 'f4100da2-1111-1111-1111-000000000001';

  useEffect(() => {
    async function fetchMenuFromGoBackend() {
      try {
        setIsLoading(true);
        // Use relative URL so it works seamlessly on production via Firebase Hosting rewrites
        const res = await fetch(`/api/v1/stores/${activeStoreId}/menu`);
        if (!res.ok) throw new Error('Failed to fetch menu');
        const data = await res.json();
        
        // Guard: if the API returns null or a non-array, fall back to local constants
        if (!Array.isArray(data) || data.length === 0) {
          console.warn('API returned empty/null menu, falling back to Firestore/local');
          const fallback = (await getMenuItems()).filter(item => !soldOutItems.includes(item.id));
          setMenuItems(fallback);
          if (fallback.length > 0) setActiveCategory(fallback[0].category);
          return;
        }

        // Map the backend DB response to frontend MenuItem format
        const items: MenuItem[] = data
          .filter((d: any) => d && d.product_name) // skip null/malformed rows
          .map((d: any) => ({
            id: d.product_id || d.id || '',
            name: d.product_name || 'Unknown Item',
            category: (d.category || 'other').toLowerCase().replace(/ /g, '_'), // null-safe normalize
            price: d.final_price ?? 0,
            description: '',
            image: '/assets/placeholder_dessert.jpg',
            is86d: !!d.is_86d,
            popular: false,
          }))
          .filter((d: MenuItem) => !d.is86d);

        setMenuItems(items);
        if (items.length > 0) setActiveCategory(items[0].category);
      } catch (err: any) {
        // On any fetch error, fall back to local constants so customers can still browse
        console.error('Menu fetch failed, using Firestore/local fallback:', err.message);
        const fallback = (await getMenuItems()).filter(item => !soldOutItems.includes(item.id));
        setMenuItems(fallback);
        if (fallback.length > 0) setActiveCategory(fallback[0].category);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMenuFromGoBackend();
  }, [activeStoreId]);

  // Derive categories automatically from items
  const categoriesMap = new Map();
  menuItems.forEach(item => {
    if (!categoriesMap.has(item.category)) categoriesMap.set(item.category, []);
    categoriesMap.get(item.category).push(item);
  });

  const groupedMenu = Array.from(categoriesMap.keys()).map(cat => ({
    id: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' '),
    items: categoriesMap.get(cat)
  }));


  // ScrollSpy Logic
  useEffect(() => {
    if (isLoading || groupedMenu.length === 0) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter(e => e.isIntersecting);
        if (intersecting.length > 0) {
          setActiveCategory(intersecting[0].target.id.replace('cat-', ''));
        }
      },
      { rootMargin: '-200px 0px -40% 0px', threshold: 0 }
    );

    document.querySelectorAll('section[id^="cat-"]').forEach(el => observer.current?.observe(el));
    return () => observer.current?.disconnect();
  }, [isLoading, menuItems]);

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    const element = document.getElementById(`cat-${id}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 180;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCreateGoOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const newOrder = {
      store_id: activeStoreId,
      source: 'Web',
      table_number: isCollection ? null : parseInt(tableParam!),
      customer_name: isCollection ? customerInfo.name : null,
      customer_phone: isCollection ? customerInfo.phone : null,
      apply_service_charge: false,
      items: cart.map(item => ({
        product_id: item.id,
        name: item.name,
        price_paid: item.price,
        is_takeaway: isCollection,
        vat_rate: 0.20 // default 20%
      }))
    };

    try {
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (!res.ok) throw new Error('Order creation failed');
      
      const summary = await res.json();
      setCompletedOrderId(summary.order_id);
      setCheckoutStep('success');
      clearCart();

      // Get queue length from the realtime context (decoupled)
      try {
        setActiveQueueLength(orders.filter((o: any) => !['completed', 'no_show'].includes(o.status)).length);
      } catch(e) {}
    } catch (err) {
      alert("Failed to create order, please try again. " + err);
    }
  };

  // Track order status via the decoupled adapter
  useEffect(() => {
    if (!completedOrderId) return;
    const unsub = adapter.orders.subscribeToSingleOrder(
      completedOrderId,
      (order) => {
        if (order) {
          setOrderStatus(order.status);
        } else {
          setOrderStatus('completed');
        }
      },
      (error) => {
        console.error('[Order] Tracking subscription failed:', error);
      }
    );
    return () => unsub();
  }, [completedOrderId, adapter]);

  // Derived estimated wait time based on queue
  const estimatedWaitMins = Math.max(5, activeQueueLength * 3); // 3 mins per ticket avg

  return (
    <div className="min-h-screen bg-brand-cacao pb-20 pt-8">
      <div className="max-w-3xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-2xl p-6 text-center border border-brand-text/10 shadow-sm">
          <h1 className="font-display text-4xl text-brand-text font-bold mb-2">
            {isCollection ? 'Collection Order' : `Table ${tableParam}`}
          </h1>
          <p className="text-brand-text/80">
            {isCollection ? 'Order ahead and pick up securely.' : 'Scan, order, relax. We bring it right to you.'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-brand-text/50 animate-pulse">Loading Live Menu...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-400 font-bold flex flex-col items-center gap-4">
          <AlertCircle size={48} />
          {error}
        </div>
      ) : (
        <>
          {/* Category Filter */}
          <div className="bg-brand-cacao/95 backdrop-blur-md shadow-sm sticky z-40 py-4 border-b border-brand-text/10 top-0">
            <div className="max-w-7xl mx-auto px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollBehavior: 'smooth' }}>
              <div className="flex space-x-4">
                {groupedMenu.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all border-2 ${
                      activeCategory === cat.id
                      ? 'bg-brand-pink text-white border-brand-pink shadow-md'
                      : 'bg-white text-brand-text/50 border-brand-text/10 hover:border-brand-pink/30 hover:text-brand-text'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-8">
            {groupedMenu.map((group) => (
              <section key={group.id} id={`cat-${group.id}`} className="mb-16 scroll-mt-48">
                <h2 className="font-display text-3xl font-bold text-brand-text mb-6">{group.label}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.items.map((item: MenuItem) => (
                    <div key={item.id} className="bg-white rounded-3xl p-4 border border-brand-text/5 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
                       <div className="w-24 h-24 rounded-2xl bg-brand-cacao flex-shrink-0 overflow-hidden shadow-inner border border-brand-text/5">
                          {/* Wait for real images in Go DB for now use glass placeholder */}
                          <div className="w-full h-full bg-gradient-to-br from-brand-pink/20 to-brand-rose/40" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <h3 className="text-brand-text font-bold text-lg mb-1 truncate">{item.name}</h3>
                         <span className="text-brand-pink font-black">£{item.price.toFixed(2)}</span>
                       </div>
                       <button
                          onClick={() => { addToCart(item); setIsCartOpen(true); }}
                          className="w-12 h-12 rounded-full bg-brand-cacao border border-brand-text/10 text-brand-text flex justify-center items-center font-bold hover:bg-brand-pink hover:text-white hover:border-brand-pink transition-colors flex-shrink-0"
                        >
                          <Plus size={20} />
                        </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 w-[calc(100%-3rem)] max-w-sm left-1/2 -translate-x-1/2 z-50 bg-white text-brand-text px-6 py-4 rounded-full font-bold shadow-2xl hover:scale-[1.02] transition-transform flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="bg-brand-pink text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">{cart.reduce((s, i) => s + i.quantity, 0)}</div>
            <span>View Cart</span>
          </div>
          <span>£{cartTotal.toFixed(2)}</span>
        </button>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="font-display text-2xl font-bold text-brand-text">
                {checkoutStep === 'cart' ? 'Your Order' : checkoutStep === 'details' ? 'Complete Order' : 'Success!'}
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {checkoutStep === 'cart' && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                      <div>
                        <h4 className="font-bold text-brand-text">{item.name}</h4>
                        <p className="text-brand-pink text-sm font-bold">£{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-4 bg-white rounded-full px-2 py-1 shadow-sm border border-gray-100">
                        <button className="text-gray-400 p-2" onClick={() => removeFromCart(item.id)}><Minus size={14} /></button>
                        <span className="font-bold text-brand-text w-4 text-center">{item.quantity}</span>
                        <button className="text-gray-400 p-2" onClick={() => addToCart(item)}><Plus size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t">
                  <div className="flex justify-between mb-4 text-lg font-bold text-brand-text">
                    <span>Total</span>
                    <span>£{cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => setCheckoutStep('details')}
                    disabled={cart.length === 0}
                    className="w-full py-4 bg-brand-pink text-white rounded-xl font-bold hover:bg-brand-pink/90 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </>
            )}

            {checkoutStep === 'details' && (
              <form onSubmit={handleCreateGoOrder} className="flex-1 flex flex-col">
                 <div className="flex-1 overflow-y-auto p-6">
                   <div className="space-y-4 mb-6">
                     <label className="block text-sm font-bold">Your Name {isCollection ? '' : '(Optional)'}</label>
                     <input autoFocus required={isCollection} value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl" placeholder="John" />
                     <label className="block text-sm font-bold flex justify-between items-center">
                        <span>Phone Number {isCollection ? '' : '(Optional)'}</span>
                        {!isCollection && <span className="text-brand-pink text-xs bg-brand-pink/10 px-2 py-1 rounded-full">Earn points & track order!</span>}
                     </label>
                     <input required={isCollection} type="tel" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl" placeholder="07700 900000" />
                   </div>
                   <p className="text-gray-500 text-sm mb-4">
                     {isCollection ? 'Pay securely online or at the counter upon pickup.' : `Your order will be linked to Table ${tableParam}. Pay securely online or at the table.`}
                   </p>
                 </div>
                 <div className="p-6 border-t space-y-3">
                    <button type="submit" className="w-full py-4 bg-brand-pink text-white rounded-xl font-bold hover:bg-brand-pink/90 shadow-lg shadow-brand-pink/20">
                      Submit Order to Kitchen
                    </button>
                    <button type="button" onClick={() => setCheckoutStep('cart')} className="w-full py-3 text-brand-text/60 font-bold hover:text-brand-text">Back</button>
                 </div>
              </form>
            )}

            {checkoutStep === 'success' && (
               <div className="flex-1 flex flex-col p-6">
                 <h2 className="text-3xl font-display font-bold text-center text-brand-text mb-2 mt-4">Live Tracking</h2>
                 <p className="text-gray-500 text-center mb-8">
                   Order Number: <span className="font-bold text-brand-text">#{completedOrderId?.substring(0, 8)}</span>
                 </p>
                 
                 <div className="flex-1">
                   <div className="relative pl-8 space-y-10 before:absolute before:inset-y-2 before:left-[1.35rem] before:w-0.5 before:bg-brand-rose/30">
                     
                     {/* Step 1: Received */}
                     <div className={`relative flex items-center gap-4 transition-all ${['pending','preparing','ready','completed'].includes(orderStatus) ? 'opacity-100' : 'opacity-40'}`}>
                       <div className="absolute -left-12 w-8 h-8 rounded-full flex items-center justify-center shadow-lg bg-orange-400 text-white z-10 border-4 border-white">
                         <CheckCircle2 size={16} />
                       </div>
                       <div>
                         <h4 className="font-bold text-lg text-brand-text">Order Received</h4>
                         <p className="text-gray-500 text-sm">We've got your order and are checking it.</p>
                       </div>
                     </div>

                     {/* Step 2: Preparing */}
                     <div className={`relative flex items-center gap-4 transition-all ${['preparing','ready','completed'].includes(orderStatus) ? 'opacity-100' : 'opacity-40'}`}>
                       <div className={`absolute -left-12 w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-10 border-4 border-white ${['preparing','ready','completed'].includes(orderStatus) ? 'bg-amber-400 text-white' : 'bg-gray-200 text-gray-400'}`}>
                         <ChefHat size={16} />
                       </div>
                       <div>
                         <h4 className="font-bold text-lg text-brand-text flex items-center gap-2">
                           Preparing
                           {orderStatus === 'preparing' && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span></span>}
                         </h4>
                         <p className="text-gray-500 text-sm">Our chefs are assembling your order.</p>
                       </div>
                     </div>

                     {/* Step 3: Ready */}
                     <div className={`relative flex items-center gap-4 transition-all ${['ready','completed'].includes(orderStatus) ? 'opacity-100' : 'opacity-40'}`}>
                       <div className={`absolute -left-12 w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-10 border-4 border-white ${['ready','completed'].includes(orderStatus) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                         <Check size={16} />
                       </div>
                       <div>
                         <h4 className={`font-bold text-lg ${['ready','completed'].includes(orderStatus) ? 'text-green-600' : 'text-brand-text'}`}>
                           {isCollection ? 'Ready for Pickup!' : 'On the Way!'}
                         </h4>
                         <p className="text-gray-500 text-sm">
                           {isCollection ? 'Please head to the counter.' : 'We are bringing it to your table now.'}
                         </p>
                       </div>
                     </div>

                   </div>
                 </div>

                 {/* ETA Block */}
                 {['pending', 'preparing'].includes(orderStatus) && (
                   <div className="bg-brand-rose/10 rounded-2xl p-4 flex items-center gap-4 mb-4 border border-brand-rose/20">
                     <Clock className="text-brand-pink" size={24} />
                     <div>
                       <p className="text-sm font-bold text-brand-text">Estimated Wait</p>
                       <p className="text-gray-600 text-sm">~ {estimatedWaitMins} minutes</p>
                     </div>
                   </div>
                 )}
                 
                 <button onClick={() => {setIsCartOpen(false); setCheckoutStep('cart'); setCompletedOrderId(null);}} className="w-full py-4 bg-brand-text text-white rounded-xl font-bold mt-4">Start New Order</button>
               </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
