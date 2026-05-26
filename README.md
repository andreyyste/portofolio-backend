# CREATIVE.RAW — Brutalist Portfolio API (Backend)

The dedicated backend for the Neo-Brutalist portfolio, built from the ground up to serve dynamic, easily updatable content to the Next.js frontend. It ensures that the portfolio's content (projects, experiences, configurations) is decoupled from the frontend presentation logic.

## Features

- **NestJS Architecture**: Built with modules, controllers, and services for maximum scalability and maintainability.
- **Database**: PostgreSQL (or SQLite for development) managed safely through Prisma ORM.
- **RESTful Endpoints**: Full CRUD endpoints for `/portfolio/projects`, `/portfolio/experiences`, `/portfolio/skills`, and `/config/:key`.
- **Authentication**: JWT-based authentication combined with Argon2 password hashing to secure `POST`, `PATCH`, and `DELETE` requests. Only authorized administrators can mutate data.
- **Security Fortified**: Uses `@nestjs/throttler` for rate limiting, `helmet` for HTTP headers, and NestJS `ValidationPipe` for strict payload validation.
- **CORS Enabled**: Pre-configured to securely accept requests from the frontend at `http://localhost:3000`.

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database & ORM**: SQLite (Development) / PostgreSQL (Production) + Prisma ORM
- **Security**: Passport.js, JWT, Argon2, Helmet, Throttler

## Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed.

## Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd portofolio-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Database Setup & Seeding:**
   ```bash
   # Run Prisma migrations to create the database schema
   npx prisma migrate dev

   # Seed the database with the initial portfolio data
   npx prisma db seed
   ```

4. **Environment Variables:**
   Create a `.env` file in the root directory and ensure the `JWT_SECRET` is set:
   ```env
   JWT_SECRET="your-super-secret-key"
   DATABASE_URL="file:./dev.db"
   ```

## Start the Server

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3001`.

## API Structure

- `GET /portfolio/projects`: Retrieve all projects.
- `GET /portfolio/experiences`: Retrieve all work history.
- `GET /portfolio/skills`: Retrieve all skills.
- `GET /config/:key`: Retrieve singleton configurations like `heroData`, `aboutData`, `resumeData`, `contactData`, etc.
- `POST /auth/login`: Authenticate to receive an access token.
