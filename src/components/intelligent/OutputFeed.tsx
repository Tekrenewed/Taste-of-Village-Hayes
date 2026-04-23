import React from 'react';
import { Send, Video, FileVideo, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { useIntelligentMedia } from '../../context/IntelligentMediaContext';

export const OutputFeed = () => {
  const { results, modelMode } = useIntelligentMedia();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Send className="text-brand-pink" />
        Social Media Output
      </h2>

      {results.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-black/5 flex flex-col items-center justify-center text-center h-[500px] shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Video size={48} className="text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Awaiting Generation</h3>
          <p className="text-gray-500 max-w-sm">Upload a raw image and generate to see the Veo 3 or Banana GPU output here, complete with AI-crafted captions.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {results.map((res) => (
            <div key={res.id} className="bg-white p-6 rounded-3xl shadow-md border border-black/5 overflow-hidden relative">
              {res.status === 'generating' && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin mb-4" />
                  <p className="font-bold text-gray-800">Synthesizing Media...</p>
                  <p className="text-sm text-gray-500 mt-1">Calling {modelMode === 'veo3_video' ? 'Google Veo 3' : 'Banana.dev GPU'}...</p>
                </div>
              )}
              
              {/* Media Display */}
              <div className="w-full h-[300px] bg-black rounded-2xl overflow-hidden relative mb-6">
                {res.type === 'video' ? (
                  <video src={res.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={res.url} alt="Generated" className="w-full h-full object-cover" />
                )}
                
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                  {res.type === 'video' ? <FileVideo size={14} className="text-violet-400" /> : <ImageIcon size={14} className="text-brand-pink" />}
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {res.type === 'video' ? 'Veo 3 Output' : 'Banana Output'}
                  </span>
                </div>
              </div>

              {/* AI Copywriting */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gemini 1.5 Flash Copywriter</span>
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
                <p className="text-gray-800 font-medium mb-3">{res.caption}</p>
                <p className="text-brand-pink font-medium text-sm">{res.hashtags}</p>
              </div>

              <div className="mt-6 flex gap-4">
                <button 
                  onClick={async () => {
                    try {
                      await fetch('/api/v1/ai/publish/instagram', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ jobId: res.id })
                      });
                      alert('Successfully published to Instagram! (Simulated)');
                    } catch (e) {
                      alert('Failed to publish');
                    }
                  }}
                  className="flex-1 bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50" 
                  disabled={res.status === 'generating'}
                >
                  Post to Instagram
                </button>
                <button 
                  onClick={async () => {
                    try {
                      await fetch('/api/v1/ai/publish/tiktok', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ jobId: res.id })
                      });
                      alert('Successfully published to TikTok! (Simulated)');
                    } catch (e) {
                      alert('Failed to publish');
                    }
                  }}
                  className="flex-1 bg-brand-cream text-brand-text font-bold py-3 rounded-xl hover:bg-[#F2EFE9] transition-colors border border-black/5 disabled:opacity-50" 
                  disabled={res.status === 'generating'}
                >
                  Post to TikTok
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
