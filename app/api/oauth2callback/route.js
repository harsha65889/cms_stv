import { NextResponse } from 'next/server';
import { createOAuth2Client, getRedirectUri } from '../../../lib/google-oauth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const oauthError = searchParams.get('error');

  if (oauthError) {
    return NextResponse.json({ error: `Google returned an error: ${oauthError}` }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing ?code= query parameter from Google.' }, { status: 400 });
  }

  const oauth2Client = createOAuth2Client(request);

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Refresh token was NOT generated. Google usually withholds it when this app already ' +
            'has an unrevoked, previously granted consent for this account.',
          fix: 'Revoke access at https://myaccount.google.com/permissions, then start over at /api/auth.',
          tokens,
        },
        { status: 200 }
      );
    }

    console.log('Refresh token generated successfully.');

    return NextResponse.json({
      success: true,
      message: 'Refresh token generated successfully. Copy the refresh_token value below.',
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
    });
  } catch (err) {
    console.error('OAuth token exchange failed:', {
      message: err.message,
      responseData: err.response?.data,
      redirectUriUsed: getRedirectUri(request),
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Token exchange failed.',
        message: err.message,
        googleError: err.response?.data,
        redirectUriUsed: getRedirectUri(request),
        hint:
          'If this is redirect_uri_mismatch, add the exact redirectUriUsed value above as an ' +
          'Authorized redirect URI on your OAuth client in Google Cloud Console.',
      },
      { status: 500 }
    );
  }
}
