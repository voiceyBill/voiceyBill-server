import "dotenv/config";
import "./config/passport.config";
import express, { Request, Response } from "express";
import cors from "cors";
import passport from "passport";
import mongoose from "mongoose";
import { Env } from "./config/env.config";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { asyncHandler } from "./middlewares/asyncHandler.middlerware";
import { ensureDatabaseConnection } from "./config/database.config";
import authRoutes from "./routes/auth.route";
import { passportAuthenticateJwt } from "./config/passport.config";
import userRoutes from "./routes/user.route";
import transactionRoutes from "./routes/transaction.route";
import { initializeCrons } from "./cron";
import reportRoutes from "./routes/report.route";
import analyticsRoutes from "./routes/analytics.route";
import voiceRoutes from "./routes/voice.route";

const app = express();
const BASE_PATH = Env.BASE_PATH;

const allowedOrigins = new Set(
  [
    "http://localhost:5173",
    "https://voiceybill.vercel.app",
    Env.FRONTEND_ORIGIN,
  ].filter(Boolean),
);

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept, Origin, X-Requested-With",
    );
    res.header("Vary", "Origin");
  }

  next();
});

app.use(cors(corsOptions));
app.options("*", (req, res) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept, Origin, X-Requested-With",
    );
    res.header("Vary", "Origin");
  }

  res.sendStatus(204);
});

app.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    res.status(HTTPSTATUS.OK).json({
      message: "VoiceyBill API is running successfully!",
      status: "active",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  }),
);

app.get(
  "/health",
  asyncHandler(async (_req: Request, res: Response) => {
    res.status(HTTPSTATUS.OK).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
  }),
);

app.get(
  "/test",
  asyncHandler(async (_req: Request, res: Response) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Serverless function is working!",
      timestamp: new Date().toISOString(),
      environment: Env.NODE_ENV,
    });
  }),
);

app.use(`${BASE_PATH}/auth`, ensureDatabaseConnection, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes);
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt, transactionRoutes);
app.use(`${BASE_PATH}/report`, passportAuthenticateJwt, reportRoutes);
app.use(`${BASE_PATH}/analytics`, passportAuthenticateJwt, analyticsRoutes);
app.use(`${BASE_PATH}/voice`, passportAuthenticateJwt, voiceRoutes);

// Catch-all route for 404 errors
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    status: 404,
  });
});

app.use(errorHandler);

// Initialize crons only in development
if (Env.NODE_ENV === "development") {
  initializeCrons()
    .then(() => {
      console.log("Crons initialized");
    })
    .catch((error) => {
      console.error("Cron initialization failed:", error);
    });
}

// Start the server in development mode
if (Env.NODE_ENV === "development") {
  const port = parseInt(Env.PORT);
  app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(`📋 API Base Path: ${BASE_PATH}`);
    console.log(`🌍 Environment: ${Env.NODE_ENV}`);
  });
}

// Export the app for Vercel serverless functions
export default app;
