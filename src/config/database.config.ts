import mongoose from "mongoose";
import { Env } from "./env.config";
import { NextFunction, Request, Response } from "express";

// const connctDatabase = async () => {
//   try {
//     // Check if already connected
//     if (mongoose.connection.readyState === 1) {
//       console.log("Already connected to MongoDB database");
//       return;
//     }

//     await mongoose.connect(Env.MONGO_URI, {
//       serverSelectionTimeoutMS: 8000,
//       socketTimeoutMS: 45000,
//       connectTimeoutMS: 30000,
//     });
//     console.log("Connected to MongoDB database");
//   } catch (error) {
//     console.error("Error connecting to MongoDB database:", error);
//     // Don't exit in serverless environment, just log the error
//     throw error;
//   }
// };

// export default connctDatabase;

const connectDbWithRetry = async (dbURI: string, maxRetries: number) => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  for (let retries = 0; retries < maxRetries; retries++) {
    try {
      const uri = dbURI;
      // const uri =
      //   process.env.NODE_ENV === "test" ? await getMemoryServerUri() : dbURI;
      await mongoose.connect(uri, {
        dbName: "money-tracker",
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 0,
        maxIdleTimeMS: 10000,
        bufferCommands: false,
      });
      console.log("Connected to MongoDB");

      break;
    } catch (err) {
      console.error(`Failed to connect to MongoDB: ${err}. Retrying...`);
      if (retries === maxRetries) {
        console.error("Max connection retries reached.");
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

let connectionPromise: Promise<void> | null = null;

export const connctDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = connectDbWithRetry(Env.MONGO_URI, 5).finally(() => {
      connectionPromise = null;
    });
  }

  await connectionPromise;
};

export const ensureDatabaseConnection = async (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    await connctDatabase();
    next();
  } catch (error) {
    next(error);
  }
};
