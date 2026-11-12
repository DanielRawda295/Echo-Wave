# Supabase database CA certificate

Save the database root CA downloaded from the Supabase project's Database settings / SSL configuration as `supabase-ca.crt` in this folder. The deployment check uses `DB_SSL_CA_FILE=certificates/supabase-ca.crt` from the private `.env.deploy.local` file.

A root CA certificate contains public trust information, not the database password or a private key. Only use the certificate downloaded from the intended Supabase project. Certificate verification remains enabled.
