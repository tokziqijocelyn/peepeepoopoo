import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { BottomNav } from "./_components/BottomNav";
import { TaskProvider } from "./_components/TaskContext";
import { TaskStatus } from "./_components/TaskStatus";
import { AutoAuth } from "./_components/AutoAuth";

export const metadata: Metadata = {
  title: "Fitsies",
  description: "Fitsies - AI-powered fashion assistant",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#141414",
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="bg-[var(--color-bg)] text-[var(--color-text-primary)]">
        <TRPCReactProvider>
          <AutoAuth>
            <TaskProvider>
              <TaskStatus />
              <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col">
                <main className="flex-1 overflow-y-auto pb-16">{children}</main>
                <BottomNav />
              </div>
            </TaskProvider>
          </AutoAuth>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
