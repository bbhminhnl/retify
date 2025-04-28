// lib/session.ts

import Cookies from "js-cookie"; // Thư viện để thao tác với cookies

/** Lưu sessionId vào Cookies (hoặc LocalStorage) */
export const storeSessionId = (sessionId: string) => {
  Cookies.set("sessionId", sessionId, { expires: 7 }); // Lưu sessionId trong cookie với TTL 5 phут }); // Lưu sessionId trong cookie với TTL 7 ngày
};

/** Lấy sessionId từ Cookies (hoặc LocalStorage) */
export const getSessionId = (): string | undefined => {
  return Cookies.get("sessionId");
};

/** Xóa sessionId khỏi Cookies */
export const deleteSessionId = () => {
  Cookies.remove("sessionId");
};
/** Function to generate session ID */
export const generateSessionId = () => {
  return `session_${Math.random().toString(36).substr(2, 9)}`;
};
