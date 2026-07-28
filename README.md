# FEDARB Backend API

A RESTful backend built with **Node.js**, **Express.js**, **Prisma ORM**, and **PostgreSQL**.

> ⚠️ **Project status:** Early scaffold stage. Server, security middleware, and Prisma/DB connection are set up and working. Controllers, routes, services, repositories, and validations are not implemented yet — this README documents the current setup so anyone (including future-you) can clone and run it immediately.

---

## Tech Stack

| Layer            | Technology                          |
|-------------------|--------------------------------------|
| Runtime            | Node.js                              |
| Framework          | Express.js 5                         |
| ORM                | Prisma 6                             |
| Database           | PostgreSQL                           |
| Auth (planned)     | JWT (`jsonwebtoken`) + `bcrypt`       |
| Validation (planned)| Zod                                |
| Logging            | Winston, Morgan                      |
| Security           | Helmet, CORS, cookie-parser          |
| Package manager    | pnpm                                 |
| Dev tooling        | Nodemon, ESLint, Prettier            |

---

## Prerequisites

- **Node.js** v18+ (recommended v20+)
- **pnpm** (this project uses pnpm, not npm/yarn)
- **PostgreSQL** running locally or a hosted instance (Neon, Supabase, Railway, etc.)

If you don't have pnpm installed:

```bash
npm install -g pnpm
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/alidev68/FEDARB.git
cd FEDARB
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the project root (copy from `.env.example` if present):

```bash
cp .env.example .env
```

Fill in the following variables:

```env
# Server
PORT=8000

# Database (PostgreSQL connection string)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public"

# JWT Secrets
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

# JWT Expiry
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

> 🔒 **Never commit your `.env` file.** It's already covered by `.gitignore`.
> 🔒 **Note:** if a GitHub token or any secret was ever committed to this repo's history or remote URL, revoke it immediately and rewrite git history — don't just delete the file, since old commits still contain it.

### 4. Set up the database with Prisma

Generate the Prisma Client:

```bash
pnpm prisma:generate
```

Run migrations to create tables in your database (this applies the existing migration in `prisma/migrations/`):

```bash
pnpm prisma:migrate
```

This will:
- Create the `users` table (with `Role` enum: `ADMIN`, `USER`)
- Keep your local DB schema in sync with `prisma/schema.prisma`

(Optional) Open Prisma Studio to view/edit data visually:

```bash
pnpm prisma:studio
```

### 5. Run the development server

```bash
pnpm dev
```

The server will start on `http://localhost:8000` (or whatever `PORT` you set), with **nodemon** auto-restarting on file changes.

### 6. Run in production mode

```bash
pnpm start
```

---

## Verify it's working

Hit the health check endpoint:

```bash
curl http://localhost:8000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "FEDARB API is running 🚀"
}
```

---

## Available Scripts

| Script                  | Command                    | Description                              |
|--------------------------|-----------------------------|--------------------------------------------|
| `pnpm dev`               | `nodemon src/server.js`     | Start dev server with auto-reload          |
| `pnpm start`             | `node src/server.js`        | Start production server                    |
| `pnpm prisma:generate`   | `prisma generate`           | Generate Prisma Client from schema         |
| `pnpm prisma:migrate`    | `prisma migrate dev`        | Create & apply a new migration (dev)       |
| `pnpm prisma:studio`     | `prisma studio`             | Open Prisma Studio GUI                     |

---

## Project Structure

```
FEDARB/
├── prisma/
│   ├── migrations/          # DB migration history
│   └── schema.prisma        # Prisma schema (models, enums, datasource)
├── src/
│   ├── config/
│   │   └── prisma.js        # Prisma Client instance (singleton)
│   ├── constants/            # (planned) app-wide constants
│   ├── controllers/          # (planned) request handlers
│   ├── middlewares/          # (planned) auth, error handling, etc.
│   ├── repositories/         # (planned) DB query layer (Prisma calls)
│   ├── routes/                # (planned) Express route definitions
│   ├── services/              # (planned) business logic layer
│   ├── utils/                  # (planned) helper functions
│   ├── validations/            # (planned) Zod schemas
│   ├── app.js                  # Express app config (middleware, health route)
│   └── server.js               # Entry point — loads env, starts server
├── logs/                        # Winston log output
├── .env                          # Environment variables (not committed)
├── .env.example                  # Environment variable template
├── package.json
└── pnpm-lock.yaml
```

The architecture follows a layered pattern:
**Route → Controller → Service → Repository → Prisma/DB**

---

## Current Data Model

### `User`

| Field          | Type      | Notes                          |
|-----------------|------------|----------------------------------|
| `id`             | String     | Primary key, `cuid()`            |
| `firstName`      | String     | Required                         |
| `lastName`       | String     | Required                         |
| `email`          | String     | Unique                           |
| `password`       | String     | Hashed (bcrypt)                  |
| `phoneNumber`    | String?    | Optional                         |
| `role`           | Role enum  | `ADMIN` \| `USER`, default `USER`|
| `isActive`       | Boolean    | Default `true`                   |
| `isVerified`     | Boolean    | Default `false`                  |
| `refreshToken`   | String?    | For JWT refresh flow             |
| `createdAt`      | DateTime   | Auto-set                         |
| `updatedAt`      | DateTime   | Auto-updated                     |

Table name in DB: `users`

---

## Roadmap

- [ ] User registration & login (JWT access/refresh flow)
- [ ] Auth middleware (protect routes, role-based access)
- [ ] Zod validation schemas for request bodies
- [ ] Controllers, services, repositories for `User`
- [ ] Centralized error handling middleware
- [ ] Winston structured logging integration
- [ ] Additional models as the API grows

---

## Troubleshooting

- **`Environment variable not found: DATABASE_URL`** → Make sure `.env` exists and Prisma can read it (check `prisma/schema.prisma` datasource config).
- **Port already in use** → Change `PORT` in `.env` or kill the process using that port.
- **Migration drift errors** → Run `prisma migrate status` to check, and `prisma migrate reset` (dev only, wipes data) if migrations are out of sync.

---

## Author

**Ali Haider**
