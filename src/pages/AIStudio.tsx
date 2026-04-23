import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Image as ImageIcon, Video, TrendingUp, History, Download, Settings, RefreshCw, Send, PlayCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface AIGeneration {
  id: string;
  type: 'image' | 'video' | 'prompt';
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  thumbnailUrl?: string;
  createdAt: number;
  engine: 'nano_banana' | 'veo_3' | 'google_pro_ai';
}

export const AIStudio = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'prompts' | 'gallery'>('dashboard');
  const [generations, setGenerations] = useState<AIGeneration[]>([]);
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] = useState<'image' | 'video'>('image');

  useEffect(() => {
    // Listen for AI generations from Firestore
    const q = query(collection(db, 'ai_media'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      const data: AIGeneration[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as AIGeneration));
      setGenerations(data);
    });
    return () => unsub();
  }, []);

  const handleGenerate = async () => {
    if (!promptInput.trim()) return;
    setIsGenerating(true);
    
    try {
      // In Phase 2: This will hit the Go backend `/api/ai/generate` endpoint
      // which handles the Nano Banana or Veo 3 API requests and syncs to Firestore
      console.log(`Generating ${generationType} via ${generationType === 'image' ? 'Nano Banana' : 'Google Veo 3'}...`);
      
      // Simulate network request for UI purposes for now
      setTimeout(() => {
        setPromptInput('');
        setIsGenerating(false);
        alert('Generation requested! The background worker is processing your media.');
      }, 1000);
    } catch (error) {
      console.error(error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 mt-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="text-brand-pink h-8 w-8" />
              <h1 className="text-4xl font-display font-bold text-brand-text">AI Media Studio</h1>
            </div>
            <p className="text-brand-text/60 max-w-2xl">
              Powered by Google Pro AI Ultra, Veo 3, and Nano Banana. Automate viral food content creation.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col items-end text-xs text-brand-text/50">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Veo 3: Connected</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Nano Banana: Connected</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Google Drive: Synced</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-brand-text/10 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', icon: TrendingUp, label: 'Trend Intelligence' },
            { id: 'prompts', icon: Sparkles, label: 'Studio Engine' },
            { id: 'gallery', icon: ImageIcon, label: 'Media Gallery' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-white shadow-sm border-t-2 border-brand-pink text-brand-text font-bold' 
                  : 'text-brand-text/50 hover:bg-white/50'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content: Dashboard */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-text/5">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-brand-pink" /> 
                  Viral Trends Analysis
                </h2>
                <div className="p-4 bg-brand-cream/30 rounded-xl border border-brand-text/5 text-sm text-brand-text/80 mb-4">
                  <span className="font-bold">Google Pro AI Insight:</span> "Slow-motion caramel drips over crushed pistachios" is currently trending on Instagram Reels in the UK dessert space.
                </div>
                <div className="flex flex-wrap gap-2">
                  {['#PistachioTasteOfVillage', '#ASMRDessert', '#SlowMoPour', '#DubaiChocolate'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-brand-pistachio/20 text-brand-green font-bold text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-brand-pink to-orange-400 p-6 rounded-2xl shadow-sm text-white">
                <h3 className="font-bold text-lg mb-2">Engine Status</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <span>Google Drive Storage</span>
                    <span className="font-mono">842 GB Free</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <span>Nano Banana Credits</span>
                    <span className="font-mono">Active Sub</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Veo 3 Quota</span>
                    <span className="font-mono">Unlimited (Pro)</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Content: Studio Engine */}
        {activeTab === 'prompts' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-brand-text/5">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Settings className="text-brand-pink" />
              Generation Engine
            </h2>
            
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => setGenerationType('image')}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                  generationType === 'image' ? 'bg-brand-pink text-white shadow-md' : 'bg-gray-100 text-brand-text/60 hover:bg-gray-200'
                }`}
              >
                <ImageIcon className="h-5 w-5" />
                Image (Nano Banana)
              </button>
              <button 
                onClick={() => setGenerationType('video')}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                  generationType === 'video' ? 'bg-brand-pink text-white shadow-md' : 'bg-gray-100 text-brand-text/60 hover:bg-gray-200'
                }`}
              >
                <Video className="h-5 w-5" />
                Cinematic Video (Veo 3)
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-brand-text/70 mb-2">Creative Prompt</label>
              <textarea 
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g., A cinematic close-up of a royal taste-of-village, rich pink syrup slowly dripping down the frosted glass, soft ambient lighting, 4k, hyper-realistic food photography..."
                className="w-full h-32 p-4 rounded-xl border border-brand-text/10 bg-brand-cream/20 focus:outline-none focus:ring-2 focus:ring-brand-pink transition-all resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <button 
                  onClick={() => setPromptInput("A cinematic 4k close up of rich pistachio ice cream being scooped into a Taste of Village glass, slow motion, shallow depth of field, warm lighting")}
                  className="text-xs text-brand-pink font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Auto-fill from Viral Trend
                </button>
                <span className="text-xs text-brand-text/40">{promptInput.length} chars</span>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !promptInput.trim()}
              className="w-full bg-brand-text text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-text/90 transition-all disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              {isGenerating ? 'Initializing AI Core...' : 'Generate Media'}
            </button>
          </motion.div>
        )}

        {/* Tab Content: Gallery */}
        {activeTab === 'gallery' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {generations.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-brand-text/5">
                <History className="h-12 w-12 text-brand-text/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-brand-text/50">No media generated yet</h3>
                <p className="text-sm text-brand-text/40 mt-1">Go to the Studio Engine to create your first asset.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {generations.map(gen => (
                  <div key={gen.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-text/5 group">
                    <div className="aspect-square bg-gray-100 relative flex items-center justify-center overflow-hidden">
                      {gen.status === 'processing' ? (
                        <div className="flex flex-col items-center text-brand-text/40">
                          <RefreshCw className="h-8 w-8 animate-spin mb-2" />
                          <span className="text-sm font-bold animate-pulse">Rendering via {gen.engine === 'veo_3' ? 'Veo 3' : 'Nano Banana'}...</span>
                        </div>
                      ) : gen.thumbnailUrl ? (
                        <img src={gen.thumbnailUrl} alt={gen.prompt} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <ImageIcon className="h-12 w-12 text-brand-text/20" />
                      )}
                      
                      {gen.type === 'video' && gen.status === 'completed' && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlayCircle className="text-white h-12 w-12" />
                        </div>
                      )}
                      
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                          {gen.type}
                        </span>
                        {gen.engine && (
                          <span className="bg-brand-pink/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                            {gen.engine === 'veo_3' ? 'Veo 3' : gen.engine === 'nano_banana' ? 'Banana' : 'Google AI'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-brand-text/60 line-clamp-2 mb-3 h-8">{gen.prompt}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-brand-text/40 font-mono">
                          {new Date(gen.createdAt).toLocaleDateString()}
                        </span>
                        {gen.status === 'completed' && gen.url && (
                          <a href={gen.url} target="_blank" rel="noreferrer" className="p-2 bg-brand-cream rounded-lg text-brand-text hover:bg-brand-pink hover:text-white transition-colors">
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};
