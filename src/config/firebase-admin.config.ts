import admin from "firebase-admin";
import { Env } from "./env.config";

const parseServiceAccount = () => {
  const raw = Env.FIREBASE_SERVICE_ACCOUNT_JSON.trim();

  const jsonString = raw.startsWith("{")
    ? raw
    : Buffer.from(raw, "base64").toString("utf-8");

  return JSON.parse(jsonString);
};

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(parseServiceAccount()),
  });
}

export const firebaseAdmin = admin;
export const firebaseMessaging = admin.messaging();
