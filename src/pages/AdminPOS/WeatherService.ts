/**
 * Hyperlocal Weather Service for Taste of Village (Slough)
 * Uses OpenWeatherMap API (Free Tier: 1,000 calls/day)
 */

const SLOUGH_COORDS = { lat: 51.5283, lon: -0.6121 };
const API_KEY = '538e11e3b52f1e626e8389659e51c201'; // Default Fallback (User should replace in ENV)

export interface WeatherInsight {
  temp: number;
  condition: string;
  isHot: boolean;
  isRaining: boolean;
  impactLevel: 'low' | 'medium' | 'high';
  recommendation: string;
}

export const fetchWeatherInsights = async (): Promise<WeatherInsight | null> => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${SLOUGH_COORDS.lat}&lon=${SLOUGH_COORDS.lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const temp = data.main.temp;
    const condition = data.weather[0].main.toLowerCase();
    
    const isHot = temp > 22;
    const isRaining = condition.includes('rain') || condition.includes('drizzle');
    
    let impactLevel: 'low' | 'medium' | 'high' = 'low';
    let recommendation = 'Standard staffing levels recommended.';
    
    if (isHot) {
      impactLevel = 'high';
      recommendation = 'Heatwave detected! Expect a 40%+ spike in Taste of Village and Milkshake demand. Increase Meetha-station staffing.';
    } else if (isRaining) {
      impactLevel = 'medium';
      recommendation = 'Rain detected. Expect a spike in Delivery and Hot Tea orders. Ensure delivery packing station is ready.';
    } else if (temp < 10) {
      impactLevel = 'medium';
      recommendation = 'Cold weather. Push Desi Breakfast and Hot Gajar Halwa promotions.';
    }

    return {
      temp,
      condition: data.weather[0].description,
      isHot,
      isRaining,
      impactLevel,
      recommendation
    };
  } catch (error) {
    console.warn('[WeatherService] Failed to fetch weather:', error);
    return null;
  }
};

export const getAiInsight = (): WeatherInsight | null => {
  const stored = localStorage.getItem('weather_insight');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const refreshAiInsight = (insight: WeatherInsight, activeOrders: number) => {
  const updated = { ...insight };
  if (activeOrders > 10) {
    updated.recommendation = `! HIGH LOAD: ${updated.recommendation} | Current: ${activeOrders} items in kitchen.`;
    updated.impactLevel = 'high';
  }
  localStorage.setItem('weather_insight', JSON.stringify(updated));
  return updated;
};
