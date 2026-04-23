import { useState, useEffect, useCallback } from 'react';
import { fetchWeatherInsights, WeatherInsight } from '../pages/AdminPOS/WeatherService';
import { GeminiService, StaffingRecommendation, PredictivePrep } from '../services/GeminiService';

/**
 * useAiInsights
 * 
 * Encapsulates the "AI Operational Brain" for Taste of Village:
 * - Hyperlocal weather data (OpenWeatherMap, hourly refresh)
 * - Gemini-powered staffing recommendations
 * - Real-time clock for KDS timestamps
 * 
 * Keeps the AdminPOS root component free of side-effect timers.
 */
export function useAiInsights(pendingOrderCount: number) {
  const [weatherInsight, setWeatherInsight] = useState<WeatherInsight | null>(null);
  const [staffingInsight, setStaffingInsight] = useState<StaffingRecommendation | null>(null);
  const [prepInsight, setPrepInsight] = useState<PredictivePrep | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const refreshAiInsight = useCallback(async (weather: WeatherInsight, currentOrdersCount: number) => {
    try {
      const [staffing, prep] = await Promise.all([
        GeminiService.getStaffingInsight(weather, currentOrdersCount),
        GeminiService.getPredictivePrep(weather, currentOrdersCount)
      ]);
      setStaffingInsight(staffing);
      setPrepInsight(prep);
    } catch (err) {
      console.error('[useAiInsights] AI Refresh Failed:', err);
    }
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      const insight = await fetchWeatherInsights();
      setWeatherInsight(insight);
      if (insight) refreshAiInsight(insight, pendingOrderCount);
    };

    fetchWeather();

    // Refresh weather hourly, clock every 30s
    const weatherTimer = setInterval(fetchWeather, 3600000);
    const timeTimer = setInterval(() => setCurrentTime(new Date()), 30000);

    return () => {
      clearInterval(weatherTimer);
      clearInterval(timeTimer);
    };
  }, [pendingOrderCount, refreshAiInsight]);

  return {
    weatherInsight,
    staffingInsight,
    prepInsight,
    currentTime,
    refreshAiInsight
  };
}
