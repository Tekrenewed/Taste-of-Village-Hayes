import React from 'react';
import { Users, Settings, MessageSquare, Sparkles, Send, Copy } from 'lucide-react';
import { GeminiService } from '../../services/GeminiService';

interface MarketingPanelProps {
  segments: any;
  posDarkMode: boolean;
}

export const MarketingPanel: React.FC<MarketingPanelProps> = ({
  segments, 
  posDarkMode 
}) => {
  const [feedbackQueue, setFeedbackQueue] = React.useState([
    { id: '1', name: 'Zaid', rating: 2, text: 'The Taste of Village was too sweet today and the wait was long.', timestamp: new Date().toISOString() },
    { id: '2', name: 'Sara', rating: 3, text: 'Kulfi was great but table was sticky.', timestamp: new Date().toISOString() }
  ]);
  const [aiDrafts, setAiDrafts] = React.useState<Record<string, string>>({});
  const [loadingAi, setLoadingAi] = React.useState<string | null>(null);

  const generateAiResponse = async (item: any) => {
    setLoadingAi(item.id);
    try {
      const response = await GeminiService.suggestReviewResponse(item.text, item.name);
      setAiDrafts(prev => ({ ...prev, [item.id]: response }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(null);
    }
  };
  const triggerReward = async (segmentKey: string, percent: number, code: string) => {
    const list = segments?.[segmentKey];
    if (!list?.length) {
      alert(`No customers found in ${segmentKey} segment.`);
      return;
    }

    let sent = 0;
    for (const cust of list) {
      if (cust.email) {
        try {
          await fetch('/api/v1/mail/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: cust.email,
              subject: `Your ${percent}% Taste of Village ${segmentKey === 'loyal' ? 'Elite' : 'VIP'} Reward!`,
              html: `Hi ${cust.name}, thanks for picking Taste of Village so often! Present this code: ${code} for ${percent}% off your next order.`
            }),
          });
          sent++;
        } catch (e) { console.error('Mail dispatch failed:', e); }
      }
    }
    alert(`Triggered! ${sent} rewards dispatched to queue.`);
  };

  return (
    <div className="space-y-10">
      <h2 className="font-display text-4xl font-bold">Marketing Automation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="pine-card p-10 rounded-[3rem] relative">
          <h3 className="font-bold text-xl mb-8 flex items-center gap-3"><Users className="text-terracotta" size={20} /> Smart Segments</h3>
          <div className="space-y-6">
            {[
              { label: 'Loyal Fans (5+)', desc: '5+ past orders', count: segments?.loyal?.length || 0, color: 'bg-green-500', key: 'loyal' },
              { label: 'Regulars (3-4)', desc: '3 to 4 past orders', count: segments?.regular?.length || 0, color: 'bg-yellow-500', key: 'regular' },
              { label: 'At-Risk', desc: 'Inactive for 30 days', count: segments?.atRisk?.length || 0, color: 'bg-red-500', key: 'atRisk' },
              { label: 'New Members', desc: 'Recent signups', count: segments?.new?.length || 0, color: 'bg-blue-500', key: 'new' },
            ].map((seg, i) => (
              <div key={i} className="flex justify-between items-center p-6 bg-white/5 rounded-2xl hover-obsidian">
                <div>
                  <p className="font-bold">{seg.label}</p>
                  <p className="text-xs text-cream/40">{seg.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">{seg.count}</span>
                  <div className={`w-2 h-2 rounded-full ${seg.color} animate-pulse`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pine-card p-10 rounded-[3rem]">
          <h3 className="font-bold text-xl mb-8 flex items-center gap-3"><Settings className="text-terracotta" size={20} /> Quick Automation</h3>
          <div className="space-y-4">
            <button 
              onClick={() => triggerReward('regular', 10, 'VIP-REG-10')}
              className="w-full text-left p-6 glass-pine rounded-3xl hover-obsidian group"
            >
              <p className="font-bold group-hover:text-terracotta transition-colors">Trigger Regular Reward (10% Off)</p>
              <p className="text-xs text-cream/40 mt-1">Sends 10% off to customers with 3-4 orders</p>
            </button>

            <button 
              onClick={() => triggerReward('loyal', 15, 'VIP-ELITE-15')}
              className="w-full text-left p-6 glass-pine rounded-3xl hover-obsidian group border border-terracotta/20 shadow-[0_0_15px_rgba(232,160,191,0.1)]"
            >
              <p className="font-bold text-terracotta">Trigger Elite Reward (15% Off)</p>
              <p className="text-xs text-cream/40 mt-1">Sends 15% off to loyal fans with 5+ orders</p>
            </button>
            
            <button className="w-full text-left p-6 glass-pine rounded-3xl hover-obsidian group opacity-40 cursor-not-allowed">
              <p className="font-bold">Weekend Early Bird Push</p>
              <p className="text-xs text-cream/40 mt-1">Broadcast to all recorded phonelines (Ready in V3.0)</p>
            </button>
          </div>
        </div>
      </div>

      {/* Private Feedback Feed (Phase 3) */}
      <div className="pine-card p-10 rounded-[3rem]">
        <h3 className="font-bold text-xl mb-8 flex items-center gap-3">
          <MessageSquare className="text-terracotta" size={20} /> 
          Private Feedback Gate (Damage Control)
        </h3>
        <div className="space-y-6">
          {feedbackQueue.map((item) => (
            <div key={item.id} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-black text-lg">{item.name}</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <div key={s} className={`w-2 h-2 rounded-full ${s <= item.rating ? 'bg-amber-400' : 'bg-white/10'}`}></div>
                      ))}
                    </div>
                  </div>
                  <p className="text-cream/60 italic">"{item.text}"</p>
                </div>
                <button 
                  onClick={() => generateAiResponse(item)}
                  disabled={loadingAi === item.id}
                  className="px-6 py-3 bg-terracotta text-pine rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
                >
                  <Sparkles size={14} /> {loadingAi === item.id ? 'Thinking...' : 'AI Assist'}
                </button>
              </div>

              {aiDrafts[item.id] && (
                <div className="p-6 bg-terracotta/10 border border-terracotta/30 rounded-2xl animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-3 text-terracotta">
                    <Sparkles size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Suggested AI Response</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{aiDrafts[item.id]}</p>
                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => { navigator.clipboard.writeText(aiDrafts[item.id]); alert('Copied!'); }}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all"
                    >
                      <Copy size={12} /> Copy to Clipboard
                    </button>
                    <button className="flex-1 py-3 bg-terracotta text-pine rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                      <Send size={12} /> Send WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
