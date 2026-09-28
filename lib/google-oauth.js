import { google } from 'googleapis';

// CMS partner scopes - required for onBehalfOfContentOwner / CMS-level operations.
export const CMS_SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtubepartner',
];

/**
 * Builds the redirect URI dynamically from the incoming request's host, so
 * the same code works on localhost, every Vercel preview deployment, and
 * production without hardcoding a domain. Must resolve identically on both
 * /api/auth and /api/oauth2callback or Google will reject the token
 * exchange with redirect_uri_mismatch.
 */
export function getRedirectUri(request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || (host?.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}/api/oauth2callback`;
}

export function createOAuth2Client(request) {
  return new google.auth.OAuth2(
    process.env.YT_CLIENT_ID,
    process.env.YT_CLIENT_SECRET,
    getRedirectUri(request)
  );
}
