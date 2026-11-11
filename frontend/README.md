# EchoWave frontend

The React 19 + TypeScript interface for EchoWave, built with Vite (Rolldown), React Router, Redux Toolkit/RTK Query, Zustand, Axios, and Tailwind CSS.

See the [main project README](../README.md) for the live-demo placeholder, full feature list, architecture, environment setup, and deployment preparation.

## Main screens

- Login, registration, guest login, Google OAuth callback, and password recovery.
- Discover, Top Charts, Top Artists, Around You, catalog/community search, and song/artist details.
- Favorites, recently played tracks, playlists, and playlist management.
- Community uploads, My Uploads, and account settings.
- Shared navigation, audio player with queue controls, and local-FAQ help widget.

## Run locally

Start the backend and configure `frontend/.env` using [.env.example](.env.example). From this folder:

```sh
npm ci
npm run dev
```

The default frontend URL is `http://localhost:5173`. Set `VITE_API_URL=http://localhost:3000/api` for the local backend. Restart Vite after changing environment values.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Run TypeScript checks and build `dist/` |
| `npm run preview` | Preview the built website locally |
| `npm run lint` | Run ESLint |

The current production TypeScript check reports unused `passwordToast`/`setPasswordToast` state in `src/pages/Account.tsx`; resolve that before deploying.

## Data and configuration

Catalog results and preview audio come from iTunes. Community data, accounts, and playlists use the NestJS API. Favorites and recently played tracks are browser-local, and login/logout clears them; they do not sync across devices.

All `VITE_` variables are public browser configuration. Keep private credentials on the backend. The current country lookup needs no geolocation API key. Real `.env` files are ignored by the repository's root rules; only sanitized examples should be committed.
