import fs from "fs";
import path from "path";
import { TranscriptionResponse } from "../@types/voice.type";
import { voiceConfig } from "../config/voice.config";
import { AppError } from "../utils/app-error";

export class UpliftAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = voiceConfig.uplift_ai_base_url;
  }

  async transcribeAudio(audioFilePath: string): Promise<TranscriptionResponse> {
    if (!this.apiKey) {
      throw new AppError("Uplift AI API key not configured", 500);
    }

    try {
      const url = `${this.baseUrl}/transcribe/speech-to-text`;

      const form = new FormData();
      form.append("model", voiceConfig.uplift_ai_model);
      form.append("language", voiceConfig.uplift_ai_language);
      form.append("domain", voiceConfig.uplift_ai_domain);

      // Read the file and append it to FormData
      const fileBuffer = fs.readFileSync(audioFilePath);
      const fileExtension = path.extname(audioFilePath).toLowerCase();

      // Set appropriate MIME type based on file extension
      let mimeType = "audio/mpeg";

      if (fileExtension === ".webm") mimeType = "audio/webm";
      else if (fileExtension === ".wav") mimeType = "audio/wav";
      else if (fileExtension === ".ogg") mimeType = "audio/ogg";
      else if (fileExtension === ".m4a") mimeType = "audio/mp4";

      const blob = new Blob([fileBuffer], { type: mimeType });
      form.append("file", blob, path.basename(audioFilePath));

      const options: RequestInit = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: form,
      };

      // Add timeout handling for production
      let response: Response;

      if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) {
        // Modern Node.js environment
        options.signal = AbortSignal.timeout(15000);
        response = await fetch(url, options);
      } else {
        // Fallback for older environments
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Request timeout after 15 seconds")),
            15000
          )
        );

        const fetchPromise = fetch(url, options);
        response = await Promise.race([fetchPromise, timeoutPromise]);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const transcribedText = (result.transcript || result.text || "").trim();

      if (!transcribedText) {
        return {
          text: "",
          confidence: 0.0,
          language: voiceConfig.uplift_ai_language,
        };
      }

      return {
        text: transcribedText,
        confidence: result.confidence || 0.8,
        language: voiceConfig.uplift_ai_language,
      };
    } catch (error: unknown) {
      const errorDetail =
        error instanceof Error ? error.message : "Unknown error";

      throw new AppError(`Transcription failed: ${errorDetail}`, 500);
    }
  }

  validateAudioFile(filePath: string): boolean {
    try {
      if (!fs.existsSync(filePath)) {
        return false;
      }

      const fileExtension = path.extname(filePath).toLowerCase();

      if (![".mp3", ".wav", ".m4a", ".webm", ".ogg"].includes(fileExtension)) {
        return false;
      }

      // Check file size (max 25MB as per Uplift AI docs)
      const fileSize = fs.statSync(filePath).size;
      const maxSize = 25 * 1024 * 1024; // 25MB

      if (fileSize > maxSize) {
        return false;
      }

      if (fileSize === 0) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}