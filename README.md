# VoiceyBill — Backend

[![CI](https://github.com/voiceyBill/voiceyBill-server/actions/workflows/ci.yml/badge.svg)](https://github.com/voiceyBill/voiceyBill-server/actions/workflows/ci.yml)
[![CodeQL](https://github.com/voiceyBill/voiceyBill-server/actions/workflows/codeql.yml/badge.svg)](https://github.com/voiceyBill/voiceyBill-server/actions/workflows/codeql.yml)
[![Release](https://github.com/voiceyBill/voiceyBill-server/actions/workflows/release.yml/badge.svg)](https://github.com/voiceyBill/voiceyBill-server/actions/workflows/release.yml)

REST API powering transaction management, voice-to-transaction AI processing, receipt scanning, report scheduling, and user auth for VoiceyBill.

## Tech stack

- **Express 4** + **TypeScript**
- **MongoDB** via **Mongoose 8**
- **Passport.js** + **JWT** for authentication
- **Google Generative AI** (Gemini) for voice transcription classification
- **OpenAI** for receipt scanning
- **Cloudinary** for file/image storage
- **Resend** for transactional email (report delivery)
- **node-cron** for scheduled report jobs

## Prerequisites

- Node.js 20 or later
- MongoDB instance (local or Atlas)

## Setup

```bash
cp .env.example .env   # fill in required values
npm ci
```

### Environment variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GEMINI_API_KEY` | Google Generative AI key (voice processing) |
| `OPENAI_API_KEY` | OpenAI key (receipt scanning) |
| `RESEND_API_KEY` | Resend API key (report emails) |
| `CLIENT_URL` | Allowed CORS origin for the web client |

## Development

```bash
npm run dev     # ts-node-dev with hot reload
npm run build   # compile TypeScript → dist/
npm start       # run compiled build
```

## API areas

- **Auth** — register, login, JWT refresh
- **Transactions** — CRUD, bulk delete, CSV import, duplicate, recurring intervals
- **Analytics** — dashboard stats, income/expense trends, category breakdown
- **Voice** — upload audio, AI transcription → structured transaction data
- **Receipt scan** — upload receipt image, AI extraction → transaction fields
- **Reports** — generate reports, schedule recurring email delivery
- **User** — profile update, avatar upload

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [SECURITY.md](SECURITY.md).
