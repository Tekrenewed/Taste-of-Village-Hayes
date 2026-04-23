
/**
 * GeminiService.ts
 * Interfaces with the existing local Vertex AI proxy to provide 
 * operational intelligence via Google Gemini 1.5 Flash.
 */

const API_PROXY_URL = 'http://localhost:5000/api-proxy';

export interface StaffingRecommendation {
  impactScore: number; 
  recommendation: string;
  rationale: string;
  suggestedStaffCount: number;
}

export interface PredictivePrep {
  itemsToPrepped: string[];
  alertLevel: 'low' | 'medium' | 'high';
  reasoning: string;
}

export const GeminiService = {
  /**
   * Generates a staffing recommendation based on weather and current shop load.
   */
  async getStaffingInsight(weatherData: any, currentOrdersCount: number): Promise<StaffingRecommendation> {
    try {
      const prompt = `
        As an expert restaurant manager for "Taste of Village" (luxury dessert shop in Slough), 
        analyze the following data and provide a staffing recommendation.
        
        DATA:
        - Weather: ${weatherData.temp}°C, ${weatherData.description}
        - Current Live Orders: ${currentOrdersCount}
        
        Output format (JSON only):
        {
          "impactScore": number,
          "recommendation": "string",
          "rationale": "string",
          "suggestedStaffCount": number
        }
      `;

      // We use the existing proxy structure found in backend/server.js
      const response = await fetch(API_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-proxy': 'local-vertex-ai-app' // Required by your proxy security
        },
        body: JSON.stringify({
          originalUrl: "https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-1.5-flash:generateContent",
          method: "POST",
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        })
      });

      if (!response.ok) throw new Error('Gemini Proxy Error');

      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      return JSON.parse(rawText);

    } catch (error) {
      console.error('Gemini Insight Failure:', error);
      // Fallback logic if AI is offline
      return {
        impactScore: 5,
        recommendation: "Maintain standard staffing levels.",
        rationale: "AI insight currently unavailable. Monitoring weather manually.",
        suggestedStaffCount: 3
      };
    }
  },

  /**
   * Predicts which items will be in high demand based on weather/time.
   */
  async getPredictivePrep(weatherData: any, currentOrdersCount: number): Promise<PredictivePrep> {
    try {
      const prompt = `
        Analyze for "Taste of Village" (Slough, UK):
        - Weather: ${weatherData.temp}°C, ${weatherData.description}
        - Current Workload: ${currentOrdersCount} orders
        
        Predict 2-3 items that will have high demand in the next 2 hours.
        Provide preparation advice for the kitchen.

        Output JSON:
        {
          "itemsToPrepped": ["string"],
          "alertLevel": "low" | "medium" | "high",
          "reasoning": "string"
        }
      `;

      const response = await fetch(API_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-app-proxy': 'local-vertex-ai-app' },
        body: JSON.stringify({
          originalUrl: "https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-1.5-flash:generateContent",
          method: "POST",
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        })
      });

      const data = await response.json();
      return JSON.parse(data.candidates[0].content.parts[0].text);
    } catch {
      return { itemsToPrepped: [], alertLevel: 'low', reasoning: 'Standard demand expected.' };
    }
  },

  /**
   * Generates a professional response to negative customer feedback.
   */
  async suggestReviewResponse(feedback: string, customerName: string): Promise<string> {
    try {
      const prompt = `
        A customer named "${customerName}" left this private feedback: "${feedback}"
        Draft a professional, empathetic, and resolution-oriented response. 
        Tone: Luxury dessert shop owner, humble but professional.
        Max 3 sentences. Mention we want to make it right.
      `;

      const response = await fetch(API_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-app-proxy': 'local-vertex-ai-app' },
        body: JSON.stringify({
          originalUrl: "https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-1.5-flash:generateContent",
          method: "POST",
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        })
      });

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch {
      return "Thank you for your feedback. We are looking into this immediately and will be in touch.";
    }
  }
};
