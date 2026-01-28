-- Seeds for Google Secrets (Sanitized)
-- Usage: psql -f supabase/seeds/set_google_secrets.sql

INSERT INTO vault.decrypted_secrets (name, description, secret, created_at, updated_at)
VALUES
    ('GOOGLE_OAUTH_CLIENT_ID', 'Google OAuth Client ID', 'placeholder-client-id', now(), now()),
    ('GOOGLE_OAUTH_CLIENT_SECRET', 'Google OAuth Client Secret', 'placeholder-client-secret', now(), now()),
    ('GOOGLE_OAUTH_REFRESH_TOKEN', 'Google OAuth Refresh Token', 'placeholder-refresh-token', now(), now())
ON CONFLICT (name) DO UPDATE SET
    secret = EXCLUDED.secret,
    updated_at = now();