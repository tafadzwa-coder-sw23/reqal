import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TriageResponse, PriorityLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const triageSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    priority: {
      type: Type.STRING,
      enum: [PriorityLevel.CRITICAL, PriorityLevel.HIGH, PriorityLevel.MEDIUM, PriorityLevel.LOW],
      description: "The urgency level of the emergency based on the description."
    },
    etaMinutes: {
      type: Type.INTEGER,
      description: "Estimated time of arrival in minutes (simulate realistic times between 3 and 15)."
    },
    vehicleType: {
      type: Type.STRING,
      description: "Type of vehicle dispatched (e.g., ALS Ambulance, BLS Ambulance, Rapid Response Bike, Helicopter)."
    },
    recommendedAction: {
      type: Type.STRING,
      description: "Immediate life-saving advice for the user to perform while waiting."
    },
    summary: {
      type: Type.STRING,
      description: "A very brief, reassuring summary of the situation analysis."
    },
    assistantName: {
      type: Type.STRING,
      description: "A friendly name for the AI dispatcher."
    },
    contactNotificationMessage: {
      type: Type.STRING,
      description: "A concise SMS message (max 160 chars) to be sent to the user's emergency contact, informing them that help is on the way and the estimated ETA."
    }
  },
  required: ["priority", "etaMinutes", "vehicleType", "recommendedAction", "summary", "assistantName", "contactNotificationMessage"]
};

export const analyzeEmergency = async (description: string, userName?: string): Promise<TriageResponse> => {
  try {
    const userContext = userName ? `The caller's name is ${userName}. Address them by name if appropriate.` : "";
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this emergency call: "${description}". ${userContext} Provide a triage assessment. Act as a professional emergency dispatch system.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: triageSchema,
        systemInstruction: "You are ResQ-AI, an advanced emergency dispatch system. Your goal is to keep the user calm, assess the situation accurately, and simulate a realistic dispatch response."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as TriageResponse;
  } catch (error) {
    console.error("Gemini Analysis Failed", error);
    // Fallback in case of API error to ensure app doesn't crash during emergency demo
    return {
      priority: PriorityLevel.HIGH,
      etaMinutes: 8,
      vehicleType: "Standard Ambulance",
      recommendedAction: "Stay calm. Keep your phone line open. If you are in danger, move to a safe location.",
      summary: "Emergency services have been notified manually due to connection issues.",
      assistantName: "Dispatch Center",
      contactNotificationMessage: "Emergency detected. Ambulance dispatched to location. ETA ~8 mins."
    };
  }
};