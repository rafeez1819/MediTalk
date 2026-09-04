# MediTalk

MediTalk is a modern clinical documentation workspace for creating, reviewing, and managing structured medical encounter notes.

> **Project status:** Development / prototype.
>
> This repository is not currently a production-ready patient-doctor consultation platform and must not be used as a substitute for a validated clinical system.
>
> ## Getting Started

Clone the repository and install dependencies:

```bash
npm ci
npm install
```

Run the development server:
```
npm run dev
npx install
npx vite
```

## Overview

The current application focuses on a clinician-oriented encounter workspace with support for:

- Clinical encounter management
- Structured note templates
- SOAP, H&P, progress, referral, discharge, and consultation note workflows
- Audio recording and transcription workflows
- AI-assisted clinical note drafting
- AI Copilot assistance
- Section rewriting/refinement
- Local application state and persistence
- Authentication/session infrastructure
- Responsive web UI and PWA-oriented tooling

## Important Scope Notice

This repository reflects the application currently contained in this project archive.

It should **not** be confused with the separate MedTalk patient-doctor medical discussion specification that requires:

- Patient/doctor chat
- Asynchronous report review
- Razorpay
- Firebase OTP/FCM
- Socket.IO
- AWS S3
- Wallets
- Referrals
- Flutter applications

Those capabilities are **not represented here as a complete production implementation**.

## Technology Stack

| Area | Technology |
|---|---|
| Frontend | React 19 |
| Routing | TanStack Router |
| Application runtime | TanStack Start / Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | Radix UI + Lucide React |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Data access | Kysely |
| Database | PostgreSQL / Neon with PGlite development support |
| Authentication | Better Auth |
| Cryptography/session utilities | jose |
| Charts | Recharts |
| Testing | Node test runner and Playwright-oriented tooling |

## Project Structure

```text
.
├── src/
│   ├── components/       # Application UI and workspace components
│   ├── lib/              # Application logic, data, auth, AI and state
│   ├── routes/           # TanStack Router routes
│   ├── router.tsx        # Router configuration
│   └── styles.css        # Global styling
├── scripts/              # Build, migration, auth and QA utilities
├── public/               # Static assets
├── screenshots/          # Development/QA screenshots
├── .grok/                # Grok/App Builder project references and skills
├── app.json              # Application metadata
├── package.json          # Dependencies and scripts
└── vite.config.ts        # Vite configuration
```
Requirements
```
Node.js 20+ recommended
npm 10+ recommended
```
PostgreSQL/Neon for persistent server-side data when enabled
PGlite-based development support where configured by the application environment
Getting Started
1. Clone the repository
git clone https://github.com/rafeez1819/MediTalk.git
cd MediTalk
2. Install dependencies
npm ci
3. Start the development server
npm run dev

The development server is configured to listen on port 8080.

