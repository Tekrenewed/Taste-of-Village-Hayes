import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { 
  GeneratedMedia, 
  ViralTrend, 
  GenerationParams, 
  fetchViralTrends, 
  generateMediaAsset,
  fetchGeneratedMedia
} from '../services/intelligentService';

interface IntelligentMediaState {
  // File state
  selectedFile: File | null;
  previewUrl: string | null;
  handleFile: (file: File) => void;
  
  // Model state
  modelMode: 'banana_image' | 'veo3_video';
  setModelMode: (mode: 'banana_image' | 'veo3_video') => void;
  promptStyle: string;
  setPromptStyle: (prompt: string) => void;
  
  // Generation state
  isGenerating: boolean;
  results: GeneratedMedia[];
  triggerGeneration: () => Promise<void>;
  
  // Trends state
  isAnalyzing: boolean;
  trends: ViralTrend[];
  selectedTrend: string | null;
  triggerTrendAnalysis: () => Promise<void>;
  applyTrend: (trend: ViralTrend) => void;
}

const IntelligentMediaContext = createContext<IntelligentMediaState | undefined>(undefined);

export const IntelligentMediaProvider = ({ children }: { children: ReactNode }) => {
  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Model state
  const [modelMode, setModelMode] = useState<'banana_image' | 'veo3_video'>('banana_image');
  const [promptStyle, setPromptStyle] = useState('Cinematic, slow-motion, moody lighting');
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedMedia[]>([]);

  // Trends state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [trends, setTrends] = useState<ViralTrend[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);

  // Fetch generated media from REST API
  const fetchMedia = useCallback(async () => {
    try {
      const mediaList = await fetchGeneratedMedia();
      setResults(mediaList);
    } catch (error) {
      console.error("Failed to sync Intelligent media library:", error);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchMedia();
    
    // Set up polling interval (every 30 seconds)
    const intervalId = setInterval(fetchMedia, 30000);
    
    return () => clearInterval(intervalId);
  }, [fetchMedia]);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const triggerTrendAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const fetchedTrends = await fetchViralTrends();
      setTrends(fetchedTrends);
    } catch (error) {
      console.error("Failed to fetch trends:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyTrend = (trend: ViralTrend) => {
    setSelectedTrend(trend.id);
    setPromptStyle(trend.promptModifier);
    if (trend.type === 'Editing Style' || trend.type === 'Visual Flow') {
      setModelMode('veo3_video');
    }
  };

  const triggerGeneration = async () => {
    if (!selectedFile) return;
    setIsGenerating(true);

    try {
      const params: GenerationParams = {
        modelMode,
        promptStyle,
        fileUrl: previewUrl // Note: Real implementation needs real Cloud Storage upload first
      };
      
      // Re-fetch media immediately after triggering to show the new 'generating' job
      await generateMediaAsset(params, selectedTrend);
      await fetchMedia();
      
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to start generation job. Check console.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <IntelligentMediaContext.Provider value={{
      selectedFile,
      previewUrl,
      handleFile,
      modelMode,
      setModelMode,
      promptStyle,
      setPromptStyle,
      isGenerating,
      results,
      triggerGeneration,
      isAnalyzing,
      trends,
      selectedTrend,
      triggerTrendAnalysis,
      applyTrend
    }}>
      {children}
    </IntelligentMediaContext.Provider>
  );
};

export const useIntelligentMedia = () => {
  const context = useContext(IntelligentMediaContext);
  if (context === undefined) {
    throw new Error('useIntelligentMedia must be used within an IntelligentMediaProvider');
  }
  return context;
};
