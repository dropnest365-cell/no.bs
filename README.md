# NO BS — Make money. Build something real.

NO BS is a business and side-hustle platform for India. It pairs 40 researched business ideas and 8 editorial guides with free calculators, a rule-based AI mentor, an idea analyzer and a 90-day roadmap generator. Costs and income figures are planning estimates, not promises.

The project is a monorepo with a React + TypeScript client and an Express + Prisma + SQLite API.

---

## Features

- **Business ideas** — 40 ideas across 19 categories, filterable by online/offline, difficulty, category, budget and search.
- **Guides** — editorial guides with official source links, review dates and clear "general information, not professional advice" framing.
- **Calculators** — startup cost, monthly profit and pricing calculators, all client-side with reset controls.
- **AI mentor** — saved conversations with a rule-based fallback that works without any paid AI provider. An OpenAI-compatible provider can be configured optionally.
- **Idea analyzer** — structured first-pass analysis (audience, competition, requirements, risks, next steps) with a budget check.
- **Roadmap generator** — 90-day plan with saved roadmaps and per-task progress.
- **Accounts** — register, log in, profile editing, password change, bookmarks and a personal dashboard.
- **Admin** — stats, idea/category/guide CRUD, and review of community-submitted drafts.
- **Contact form** — stores messages locally in the database (no email is sent).

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Client | React 19, TypeScript, Vite, Tailwind CSS, React Router, lucide-react |
| Server | Node.js 20+, Express 4, Zod validation, JWT auth (httpOnly cookie) |
| Database | Prisma ORM with SQLite (schema is portable to PostgreSQL) |
| Security | Helmet, CORS allow-list, origin guard, rate limits, bcrypt (cost 12) |

---

## Quick start

Requirements: **Node.js 20 or newer** and npm.

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run db:setup          # create the SQLite schema and seed content
npm run dev               # API on :4000, client on :5173
```

Open <http://localhost:5173>.

> On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

### Create an admin account

Either set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` **before** seeding, or register a normal account and promote it:

```bash
npm run make-admin -- you@example.com
```

---

## Environment variables

Copy `.env.example` to `.env`. The server loads the root `.env` first, then `server/.env` (which wins if both exist).

| Variable | Default | Notes |
| --- | --- | --- |
| `NODE_ENV` | `development` | Set to `production` for deployment. |
| `PORT` | `4000` | API port. |
| `DATABASE_URL` | `file:./dev.db` | SQLite path, relative to `server/prisma/schema.prisma`. |
| `JWT_SECRET` | — | **Required in production**, at least 24 characters. Dev generates an ephemeral secret, so sessions reset on restart. |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Comma-separated allowed browser origins. |
| `COOKIE_SECURE` | `false` | Set `true` behind HTTPS in production. |
| `AI_PROVIDER` | blank | Optional. Blank uses the built-in rule-based engine. |
| `AI_API_KEY` | blank | Server-side only; never exposed to the browser. |
| `AI_BASE_URL` | `https://api.openai.com/v1` | Any OpenAI-compatible chat-completions endpoint. |
| `AI_MODEL` | blank | Required to enable the AI provider. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | blank | Optional first-admin bootstrap during `npm run db:seed`. |

