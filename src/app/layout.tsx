import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Closing Clients System",
  description: "Closing Clients System — Member Resource Library",
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Warm up DNS + TLS to Loom before any embedded video iframe
            fires. Cuts ~200-400ms off the first video load. */}
        <link rel="preconnect" href="https://www.loom.com" />
        <link rel="dns-prefetch" href="https://www.loom.com" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
