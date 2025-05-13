import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  /** Lấy locale */
  let locale = await requestLocale;
  console.log(locale, "request locale");

  /**
   * Kiểm tra locale
   */
  if (!locale || !routing.locales.includes(locale as any)) {
    /** Neu không tìm thấy locale, dùng locale default */
    locale = routing.defaultLocale;
  }

  console.log(locale, "request locale");
  /**
   * LOCALE hợp lệ
   */
  const VALID_LOCALE = locale as "en" | "vi";

  /** Tải messages */
  const MESSAGES = (await import(`../../messages/${VALID_LOCALE}.json`))
    .default;

  return {
    locale: VALID_LOCALE,
    messages: MESSAGES,
    /** Thêm fallback: trả về key nếu không tìm thấy chuỗi dịch */
    onMessageMissing: ({ key }: { key: string }) => {
      console.warn(
        `Missing translation for key: ${key} in locale: ${VALID_LOCALE}`
      );
      return key; // Sử dụng key làm fallback
    },
  };
});
