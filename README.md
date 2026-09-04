# MediTalk

MediTalk is a modern clinical documentation workspace for creating, reviewing, and managing structured medical encounter notes.

> **Project status:** Development / prototype.
>
> This repository is not currently a production-ready patient-doctor consultation platform and must not be used as a substitute for a validated clinical system.

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
