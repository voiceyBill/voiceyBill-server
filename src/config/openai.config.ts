import OpenAI from "openai";
import { Env } from "./env.config";

export const openai = new OpenAI({ apiKey: Env.OPENAI_API_KEY });
export const openAIModel = "gpt-4o";
