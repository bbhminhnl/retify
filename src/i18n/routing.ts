// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  /** Thêm 'as const' để tạo literal types */
  locales: ["vi", "en"] as const,
  defaultLocale: "vi",
  localePrefix: "always",
});
