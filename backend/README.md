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

**Fresh-install blockers:** the checked-in manifest/lockfile are missing imported GraphQL/Apollo, Google authentication, and Nodemailer dependencies. The TypeScript `ignoreDeprecations: "6.0"` setting also needs aligning with the declared TypeScript 5.x range. Fix these before expecting the commands to work on a clean clone; see the root README.

| Address | Purpose |
| --- | --- |
| `http://localhost:3000/api` | REST API base prefix, not a root health route |
| `http://localhost:3000/api/chat/health` | Basic application health response |
| `http://localhost:3000/api/graphql` | GraphQL endpoint and development playground |
| `http://localhost:3000/uploads/` | Uploaded-file URL prefix |

Protected operations use `Authorization: Bearer <token>`. Google login requires both Google environment values in the current service. Password-reset delivery needs the `EMAIL_*` SMTP settings.

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

The database currently uses separate `DB_*` settings with automatic TypeORM schema synchronization, intended for development. Reviewed migrations are needed before production. Uploads are written under `uploads/audio` and `uploads/images`; each file is limited to 25 MB. Persist those files outside an ephemeral server filesystem. Deleting track metadata does not currently delete the disk file.

New runtime uploads and real environment files are ignored by the root `.gitignore`. Previously committed sample media remains tracked. Before public deployment, address raw-entity responses that can expose password hashes, remove token/reset-code debug logs, review rate limits and reset-code reuse, restrict CORS, and read a host-provided listening port. The main README lists the current deployment work explicitly.
