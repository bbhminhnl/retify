import "./globals.css";

import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, getMessages } from "next-intl";

import type { Metadata } from "next";
import ToastProvider from "@/components/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Retify",
  description: "A simple way to generate your menu",
};

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  /**
   * Messages
   */
  const messages = await getMessages({ locale: params.locale });

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={MESSAGES}>
          <div className="flex-grow min-h-0 h-screen w-screen">
            <ToastProvider />
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
