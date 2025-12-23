
import { GoogleGenAI, Type } from "@google/genai";
import { FailureRoadmap, InversionGoal } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const FAILURE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    business_concept: { type: Type.STRING },
    doom_score: { type: Type.INTEGER },
    phases: {
      type: Type.OBJECT,
      properties: {
        market_ignorance: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              severity: { type: Type.STRING }
            },
            required: ["id", "title", "description", "severity"]
          }
        },
        financial_suicide: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              estimated_burn: { type: Type.STRING }
            },
            required: ["id", "title", "description", "estimated_burn"]
          }
        },
        operational_hell: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              time_wasted: { type: Type.STRING }
            },
            required: ["id", "title", "description", "time_wasted"]
          }
        }
      },
      required: ["market_ignorance", "financial_suicide", "operational_hell"]
    },
    the_obituary: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        tweet_text: { type: Type.STRING }
      },
      required: ["headline", "tweet_text"]
    }
  },
  required: ["business_concept", "doom_score", "phases", "the_obituary"]
};

const INVERSION_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      bad_decision: { type: Type.STRING },
      strategic_rule: { type: Type.STRING }
    },
    required: ["bad_decision", "strategic_rule"]
  }
};

export async function generateFailureRoadmap(idea: string, doom: number): Promise<FailureRoadmap> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this business idea and show how it will fail: "${idea}". Doom level: ${doom}/10.`,
    config: {
      systemInstruction: `You are the 'Chaos Consultant.' Your job is to analyze business ideas and ruthlessly identify their failure points. Do not be polite. Do not offer encouragement. Use the principle of Inversion. Use a cynical, dry, and analytical tone.
      
      Output categories:
      1. Market Ignorance: Why the market will reject this.
      2. Financial Suicide: Expensive early mistakes.
      3. Operational Hell: Logistical/legal nightmares.
      
      Temperature should scale with doom level (0-10).`,
      responseMimeType: "application/json",
      responseSchema: FAILURE_SCHEMA,
      temperature: doom / 10,
    },
  });

  return JSON.parse(response.text);
}

export async function invertDecisions(decisions: { title: string, description: string }[]): Promise<InversionGoal[]> {
  const list = decisions.map(d => `${d.title}: ${d.description}`).join('\n');
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Invert the following bad decisions into strategic anti-goals/guardrails:\n${list}`,
    config: {
      systemInstruction: `Apply the mental model of Inversion to these specific points. Transform them into strict, actionable 'Anti-Goals' or 'Guardrails' that will prevent these specific failures. Output format: A list of objects with 'bad_decision' and 'strategic_rule'.`,
      responseMimeType: "application/json",
      responseSchema: INVERSION_SCHEMA,
    },
  });

  return JSON.parse(response.text);
}
