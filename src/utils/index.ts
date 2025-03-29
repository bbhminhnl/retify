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
