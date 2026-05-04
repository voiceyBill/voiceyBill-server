import { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";
import { UpliftAIService } from "../services/uplift.service";
import { GeminiClassificationService } from "../services/gemini.service";
import { voiceConfig } from "../config/voice.config";
import { AppError } from "../utils/app-error";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { HTTPSTATUS } from "../config/http.config";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/webm",
      "audio/wav",
      "audio/ogg",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          "Only MP3, WebM, WAV, and OGG audio files are supported",
          400
        )
      );
    }
  },
});

// Initialize services
const upliftService = new UpliftAIService(voiceConfig.uplift_ai_api_key);
const geminiService = new GeminiClassificationService(
  voiceConfig.openai_api_key
);

export const uploadMiddleware = upload.single("file");

export const processVoiceTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const file = req?.file;

    if (!file) {
      throw new AppError("No audio file provided", 400);
    }

    // Write buffer to OS temp directory to ensure writable path on serverless platforms
    const tmpDir = os.tmpdir();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".webm";
    const tmpFilename = `voice-${uniqueSuffix}${ext}`;
    const tmpFilePath = path.join(tmpDir, tmpFilename);

    try {
      fs.writeFileSync(tmpFilePath, file.buffer);

      // Validate audio file
      if (!upliftService.validateAudioFile(tmpFilePath)) {
        throw new AppError("Invalid audio file format or size", 400);
      }

      console.log("Starting transcription...");

      // Set overall timeout for the entire process (45 seconds for Vercel Pro)
      const overallTimeout = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Voice processing timeout - please try with shorter audio"
              )
            ),
          45000
        )
      );

      const processVoice = async () => {
        const transcriptionResult =
          await upliftService.transcribeAudio(tmpFilePath);

        if (!transcriptionResult.text.trim()) {
          return {
            success: false,
            message: "Voice processed successfully",
            data: {
              error: "No speech detected in audio file",
            },
          };
        }

        console.log(`Transcription: ${transcriptionResult.text}`);

        console.log("Starting classification...");
        const transactionData = await geminiService.classifyTransaction(
          transcriptionResult.text
        );

        console.log(`Processing successful: ${transactionData.title}`);

        // Return the same format as scanReceiptController
        const result = {
          title: transactionData.title,
          amount: transactionData.amount,
          date: transactionData.date,
          description: transactionData.description,
          category: transactionData.category,
          paymentMethod: transactionData.paymentMethod,
          type: transactionData.type,
          voiceUrl: tmpFilePath, // Temporary file path on server
          transcription: transcriptionResult.text,
          confidence: transactionData.confidence,
        };

        return {
          success: true,
          message: "Voice processed successfully",
          data: result,
        };
      };

      // Race between processing and timeout
      const result = await Promise.race([processVoice(), overallTimeout]);

      return res.status(HTTPSTATUS.OK).json(result);
    } catch (error: any) {
      console.error("Unexpected error in voice processing:", error);

      // Handle specific timeout errors
      if (error.message.includes("timeout")) {
        return res.status(HTTPSTATUS.OK).json({
          success: false,
          message: "Voice processed successfully",
          data: {
            error:
              "Processing timeout - please try with shorter audio or try again",
          },
        });
      }

      return res.status(HTTPSTATUS.OK).json({
        success: false,
        message: "Voice processed successfully",
        data: {
          error: error.message || "Voice processing service unavailable",
        },
      });
    } finally {
      // Clean up temporary file written to OS temp dir
      try {
        if (fs.existsSync(tmpFilePath)) {
          fs.unlinkSync(tmpFilePath);
        }
      } catch (cleanupErr) {
        console.warn("Failed to clean up temp file:", cleanupErr);
      }
    }
  }
);
