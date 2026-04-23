import { useState, useEffect, useCallback } from 'react';

// ─── Server-Side Segments API Integration ───
// Replaces naive client-side order counting with pre-computed RFM segments
// from the Go backend scoring engine (/api/v1/segments)

const API_BASE = import.meta.env.VITE_API_URL || 'https://restaurant-os-api-3522407115.europe-west2.run.app';

export interface SegmentCustomer {
  id: string;
  phone: string;
  email: string;
  name: string;
  loyalty_points: number;
  total_score: number;
  segment: string;
  recency_score: number;
  frequency_score: number;
  monetary_score: number;
}

export interface CustomerSegment {
  loyal: SegmentCustomer[];   // VIP segment (mapped from backend)
  regular: SegmentCustomer[]; // REGULAR segment
  atRisk: SegmentCustomer[];  // CHURN_RISK segment
  new: SegmentCustomer[];     // NEW segment
}

export interface SegmentSummary {
  total_customers: number;
  vip_count: number;
  regular_count: number;
  churn_risk_count: number;
  new_count: number;
  scored_at: string;
}

export function useMarketing(activeTab: string, authToken?: string, storeId?: string) {
  const [segments, setSegments] = useState<CustomerSegment>({ loyal: [], regular: [], atRisk: [], new: [] });
  const [summary, setSummary] = useState<SegmentSummary | null>(null);
  const [reviewQueue, setReviewQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchSegments = useCallback(async () => {
    if (!authToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const url = storeId 
        ? `${API_BASE}/api/v1/segments?store_id=${storeId}`
        : `${API_BASE}/api/v1/segments`;
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`Segments API returned ${res.status}`);
      }

      const data = await res.json();

      setSegments({
        loyal: data.vip || [],     // Backend "VIP" = Frontend "loyal"
        regular: data.regular || [],
        atRisk: data.churn_risk || [],
        new: data.new || []
      });
      setSummary(data.summary || null);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('[useMarketing] Failed to fetch segments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load segments');
    } finally {
      setLoading(false);
    }
  }, [authToken, storeId]);

  useEffect(() => {
    if (activeTab === 'marketing') {
      fetchSegments();
    }
  }, [activeTab, fetchSegments]);

  // Trigger a manual RFM re-score (admin action)
  const triggerRescore = useCallback(async (migrateKey: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/internal/score-customers`, {
        method: 'POST',
        headers: { 'X-Migrate-Key': migrateKey }
      });
      if (!res.ok) throw new Error(`Score API returned ${res.status}`);
      const result = await res.json();
      
      // Refresh segments after re-scoring
      await fetchSegments();
      return result;
    } catch (err) {
      console.error('[useMarketing] Rescore failed:', err);
      throw err;
    }
  }, [fetchSegments]);

  return {
    segments,
    summary,
    reviewQueue,
    setReviewQueue,
    loading,
    error,
    lastRefresh,
    refetch: fetchSegments,
    triggerRescore
  };
}
