const { mediaStorageConfig } = require('../dist/modules/tracks/media-storage.config');

async function main() {
  try {
    const config = mediaStorageConfig(process.env);
    if (!config) throw new Error('MISSING_CONFIG');
    const response = await fetch(`${config.origin}/storage/v1/bucket/${config.bucket}`, {
      headers: { apikey: config.secret },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      console.error(`Storage connection check failed (HTTP ${response.status}). Check the backend secret key and bucket name.`);
      process.exitCode = 1;
      return;
    }
    const bucket = await response.json();
    if (!bucket.public) throw new Error('BUCKET_NOT_PUBLIC');
    const types = bucket.allowed_mime_types;
    if (Array.isArray(types) && types.length &&
        !['audio/mpeg', 'image/jpeg', 'image/png', 'image/webp'].every(type => types.includes(type))) {
      throw new Error('BUCKET_MIME_TYPES');
    }
    console.log('Storage connection verified. Public media bucket and allowed types are ready. No files were changed.');
  } catch {
    console.error('Storage check failed. Verify the project URL, backend secret key, public bucket, MIME types, and network access.');
    process.exitCode = 1;
  }
}

main();