Generate a strong secret with `openssl rand -hex 32` or `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

---

## Scripts

Run from the repository root:

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the API and Vite client together. |
| `npm run build` | Type-checks the client and produces `client/dist`. |
| `npm start` | Starts the API (serves `client/dist` when `NODE_ENV=production` and the build exists). |
| `npm run setup` | Installs dependencies and runs the database setup. |
| `npm run db:push` | Pushes the Prisma schema to SQLite. |
| `npm run db:seed` | Seeds ideas, categories, tools, guides and an optional admin. |
| `npm run make-admin -- email` | Promotes an existing account to `ADMIN`. |
| `npm run lint` | Runs the client TypeScript check (no ESLint config is included). |
| `npm run preview` | Serves the built client with Vite preview. |

Server-only helpers: `npm run studio -w server` (Prisma Studio), `npm run db:generate -w server`.

---

## Deploying to Render

The repo deploys as a single Node web service: Express serves `/api/*` and the built SPA from `client/dist`. `render.yaml` records the values below for Render Blueprint deploys; a service created manually in the dashboard needs the same settings entered by hand.

| Setting | Value |
| --- | --- |
| Root Directory | *(leave blank)* |
| Build Command | `npm ci --include=dev && npm run build && npm run db:generate -w server` |
| Start Command | `npm run db:push -w server && npm start` |
| Health Check Path | `/api/health` |

**Root Directory must stay blank.** If it is set to `server`, Render runs every command inside that folder: `client/` is outside the build context, `client/dist` can never be produced, and `node index.js` resolves to `server/index.js` instead of the real entry point `server/src/index.js`.

Set these environment variables in the Render dashboard:

| Variable | Value |
| --- | --- |
| `JWT_SECRET` | Random string, at least 24 characters. The server refuses to boot without it. |
| `CLIENT_ORIGIN` | The service URL, e.g. `https://no-bs.onrender.com`. |
| `DATABASE_URL` | `file:/var/data/no-bs.db` with a persistent disk mounted at `/var/data`. |

`NODE_ENV=production` is set by Render at runtime; the server then serves `client/dist` and forces secure cookies. SQLite has no durability without a persistent disk (paid instance type): the filesystem is wiped on every deploy. Disks are mounted only at runtime, never during the build, which is why schema creation happens in the Start Command.

Seed once after the first deploy with `npm run db:seed -w server` from the Render Shell. Do not seed on every boot: the seed updates existing records and would overwrite admin edits.

`server/.env` is local-only and is not deployed. If it is ever present it overrides dashboard variables, so keep it out of version control.

---

## Project structure

```
client/
  index.html
  src/
    components/     Layout, Markdown renderer, cards, calculator frame, UI primitives
    context/        Auth context (session refresh, login, logout)
    lib/            API client, formatters, shared types, URL safety helpers
    pages/          Route pages (ideas, guides, tools, mentor, admin, auth, legal)
server/
  prisma/
    schema.prisma   User, Category, Idea, Tool, Guide, Bookmark, Roadmap,
                    Conversation, Message, ContentDraft, ContactMessage
    data/           Seed content (ideas, categories, tools, guides)
    seed.js         Idempotent upsert-based seed
  src/
    config.js       Environment loading and validation
    middleware/     Auth, error handling, rate limits, origin guard
    routes/         REST endpoints
    services/       Rule-based mentor, analyzer, roadmap, optional AI provider
    lib/            Validation schemas, serializers, JSON helpers
```

### Database notes

- List-like fields (steps, risks, resources, sources, etc.) are stored as JSON strings for SQLite portability.
- `prisma db push` is used instead of migrations for local development. Add migrations before using PostgreSQL in production.
- `server/prisma/*.db` is git-ignored.

---

## Security notes

- Passwords are hashed with bcrypt (cost 12) and never returned by the API.
- Sessions use a signed JWT in an `httpOnly`, `sameSite=lax` cookie. Set `COOKIE_SECURE=true` under HTTPS.
- **Production requires `JWT_SECRET` of at least 24 characters**; the server refuses to start without it.
- A lightweight origin guard rejects state-changing requests from unexpected origins (CSRF defence in depth). CORS is restricted to `CLIENT_ORIGIN`.
- Rate limits apply globally, plus tighter limits on auth, contact, AI and bookmark endpoints.
- Every admin route requires an authenticated `ADMIN` user; every user-owned resource (roadmaps, conversations, drafts) is scoped by `userId`.
- URLs submitted for idea resources and guide sources must be `http://` or `https://`. The client also refuses to render unsafe schemes (`javascript:`, `data:`) from Markdown or stored links.
- Request bodies are limited to 100 KB.
- `helmet` sets a production Content-Security-Policy, HSTS and other headers.

Secrets belong in `.env`, which is git-ignored. Never commit real keys.

---

## Data and content disclaimers

- All costs, revenue and profit figures are planning estimates. They vary by city, supplier, scale, season and execution.
- Guides are general information, not legal, tax or financial advice. Official links and review dates are shown on each guide.
- The rule-based mentor and analyzer are deterministic helpers. AI output, when enabled, is not verified and must be checked.
- NO BS does not guarantee income, profit, rankings, approvals or business success.

---

## Known limitations

- No automated test suite is included. Verification is manual plus `tsc --noEmit` and the production build.
- SQLite is used for local development and the single-service deployment; production needs a persistent disk plus `prisma db push`. Move to PostgreSQL with committed migrations before running more than one instance.
- Contact messages are stored only in the database; no email delivery is configured.
- No image uploads, payments, password-reset email flow or multi-language support.
- Admin content editing uses plain text/JSON-ish fields, not a rich-text editor.
- The optional AI provider is a single OpenAI-compatible endpoint; there is no per-user AI quota beyond the shared rate limit.

---

## License

Private project. Content and branding belong to the project owner.
