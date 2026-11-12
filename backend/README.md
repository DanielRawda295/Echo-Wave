# EchoWave backend

The NestJS 11 + TypeScript API for EchoWave. PostgreSQL persistence uses TypeORM; REST controllers and Apollo GraphQL resolvers expose the application features.

See the [main project README](../README.md) for full setup, the live-demo placeholder, frontend integration, and deployment preparation.

## Modules

| Module | Responsibility |
| --- | --- |
| `auth` | Registration, bcrypt password checks, JWT issuance, guest accounts, Google ID-token verification, and emailed password-reset codes |
| `users` | Profiles, password changes, account deactivation, and user queries |
| `tracks` | MP3/cover uploads, metadata, owner edits/deletion, search, likes, comments, and play counts |
| `playlists` | Ownership checks for mutations and JSONB catalog items with add/remove/reorder operations |
| `chat` | Local FAQ/Markdown-based help, with no external AI provider |
| `external` | Placeholder external search service; catalog browsing is implemented in the frontend |

## Run locally

Create a PostgreSQL development database, copy [.env.example](.env.example) to `.env` without overwriting existing settings, and configure the database credentials and JWT secret. From this folder:

```sh
npm ci
npm run start:dev
```

The dependency manifest includes the GraphQL/Apollo, Google authentication, and Nodemailer packages used by the source. Review the root README's remaining deployment items before publishing the API.

Dependency review on 12 November 2026: the updated lockfile has no high or critical npm audit findings. The production-only audit reports three moderate findings through TypeORM's `glob`/`minimatch` dependencies; this app supplies fixed entity/migration paths rather than user-provided glob patterns. The full audit also includes low/moderate build and test tooling findings. These remain open for compatible upstream fixes. The scoped GraphQL utility and brace-expansion overrides select patched versions without upgrading the NestJS framework major version.

| Address | Purpose |
| --- | --- |
| `http://localhost:3000/api` | REST API base prefix, not a root health route |
| `http://localhost:3000/api/chat/health` | Basic application health response |
| `http://localhost:3000/api/graphql` | GraphQL endpoint and development playground |
| `http://localhost:3000/uploads/` | Uploaded-file URL prefix |

Protected operations use `Authorization: Bearer <token>`. Google login requires `GOOGLE_CLIENT_ID` to match the frontend public client ID. A client secret is not needed to verify ID tokens. Register the public frontend origin and `/auth/google/callback` URL in that Google Cloud OAuth client. Production password-reset delivery uses `BREVO_API_KEY` and a verified `EMAIL_FROM` sender through the Brevo HTTPS API. `EMAIL_FROM_NAME` defaults to EchoWave. SMTP settings are used only as a local-development fallback. Reset codes expire after ten minutes, are consumed once, and allow three requests per email per hour; codes are never printed in server logs.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run start:dev` | Start NestJS in watch mode |
| `npm run build` | Compile into `dist/` |
| `npm run start:prod` | Start compiled output |
| `npm test -- --runInBand` | Run unit tests |
| `npm test -- --runInBand auth.service.spec.ts` | Run guest-login tests |
| `npm run test:e2e` | Run the existing starter Supertest test; it needs updating for the current routes |

## Storage and deployment notes

Local development uses separate `DB_*` settings with automatic TypeORM schema synchronization. Hosted connections use `DATABASE_URL`, verified TLS, the `echowave` schema by default, and no automatic synchronization. Save private deployment settings in `.env.deploy.local` and run `npm run db:check:deploy` to check the connection without changing data. If the Supabase URL contains `[YOUR-PASSWORD]`, `DB_PASS` supplies the password with safe URL encoding.

Run `npm run db:migrate:deploy` for the versioned initial schema migration. It creates eight app tables in `echowave` with row-level security and verifies that the schema matches the entity definitions. A repeat run applies only pending migrations. Existing unmanaged tables cause initialization to stop rather than overwrite them. Future entity changes require a new migration.

Production uploads use Supabase Storage. Configure backend-only `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (an `sb_secret_` key), and `SUPABASE_STORAGE_BUCKET=echowave-media`. Create that bucket as public, limit files to 25 MB, and allow MP3/JPEG/PNG/WebP MIME types. `npm run storage:check:deploy` checks its configuration without changing files. The API validates file headers and normalizes content types. When no media credentials are configured in development, uploads use `uploads/audio` and `uploads/images`; production never falls back to local disk. Track deletion and failed uploads attempt media cleanup.

New runtime uploads and real environment files are ignored by the root `.gitignore`. Previously committed sample media remains tracked. The server reads `PORT` and uses `FRONTEND_ORIGIN` for CORS. Before public deployment, address raw-entity responses that can expose password hashes, remove token/reset-code debug logs, and review rate limits and reset-code reuse. The main README lists the current deployment work explicitly.
