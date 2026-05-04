import { VoiceConfig } from '../@types/voice.type';
import { Env } from './env.config';

export const voiceConfig: VoiceConfig = {
  uplift_ai_api_key: Env.UPLIFT_AI_API_KEY,
  openai_api_key: Env.OPENAI_API_KEY,
  uplift_ai_base_url: 'https://api.upliftai.org/v1',
  uplift_ai_model: 'scribe',
  uplift_ai_language: 'ur',
  uplift_ai_domain: 'phone-commerce',
  openai_model: 'gpt-4o',
  openai_temperature: 0.0,
  categories: [
    'groceries',
    'dining',
    'transportation',
    'utilities',
    'entertainment',
    'shopping',
    'healthcare',
    'travel',
    'housing',
    'income',
    'investments',
    'other'
  ],
  payment_methods: [
    'CARD',
    'BANK_TRANSFER',
    'MOBILE_PAYMENT',
    'AUTO_DEBIT',
    'CASH',
    'OTHER'
  ]
};

