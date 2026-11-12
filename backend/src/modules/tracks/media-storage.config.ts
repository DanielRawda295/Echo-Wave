export function mediaStorageConfig(env: NodeJS.ProcessEnv) {
  const projectUrl = env.SUPABASE_URL?.trim();
  const secret = env.SUPABASE_SECRET_KEY?.trim();
  if (!projectUrl && !secret && env.NODE_ENV !== 'production') return null;
  if (!projectUrl || !secret) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY for hosted media storage.');
  }
  let parsed: URL;
  try { parsed = new URL(projectUrl); }
  catch { throw new Error('SUPABASE_URL must be the HTTPS Supabase project URL.'); }
  if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.supabase.co') ||
      parsed.pathname !== '/' || parsed.search || parsed.hash || parsed.username || parsed.password) {
    throw new Error('SUPABASE_URL must be the HTTPS Supabase project URL.');
  }
  if (!secret.startsWith('sb_secret_')) {
    throw new Error('SUPABASE_SECRET_KEY must be a backend secret key, not a publishable or legacy key.');
  }
  const bucket = env.SUPABASE_STORAGE_BUCKET || 'echowave-media';
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(bucket)) throw new Error('Invalid SUPABASE_STORAGE_BUCKET.');
  return { origin: parsed.origin, secret, bucket };
}
