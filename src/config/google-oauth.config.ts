import { OAuth2Client } from "google-auth-library";
import { Env } from "./env.config";

// ─── Why the module-level throw was removed ───────────────────────────────────
//
// The original code threw at module-load time if GOOGLE_CLIENT_ID was missing.
// On Vercel (serverless), this crashes the function BEFORE Express is running,
// so the Express errorHandler never fires. Vercel returns its own raw error
// response (not JSON), RTK Query fails to parse it, and the mobile app shows
// the generic "Google sign-in failed" fallback instead of a useful message.
//
// Fix: move the guard into verifyGoogleIdToken() so the error is thrown inside
// a request handler, Express can catch it, and the client receives a proper
// JSON response with a readable message.
// ─────────────────────────────────────────────────────────────────────────────

// OAuth2Client does not need a clientId in the constructor when an explicit
// audience list is passed to verifyIdToken(). Keeping the constructor argument
// when the value is present is harmless and retains the original behaviour.
export const googleAuthClient = new OAuth2Client(
  Env.GOOGLE_CLIENT_ID || undefined,
);

// ─── Accepted token audiences ─────────────────────────────────────────────────
//
// Google ID tokens include an `aud` claim equal to the OAuth client ID that
// issued them.
//
// • @react-native-google-signin/google-signin on Android
//     configure({ webClientId }) → aud = GOOGLE_CLIENT_ID (web client)
//
// • expo-auth-session legacy flow / web login
//     aud = GOOGLE_CLIENT_ID (web client)
//
// • Future iOS native SDK flow
//     aud = GOOGLE_IOS_CLIENT_ID
//
// All three IDs are included so the same endpoint handles every platform.
// ─────────────────────────────────────────────────────────────────────────────
const googleClientAudiences = [
  Env.GOOGLE_CLIENT_ID,
  Env.GOOGLE_ANDROID_CLIENT_ID,
  Env.GOOGLE_IOS_CLIENT_ID,
].filter((id): id is string => Boolean(id?.trim()));

export const verifyGoogleIdToken = async (idToken: string) => {
  // ── Guard: configuration check at request time ──────────────────────────────
  // Checked here (not at module load) so Express can return a proper JSON 500
  // instead of Vercel's raw function-crash error page.
  if (!Env.GOOGLE_CLIENT_ID) {
    throw new Error(
      "Server configuration error: GOOGLE_CLIENT_ID is not set. " +
        "Set it to the Web application client ID in the hosting environment.",
    );
  }

  if (googleClientAudiences.length === 0) {
    throw new Error(
      "Server configuration error: no Google client IDs configured. " +
        "Set GOOGLE_CLIENT_ID in the hosting environment.",
    );
  }

  // ── Verify the token ────────────────────────────────────────────────────────
  try {
    const ticket = await googleAuthClient.verifyIdToken({
      idToken,
      audience: googleClientAudiences,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error("Google token returned an empty payload.");

    return {
      googleId: payload.sub,
      email: payload.email ?? "",
      name: payload.name ?? "",
      picture: payload.picture ?? null,
      emailVerified: payload.email_verified ?? false,
    };
  } catch (error: any) {
    // Surface the original Google library error message so the service layer
    // can forward a useful reason to the client (e.g. "audience mismatch").
    console.error("[google-oauth] token verification failed:", {
      message: error?.message,
      audiences: googleClientAudiences.map((id) =>
        id ? `${id.slice(0, 20)}…` : "(empty)",
      ),
    });
    throw error;
  }
};
