import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface KBArticle {
  title: string;
  category: string;
  problem: string;
  cause: string;
  solution: string;
  stepByStepFix: string[];
  keywords: string[];
}

export async function analyzeConversation(conversation: string): Promise<KBArticle> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are an expert customer support analyst. Analyze the following conversation and extract information to create a Knowledge Base article.
            
            Conversation:
            """
            ${conversation}
            """
            
            Return the result in JSON format matching the schema provided.`
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A clear, concise title for the KB article" },
          category: { type: Type.STRING, description: "The category of the issue (e.g., Billing, Technical, Account)" },
          problem: { type: Type.STRING, description: "A description of the main issue faced by the customer" },
          cause: { type: Type.STRING, description: "The root cause of the problem" },
          solution: { type: Type.STRING, description: "A summary of the solution provided" },
          stepByStepFix: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "A list of steps to resolve the issue"
          },
          keywords: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "SEO keywords for the article"
          }
        },
        required: ["title", "category", "problem", "cause", "solution", "stepByStepFix", "keywords"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  return JSON.parse(text) as KBArticle;
}
