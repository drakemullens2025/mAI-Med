import type { Metadata, Viewport } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "mAI",
  description: "On-demand telemedicine",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "mAI" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-surface antialiased">
        <StackProvider app={stackServerApp}>
          <StackTheme>
            {children}
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
