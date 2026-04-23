import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, FileVideo, Wand2, Save } from 'lucide-react';
import { useIntelligentMedia } from '../../context/IntelligentMediaContext';

export const GenerationConfig = () => {
  const { 
    modelMode, 
    setModelMode, 
    promptStyle, 
    setPromptStyle, 
    selectedTrend, 
    selectedFile, 
    isGenerating, 
    triggerGeneration 
  } = useIntelligentMedia();

  const [isSavingPreset, setIsSavingPreset] = useState(false);

  const handleSavePreset = () => {
    setIsSavingPreset(true);
    // Simulate saving the current prompt to localStorage/backend
    setTimeout(() => {
      setIsSavingPreset(false);
    }, 1000);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber-400" /> 
          Generation Parameters
        </div>
        <button 
          onClick={handleSavePreset}
          className="text-brand-pink text-sm font-bold flex items-center gap-1 hover:text-brand-electricPeach transition-colors"
        >
          {isSavingPreset ? 'Saved!' : <><Save size={16} /> Save Preset</>}
        </button>
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setModelMode('banana_image')}
          className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
            modelMode === 'banana_image' 
              ? 'border-brand-pink bg-brand-pink/5 text-brand-pink' 
              : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
          }`}
        >
          <ImageIcon size={28} />
          <span className="font-bold">Banana GPU Image</span>
          <span className="text-xs opacity-70 text-center">Stable Diffusion LoRA</span>
        </button>
        
        <button
          onClick={() => setModelMode('veo3_video')}
          className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
            modelMode === 'veo3_video' 
              ? 'border-violet-500 bg-violet-50 text-violet-600' 
              : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
          }`}
        >
          <FileVideo size={28} />
          <span className="font-bold">Veo 3 Video</span>
          <span className="text-xs opacity-70 text-center">Cinematic Flow Generation</span>
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between">
          Cinematic Flow Style 
          {selectedTrend && <span className="text-brand-pink text-xs uppercase tracking-wider">Trend Applied</span>}
        </label>
        <textarea 
          value={promptStyle}
          onChange={(e) => setPromptStyle(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-pink/50 resize-none h-24"
          placeholder="e.g. 4k, macro lens, dramatic studio lighting..."
        />
      </div>

      <button
        disabled={!selectedFile || isGenerating}
        onClick={triggerGeneration}
        className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
          ${!selectedFile 
            ? 'bg-gray-100 text-gray-400 shadow-none' 
            : isGenerating 
              ? 'bg-gray-800 text-white animate-pulse' 
              : modelMode === 'veo3_video'
                ? 'bg-gradient-to-r from-violet-600 to-purple-500 text-white hover:shadow-violet-500/25'
                : 'bg-gradient-to-r from-brand-pink to-rose-500 text-white hover:shadow-brand-pink/25'
          }`}
      >
        {isGenerating ? (
          <>Processing Engine...</>
        ) : (
          <>
            <Wand2 size={24} />
            Generate {modelMode === 'veo3_video' ? 'Cinematic Video' : 'Studio Image'}
          </>
        )}
      </button>
    </div>
  );
};
