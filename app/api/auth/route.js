import { NextResponse } from 'next/server';
import { createOAuth2Client, CMS_SCOPES } from '../../../lib/google-oauth';

export async function GET(request) {
  if (!process.env.YT_CLIENT_ID || !process.env.YT_CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Missing YT_CLIENT_ID / YT_CLIENT_SECRET environment variables.' },
      { status: 500 }
    );
  }

  // Optional guard: if ADMIN_SECRET is set in the environment, this public
  // URL requires it as a query param before starting the OAuth flow, so a
  // random visitor can't trigger a consent screen against your registered
  // Google Cloud OAuth client. Leave ADMIN_SECRET unset to skip this check.
  const { searchParams } = new URL(request.url);
  if (process.env.ADMIN_SECRET && searchParams.get('secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized. Append ?secret=<ADMIN_SECRET> to the URL.' }, { status: 401 });
  }

  const oauth2Client = createOAuth2Client(request);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // required so Google issues a refresh_token, not just an access_token
    prompt: 'consent',      // forces the consent screen every time, guaranteeing a fresh refresh_token
    scope: CMS_SCOPES,
  });

  return NextResponse.redirect(authUrl, 302);
}
