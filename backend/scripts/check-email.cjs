// Sends a single configuration test to the configured sender, never to app users.
async function main() {
  const key = process.env.BREVO_API_KEY?.trim();
  const sender = process.env.EMAIL_FROM?.trim();
  if (!key || !sender || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender)) {
    console.error('Email check needs BREVO_API_KEY and a valid EMAIL_FROM in the private deployment file.');
    process.exitCode = 1;
    return;
  }
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': key, 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { email: sender, name: process.env.EMAIL_FROM_NAME || 'EchoWave' },
        to: [{ email: sender }],
        subject: 'EchoWave email delivery test',
        textContent: 'This is a test of EchoWave email delivery. No password reset was requested and no account changes were made. If you received this message, the test email arrived successfully.',
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      console.error(`Brevo rejected the test email (HTTP ${response.status}). Check API permissions, sender verification, and account activation.`);
      process.exitCode = 1;
      return;
    }
    console.log('Brevo accepted one test email for the configured sender. Check the inbox and Spam to confirm delivery. No credentials displayed.');
  } catch {
    console.error('Email check could not finish. Check network access and the Brevo dashboard before retrying.');
    process.exitCode = 1;
  }
}
main();
