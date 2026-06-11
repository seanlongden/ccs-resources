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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
