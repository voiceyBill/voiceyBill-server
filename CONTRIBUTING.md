# Contributing to VoiceyBill

Thanks for your interest in contributing. This guide covers all three packages in the monorepo: **backend**, **client (web)**, and **mobile**.

## Ground rules

- Be respectful and constructive in all discussions.
- Focus pull requests on one clear change.
- Open an issue before starting major features.
- Do not include secrets or production credentials in any commit.

---

## Backend

**Location:** `backend/`  
**Stack:** Express, TypeScript, MongoDB, Passport.js

### Setup

```bash
cd backend
cp .env.example .env   # fill in required values
npm ci
npm run dev
```

### Quality checks

```bash
npm run build
npm test --if-present
```

---

## Client (web)

**Location:** `client/`  
**Stack:** React 19, Vite, Tailwind CSS, Redux Toolkit

### Setup

```bash
cd client
cp .env.example .env   # set VITE_API_URL
npm ci
npm run dev
```

### Quality checks

```bash
npm run build
npm run lint
```

---

## Mobile

**Location:** `mobile/`  
**Stack:** React Native 0.81, Expo 54, Redux Toolkit

### Setup

```bash
cd mobile
cp .env.example .env   # set EXPO_PUBLIC_API_URL to your local machine IP
npm ci
npx expo start
```

> Use your machine's LAN IP (not `localhost`) so the device/emulator can reach the backend.

### Quality checks

```bash
npx expo export         # verify the app bundles without errors
npx tsc --noEmit        # TypeScript type check
```

---

## Branch and commit conventions

- Branch names should be descriptive, for example:
  - `feat/voice-transcription-card`
  - `fix/mobile-theme-tokens`
  - `docs/update-mobile-readme`
- Use clear commits that explain why the change is needed.

## Pull request requirements

- PR titles follow Conventional Commits style:
  - `feat(mobile): Add transcription result card`
  - `fix(client): Correct income chart colour tokens`
  - `chore(backend): Upgrade Mongoose to v8`
- Keep PRs small and easy to review.
- Link related issues, for example `Closes #123`.
- Include screenshots or recordings for any UI-related changes.

## Issue reporting

- Use the bug template for defects.
- Use the feature template for enhancements.
- Use the question template for usage help.

## Security policy

- Do not open public issues for security vulnerabilities.
- Use GitHub Security Advisories for responsible disclosure.
