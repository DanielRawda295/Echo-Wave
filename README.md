# EchoWave

A full-stack music discovery and community web app built with **React, TypeScript, NestJS, and PostgreSQL**. Explore music previews, organize playlists, publish your own MP3 tracks, and interact with other listeners.

Built by [Daniel Rawda](https://github.com/DanielRawda295) as a web development portfolio project.

## Live demo

**Deployment pending.**

**Website URL:** `YOUR_DEPLOYED_WEBSITE_URL_HERE`

<!-- After deployment, replace the placeholder above with the real HTTPS URL. -->

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
| Password recovery | Request an emailed six-digit reset code and submit a new password. Requires configured SMTP delivery. |
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
| Media and email | Multer uploads to local disk; Nodemailer SMTP for reset emails |
| Testing | Jest, Nest testing utilities, Supertest |

The React application calls the NestJS REST API for authentication, accounts, playlists, uploads, likes, comments, and help. RTK Query fetches catalog data directly from iTunes. NestJS also exposes GraphQL queries and playlist/engagement mutations at `/api/graphql`; the current pages primarily use REST.

The help widget uses keyword intent matching and local Markdown knowledge lookup. It does **not** require a hosted language model, an AI API key, or Ollama.

### Data storage

- **PostgreSQL:** users, deactivated-account records, reset codes, playlists, uploaded-track metadata, likes, and comments. Catalog playlist items are stored as JSONB snapshots; playlists also have a relation to uploaded tracks.
- **Backend filesystem:** uploaded audio and cover images under `backend/uploads/`, served at `/uploads/`. Database rows store the media paths.
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
- Google OAuth credentials and SMTP access only if testing those optional integrations.

**Current setup caveats:** the backend manifest/lockfile do not yet declare all imported GraphQL, Google authentication, and mail packages. Its `ignoreDeprecations: "6.0"` setting also conflicts with the TypeScript 5.x dependency range. The frontend production build has unused state variables in `Account.tsx`. These existing issues must be resolved before treating a fresh install or production build as ready for deployment. See [deployment preparation](#deployment-preparation).

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
| `JWT_SECRET` | A long random signing secret, unique to your environment. |
| `JWT_EXPIRES_IN` | Regular login token lifetime; example: `1d`. Guest tokens explicitly use `1d`. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional Google login credentials; the secret stays on the backend. |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | Optional SMTP configuration for password-reset email. Current mail transport uses `secure: false` for STARTTLS-style delivery. |

| Frontend variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend API base URL, including `/api`; locally `http://localhost:3000/api`. |
| `VITE_GOOGLE_CLIENT_ID` | Public Google OAuth client ID, matching the backend client ID. |
| `VITE_GOOGLE_REDIRECT_URI` | Google callback URL; locally `http://localhost:5173/auth/google/callback`. |

All frontend `VITE_` values can be exposed in browser assets. Only put public configuration there. Country detection currently calls `api.country.is` without an API key, so a geolocation key is unnecessary.

For Google login, configure your OAuth client with the frontend origin and the matching callback URL. Without OAuth credentials, use email/password or guest login. Without SMTP credentials, password-reset email delivery is unavailable even though the request returns a generic success message.

The current database configuration uses separate `DB_*` fields, not `DATABASE_URL`, and enables `synchronize: true`. Start only against a development database: TypeORM creates/updates tables automatically. Media files already in the repository do not automatically create corresponding database rows.

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

Each upload field has a 25 MB file-size limit. Audio accepts MP3 files; a cover must be an image. Use media you have permission to publish. Track deletion removes the database record; automatic removal of the underlying disk files is not implemented.

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
| `backend` | `npm test -- --runInBand` | Run Jest unit tests |
| `backend` | `npm test -- --runInBand auth.service.spec.ts` | Test isolated guest accounts, token creation, and database-failure behavior |
| `backend` | `npm run test:e2e` | Existing Supertest starter test; requires backend dependencies/database and needs updating to the current routes |

Test coverage is limited; the repository does not yet have a frontend automated test suite or a complete end-to-end feature suite.

## Environment-file hygiene

The root `.gitignore` excludes real `.env` files and their variants across both applications. Sanitized `.env.example` templates are intentionally versioned. The folder-level ignore files additionally exclude development/build artifacts.

A frontend `.env` containing a geolocation API key was previously committed. Removing it from the current branch does **not** remove earlier copies from history: revoke/rotate that key with its provider. The Google OAuth client ID is public configuration; client secrets, mail credentials, database passwords, and JWT signing keys must remain private. Ignoring a file does not remove it if Git already tracks it.

## Deployment preparation

The project is a portfolio demo under active preparation, with no admin panel currently implemented. Before public deployment:

- Resolve missing backend runtime dependency declarations (`@nestjs/graphql`, `@nestjs/apollo`, their Apollo/GraphQL runtime peers, `google-auth-library`, and `nodemailer`) and align TypeScript configuration with the locked compiler.
- Fix frontend production TypeScript errors and verify clean installs/builds in both folders.
- Read the host-provided port in NestJS instead of hardcoding `3000`, restrict CORS to the deployed frontend, and configure database TLS as required by your host.
- Replace automatic schema synchronization with reviewed database migrations; no migration files are currently included.
- Move uploads to durable storage or attach a persistent disk; ephemeral hosting filesystems cannot preserve runtime uploads. Existing media URLs currently assume backend-relative paths, so adapt those helpers if changing to absolute object-storage URLs.
- Review access controls and response serialization: some REST user/list endpoints and playlist relations currently return raw entities that can include password hashes. Remove sensitive fields and restrict access before connecting real user data.
- Remove authentication-token and reset-code debug logging; review reset-code reuse, rate limiting, and guest-account cleanup before accepting public traffic.
- Disable or restrict the GraphQL development playground as appropriate, configure email delivery for the host, and add an SPA rewrite to `index.html` for frontend routes.
- Set deployed API/OAuth URLs, verify the complete guest/account/media flow, and replace the live-demo URL placeholder above.

## Author and license

[Daniel Rawda](https://github.com/DanielRawda295) · [Echo-Wave repository](https://github.com/DanielRawda295/Echo-Wave)

No project-wide license file is currently included. Public source visibility does not grant a separate open-source license, and third-party music/artwork retains its own rights.
