# Saku — Personal Finance Tracker

A full-stack workshop project for recording personal income and expenses. Saku uses a Next.js 15 frontend, a NestJS REST API, Prisma ORM, and PostgreSQL. Each account can access only its own transactions.

## Features

- Register and sign in with JWT authentication; passwords are hashed with bcrypt.
- Create, view, edit, and delete income and expense transactions.
- Summarize income, expenses, and current balance.
- Search by title and filter by transaction type.
- Store currency values as PostgreSQL `DECIMAL(14,2)`.
- Validate write requests with DTOs and `class-validator`.
- Show loading, error with retry, and empty states in the dashboard.

## Repository layout

```text
backend/       NestJS API, Prisma schema, and committed SQL migration
frontend/      Next.js App Router application
docker-compose.yml  Local PostgreSQL service
```

The API listens on port `3001`; the web app listens on port `3000`.

## Requirements

- Node.js 22.18+, 24.11+, or 26+ and npm (Prisma ORM 7 requirement)
- Docker Desktop for the local PostgreSQL option, or a PostgreSQL connection string

## Run locally

1. Create local environment files from the examples:

   ```powershell
   Copy-Item .env.example .env
   Copy-Item backend/.env.example backend/.env
   Copy-Item frontend/.env.example frontend/.env.local
   ```

2. Set a local `POSTGRES_PASSWORD` in the root `.env`. Set the matching password in `backend/.env` under `DATABASE_URL`. Keep both actual environment files out of Git.

3. Start PostgreSQL:

   ```bash
   docker compose up -d postgres
   ```

   If you already have PostgreSQL, skip Docker and put its connection string in `backend/.env` as `DATABASE_URL`.

4. Install dependencies, generate Prisma Client, and apply the checked-in migration:

   ```bash
   npm install
   npm run db:generate
   npm run db:migrate
   ```

5. Start both apps from the repository root:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). The NestJS API is available at [http://localhost:3001](http://localhost:3001).

## Supabase PostgreSQL

The backend connects through Prisma using `DATABASE_URL`; it does not use Supabase Auth or expose database credentials to the browser. Create or select a Supabase PostgreSQL project, copy its PostgreSQL connection string from the project’s Connect panel, and store it only in `backend/.env`. Use the connection method suitable for your backend host and network. Never place a database password or service key in a `NEXT_PUBLIC_` variable.

The Supabase connector had no projects available when this scaffold was prepared, so no hosted database or schema was changed.

## Environment variables

### `backend/.env`

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by the API |
| `DIRECT_URL` | Optional direct connection for Prisma CLI migrations; defaults to `DATABASE_URL` |
| `JWT_SECRET` | Private key used to sign access tokens |
| `JWT_EXPIRES_IN` | Token lifetime, such as `1d` |
| `PORT` | API port; defaults to `3001` |
| `FRONTEND_URL` | Allowed browser origin for CORS |

### `frontend/.env.local`

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Public base URL for the NestJS API |

The `.env.example` files contain placeholders only. Generate a strong, private `JWT_SECRET` for any shared or deployed environment.

## API reference

All `/transactions` routes require `Authorization: Bearer <access_token>`.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Create an account and return a session |
| `POST` | `/auth/login` | Sign in and return a session |
| `GET` | `/transactions` | List the signed-in user’s transactions; optional `type` and `search` filters |
| `GET` | `/transactions/summary` | Return `totalIncome`, `totalExpense`, `currentBalance`, and `transactionCount` |
| `GET` | `/transactions/:id` | Read one owned transaction |
| `POST` | `/transactions` | Create a transaction |
| `PATCH` | `/transactions/:id` | Update an owned transaction |
| `DELETE` | `/transactions/:id` | Delete an owned transaction; responds `204` |

Transaction types are `INCOME` and `EXPENSE`. Categories are `FOOD`, `TRANSPORTATION`, `HOUSING`, `UTILITIES`, `ENTERTAINMENT`, `SALARY`, `INVESTMENT`, and `OTHER`.

## Prisma workflow

- Development migrations: `npm run db:migrate`
- Generate the client after schema changes: `npm run db:generate`
- Apply committed migrations in a deployment: `npm run db:deploy`
- Build both apps: `npm run build`

Review the generated migration before applying schema changes to a hosted database. Do not commit `.env` or `.env.local` files.

## Manual demo flow

1. Register a new account and sign in.
2. Add an income and an expense, then review the IDR summary.
3. Search and filter the transaction list, edit an entry, and delete one.
4. Register a second account and confirm its dashboard does not show the first account’s transactions.
