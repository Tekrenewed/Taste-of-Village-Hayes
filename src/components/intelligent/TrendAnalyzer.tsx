import React from 'react';
import { Activity, TrendingUp, Music } from 'lucide-react';
import { useIntelligentMedia } from '../../context/IntelligentMediaContext';

export const TrendAnalyzer = () => {
  const { isAnalyzing, trends, selectedTrend, triggerTrendAnalysis, applyTrend } = useIntelligentMedia();

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-3xl shadow-lg border border-indigo-500/30 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative z-10 flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Activity className="text-brand-electricPeach" /> 
          Viral Trend Analyzer
        </h3>
        <button 
          onClick={triggerTrendAnalysis}
          disabled={isAnalyzing}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 border border-white/10"
        >
          {isAnalyzing ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning...</>
          ) : (
            <><TrendingUp size={16} /> Scan Industry</>
          )}
        </button>
      </div>

      {trends.length === 0 ? (
        <div className="text-indigo-200/60 text-sm italic">
          Run a scan to fetch real-time TikTok & Reels food trends. The AI will adapt your generation parameters to match high-performing content hooks.
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {trends.map(trend => (
            <div 
              key={trend.id}
              onClick={() => applyTrend(trend)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedTrend === trend.id 
                  ? 'bg-brand-pink/20 border-brand-pink shadow-[0_0_15px_rgba(255,105,180,0.3)]' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${trend.type === 'Audio Hook' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                  {trend.type === 'Audio Hook' ? <Music size={16} /> : <TrendingUp size={16} />}
                </div>
                <div>
                  <div className="font-bold">{trend.name}</div>
                  <div className="text-xs text-indigo-200 opacity-80">{trend.type}</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-brand-electricPeach font-black text-lg">{trend.score}</div>
                <div className="text-[10px] uppercase tracking-wider text-indigo-300">Viral Score</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
