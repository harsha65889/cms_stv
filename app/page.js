export default function Home() {
  return (
    <main style={{ maxWidth: 560, margin: '80px auto', padding: '0 24px', lineHeight: 1.6 }}>
      <h1 style={{ fontSize: 22 }}>Master CMS Refresh Token Generator</h1>
      <p style={{ color: '#555' }}>
        One-time tool: sign in as your <strong>Master CMS Administrator</strong> Google account to
        generate the permanent <code>refresh_token</code> your publishing scripts reuse for every
        channel in the network.
      </p>
      <a
        href="/api/auth"
        style={{
          display: 'inline-block',
          marginTop: 16,
          padding: '10px 18px',
          background: '#ff3b30',
          color: 'white',
          borderRadius: 8,
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Connect Google Account
      </a>
      <p style={{ marginTop: 24, fontSize: 13, color: '#888' }}>
        Make sure you are signed in to the browser as the Master CMS Administrator account before
        clicking - Google will generate the token for whichever account completes the consent
        screen.
      </p>
    </main>
  );
}
