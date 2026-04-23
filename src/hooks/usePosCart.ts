import { useState, useCallback, useMemo } from 'react';
import { MenuItem, CartItem, Order, CustomerProfile, Reward } from '../types';
import { SIZE_VARIATIONS, ITEM_MODIFIERS } from '../pages/AdminPOS/PosConstants';
import { ORDER_SOURCE } from '../lib/statusConstants';

export function usePosCart(addOrder: (order: Order) => void | Promise<void>, soldOutItems: string[]) {
  // Cart & Order Info
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [posOrderType, setPosOrderType] = useState<'dine-in' | 'takeaway' | 'collection'>('dine-in');
  const [posTable, setPosTable] = useState<number | null>(null);
  const [posGuestCount, setPosGuestCount] = useState<number | null>(null);
  const [posSplitBill, setPosSplitBill] = useState(false);
  const [posCustomerName, setPosCustomerName] = useState('');
  const [posCustomerPhone, setPosCustomerPhone] = useState('');
  const [posCustomerEmail, setPosCustomerEmail] = useState('');
  
  // Modals & Selection state
  const [sizePickerItem, setSizePickerItem] = useState<MenuItem | null>(null);
  const [modifierPickerItem, setModifierPickerItem] = useState<MenuItem | null>(null);
  const [modifierSelections, setModifierSelections] = useState<Record<string, string>>({});
  
  // Loyalty & Discount
  const [posLoyaltyProfile, setPosLoyaltyProfile] = useState<CustomerProfile | null>(null);
  const [posAvailableRewards, setPosAvailableRewards] = useState<Reward[]>([]);
  const [posAppliedReward, setPosAppliedReward] = useState<Reward | null>(null);
  const [posDiscountAmount, setPosDiscountAmount] = useState(0);
  
  // Status
  const [posSubmitting, setPosSubmitting] = useState(false);
  const [posLastOrder, setPosLastOrder] = useState<Order | null>(null);

  // Computed values
  const posSubtotal = useMemo(() => 
    posCart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  , [posCart]);
  
  const posTotal = useMemo(() => 
    Math.max(0, posSubtotal - posDiscountAmount)
  , [posSubtotal, posDiscountAmount]);

  const addItemDirectly = useCallback((item: any) => {
    setPosCart(prev => {
      const cartKey = item._cartKey || item.id;
      const existing = prev.find(i => (i._cartKey || i.id) === cartKey);
      if (existing) {
        return prev.map(i => (i._cartKey || i.id) === cartKey ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, _cartKey: cartKey, quantity: 1 }];
    });
  }, []);

  const addToPosCart = useCallback((item: MenuItem) => {
    const full = item as any;
    // Prefer DB-driven customisation (variants or modifier groups from API)
    const hasDbVariants = full.variants && full.variants.length > 1;
    const hasDbModifiers = full.modifier_groups && full.modifier_groups.length > 0;
    if (hasDbVariants || hasDbModifiers) {
      setSizePickerItem(item); // reuse state — PosPanel reads this to open CustomisationModal
      return;
    }
    // Legacy fallback: hardcoded SIZE_VARIATIONS / ITEM_MODIFIERS
    if (SIZE_VARIATIONS[item.name]) {
      setSizePickerItem(item);
      return;
    }
    const mods = ITEM_MODIFIERS[item.name];
    if (mods) {
      setModifierPickerItem(item);
      const initialMods: Record<string, string> = {};
      mods.forEach(m => initialMods[m.name] = m.default);
      setModifierSelections(initialMods);
      return;
    }
    addItemDirectly(item);
  }, [addItemDirectly]);


  const addSizedItemToCart = useCallback((item: MenuItem, size: 'regular' | 'large') => {
    const sizeInfo = SIZE_VARIATIONS[item.name];
    if (!sizeInfo) return;
    const sizeLabel = size === 'large' ? 'L' : 'R';
    const sizedItem = {
      ...item,
      _cartKey: `${item.id}_${size}`,
      name: `${item.name} (${sizeLabel})`,
      price: sizeInfo[size],
    };
    addItemDirectly(sizedItem);
    setSizePickerItem(null);
  }, [addItemDirectly]);

  const addModifiedItemToCart = useCallback(() => {
    if (!modifierPickerItem) return;
    const item = modifierPickerItem;
    const modString = Object.entries(modifierSelections)
      .sort((a,b) => a[0].localeCompare(b[0]))
      .map(([k,v]) => `${k}:${v}`)
      .join('|');
    const modifiedItem = {
      ...item,
      _cartKey: `${item.id}_${modString}`,
      modifiers: modifierSelections,
    };
    addItemDirectly(modifiedItem);
    setModifierPickerItem(null);
  }, [modifierPickerItem, modifierSelections, addItemDirectly]);

  const updatePosQty = useCallback((id: string, delta: number) => {
    setPosCart(prev => prev.map(i => {
      const key = i._cartKey || i.id;
      if (key !== id) return i;
      const newQty = i.quantity + delta;
      return newQty <= 0 ? null : { ...i, quantity: newQty };
    }).filter(Boolean) as CartItem[]);
  }, []);

  const clearCart = useCallback(() => {
    setPosCart([]);
    setPosCustomerName('');
    setPosCustomerPhone('');
    setPosCustomerEmail('');
    setPosTable(null);
    setPosGuestCount(null);
    setPosSplitBill(false);
    setPosAppliedReward(null);
    setPosDiscountAmount(0);
    setPosLoyaltyProfile(null);
    setPosAvailableRewards([]);
  }, []);

  const resetAfterOrder = useCallback((newOrder: Order) => {
    setPosLastOrder(newOrder);
    clearCart();
    setTimeout(() => setPosLastOrder(null), 5000);
  }, [clearCart]);

  const submitPosOrder = async (paymentMethod: 'cash' | 'card' | 'unpaid') => {
    if (posCart.length === 0) return;
    setPosSubmitting(true);
    
    const orderId = `POS-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
    const newOrder: Order = {
      id: orderId,
      customerName: posCustomerName.trim() || 'Walk-in',
      customerPhone: posCustomerPhone.trim() || '',
      customerEmail: posCustomerEmail.trim() || '',
      type: posOrderType as any,
      table_number: posOrderType === 'dine-in' ? Number(posTable) : undefined,
      items: posCart.map(item => ({
        ...item,
        quantity: item.quantity,
        modifiers: item.modifiers || {}
      })),
      total: posTotal,
      status: 'pending' as const,
      timestamp: new Date() as any, // Firestore handles this
      isPaid: paymentMethod !== 'unpaid',
      notes: `Method: ${paymentMethod}`,
      source: ORDER_SOURCE.POS
    };

    try {
      await addOrder(newOrder);

      // Handle Loyalty logic (dynamic imports for split cleaning)
      if (posCustomerPhone.trim()) {
        const { processOrderForLoyalty, redeemReward } = await import('../services/loyaltyService');
        
        if (posAppliedReward) {
          await redeemReward(posCustomerPhone.trim(), posAppliedReward.id, orderId);
        }
        
        processOrderForLoyalty(newOrder).catch(e => console.error('[Loyalty] failed:', e));
      }
      
      resetAfterOrder(newOrder);
    } catch (err) {
      console.error('POS order failed', err);
      if (!navigator.onLine) {
        resetAfterOrder(newOrder);
      } else {
        alert('Failed to send order to kitchen. Please try again.');
      }
    } finally {
      setPosSubmitting(false);
    }
  };

  return {
    posCart, setPosCart,
    posOrderType, setPosOrderType,
    posTable, setPosTable,
    posGuestCount, setPosGuestCount,
    posSplitBill, setPosSplitBill,
    posCustomerName, setPosCustomerName,
    posCustomerPhone, setPosCustomerPhone,
    posCustomerEmail, setPosCustomerEmail,
    sizePickerItem, setSizePickerItem,
    modifierPickerItem, setModifierPickerItem,
    modifierSelections, setModifierSelections,
    posLoyaltyProfile, setPosLoyaltyProfile,
    posAvailableRewards, setPosAvailableRewards,
    posAppliedReward, setPosAppliedReward,
    posDiscountAmount, setPosDiscountAmount,
    posSubmitting,
    posLastOrder,
    posSubtotal,
    posTotal,
    addToPosCart,
    addSizedItemToCart,
    addModifiedItemToCart,
    updatePosQty,
    submitPosOrder,
    clearCart
  };
}
