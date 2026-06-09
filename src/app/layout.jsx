import { Inter, Outfit } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import '../../style.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata = {
  title: 'Vortex Live - Premium IPTV Player',
  description: 'Premium IPTV Web Player with HLS.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body suppressHydrationWarning>
        {children}
        <Analytics />
        <Script src="https://cdn.jsdelivr.net/npm/hls.js@latest" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
