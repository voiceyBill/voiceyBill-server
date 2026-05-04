export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE"
}

export enum PaymentMethod {
  CARD = "CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  MOBILE_PAYMENT = "MOBILE_PAYMENT",
  AUTO_DEBIT = "AUTO_DEBIT",
  CASH = "CASH",
  OTHER = "OTHER"
}

export interface TransactionData {
  title: string;
  amount: number;
  date: string;
  description?: string;
  category: string;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  confidence?: number;
}

export interface TranscriptionResponse {
  text: string;
  confidence?: number;
  language?: string;
  processing_time?: number;
}

export interface VoiceProcessingResponse {
  message: string;
  data: {
    title?: string;
    amount?: number;
    date?: string;
    description?: string;
    category?: string;
    paymentMethod?: string;
    type?: string;
    voiceUrl?: string;
    transcription?: string;
    confidence?: number;
    error?: string;
  };
}

export interface ErrorResponse {
  error: string;
  detail?: string;
  code?: string;
  timestamp: string;
}

export interface VoiceConfig {
  uplift_ai_api_key: string;
  openai_api_key: string;
  uplift_ai_base_url: string;
  uplift_ai_model: string;
  uplift_ai_language: string;
  uplift_ai_domain: string;
  openai_model: string;
  openai_temperature: number;
  categories: string[];
  payment_methods: string[];
}

