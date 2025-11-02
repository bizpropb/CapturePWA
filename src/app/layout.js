import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Moment Capture - Save Your Moments",
  description: "Capture and cherish your special moments with photos, audio, and location",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Moments",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

// Force dynamic rendering for all pages (PWA with heavy client-side functionality)
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            // Dark mode styling
            style: {
              background: '#171717',
              color: '#ededed',
              border: '1px solid #404040',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ededed',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ededed',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
