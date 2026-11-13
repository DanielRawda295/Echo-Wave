# EchoWave

A full-stack music discovery and community web app built with **React, TypeScript, NestJS, and PostgreSQL**. Explore music previews, organize playlists, publish your own MP3 tracks, and interact with other listeners.

Built by [Daniel Rawda](https://github.com/DanielRawda295) as a web development portfolio project.

## Live demo

**Website:** [echowave-web.onrender.com](https://echowave-web.onrender.com)

Once deployed, choose **Continue as Guest** on the login page to explore without registering. Every guest login creates a separate listener account. The guest token is kept in the browser tab's session storage and expires after one day; the account and its database records are not automatically deleted when the tab closes.

## Features

| Area | What you can do |
| --- | --- |
| Discovery | Browse by genre, explore the Top Charts and Top Artists pages, and view country-based results on Around You. |
| Search | Search the iTunes catalog and community uploads, with filters for each source. |
| Song and artist pages | View catalog metadata, related results, and community song details. |
| Music player | Play/pause, skip tracks, seek, adjust volume, repeat, shuffle, and view the queue. |
| Favorites and listening history | Save favorite songs and revisit recently played tracks in the current browser. |
| Playlists | Create, rename, delete, and play playlists; add/remove songs and reorder items. |
| Community | Upload an MP3 with an optional cover image, browse uploads, and like or comment on tracks. |
| My Uploads | View, edit metadata for, and delete your own uploaded tracks. |
| Authentication | Register with email/password, sign in with Google, or start a guest session. |
| Account settings | Update username, email, and avatar URL; change password, log out, or deactivate an account with password confirmation. |
| Password recovery | Request an emailed six-digit reset code and submit a new password. Requires configured Brevo API delivery in production. |
| Help widget | Ask how to use EchoWave through an in-app assistant backed by local FAQs and documentation. |

Catalog playback uses the preview audio returned by iTunes, rather than full catalog tracks. Community playback uses uploaded audio files. The Top Charts and Top Artists views are built from catalog search results, not an official real-time chart-ranking feed. Around You uses IP-based country detection with a US fallback.

## Technology and architecture

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite (Rolldown), React Router 7, Tailwind CSS, CSS modules, React Icons |
| State and requests | Redux Toolkit/RTK Query for music results and playback, Zustand for favorites/history, Axios for the EchoWave API |
| Backend | NestJS 11, TypeScript, REST controllers, code-first GraphQL with Apollo, DTO validation |
| Database | PostgreSQL, TypeORM entities and repositories, JSONB playlist items |
| Authentication | JWT bearer tokens, Passport, bcrypt password hashing, Google ID-token verification |
| Media and email | Multer uploads through the API to Supabase Storage in production (local disk in development); Brevo HTTP API for reset emails (Nodemailer SMTP fallback in local development) |
| Testing | Jest, Nest testing utilities, Supertest |

The React application calls the NestJS REST API for authentication, accounts, playlists, uploads, likes, comments, and help. RTK Query fetches catalog data directly from iTunes. NestJS also exposes GraphQL queries and playlist/engagement mutations at `/api/graphql`; the current pages primarily use REST.

The help widget uses keyword intent matching and local Markdown knowledge lookup. It does **not** require a hosted language model, an AI API key, or Ollama.

### Data storage

- **PostgreSQL:** users, deactivated-account records, reset codes, playlists, uploaded-track metadata, likes, and comments. Catalog playlist items are stored as JSONB snapshots; playlists also have a relation to uploaded tracks.
- **Media:** production uploads go to the public Supabase `echowave-media` bucket; development without storage credentials uses `backend/uploads/`, served at `/uploads/`. Database rows store the media URLs, and the frontend accepts both hosted and backend-relative URLs.
- **Browser:** favorites and recent history are persisted locally and cleared on login/logout. They are not synchronized between devices. JWTs use local storage for remembered logins or session storage for temporary/guest logins.

## Repository structure

```text
Echo-Wave/
|-- README.md
|-- .gitignore
|-- frontend/
|   |-- .env.example
|   |-- src/
|   |   |-- pages/          # Discovery, community, playlists, account, auth
|   |   |-- components/     # Player, song cards, upload form, help widget
|   |   |-- Layouts/        # Shared music layout
|   |   |-- context/        # Authentication context
|   |   |-- hooks/          # Favorites, listening history, toasts
|   |   |-- redux/          # Music API and playback state
|   |   `-- utils/          # API client and media origin helpers
|   `-- package.json
`-- backend/
    |-- .env.example
    |-- src/
    |   |-- modules/        # auth, users, tracks, playlists, chat, external
    |   |-- database/       # TypeORM connection and data source
    |   |-- config/         # Environment configuration
    |   `-- common/         # Guards, filters, pipes, interceptors
    |-- test/
    |-- uploads/            # Local media; new runtime files are ignored
    `-- package.json
```

The `external` backend module currently contains a placeholder search service. Catalog discovery is implemented in the frontend's `MusicApi.ts`; Spotify, RapidAPI, and Hugging Face credentials are not needed for that flow.

## Local development

### Requirements

- Node.js 22.12 or newer in the Node 22 line, with npm.
- A running PostgreSQL instance and an empty development database owned by your configured database user.
- Internet access for iTunes results, country detection, and optional Google sign-in.
- Google OAuth credentials and a Brevo account only if testing those optional integrations.

Production preparation is in progress. Run the included database migration and configure Supabase media storage; the API security items in [deployment preparation](#deployment-preparation) still need attention before public deployment.

### 1. Clone and install

```sh
git clone https://github.com/DanielRawda295/Echo-Wave.git
cd Echo-Wave
cd backend
npm ci
cd ../frontend
npm ci
cd ..
```

There is no root npm workspace or root start script. Install and run each application from its own folder.

### 2. Configure the environment

Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env`. Use your editor, or run the following in PowerShell from the repository root on a new clone:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

If you already have local `.env` files, edit those files instead of overwriting them. Replace the placeholder database password and JWT secret before starting the backend. Never commit real credentials.

| Backend variable | Purpose |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` | PostgreSQL connection fields read by the current TypeORM configuration. |
| `DATABASE_URL` | Hosted PostgreSQL connection string; takes precedence over local connection fields. A Supabase `[YOUR-PASSWORD]` placeholder is filled from `DB_PASS` with URL encoding. |
| `DB_SCHEMA` | Schema name; defaults to `echowave` for hosted connections and `public` locally. |
| `DB_SSL_CA_FILE`, `DB_SSL_CA` | Optional provider CA certificate file or PEM text for verified TLS. |
| `DB_SYNCHRONIZE` | Set to `false` to disable local automatic schema updates. Hosted connections always disable them. |
| `JWT_SECRET` | A long random signing secret, unique to your environment. |
| `JWT_EXPIRES_IN` | Regular login token lifetime; example: `1d`. Guest tokens explicitly use `1d`. |
| `FRONTEND_ORIGIN` | Exact allowed frontend origin, or comma-separated origins. Defaults to localhost for development; configure it explicitly for production. |
| `PORT` | Backend listening port supplied by the host; defaults to `3000` locally. |
| `SUPABASE_URL` | HTTPS project URL for hosted media storage. |
| `SUPABASE_SECRET_KEY` | Backend-only `sb_secret_` key used to write/delete media; never expose this through frontend variables. |
| `SUPABASE_STORAGE_BUCKET` | Public media bucket name; defaults to `echowave-media`. |
| `GOOGLE_CLIENT_ID` | Public client ID used as the audience for server-side Google ID-token verification; no client secret is required. |
| `BREVO_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME` | Backend-only email API key, verified sender address, and optional display name for password-reset delivery. |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` | Optional SMTP fallback for local development only. Render Free uses the HTTPS API above. |

| Frontend variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend API base URL, including `/api`; locally `http://localhost:3000/api`. |
| `VITE_GOOGLE_CLIENT_ID` | Public Google OAuth client ID, matching the backend client ID. |
| `VITE_GOOGLE_REDIRECT_URI` | Google callback URL; locally `http://localhost:5173/auth/google/callback`. |

All frontend `VITE_` values can be exposed in browser assets. Only put public configuration there. Country detection currently calls `api.country.is` without an API key, so a geolocation key is unnecessary.

For Google login, configure your OAuth client with the frontend origin and the matching callback URL. Without OAuth credentials, use email/password or guest login. Without email credentials, password-reset requests return an unavailable message. With delivery configured, the response stays generic to protect account privacy; check the provider dashboard for delivery failures.

For local development, the database configuration uses `DB_*` fields and automatically creates/updates tables unless `DB_SYNCHRONIZE=false`. Use only a development database with automatic synchronization. Hosted connections use `DATABASE_URL`, enforce certificate-verified TLS, and always disable automatic synchronization. Their default `echowave` schema keeps app tables outside Supabase's default `public` Data API schema; schema initialization/migrations must be completed before starting against a new hosted database. Media files already in the repository do not automatically create corresponding database rows.

For the guided deployment, save private settings in `backend/.env.deploy.local` (ignored by Git). From `backend`, `npm run db:check:deploy` builds the API and checks the saved database connection without creating tables or changing data. The settings file is not loaded by normal `start:dev`; this keeps local development separate from deployment checks. If the TLS certificate needs a custom root, download the provider's database CA and set `DB_SSL_CA_FILE`; certificate verification stays enabled.

For a new hosted database, `npm run db:migrate:deploy` creates the private `echowave` schema and applies the versioned initial migration in a transaction. It creates eight app tables with row-level security, records the migration, and verifies that the resulting schema matches the entities. Subsequent runs apply only pending migrations. It refuses to initialize an existing unmanaged app schema; it does not migrate records or uploaded files from a local database.

### 3. Start both applications

Backend terminal:

```sh
cd backend
npm run start:dev
```

Frontend terminal:

```sh
cd frontend
npm run dev
```

- Website: `http://localhost:5173`
- REST API base: `http://localhost:3000/api`
- Basic backend health check: `http://localhost:3000/api/chat/health`
- GraphQL endpoint and development playground: `http://localhost:3000/api/graphql`
- Uploaded media: `http://localhost:3000/uploads/`

### 4. Try the main flow

1. Open the website and choose **Continue as Guest**, or create an account.
2. Browse Discover or search for an artist, then play a preview.
3. Save a favorite and create a playlist; add, reorder, and remove songs.
4. Upload an MP3 and optional cover; find it in Community and My Uploads.
5. Open the uploaded song to test likes/comments, then review Account settings.

Each upload field has a 25 MB file-size limit. Audio accepts MP3 files; covers accept JPEG, PNG, and WebP. File headers are checked and storage content types are normalized. Use media you have permission to publish. Track deletion also attempts to remove its media files; failed uploads/database writes trigger cleanup of files already stored. Cleanup failures are logged for follow-up rather than returning provider diagnostics to users.

Production requires the Supabase media settings; it does not fall back to ephemeral local storage when credentials are missing. Create a public `echowave-media` bucket with a 25 MB limit and allow `audio/mpeg`, `audio/mp3`, `image/jpeg`, `image/png`, and `image/webp`. Public reads support published community audio/covers; writes go through the authenticated NestJS API. With credentials saved privately in `.env.deploy.local`, run `npm run storage:check:deploy` from `backend` for a read-only bucket configuration check.

## API overview

All REST routes below use the `/api` prefix. Authenticated routes expect `Authorization: Bearer <token>`.

| Area | Representative routes |
| --- | --- |
| Authentication | `POST /auth/register`, `/auth/login`, `/auth/guest`, `/auth/google-login` |
| Password recovery | `POST /auth/forgot-password`, `/auth/reset-password` |
| Current account | `GET/PATCH /users/me`, `POST /users/me/password`, `/users/me/deactivate` |
| Community | `GET /tracks`, `/tracks/search?term=...`, `/tracks/:id`, `/tracks/:id/comments` |
| Upload management | `POST /tracks/upload`, `GET /tracks/me/list`, `PATCH/DELETE /tracks/:id` |
| Engagement | `POST /tracks/:id/like`, `POST /tracks/:id/comments` |
| Playlists | `GET /playlists/me`, `POST /playlists`, `GET/PATCH/DELETE /playlists/:id`, item add/remove/reorder routes |
| Help | `GET /chat/health`, `POST /chat` |

REST uploads use multipart form data with `audio` and optional `cover` fields. Authentication responses return `access_token` and basic `user` information. GraphQL exposes `me`, `myPlaylists`, `communityTracks`, `myTracks`, and related queries/mutations; inspect the development schema for the full list.

## Commands and tests

Run commands inside the indicated application folder.

| Folder | Command | Purpose |
| --- | --- | --- |
| `frontend` | `npm run dev` | Vite development server |
| `frontend` | `npm run build` | TypeScript checks and production bundle in `dist/` |
| `frontend` | `npm run preview` | Preview a built frontend locally |
| `frontend` | `npm run lint` | ESLint |
| `backend` | `npm run start:dev` | Nest watch server |
| `backend` | `npm run build` | Compile NestJS into `dist/` |
| `backend` | `npm run start:prod` | Start the compiled backend |
| `backend` | `npm run db:check:deploy` | Read-only connection check using private deployment settings |
| `backend` | `npm run db:migrate:deploy` | Initialize/update the hosted app schema using versioned migrations |
| `backend` | `node --env-file=.env.deploy.local scripts/check-email.cjs` | Send one delivery test to the configured sender |
| `backend` | `npm run storage:check:deploy` | Check the hosted public media bucket with private backend credentials |
| `backend` | `npm test -- --runInBand` | Run Jest unit tests |
| `backend` | `npm test -- --runInBand auth.service.spec.ts` | Test isolated guest accounts, token creation, and database-failure behavior |
| `backend` | `npm run test:e2e` | Existing Supertest starter test; requires backend dependencies/database and needs updating to the current routes |

The frontend also provides `npm test` for OAuth callback regression tests. Coverage remains limited; a complete end-to-end feature suite is still needed. See [QA fixes and release checklist](docs/QA-FIXES.md) for the pending migration, deployment order, and manual acceptance checks.

## Environment-file hygiene

The root `.gitignore` excludes real `.env` files and their variants across both applications. Sanitized `.env.example` templates are intentionally versioned. The folder-level ignore files additionally exclude development/build artifacts.

A frontend `.env` containing a geolocation API key was previously committed. Removing it from the current branch does **not** remove earlier copies from history: revoke/rotate that key with its provider. The Google OAuth client ID is public configuration; client secrets, mail credentials, database passwords, and JWT signing keys must remain private. Ignoring a file does not remove it if Git already tracks it.

## Deployment preparation

The project is a portfolio demo under active preparation, with no admin panel currently implemented. Before public deployment:

- Verify clean installs/builds in both folders with the locked dependencies.
- Set `FRONTEND_ORIGIN` to the deployed frontend address and configure database TLS as required by your host. The server reads the host-provided `PORT`.
- Apply the included initial migration to a new hosted database and create new reviewed migrations for future entity changes. Hosted connections disable automatic schema synchronization.
- Configure and verify the Supabase media bucket. Existing local database records and local files are not automatically imported into the new hosted database/bucket.
- Password hashes are excluded from default database reads; public user responses contain only ID, username, and avatar. Playlist list/read operations require ownership. Review access controls again whenever adding new endpoints.
- Reset codes are single-use and no longer logged. Authentication endpoints allow ten requests per route/IP/minute on a single instance. These in-memory counters reset on restart; review stronger abuse controls and guest-account cleanup as usage grows.
- GraphQL playground and introspection are disabled in production. Configure and verify Brevo email delivery, and add an SPA rewrite to `index.html` for frontend routes.
- Set deployed API/OAuth URLs, verify the complete guest/account/media flow, and replace the live-demo URL placeholder above.

## Author and license

[Daniel Rawda](https://github.com/DanielRawda295) · [Echo-Wave repository](https://github.com/DanielRawda295/Echo-Wave)

No project-wide license file is currently included. Public source visibility does not grant a separate open-source license, and third-party music/artwork retains its own rights.
