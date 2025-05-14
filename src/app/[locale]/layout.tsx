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
/**
 * Kiểu font cho trang web geistSans
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
/**
 * Kiểu font cho trang web geistMono
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Meta data cho trang web
 * cần giữ nguyên tên metadata
 */
export const metadata: Metadata = {
  title: "Retify",
  description: "A simple way to generate your menu",
  icons: {
    icon: "/favicon.ico", // hoặc .png, .svg
  },
};

/**
 * Kiểu viewport cho trang web
 * không đổi tên theo format. cần giữ nguyên tên trang web
 */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: "no",
  height: "device-height",
};

export default async function RootLayout({ children, params }: Props) {
  /** Await params để lấy locale */
  const { locale } = await params;

  /** Kiểm tra xem locale có hợp lệ không */
  const IS_VALID_LOCALE = routing.locales.includes(locale as any);
  /**
   * Neu locale khong hop le, return 404
   */
  if (!IS_VALID_LOCALE) {
    notFound();
  }

  /** Ép kiểu locale thành "en" | "vi" */
  const VALID_LOCALE = locale as "en" | "vi";

  /** Tải messages cho locale */
  let messages;
  /**
   * Neu khong tìm thấy file messages, return 404
   */
  try {
    messages = (await import(`../../../messages/${VALID_LOCALE}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={VALID_LOCALE}>
      <body>
        <NextIntlClientProvider locale={VALID_LOCALE} messages={messages}>
          <ToastProvider />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
