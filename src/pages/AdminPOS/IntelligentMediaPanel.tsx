import React from 'react';
import { Wand2, CheckCircle2 } from 'lucide-react';
import { IntelligentMediaProvider } from '../../context/IntelligentMediaContext';
import { TrendAnalyzer } from '../../components/intelligent/TrendAnalyzer';
import { MediaUploader } from '../../components/intelligent/MediaUploader';
import { GenerationConfig } from '../../components/intelligent/GenerationConfig';
import { OutputFeed } from '../../components/intelligent/OutputFeed';

const IntelligentMediaLayout = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F9FA] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-gray-900 flex items-center gap-3">
              <Wand2 className="text-brand-pink" size={36} />
              Intelligent Studio <span className="text-sm px-3 py-1 bg-gradient-to-r from-brand-pink to-orange-400 text-white rounded-full font-bold uppercase tracking-wider ml-2 shadow-sm">Pro</span>
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Autonomous Media Engine: Banana GPU & Google Veo 3</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
            <CheckCircle2 size={16} className="text-emerald-400" />
            Admin Only Access
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Config */}
          <div className="space-y-6">
            <TrendAnalyzer />
            <MediaUploader />
            <GenerationConfig />
          </div>

          {/* Right Column: Output */}
          <div>
            <OutputFeed />
          </div>
        </div>
      </div>
    </div>
  );
};

export const IntelligentMediaPanel = () => {
  return (
    <IntelligentMediaProvider>
      <IntelligentMediaLayout />
    </IntelligentMediaProvider>
  );
};

