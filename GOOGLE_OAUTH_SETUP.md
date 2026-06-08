# Google Authentication Setup

This guide explains how the backend verifies Google authentication for both the web app and the Expo mobile app.

## What The Backend Does

- Receives Google auth requests at `POST /api/auth/google`.
- Verifies the Google ID token with `google-auth-library`.
- Accepts tokens issued to the configured web, Android, and iOS OAuth client IDs.
- Logs in existing Google users.
- Links an existing email/password account when the Google email matches.
- Creates first-time Google users automatically.
- Issues the existing VoiceyBill access and refresh tokens.

Email/password authentication remains separate and should continue to work unchanged.

## Required Environment Variables

Add these values to `.env` for local development and to the production hosting environment before deployment:

```env
# Existing backend settings
FRONTEND_ORIGIN=http://localhost:5173

# Google OAuth audiences
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

`GOOGLE_CLIENT_ID` is the web client ID and is required. Android and iOS IDs are required when mobile Google login is enabled.

## Why Multiple Client IDs Are Needed

Google ID tokens include an `aud` claim. That claim is the OAuth client ID that the token was issued for.

- Web login usually sends a token with `aud = GOOGLE_CLIENT_ID`.
- Android login sends a token with `aud = GOOGLE_ANDROID_CLIENT_ID`.
- iOS login sends a token with `aud = GOOGLE_IOS_CLIENT_ID`.

If the backend only verifies `GOOGLE_CLIENT_ID`, mobile login fails with:

```text
Wrong recipient, payload audience != requiredAudience
```

The verifier should pass all supported client IDs as the allowed audience list.

## Google Cloud Setup

Maintainers should configure one Google Cloud project with these OAuth clients.

### OAuth Consent Screen

- Configure the OAuth consent screen for `VoiceyBill`.
- Add support and developer contact emails.
- While the app is in testing mode, add contributor Google accounts as test users.
- Before production release, publish/verify the consent configuration as required by Google.

### Web OAuth Client

- Application type: Web application
- Authorized JavaScript origins:
  - `http://localhost:5173`
  - production web URL
- Authorized redirect URIs:
  - local and production web redirect URLs required by the web app

### Android OAuth Client

- Application type: Android
- Package name: `com.voiceybill.mobile`
- SHA-1 fingerprints:
  - local contributor debug SHA-1 when testing local builds
  - production release/EAS signing SHA-1
- Custom URI scheme: enabled

If a contributor uses a local Expo development build, add that contributor's local debug SHA-1 to this Android OAuth client. In this project it is usually read from `voiceyBill-App/android/app/debug.keystore` after running `npx expo run:android`.

### iOS OAuth Client

- Application type: iOS
- Bundle ID: `com.voiceybill.mobile`
- URL scheme should match the iOS Google client ID scheme used by the app.

## Local Contributor Flow

1. Ask a maintainer for approved Google OAuth client IDs, or ask them to add your Android debug SHA-1 to the Android OAuth client.
2. Add the client IDs to the backend `.env`.
3. Add the same client IDs to the mobile/web `.env` files.
4. Make sure your Google account is added as an OAuth consent test user if the app is still in testing mode.
5. Start the backend:

   ```bash
   npm run dev
   ```

6. Test web Google sign-in.
7. Test mobile Google sign-in from a development build, not Expo Go.

## Testing The Endpoint

Start the server, then authenticate from the web or mobile client. A successful request to `/api/auth/google` should return the existing auth response:

```json
{
  "user": {
    "_id": "user_id",
    "name": "Google User",
    "email": "user@example.com"
  },
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "reportSetting": null
}
```

Do not commit real tokens or real `.env` values.

## Troubleshooting

### Invalid or expired Google token

Common causes:

- Client ID mismatch.
- Backend does not include Android/iOS IDs as allowed audiences.
- Token was copied manually and expired.
- Backend machine time is wrong.

### Token used too early

The backend system clock is behind Google's token time. Sync the machine clock and restart the server.

### Wrong recipient

The token audience does not match the backend allowed audiences. Confirm the relevant Google client ID is present in backend `.env`.

### Web works but mobile fails

The backend probably has only `GOOGLE_CLIENT_ID`. Add `GOOGLE_ANDROID_CLIENT_ID` and `GOOGLE_IOS_CLIENT_ID`.

## Production Checklist

- Add all Google client IDs to production backend env.
- Add production web origin to Google Cloud.
- Add production Android release SHA-1 to Google Cloud.
- Add production iOS bundle ID/URL scheme to Google Cloud.
- Publish/verify the OAuth consent screen for production users.
- Verify `/api/auth/google` works for web, Android, and iOS.
- Verify email/password auth still works.
- Rotate any leaked secrets before deployment.
