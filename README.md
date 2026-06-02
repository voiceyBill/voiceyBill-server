# VoiceyBill — Backend

[![CI](https://github.com/voiceyBill/voiceyBill-server/actions/workflows/ci.yml/badge.svg)](https://github.com/voiceyBill/voiceyBill-server/actions/workflows/ci.yml)
[![CodeQL](https://github.com/voiceyBill/voiceyBill-server/actions/workflows/codeql.yml/badge.svg)](https://github.com/voiceyBill/voiceyBill-server/actions/workflows/codeql.yml)
[![Release](https://github.com/voiceyBill/voiceyBill-server/actions/workflows/release.yml/badge.svg)](https://github.com/voiceyBill/voiceyBill-server/actions/workflows/release.yml)

REST API powering transaction management, voice-to-transaction AI processing, receipt scanning, report scheduling, and user auth for VoiceyBill.
It also supports multi-currency transactions by storing original amounts, converted base-currency amounts and exchange-rate metadata.

## Local development

This backend uses its own MongoDB database named `voiceybill` by default. Contributors can run the API with either a local MongoDB instance or a Docker container.

### Option 1: Docker MongoDB

Start a local database:

```bash
docker compose up -d
```

Then copy `.env.example` to `.env` and keep `MONGO_URI=mongodb://localhost:27017`.

### Option 2: MongoDB Atlas

Set `MONGO_URI` to your Atlas connection string and keep `MONGO_DB_NAME=voiceybill`.

### Start the server

```bash
npm run dev     # ts-node-dev with hot reload
```

You should see:

```
Connected to MongoDB
🚀 Server is running on http://localhost:8000
```

### Seed data

In a new terminal, seed demo data:

```bash
npm run seed
```

To wipe and recreate the demo data:

```bash
npm run seed:wipe
```

## Tech stack

- **Express 4** + **TypeScript**
- **MongoDB** via **Mongoose 8**
- **Passport.js** + **JWT** for authentication
- **Google Generative AI** (Gemini) for voice transcription classification
- **OpenAI** for receipt scanning
- **Cloudinary** for file/image storage
- **Resend** for transactional email (report delivery)
- **node-cron** for scheduled report jobs
- **Frankfurter API** with local cache fallback for exchange rates

## Prerequisites

- **Node.js 20.0.0 or later** (`node --version` to check)
- **npm 10.0.0 or later** (`npm --version` to check)
- **MongoDB instance** (local Docker container or MongoDB Atlas cloud)
- **Docker Desktop** (optional but recommended for local MongoDB)

> If you don't meet the Node/npm version requirement, download from https://nodejs.org/ (choose the LTS version 20+)

## Verify your setup

Before continuing, verify your machine meets the requirements:

```bash
node --version      # should be v20.0.0 or higher
npm --version       # should be 10.0.0 or higher
git --version       # should be 2.x or higher
docker --version    # should be 20.0+ (optional, only needed for Docker MongoDB)
```

**If versions are too old:**

- Download Node.js from https://nodejs.org/ (choose LTS v20+)
- Restart your terminal and verify again

## Setup

```bash
cp .env.example .env   # fill in required values
npm ci
```

### Environment variables

| Variable                | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `PORT`                  | Server port (default `8000`)                             |
| `MONGO_URI`             | MongoDB connection string                                |
| `MONGO_DB_NAME`         | Database name used by the backend (default `voiceybill`) |
| `JWT_SECRET`            | Secret for signing JWT tokens                            |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                                    |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                                       |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                                    |
| `GEMINI_API_KEY`        | Google Generative AI key (voice processing)              |
| `OPENAI_API_KEY`        | OpenAI key (receipt scanning)                            |
| `RESEND_API_KEY`        | Resend API key (report emails)                           |
| `FRONTEND_ORIGIN`       | Allowed CORS origin for the web client                   |

## Development

```bash
npm run dev     # ts-node-dev with hot reload
npm run build   # compile TypeScript → dist/
npm start       # run compiled build
```

## Docker

The repo includes a local MongoDB Compose file for contributors who do not want to install MongoDB directly. The container stores data in a named volume so it persists between restarts.

If you use Docker, set `MONGO_URI=mongodb://localhost:27017` in `.env` and keep `MONGO_DB_NAME=voiceybill`.

## API areas

- **Auth** — register, login, JWT refresh
- **Transactions** — CRUD, bulk delete, CSV import, duplicate, recurring intervals
- **Currency** — supported currency list, exchange rates, cached fallback rates
- **Analytics** — dashboard stats, income/expense trends, category breakdown
- **Voice** — upload audio, AI transcription → structured transaction data
- **Receipt scan** — upload receipt image, AI extraction → transaction fields
- **Reports** — generate reports, schedule recurring email delivery
- **User** — profile update, avatar upload

## Multi-currency support

- Users can set a `baseCurrency` on their profile.
- Transactions may include a `currency` code when created or updated.
- Foreign-currency transactions store the original amount/currency plus the converted base-currency amount in `amount`.
- Exchange rate, rate source (`live` or `cached`) and fetch timestamp are stored with converted transactions.
- Changing a user's base currency rebases existing transactions so dashboard totals and reports remain numerically correct.
- Currency endpoints:
  - `GET /api/currency/supported`
  - `GET /api/currency/rate?from=EUR&to=INR`

## Contributing

Please follow `CONTRIBUTING.md` for setup, issue reporting, and pull request rules.

- Use the issue templates for bugs, feature requests, and questions.
- Attach screenshots, screen recordings, or request/response samples when they help reproduce a problem.
- Use the pull request template and keep PRs focused on one change.

See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [SECURITY.md](SECURITY.md).

## Troubleshooting

### "Cannot find module" or "npm ERR!"

1. Clear and reinstall dependencies:

   ```bash
   rm -rf node_modules package-lock.json
   npm ci
   ```

2. Check Node version meets requirement (20+):

   ```bash
   node --version
   npm --version
   ```

3. If still failing, check if there are native modules (bcrypt, etc.) that need Python/build tools.

### MongoDB connection error ("connect ECONNREFUSED")

1. If using Docker, verify the container is running:

   ```bash
   docker ps | grep mongo
   ```

2. If not running, start it:

   ```bash
   docker compose up -d
   ```

3. If using MongoDB Atlas, verify `MONGO_URI` is correct in `.env`:
   ```bash
   curl "your_mongo_uri_from_env"
   ```

### Port 8000 already in use

1. Change the port in `.env`:

   ```bash
   PORT=3001
   ```

2. Or kill the process using port 8000 (be careful):

   ```bash
   # Windows
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F

   # Mac/Linux
   lsof -i :8000
   kill -9 <PID>
   ```

### "ERR: Seeding failed" or seed data won't populate

1. Verify the database is connected:

   ```bash
   npm run dev
   # should show "Connected to MongoDB"
   ```

2. Check MongoDB is using the correct database name:

   ```bash
   # Should be 'voiceybill' by default
   echo $MONGO_DB_NAME
   ```

3. Clear the database and try again:
   ```bash
   npm run seed:wipe
   npm run seed
   ```

### TypeScript build errors

1. Check for type errors:

   ```bash
   npm run build
   ```

2. If there are errors, they are usually in specific files. Fix them or open an issue with the full error output.

### Env variables not being read

1. Verify `.env` file exists and has the required variables:

   ```bash
   cat .env | grep MONGO_URI
   ```

2. Restart the server:

   ```bash
   npm run dev
   ```

3. If variables still not showing, check that they are not commented out or missing in `.env`.
