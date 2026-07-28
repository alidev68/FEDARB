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

This reads `package.json` + `pnpm-lock.yaml` and installs everything below. You don't need to install these one by one — they're already listed in `package.json` — but here's what each one does, so you know **why** it's there.

#### Runtime dependencies

| Package            | Purpose                                                                 |
|----------------------|---------------------------------------------------------------------------|
| `express`             | Web framework — handles routing, middleware, requests/responses          |
| `@prisma/client`      | Auto-generated, type-safe DB query client (generated from your schema)   |
| `prisma`              | Prisma CLI — migrations, schema management, Prisma Studio                |
| `pg`                  | PostgreSQL driver — used under the hood by Prisma to talk to Postgres     |
| `dotenv`              | Loads variables from `.env` into `process.env`                           |
| `cors`                | Enables Cross-Origin Resource Sharing (lets frontend on a diff. port/domain call this API) |
| `helmet`              | Sets secure HTTP headers (basic security hardening)                      |
| `cookie-parser`       | Parses cookies from incoming requests (needed for refresh-token cookies) |
| `morgan`              | HTTP request logger (console logs like `GET /api/health 200 8ms`)        |
| `winston`             | Structured/file logging (for `logs/` folder, more advanced than morgan)  |
| `jsonwebtoken`        | Creates & verifies JWT access/refresh tokens for auth                    |
| `bcrypt`              | Hashes passwords before storing them in the DB                           |
| `zod`                 | Schema validation for request bodies (e.g. validate signup payload)      |

#### Dev dependencies (not shipped to production)

| Package      | Purpose                                                    |
|---------------|--------------------------------------------------------------|
| `nodemon`      | Auto-restarts server on file changes during development     |
| `eslint`       | Lints code for errors/style issues                            |
| `prettier`     | Auto-formats code consistently                                |

If you ever need to add a new package later, use:

```bash
pnpm add <package-name>          # runtime dependency
pnpm add -D <package-name>       # dev-only dependency
```

Do **not** use `npm install` in this project — it will create a `package-lock.json` alongside `pnpm-lock.yaml` and cause lockfile conflicts. Stick to `pnpm` for every install/add/remove.

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

### 4. Set up PostgreSQL

You need a running PostgreSQL server before Prisma can do anything. Pick one option:

**Option A — Local PostgreSQL (Windows/Mac/Linux)**

1. Install PostgreSQL from [postgresql.org/download](https://www.postgresql.org/download/) (or via a package manager).
2. During install, set a password for the default `postgres` superuser — remember it.
3. Create a database for this project. Open `psql` (or pgAdmin) and run:

```sql
CREATE DATABASE fedarb;
```

That's it — you don't need to create tables manually, Prisma migrations do that.

**Option B — Hosted PostgreSQL (no local install needed)**

Free options that work well for dev: [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app). Create a project on any of these and they'll hand you a ready-made connection string — skip straight to step 5 below.

### 5. Configure `DATABASE_URL`

Prisma connects to Postgres using a single connection string in `.env`. Format:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public"
```

Breakdown:

| Part            | Meaning                                                      | Local example  |
|-------------------|-----------------------------------------------------------------|------------------|
| `USER`             | Postgres username                                                 | `postgres`         |
| `PASSWORD`         | Password for that user                                            | whatever you set    |
| `HOST`              | Where Postgres is running                                          | `localhost`          |
| `PORT`               | Postgres port (default is `5432`)                                   | `5432`                 |
| `DATABASE_NAME`       | The DB you created                                                   | `fedarb`                 |
| `?schema=public`       | Which Postgres schema Prisma uses (default `public` is fine)          | `public`                    |

So for a local setup it'd look like:

```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/fedarb?schema=public"
```

If you're using Neon/Supabase/Railway, just paste the connection string they give you — it already has this format (often with `?sslmode=require` appended, which is fine to keep).

**Sanity check the connection** before running migrations:

```bash
npx prisma db pull
```

If this runs without a connection error, Prisma can reach your database. (It may say "no tables found" — that's expected before migrating, and totally fine.)

### 6. Generate Prisma Client & run migrations

Generate the Prisma Client (creates the type-safe query builder based on `prisma/schema.prisma`):

```bash
pnpm prisma:generate
```

Run this any time you change `schema.prisma`, or after a fresh `pnpm install`.

Apply migrations — this creates the actual tables in your database:

```bash
pnpm prisma:migrate
```

This will:
- Read the existing migration in `prisma/migrations/20260728172809_init/`
- Create the `users` table + `Role` enum (`ADMIN`, `USER`) in your database
- Keep your local DB schema in sync with `prisma/schema.prisma`

If you change `schema.prisma` later (add a field/model), running `pnpm prisma:migrate` again will prompt you for a migration name and generate a new migration file automatically — you don't write SQL by hand.

(Optional) Open Prisma Studio to view/edit data visually in the browser:

```bash
pnpm prisma:studio
```

This opens at `http://localhost:5555` and lets you browse/edit rows in the `users` table like a spreadsheet.

### 7. Run the development server

```bash
pnpm dev
```

The server will start on `http://localhost:8000` (or whatever `PORT` you set), with **nodemon** auto-restarting on file changes.

### 8. Run in production mode

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
