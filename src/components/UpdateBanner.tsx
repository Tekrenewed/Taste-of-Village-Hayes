import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCcw, X } from 'lucide-react';

export const UpdateBanner = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every 60 minutes in the background
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-brand-pink text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-slideIn border-2 border-white/20">
      <div className="flex items-center gap-2">
        <RefreshCcw size={18} className="animate-spin-slow" />
        <span className="font-bold text-sm tracking-wide">Update Available</span>
      </div>
      <button
        onClick={() => updateServiceWorker(true)}
        className="bg-white text-brand-pink px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-md"
      >
        Reload to Apply
      </button>
      <button 
        onClick={() => setNeedRefresh(false)}
        className="p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};
