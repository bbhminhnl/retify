/** FromatCurrency
 * @param {string} value - The value to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value: string | number) => {
  /**
   * Kiểm tra nếu không có value thì trả về ''
   */
  if (!value) return "";
  /**
   * Chuyển value thành số và loại bỏ dấu chấm
   */
  const NUM_VALUE = parseFloat(value.toString().replace(/\./g, ""));
  /**
   * Kiểm tra nếu value không phải là số thì trả về ''
   */
  if (isNaN(NUM_VALUE)) return "";
  /**
   * Trả về value đã format
   */
  return NUM_VALUE.toLocaleString("vi-VN");
};
/**
 * Tạo một ID ngẫu nhiên
 * @param {number} length - Độ dài của ID
 * @returns {string} - ID ngẫu nhiên
 */
export const MENU_PATTERNS = {
  /** Cải thiện phát hiện tiêu đề mục trong menu tiếng Việt */
  SECTION:
    /^(?!.*\b(available|mon|tue|wed|thu|fri|sat|sun|am|pm|giờ|phục vụ)\b)[A-ZÀ-Ỹ][A-ZÀ-Ỹ\s]+$/i,

  /** Cải thiện phát hiện giá với định dạng tiền tệ Việt Nam */
  PRICE: /\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?\s*(?:₫|vnd|đ|d|k|nghìn)?\b/gi,

  /** Cải thiện danh sách từ khóa cần bỏ qua */
  IGNORE:
    /^(menu|thực đơn|quán|địa chỉ|hotline|====|http|\b(available|mon|tue|wed|thu|fri|sat|sun|\d+\s?[ap]m|giờ|phục vụ)\b)/i,

  /** Phát hiện đơn vị tiền tệ Việt Nam và quốc tế */
  CURRENCY: /\b(₫|vnd|đ|d|\$|€|usd|k|nghìn)\b/i,

  /** Định dạng giá tính theo nghìn đồng */
  THOUSAND_VND: /\b(nghìn đồng|giá tính theo nghìn)\b/i,

  /** Phát hiện đơn vị trong menu */
  UNIT: /\b(đĩa|plate|phần|serving|người|person|suất)\b/i,
};
