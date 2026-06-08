import { z } from "zod";

export const googleAuthSchema = z.object({
  idToken: z
    .string()
    .min(1, "Google ID token is required")
    .describe("Google ID token from frontend"),
});

export type GoogleAuthSchemaType = z.infer<typeof googleAuthSchema>;
