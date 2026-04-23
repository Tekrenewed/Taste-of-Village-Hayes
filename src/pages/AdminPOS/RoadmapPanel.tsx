import React from 'react';
import { FileText } from 'lucide-react';
import { ROADMAP_QUESTIONS } from '../../constants';

interface RoadmapPanelProps {
  simulateDeliveryOrder: (provider: string) => void;
  simulatePayment: () => void;
}

export const RoadmapPanel: React.FC<RoadmapPanelProps> = ({ 
  simulateDeliveryOrder, 
  simulatePayment 
}) => {
  return (
    <div className="space-y-10">
      <div className="p-10 rounded-[3rem] pine-card relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <FileText size={120} />
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-display text-4xl font-bold mb-4">Project Strategy</h2>
            <p className="text-cream/60 max-w-xl">Unified operational control for Taste of Village. Enterprise SaaS architecture.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => simulateDeliveryOrder('ubereats')} className="px-6 py-3 glass-pine rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-terracotta transition-all">Mock UberEats</button>
            <button onClick={() => simulateDeliveryOrder('deliveroo')} className="px-6 py-3 glass-pine rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-terracotta transition-all">Mock Deliveroo</button>
            <button onClick={() => simulateDeliveryOrder('uberdirect')} className="px-6 py-3 glass-pine rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-terracotta transition-all">Mock Uber Direct</button>
            <button onClick={simulatePayment} className="px-6 py-3 bg-terracotta/10 border border-terracotta/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-terracotta hover:bg-terracotta hover:text-pine transition-all">Mock Bank Payment</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {ROADMAP_QUESTIONS.concat([
          { id: 998, category: "Tech", question: "Production Hardening", status: "Firebase Security Rules deployed. Offline Queue immediate sync implemented." },
          { id: 999, category: "Tech", question: "Infrastructure V2", status: "Admin Dashboard refactoring to modular 600-line components. Printing logic moved to Service." }
        ]).map((item, i) => (
          <div key={i} className="p-10 rounded-[3rem] pine-card group hover-obsidian">
            <h4 className="font-bold text-xl mb-4 group-hover:text-terracotta transition-colors">{item.question}</h4>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-sm leading-relaxed text-cream/70">{item.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
