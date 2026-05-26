<div align="center">
  <h1>🎨 Portfolio Backend</h1>
  <p><i>The robust, neo-brutalist engine powering dynamic portfolio content.</i></p>
  
  [![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
</div>

<hr>

## 🚀 Overview

Welcome to the dedicated backend for the Neo-Brutalist portfolio! Built from the ground up, this API serves dynamic, easily updatable content directly to the Next.js frontend. It effectively decouples portfolio presentation from content management, giving you the flexibility to update your projects, skills, and experiences seamlessly.

---

## ✨ Features at a Glance

- 🏗️ **Robust Architecture:** Powered by **NestJS**, utilizing a scalable structure of modules, controllers, and services.
- 🗄️ **Database Mastery:** Utilizes **Prisma ORM** for safe and typed database queries (SQLite for dev, PostgreSQL-ready for prod).
- 🌐 **Comprehensive REST API:** Full CRUD operations available for your entire portfolio ecosystem:
  - 📂 Projects
  - 💼 Experiences
  - ⚡ Skills
  - ⚙️ Global Configurations (JSON key-value stores)
- 🔐 **Ironclad Security:**
  - **JWT Authentication:** Protects sensitive `POST`, `PATCH`, and `DELETE` endpoints.
  - **Argon2 Hashing:** Next-generation password hashing for maximum safety.
  - **Data Validation:** Strict payload validation using NestJS `ValidationPipe`.
  - **Helmet Integration:** Enforces secure HTTP headers.
- 🌍 **Frontend Ready:** Pre-configured CORS securely accepts requests from `http://localhost:3000`.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | NestJS |
| **Language** | TypeScript |
| **Database** | SQLite (Dev) / PostgreSQL (Prod) |
| **ORM** | Prisma ORM |
| **Security** | Passport.js, JWT, Argon2, Helmet |

---

## 🏁 Getting Started

### 1️⃣ Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2️⃣ Installation
Clone the repository and install the necessary dependencies:

```bash
git clone <your-repository-url>
cd portofolio-backend
npm install
```

### 3️⃣ Environment Configuration
Create a `.env` file in the root directory and configure your secrets:

```env
JWT_SECRET="your-super-secret-key"
DATABASE_URL="file:./dev.db"
```

### 4️⃣ Database Setup
Run Prisma migrations to construct the schema, then seed the database with initial data:

```bash
npx prisma migrate dev
npx prisma db seed
```

---

## 🏃‍♂️ Running the Server

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

## 📡 API Endpoints Reference

### Public Routes (Read-Only)
- 🟢 `GET /portfolio/projects` — Fetch all projects & tags.
- 🟢 `GET /portfolio/experiences` — Fetch all work/educational experiences.
- 🟢 `GET /portfolio/skills` — Fetch all skills.
- 🟢 `GET /config/:key` — Fetch singleton UI configurations (`heroData`, `aboutData`, etc.).

### Protected Routes (Requires JWT Token)
- 🔴 `POST /auth/login` — Authenticate and receive an access token.
- 🔴 `POST, PATCH, DELETE` — Available on `/portfolio/*` and `/config/*` routes for authorized admins.

---
<div align="center">
  <i>Built with ❤️ for a seamless, dynamic portfolio experience.</i>
</div>
