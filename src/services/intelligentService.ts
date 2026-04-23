export interface GeneratedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption: string;
  hashtags: string;
  status: 'generating' | 'ready' | 'failed';
  createdAt: number;
}

export interface ViralTrend {
  id: string;
  name: string;
  type: 'Audio Hook' | 'Visual Flow' | 'Editing Style';
  promptModifier: string;
  score: number;
}

export interface GenerationParams {
  modelMode: 'banana_image' | 'veo3_video';
  promptStyle: string;
  fileUrl: string | null;
}

import { auth } from '../firebaseConfig';

const API_BASE = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://localhost:8080') : '';

/**
 * Fetches the currently cached viral trends from the Go backend.
 */
export const fetchViralTrends = async (): Promise<ViralTrend[]> => {
  try {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : '';
    
    const res = await fetch(`${API_BASE}/api/v1/intelligent/trends`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch trends: ${res.status}`);
    }
    
    const data = await res.json();
    return data as ViralTrend[];
  } catch (error) {
    console.error('[intelligentService] fetchViralTrends error:', error);
    // Fallback if API fails
    return [
      {
        id: 't1',
        name: 'ASMR Chocolate Pour',
        type: 'Audio Hook',
        promptModifier: 'Extreme macro close up...',
        score: 98
      }
    ];
  }
};

/**
 * Fetches generated media via REST to replace onSnapshot polling
 */
export const fetchGeneratedMedia = async (): Promise<GeneratedMedia[]> => {
  try {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : '';
    
    const res = await fetch(`${API_BASE}/api/v1/intelligent/media`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch media: ${res.status}`);
    }
    
    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error('[intelligentService] fetchGeneratedMedia error:', error);
    return [];
  }
};

/**
 * Sends a request to generate media using the chosen AI model via the Go backend.
 */
export const generateMediaAsset = async (params: GenerationParams, trendId: string | null): Promise<GeneratedMedia> => {
  try {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : '';
    
    const isVideo = params.modelMode === 'veo3_video';
    
    const payload = {
      imageUrl: params.fileUrl || '',
      prompt: params.promptStyle,
      model: isVideo ? 'veo3' : 'banana',
      type: isVideo ? 'video' : 'image',
      style: params.promptStyle,
      aspectRatio: '16:9',
      trendId: trendId || ''
    };
    
    const res = await fetch(`${API_BASE}/api/v1/intelligent/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      throw new Error(`Failed to generate media: ${res.status}`);
    }
    
    const data = await res.json();
    
    return {
      id: data.jobId,
      type: isVideo ? 'video' : 'image',
      status: 'generating', // Initial status
      url: params.fileUrl || '', // Temporary URL while processing
      caption: '',
      hashtags: '',
      createdAt: Date.now()
    };
  } catch (error) {
    console.error('[intelligentService] generateMediaAsset error:', error);
    throw error;
  }
};
