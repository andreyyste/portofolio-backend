<div align="center">
  <h1> Portfolio Backend </h1>
  <p><i>The robust, neo-brutalist engine powering dynamic portfolio content.</i></p>
  
  [![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
</div>

<hr>

## Overview

Welcome to the dedicated backend for the Neo-Brutalist portfolio. Built from the ground up, this API serves dynamic, easily updatable content directly to the Next.js frontend. It effectively decouples portfolio presentation from content management, giving you the flexibility to update your projects, skills, and experiences seamlessly.

### Production Deployments
* **Live Frontend Demo:** [https://nre.codes](https://nre.codes)
* **Live API Endpoint:** [https://api.nre.codes](https://api.nre.codes)

---

## Features at a Glance

- **Robust Architecture:** Powered by **NestJS**, utilizing a scalable structure of modules, controllers, and services.
- **Database Mastery:** Utilizes **Prisma ORM** for safe and typed database queries (SQLite for dev, PostgreSQL-ready for prod).
- **Automated GitHub Synchronization:** Auto-syncs public repositories on startup and every 24 hours (midnight cron). Reads repository file trees, READMEs, and custom `.portfolio.json` configs to automatically populate/hide projects. Includes a manual trigger endpoint (`POST /github/sync`).
- **Memory Cache Management:** Integrates caching for GitHub API calls to prevent rate limiting and optimize loading of file structures in the browser codebase explorer.
- **Selective Validation Pipes:** Uses whitelisting override options (`{ whitelist: false }`) on configuration controllers to allow unstructured nested JSON configurations.
- **Comprehensive REST API:** Full CRUD operations available for your entire portfolio ecosystem:
  - Projects
  - Experiences
  - Skills
  - Global Configurations (JSON key-value stores)
- **Ironclad Security:**
  - **JWT Authentication:** Protects sensitive `POST`, `PATCH`, and `DELETE` endpoints.
  - **Argon2 Hashing:** Next-generation password hashing for maximum safety.
  - **Data Validation:** Strict payload validation using NestJS `ValidationPipe`.
  - **Helmet Integration:** Enforces secure HTTP headers.
- **Frontend Ready:** Pre-configured CORS securely accepts requests from `http://localhost:3000`.

---

## Detailed Feature Breakdown

### 🔄 Automated GitHub Synchronization
* **Metadata Syncing:** Fetches public repositories from the GitHub API using dynamic authorization headers. If a repository contains a `.portfolio.json` metadata file, the project is parsed and upserted into the database.
* **Conditional Project Visibility:** If a repository doesn't have a `.portfolio.json` or has `"include": false`, the backend automatically soft-deletes the project from the dashboard view by setting `hidden: true`.
* **API Endpoints:**
  * `POST /github/sync` — Admin-only endpoint to trigger a manual, immediate synchronization of all repositories.

### 💾 In-Memory Cache Manager
* **Rate-Limit Prevention:** Integrates NestJS `@nestjs/cache-manager` to cache repository file structures, directories, and markdown readme contents fetched from GitHub.
* **Cached Endpoints:**
  * `GET /github/repos/:repoName/tree`
  * `GET /github/repos/:repoName/file`
  * `GET /github/repos/:repoName/readme`
  * `GET /github/repos/:repoName/metadata`

### 🛡️ CMS Configuration Pipelines
* **Nested Object Validation:** Overrides NestJS's default global `ValidationPipe` whitelisting behaviour on the `/config/:key` controller to prevent stripping of nested JSON keys. This allows structured key-value configuration values (such as marquee arrays, social lists, and nav routes) to pass validation untouched.
* **CRUD API Guards:** All state-modifying endpoints (`POST`, `PATCH`, `DELETE`) are guarded by Passport's `JwtStrategy` ensuring only authenticated administrators can mutate database records.

---

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | NestJS |
| **Language** | TypeScript |
| **Database** | SQLite (Dev) / PostgreSQL (Prod) |
| **ORM** | Prisma ORM |
| **Security** | Passport.js, JWT, Argon2, Helmet |

---

## Getting Started

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
Clone the repository and install the necessary dependencies:

```bash
git clone https://github.com/andreyyste/portofolio-backend
cd portofolio-backend
npm install
```

### Environment Configuration
Create a `.env` file in the root directory and configure your secrets:

```env
JWT_SECRET="your-super-secret-key"
DATABASE_URL="file:./dev.db"
```

### Database Setup
Run Prisma migrations to construct the schema, then seed the database with initial data:

```bash
npx prisma migrate dev
npx prisma db seed
```

---

## Running the Server

Start up the API server in your preferred mode:

```bash
# Development mode (Hot-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```
> The API will be available locally at `http://localhost:3001`

---

## API Endpoints Reference

### Public Routes (Read-Only)
- `GET /portfolio/projects` — Fetch all projects & tags.
- `GET /portfolio/experiences` — Fetch all work/educational experiences.
- `GET /portfolio/skills` — Fetch all skills.
- `GET /config/:key` — Fetch singleton UI configurations (`heroData`, `aboutData`, etc.).

### Protected Routes (Requires JWT Token)
- `POST /auth/login` — Authenticate and receive an access token.
- `POST, PATCH, DELETE` — Available on `/portfolio/*` and `/config/*` routes for authorized admins.

---
<div align="center">
  <i>Built with standard practices for a seamless, dynamic portfolio experience.</i>
</div>
