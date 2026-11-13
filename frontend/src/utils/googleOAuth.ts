type GoogleAttempt = { challengeId: string; nonce: string; state: string; expiresAt: number; persist: boolean; next: string };
const key = 'echowave.oauth.attempt';

export function saveGoogleAttempt(attempt: GoogleAttempt) {
  sessionStorage.setItem(key, JSON.stringify(attempt));
}

export function consumeGoogleCallback(): { token: string; attempt: GoogleAttempt } {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const query = new URLSearchParams(window.location.search);
  const raw = sessionStorage.getItem(key);
  sessionStorage.removeItem(key);
  window.history.replaceState(null, '', window.location.pathname);
  if (!raw) throw new Error('Google sign-in was not started in this tab. Please start again.');
  const attempt = JSON.parse(raw) as GoogleAttempt;
  if (!attempt.state || (hash.get('state') || query.get('state')) !== attempt.state || attempt.expiresAt <= Date.now()) {
    throw new Error('Google sign-in expired or could not be verified. Please start again.');
  }
  if (hash.get('error') || query.get('error')) throw new Error('Google sign-in was cancelled or rejected.');
  const token = hash.get('id_token');
  if (!token || !attempt.challengeId || !attempt.nonce) throw new Error('Google did not return a valid sign-in response.');
  return { token, attempt };
}
