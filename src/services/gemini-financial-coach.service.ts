import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  ExpenseOptimization,
  FinancialGoal,
  ExpenseItem,
} from "../@types/financial-coach.type";

export class GeminiFinancialCoachService {
  private client: GoogleGenerativeAI | null = null;

  constructor(apiKey: string) {
    console.log("🔑 API KEY RECEIVED:", apiKey?.slice(0, 10));

    if (!apiKey) {
      throw new Error("Missing GEMINI API KEY");
    }

    this.client = new GoogleGenerativeAI(apiKey);

    console.log("✅ Gemini client initialized");
  }

  async analyzeExpenseOptimization(input: {
    income: number;
    expenses: ExpenseItem[];
    goal: FinancialGoal;
    availableSavings: number;
    requiredSavings: number;
  }): Promise<{
    optimization: ExpenseOptimization | null;
    aiRecommendation: string | null;
  } | null> {
    if (!this.client) return null;

    const model = this.client.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
      },
    });

    const prompt = this.buildPrompt(input);

    try {
      const text = await this.callGemini(model, prompt);

      let parsed = this.safeParseJson(text);

      // retry once if invalid
      if (!parsed) {
        const retryText = await this.callGemini(model, prompt);
        parsed = this.safeParseJson(retryText);
      }

      if (!parsed) return null;

      if (!this.validateResponse(parsed)) return null;

      return {
        optimization: this.transformOptimization(parsed.optimization),
        aiRecommendation: this.cleanString(parsed.aiRecommendation),
      };
    } catch (err) {
      console.error("🔥 Gemini FAILED FULL ERROR:", err);
      throw err;
    }
  }

  private async callGemini(model: any, prompt: string): Promise<string> {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  // peompt
  private buildPrompt(input: any): string {
    return `
You are a financial advisor AI.

TASK:
- Classify expenses as essential or non-essential
- Give 3–5 practical savings recommendations
- Provide short financial advice (2–3 sentences)

STRICT RULES:
- DO NOT calculate savings
- DO NOT judge affordability
- RETURN ONLY VALID JSON
- NO markdown, NO explanation

INPUT:
Income: ${input.income}

Goal:
${JSON.stringify(input.goal, null, 2)}

Expenses:
${JSON.stringify(input.expenses, null, 2)}

OUTPUT FORMAT:
{
  "optimization": {
    "essential": [
      { "category": "string", "amount": number, "rationale": "string" }
    ],
    "nonEssential": [
      { "category": "string", "amount": number, "rationale": "string" }
    ],
    "recommendations": ["string"]
  },
  "aiRecommendation": "string"
}
`;
  }

  // SAFE JSON PARSING
  private safeParseJson(text: string): any | null {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return null;
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }

  // VALIDATION (CRITICAL)

  private validateResponse(data: any): boolean {
    if (!data?.optimization) return false;

    if (!Array.isArray(data.optimization.essential)) return false;
    if (!Array.isArray(data.optimization.nonEssential)) return false;
    if (!Array.isArray(data.optimization.recommendations)) return false;

    return true;
  }

  // TRANSFORM SAFELY FOR FRONTEND

  private transformOptimization(data: any): ExpenseOptimization {
    return {
      essential: (data.essential || []).map((i: any) => ({
        category: String(i.category || ""),
        amount: Number(i.amount || 0),
        rationale: String(i.rationale || ""),
      })),

      nonEssential: (data.nonEssential || []).map((i: any) => ({
        category: String(i.category || ""),
        amount: Number(i.amount || 0),
        rationale: String(i.rationale || ""),
      })),

      recommendations: Array.isArray(data.recommendations)
        ? data.recommendations.slice(0, 5).map(String)
        : [],

      optimizationPotential: {
        conservative: 0,
        moderate: 0,
        aggressive: 0,
      },
    };
  }

  private cleanString(value: any): string | null {
    if (!value) return null;
    return String(value);
  }
}
