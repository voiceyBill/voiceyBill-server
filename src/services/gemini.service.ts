import OpenAI from "openai";
import { TransactionData } from "../@types/voice.type";
import { voiceConfig } from "../config/voice.config";
import { AppError } from "../utils/app-error";

export class OpenAIClassificationService {
  private client: OpenAI | null = null;

  constructor(apiKey: string) {
    if (apiKey) {
      try {
        this.client = new OpenAI({ apiKey });
      } catch (error) {
        console.error("Failed to initialize OpenAI client:", error);
        this.client = null;
      }
    }
  }

  private getClassificationPrompt(): string {
    const currentDate = new Date().toISOString().split("T")[0];

    return `You are a financial assistant that helps users classify voice-transcribed financial transactions. The transcription may be in any language — English, Spanish, French, Arabic, Urdu, Hindi, or any other. Understand the meaning regardless of the language and extract the transaction details in English.

Analyze the transcribed text and extract transaction details matching this exact JSON format:
{
  "title": "string",          // Brief description of the transaction (in English)
  "amount": number,           // Total amount (positive number)
  "date": "ISO date string",  // Transaction date in YYYY-MM-DD format (default to today if not specified)
  "description": "string",    // Additional details from the transcription
  "category": "string",       // One of: ${voiceConfig.categories.join(", ")}
  "type": "string",           // Either "INCOME" or "EXPENSE"
  "paymentMethod": "string",  // One of: ${voiceConfig.payment_methods.join(", ")}
  "confidence": number        // Your confidence in this classification (0-1)
}

Rules:
1. Amount must be positive
2. Date should be today's date if not specified: ${currentDate}
3. Category must be one of the predefined categories
4. Type should be "EXPENSE" for spending, "INCOME" for earnings
5. Payment method should be inferred from context or default to "CASH"
6. Confidence should reflect how certain you are about the classification
7. Accept any currency — extract just the numeric amount

Output only valid JSON. Do not include any explanation or markdown.`;
  }

  async classifyTransaction(transcription: string): Promise<TransactionData> {
    if (!this.client) {
      throw new AppError("OpenAI not configured", 500);
    }

    if (!transcription.trim()) {
      throw new AppError("Empty transcription text", 400);
    }

    try {
      const result = await this.client.chat.completions.create({
        model: voiceConfig.openai_model,
        messages: [
          {
            role: "user",
            content: `${this.getClassificationPrompt()}\n\nTranscribed text: ${transcription}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: voiceConfig.openai_temperature,
        max_tokens: 500,
      });

      const content = result.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response from OpenAI");

      const data = JSON.parse(content);
      return this.validateAndCleanData(data) as TransactionData;
    } catch (error: any) {
      throw new AppError(`Classification failed: ${error.message}`, 500);
    }
  }

  private validateAndCleanData(data: any): TransactionData {
    const requiredFields = ["title", "amount", "date", "category", "type", "paymentMethod"];

    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) throw new Error("Amount must be a positive number");
    data.amount = amount;

    try {
      new Date(data.date).toISOString();
    } catch {
      data.date = new Date().toISOString().split("T")[0];
    }

    if (!voiceConfig.categories.includes(data.category)) data.category = "other";
    if (!voiceConfig.payment_methods.includes(data.paymentMethod)) data.paymentMethod = "CASH";
    if (!["INCOME", "EXPENSE"].includes(data.type)) data.type = "EXPENSE";

    const confidence = parseFloat(data.confidence);
    data.confidence = isNaN(confidence) || confidence < 0 || confidence > 1 ? 0.8 : confidence;

    if (!data.description) data.description = undefined;

    return data as TransactionData;
  }
}

// keep old export name for backward compatibility
export const GeminiClassificationService = OpenAIClassificationService;
