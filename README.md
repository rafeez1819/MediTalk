# MediTalk

[svg](https://github.com/rafeez1819/MediTalk/tree/main#meditalk)

MediTalk is a modern clinical documentation workspace for creating, reviewing, and managing structured medical encounter notes.

Project status: Development / prototype. This repository is not currently a production-ready patient-doctor consultation platform and must not be used as a substitute for a validated clinical system.

Overview

The current application focuses on a clinician-oriented encounter workspace with support for:

Clinical encounter management

Structured note templates

SOAP, H&P, progress, referral, discharge, and consultation note workflows

Audio recording and transcription workflows

AI-assisted clinical note drafting

AI Copilot assistance

Section rewriting/refinement

Local application state and persistence

Authentication/session infrastructure

Responsive web UI and PWA-oriented tooling

Important Scope Notice

This repository reflects the application currently contained in this project archive. It should not be confused with the separate MedTalk patient-doctor medical discussion specification that requires patient/doctor chat, asynchronous report review, Razorpay, Firebase OTP/FCM, Socket.IO, AWS S3, wallets, referrals, and Flutter applications.

Those capabilities are not represented here as a complete production implementation.

Technology Stack

Frontend: React 19

Routing: TanStack Router

Application runtime: TanStack Start / Vite

Language: TypeScript

Styling: Tailwind CSS

UI: Radix UI + Lucide React

State: Zustand

Forms: React Hook Form + Zod

Data access: Kysely

Database: PostgreSQL / Neon with PGlite development support

Authentication: Better Auth

Cryptography/session utilities: jose

Charts: Recharts

Testing: Node test runner and Playwright-oriented tooling

Project Structure

. ├── src/ │ ├── components/ # Application UI and workspace components │ ├── lib/ # Application logic, data, auth, AI and state │ ├── routes/ # TanStack Router routes │ ├── router.tsx # Router configuration │ └── styles.css # Global styling ├── scripts/ # Build, migration, auth and QA utilities ├── public/ # Static assets ├── screenshots/ # Development/QA screenshots ├── .grok/ # Grok/App Builder project references and skills ├── app.json # Application metadata ├── package.json # Dependencies and scripts └── vite.config.ts # Vite configuration

Requirements

Node.js 20+ recommended

npm 10+ recommended

PostgreSQL/Neon for persistent server-side data when enabled

The project also supports a PGlite-based development path where configured by the application environment.

Getting Started

Clone the repository and install dependencies:

npm ci

Run the development server:

npm run dev

The development server is configured to listen on port 8080.

Available Scripts

Command

Purpose

npm run dev

Start the development server

npm run build

Build the application and run database migration

npm run build\:dev

Development-mode production build

npm run preview

Preview the production build

npm run typecheck

Run TypeScript checks

npm run lint

Run ESLint

npm test

Run project tests

npm run check\:auth

Validate authentication invariants

npm run format

Format the project with Prettier

npm run db\:migrate

Run database migrations

Configuration

Do not commit secrets, API keys, database passwords, authentication secrets, or production credentials.

Use the project's environment configuration mechanism and keep local secrets outside Git. Review .grok/app-env.json and the authentication/database references before configuring a deployment environment.

AI Features

The current application includes AI-assisted clinical documentation functionality. AI output is assistive only and must be reviewed by an appropriately qualified professional before being relied upon.

The repository currently references the xAI API for model-assisted functionality. Configure credentials through environment variables or the project's supported secret-management mechanism rather than hard-coding them.

Security and Privacy

This project deals with potentially sensitive clinical information. Before handling real patient data, a formal security and privacy review is required, including at minimum:

Server-side authorization and tenant/data isolation

Encryption in transit and at rest

Secure secret management

Audit logging

Access logging and monitoring

Secure file/document storage

Session expiration and revocation

Input validation and output sanitization

Dependency and supply-chain review

Backup and recovery controls

Privacy/compliance review appropriate to the deployment jurisdiction

Do not use real patient-identifiable information in development, screenshots, fixtures, demos, or test data.

Production Readiness

The current archive should be treated as a development/prototype codebase. A production deployment requires additional validation and hardening, including infrastructure review, security testing, privacy/compliance review, operational monitoring, backup/recovery testing, and end-to-end testing.

Contributing

Create a feature branch.

Make the smallest focused change possible.

Run type checking, linting, and tests.

Review security and privacy implications for changes involving clinical data.

Open a pull request describing the change and validation performed.

License

This project is licensed under the MIT License. See LICENSE.

Disclaimer

MediTalk is software, not medical advice. The software and any AI-generated content are provided without a guarantee of clinical accuracy, completeness, suitability, or safety. Any clinical decision, diagnosis, treatment, or documentation created with assistance from this software must be independently reviewed by an appropriately qualified professional.
