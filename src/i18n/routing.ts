// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  /** Thêm 'as const' để tạo literal types */
  locales: ["en", "vi"] as const,
  defaultLocale: "en",
  localePrefix: "always",
});
// export const routing = defineRouting({
//   locales: ["vi", "en"] as const,
//   defaultLocale: "vi",
//   localePrefix: "never", // ✅ Không thêm locale vào URL
// });
