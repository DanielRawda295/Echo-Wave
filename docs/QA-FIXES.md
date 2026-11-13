# QA fixes and release checklist

These changes address the November 2026 code review. They require the database migration and both application deployments; editing local files alone does not update Render.

Release validation on 14 November 2026: all 42 backend tests, three frontend tests, both production builds, and six isolated browser checks passed. The Supabase app schema was backed up and the security migration was applied successfully, with no schema drift. Integration checks against the migrated database passed for guest login, password login, password-change/reset session revocation, playlist operations, profile privacy, and media upload/download/deletion. Temporary test accounts were removed. Deployment and live browser acceptance checks are separate from these local integration results.

## Changes

- Google sign-in uses a five-minute, single-use server challenge. The browser validates OAuth state and the API verifies the ID token's nonce. Google identity is looked up by its stable subject ID. An email match alone no longer merges a password account with a Google account.
- Changing or resetting a password increments the account's session version, invalidating older JWTs. Changing a password returns the browser to login with an explanation. Existing tokens issued before this release are rejected: users must sign in again once.
- REST and GraphQL share playlist and comment validation, including length and media URL constraints.
- Reset-code inputs support replacing a digit, pasting, and clearing a digit without shifting its neighbors. Sensitive authentication console logs were removed.
- Song-row pause controls no longer trigger the parent play action. Numeric artist links use catalog lookup, and search terms are encoded as query parameters.
- Community search results and community song pages remain usable when the catalog provider fails.
- Track deletion and account deactivation persist media cleanup jobs in the same transaction as the database deletion. Failed storage deletions remain queued for retry on startup and every minute while the API is running.

## Verification

Run in `backend`: `npm test -- --runInBand` and `npm run build`.

Run in `frontend`: `npm test` and `npm run build`.

Isolated browser checks also cover OAuth callback rejection, reset-code editing, artist-row pause, artist lookup, query encoding, and community results during a catalog outage. These use mocked services and do not prove that Google, Brevo, or Supabase are configured correctly on Render.

The broader lint backlog and moderate dependency advisories remain separate work. Passing these checks does not establish that the entire application is defect-free.

## Release order

1. Take a database backup and confirm there are no duplicate non-null `googleId` values. The unique index intentionally rejects duplicates; do not delete or merge accounts automatically to bypass this check.
2. Build the backend. From its folder, with the existing private deployment environment file, run `node --env-file=.env.deploy.local scripts/migrate-database.cjs`. Never commit that environment file. The pending `SecuritySessions1794528000000` migration adds `user.tokenVersion`, a unique Google identity index, and the RLS-enabled media cleanup table. The runner verifies schema consistency. Apply the migration before deploying the new API; the previous API can continue using the additive schema.
3. Commit and push the reviewed changes, then deploy the backend followed by the frontend from the same commit. Until both versions are live, Google sign-in may fail because the new challenge protocol requires both. Email and guest login remain separate flows.
4. Confirm the API health endpoint, then test guest login, email login, Google login, password reset and re-login. Verify an old token returns 401 after a password change. Use a disposable test account for upload, playlist, comment, deletion, and account deactivation checks.
5. Check desktop and mobile playback, search, artist links, and the playlist dialog. Confirm deleted test uploads disappear from Supabase Storage and no cleanup jobs remain after successful deletion.

Google challenges are held in memory for this single-instance portfolio deployment. A restart requires starting Google login again. Multiple API instances require a shared challenge store before scaling. Cleanup retries pause while the free Render instance sleeps and resume when it wakes. New code does not retroactively find files orphaned by earlier deletions.

Public storage URLs can serve cached copies after deletion. Verify deletion against the storage origin listing; a successful cached download alone does not mean the object remains in storage. See [Supabase storage CDN documentation](https://supabase.com/docs/guides/storage/cdn/fundamentals).

An existing password account with the same email as a Google account must use password login; a verified account-linking flow is future work. Do not restore automatic linking by email.
