export const metadata = {
  title: 'CMS Refresh Token Generator',
  description: 'One-time tool to generate a Master YouTube CMS refresh token.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>{children}</body>
    </html>
  );
}
