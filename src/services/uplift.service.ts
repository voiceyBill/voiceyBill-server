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

    if (!this.apiKey) {
      console.warn("Uplift AI API key not provided");
    }
  }

  async transcribeAudio(audioFilePath: string): Promise<TranscriptionResponse> {
    if (!this.apiKey) {
      throw new AppError("Uplift AI API key not configured", 500);
    }

    try {
      const url = `${this.baseUrl}/transcribe/speech-to-text`;

      console.log(`Transcribing audio file: ${audioFilePath}`);

      const form = new FormData();
      form.append("model", voiceConfig.uplift_ai_model);
      form.append("language", voiceConfig.uplift_ai_language);
      form.append("domain", voiceConfig.uplift_ai_domain);

      // Read the file and append it to FormData
      const fileBuffer = fs.readFileSync(audioFilePath);
      const fileExtension = path.extname(audioFilePath).toLowerCase();

      // Set appropriate MIME type based on file extension
      let mimeType = "audio/mpeg"; // default
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
        console.warn("No text transcribed from audio file");
        return {
          text: "",
          confidence: 0.0,
          language: voiceConfig.uplift_ai_language,
        };
      }

      console.log(
        `Transcription successful: ${transcribedText.substring(0, 50)}...`
      );

      return {
        text: transcribedText,
        confidence: result.confidence || 0.8,
        language: voiceConfig.uplift_ai_language,
      };
    } catch (error: any) {
      console.error("Uplift AI API request failed:", error);

      let errorDetail = "Unknown error";
      if (error.message) {
        errorDetail = error.message;
      }

      throw new AppError(`Transcription failed: ${errorDetail}`, 500);
    }
  }

  validateAudioFile(filePath: string): boolean {
    try {
      if (!fs.existsSync(filePath)) {
        console.error(`Audio file not found: ${filePath}`);
        return false;
      }

      const fileExtension = path.extname(filePath).toLowerCase();
      if (![".mp3", ".wav", ".m4a", ".webm", ".ogg"].includes(fileExtension)) {
        console.error(`Unsupported audio format: ${fileExtension}`);
        return false;
      }

      // Check file size (max 25MB as per Uplift AI docs)
      const fileSize = fs.statSync(filePath).size;
      const maxSize = 25 * 1024 * 1024; // 25MB

      if (fileSize > maxSize) {
        console.error(`Audio file too large: ${fileSize} bytes`);
        return false;
      }

      if (fileSize === 0) {
        console.error("Audio file is empty");
        return false;
      }

      console.log(`Audio file validation passed: ${filePath}`);
      return true;
    } catch (error) {
      console.error("File validation error:", error);
      return false;
    }
  }
}
