# Neo-Brutalist Portfolio (Backend)

The dedicated backend for the Neo-Brutalist portfolio, built with NestJS, Prisma ORM, and SQLite.

## Features
- **NestJS Framework**: Robust, modular architecture.
- **Prisma ORM**: Type-safe database access with SQLite.
- **Authentication**: JWT & Argon2 protected admin routes.
- **Security**: Helmet, Rate Limiting (Throttler), and Global Validation pipes.
- **Dynamic Data**: Serves projects, experiences, skills, and singleton site configuration to the frontend via REST API.

## Getting Started

```bash
# Install dependencies
npm install

# Run database migrations and seed the data
npx prisma migrate dev
npx prisma db seed

# Start the server (runs on port 3001)
npm run start:dev
```
