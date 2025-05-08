import "./globals.css";

import { Geist, Geist_Mono } from "next/font/google";

import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import ToastProvider from "@/components/ToastProvider";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

/** Định nghĩa kiểu cho params */
type Props = {
  children: React.ReactNode;
  /** params là Promise */
  params: Promise<{ locale: string }>;
};
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

export default async function RootLayout({ children, params }: Props) {
  /** Await params để lấy locale */
  const { locale } = await params;

  /** Kiểm tra xem locale có hợp lệ không */
  const IS_VALID_LOCALE = routing.locales.includes(locale as any);
  if (!IS_VALID_LOCALE) {
    notFound();
  }

  /** Ép kiểu locale thành "en" | "vi" */
  const VALID_LOCALE = locale as "en" | "vi";

  /** Tải messages cho locale */
  let messages;
  try {
    messages = (await import(`../../../messages/${VALID_LOCALE}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={VALID_LOCALE}>
      <body>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no height=device-height"
        />

        <NextIntlClientProvider locale={VALID_LOCALE} messages={messages}>
          <ToastProvider />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
