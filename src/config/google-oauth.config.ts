import { OAuth2Client } from "google-auth-library";
import { Env } from "./env.config";

if (!Env.GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID environment variable is not set");
}

export const googleAuthClient = new OAuth2Client({
  clientId: Env.GOOGLE_CLIENT_ID,
});

const googleClientAudiences = [
  Env.GOOGLE_CLIENT_ID,
  Env.GOOGLE_ANDROID_CLIENT_ID,
  Env.GOOGLE_IOS_CLIENT_ID,
].filter((clientId): clientId is string => Boolean(clientId?.trim()));

export const verifyGoogleIdToken = async (idToken: string) => {
  try {
    const ticket = await googleAuthClient.verifyIdToken({
      idToken,
      audience: googleClientAudiences,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error("Invalid token payload");
    }

    return {
      googleId: payload.sub,
      email: payload.email || "",
      name: payload.name || "",
      picture: payload.picture || null,
      emailVerified: payload.email_verified || false,
    };
  } catch (error) {
    console.error("Google token verification failed:", error);
    throw error;
  }
};
