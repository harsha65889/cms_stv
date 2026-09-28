# CMS refresh token generator

A tiny, throwaway Next.js app with one job: run the Google OAuth consent flow
once as your Master CMS Administrator account and hand back the permanent
`refresh_token` that your publishing scripts (elsewhere) reuse for every
channel in the network.

## Folder layout

```
cms-token-generator/
├── app/
│   ├── layout.js
│   ├── page.js                      - "Connect Google Account" button
│   └── api/
│       ├── auth/route.js            - GET: redirects to Google's consent screen
│       └── oauth2callback/route.js  - GET: exchanges the code, returns the refresh_token
├── lib/
│   └── google-oauth.js              - shared OAuth2 client + redirect URI builder
├── package.json
├── next.config.js
└── .env.example
```

## Setup

1. In Google Cloud Console, create (or reuse) an OAuth 2.0 Client ID of type
   **Web application**. Under "Authorized redirect URIs" add:
   - `http://localhost:3000/api/oauth2callback` (local dev)
   - `https://<your-vercel-domain>/api/oauth2callback` (add this after you
     deploy and know the domain - Vercel preview URLs each need their own
     entry, or use a fixed production domain)
   - Make sure the OAuth consent screen has the scopes below available, and
     if the app is still in "Testing" publishing status, add your Master CMS
     Administrator email under "Test users".

2. Copy `.env.example` to `.env.local` and fill in `YT_CLIENT_ID` /
   `YT_CLIENT_SECRET`. `ADMIN_SECRET` is optional - see below.

3. Install dependencies:
   ```
   npm install
   ```

4. Run locally:
   ```
   npm run dev
   ```
   Open http://localhost:3000 and click "Connect Google Account", signed in
   as the Master CMS Administrator account.

## What each route does

- **`GET /api/auth`** - builds the Google consent URL with
  `access_type: "offline"` and `prompt: "consent"` (forces a refresh_token
  every time, not just an access_token) and scopes
  `https://www.googleapis.com/auth/youtube` +
  `https://www.googleapis.com/auth/youtubepartner`, then 302-redirects there.
  The redirect URI is built from the incoming request's host, so it works
  unchanged on localhost and on every Vercel deployment.

- **`GET /api/oauth2callback`** - reads `?code=`, exchanges it for tokens,
  and returns JSON like:
  ```json
  {
    "success": true,
    "message": "Refresh token generated successfully. Copy the refresh_token value below.",
    "refresh_token": "1//0g...",
    "access_token": "ya29...",
    "scope": "...",
    "token_type": "Bearer",
    "expiry_date": 1234567890123
  }
  ```
  If Google doesn't return a `refresh_token` (usually because this app
  already has an unrevoked prior consent for that account), the response
  explains that and points you to
  https://myaccount.google.com/permissions to revoke access before retrying.
  If the token exchange fails, the error response includes the exact
  `redirectUriUsed` and Google's raw error payload, so a
  `redirect_uri_mismatch` is easy to diagnose - just add that printed URI to
  the OAuth client's Authorized redirect URIs.

## Optional: lock down the public URL

Once deployed, `/api/auth` is a public URL that anyone could open to trigger
a consent screen against your OAuth client. Set `ADMIN_SECRET` in the
environment to require `/api/auth?secret=<ADMIN_SECRET>` before it will
redirect to Google. Leave it unset to skip this check entirely.

## Deploying

Not included here since you're deploying it yourself - the short version:
push this folder to its own Vercel project (or `vercel` CLI from inside it),
add `YT_CLIENT_ID` / `YT_CLIENT_SECRET` (and optionally `ADMIN_SECRET`) as
Environment Variables in the Vercel project settings, then add that
deployment's `https://<domain>/api/oauth2callback` to the OAuth client's
Authorized redirect URIs before using it.

This app only needs to exist long enough to mint the one refresh token - feel
free to delete the Vercel project afterward.
