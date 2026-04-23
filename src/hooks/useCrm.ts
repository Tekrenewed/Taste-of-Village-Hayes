import { useState, useEffect, useCallback } from 'react';
import { Order } from '../types';
import { redeemReward } from '../services/loyaltyService';

export function useCrm(orders: Order[]) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerHistory, setCustomerHistory] = useState<Order[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Derive initial customer list from orders (active session)
  useEffect(() => {
    const custMap: Record<string, any> = {};
    orders.forEach(o => {
      if (o.customerPhone) {
        if (!custMap[o.customerPhone]) {
          custMap[o.customerPhone] = { 
            id: o.customerPhone, 
            name: o.customerName || 'Unknown', 
            phone: o.customerPhone, 
            spent: 0, 
            count: 0 
          };
        }
        custMap[o.customerPhone].spent += o.total;
        custMap[o.customerPhone].count += 1;
      }
    });

    const custList = Object.values(custMap)
      .map(c => ({ ...c, points: Math.floor(c.spent) }))
      .sort((a, b) => b.points - a.points);
    
    setCustomers(custList);
  }, [orders]);

  const fetchCustomerHistory = useCallback(async (phone: string) => {
    setLoadingHistory(true);
    try {
      // Filter from the live orders stream (decoupled from Firestore)
      const history = orders
        .filter(o => o.customerPhone === phone)
        .sort((a, b) => {
          const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return tB - tA;
        })
        .slice(0, 10);
      setCustomerHistory(history);
    } catch (err) {
      console.error('[useCrm] Failed to fetch history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [orders]);

  const handleRedeem = async (phone: string, rewardId: string) => {
    try {
      const success = await redeemReward(phone, rewardId);
      if (success) {
        alert('Reward redeemed successfully!');
      }
    } catch (err) {
      alert('Redemption failed.');
    }
  };

  return {
    customers,
    selectedCustomer,
    setSelectedCustomer,
    customerHistory,
    loadingHistory,
    fetchCustomerHistory,
    handleRedeem
  };
}
